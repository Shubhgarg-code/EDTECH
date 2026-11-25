// storageService.js – Cloudflare R2 (S3‑compatible) integration
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

// AWS SDK v3 – S3 client (compatible with Cloudflare R2)
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const localUploadDir = path.join(__dirname, '../../uploads');

// Ensure local upload directory exists (dev only)
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

/**
 * Storage Service Adapter – supports local disk (development) and Cloudflare R2 (production).
 */
class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.isPersistent = this.driver !== 'local' || process.env.PERSISTENT_DISK === 'true';
    this.requiredR2Vars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];

    if (ENV.NODE_ENV === 'production' && !this.isPersistent) {
      console.warn(
        '⚠️  [Storage Advisory]: Running with local disk storage in production. '
        + 'Files uploaded to /uploads will be ephemeral unless a persistent disk is mounted. '
        + 'Configure Cloudflare R2 via STORAGE_DRIVER=r2 for persistent storage.'
      );
    }

    // Initialise R2 client when driver is r2
    this.initR2();
  }

  initR2() {
    const missing = this.requiredR2Vars.filter(v => !process.env[v]);
    this.missingR2Vars = missing;

    if (this.driver === 'r2') {
      if (missing.length) {
        console.warn(`⚠️  [StorageService] Missing R2 env vars: ${missing.join(', ')}`);
        this.r2Client = null;
      } else {
        try {
          this.r2Client = new S3Client({
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: 'auto', // Cloudflare uses auto pseudo‑region
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
            }
          });
          this.bucket = process.env.R2_BUCKET_NAME;
          this.publicBase = process.env.R2_PUBLIC_URL?.replace(/\/*$/, '');
          console.log(`✅ [StorageService] Cloudflare R2 client initialized for bucket "${this.bucket}"`);
        } catch (err) {
          console.error('❌ [StorageService] Error initializing R2 S3 client:', err.message);
          this.r2Client = null;
        }
      }
    }
  }

  isR2Configured() {
    return {
      driver: this.driver,
      configured: Boolean(this.r2Client && this.driver === 'r2'),
      missing: this.missingR2Vars,
      bucket: this.bucket || null,
      hasPublicBase: Boolean(this.publicBase)
    };
  }

  /**
   * Generate a Presigned PUT URL for direct-to-R2 browser uploads.
   * This completely avoids streaming large videos through Node.js Express memory buffers.
   */
  async getPresignedUploadUrl({ fileName, fileType, folder = 'videos', expiresIn = 3600 }) {
    if (!this.r2Client || this.driver !== 'r2') {
      return {
        success: false,
        driver: this.driver,
        configured: false,
        missing: this.missingR2Vars,
        message: 'Cloudflare R2 is not configured on this server. Provide R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and STORAGE_DRIVER=r2.'
      };
    }

    const ext = path.extname(fileName) || '.mp4';
    const baseName = path.basename(fileName, ext);
    const safeBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const storageKey = `${folder}/${safeBase}-${unique}${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ContentType: fileType || 'video/mp4'
      });

      const uploadUrl = await getSignedUrl(this.r2Client, command, { expiresIn });

      return {
        success: true,
        driver: 'r2',
        configured: true,
        uploadUrl,
        storageKey,
        publicUrl: this.publicBase ? `${this.publicBase}/${storageKey}` : null,
        expiresIn
      };
    } catch (err) {
      console.error('[StorageService] Error creating presigned PUT URL:', err);
      throw err;
    }
  }

  /**
   * For the local driver Multer writes directly to disk, so we just return the filename.
   * For R2 we upload the in‑memory buffer.
   */
  async uploadFile(file) {
    const ext = path.extname(file.originalname);
    const safeBase = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `${safeBase}-${unique}${ext}`;

    if (this.driver === 'r2' && this.r2Client) {
      try {
        await this.r2Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
          })
        );
        return key; // R2 object key
      } catch (err) {
        console.error('R2 upload error:', err);
        throw err;
      }
    }

    // Local driver – Multer already persisted the file on disk
    return file.filename;
  }

  /**
   * Return a URL that can be used by the frontend to stream or download the file.
   * For R2 we either use a configured public base URL or a short-lived signed GET URL.
   */
  async getFileUrl(filename, expiresIn = 3600) {
    if (!filename) return '';

    // If filename is already a full URL (e.g. YouTube, external CDN)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }

    if (this.driver === 'r2' && this.r2Client) {
      if (this.publicBase) {
        return `${this.publicBase}/${filename}`;
      }
      try {
        const command = new GetObjectCommand({ Bucket: this.bucket, Key: filename });
        const signed = await getSignedUrl(this.r2Client, command, { expiresIn });
        return signed;
      } catch (err) {
        console.warn(`[StorageService] Failed to sign R2 GET URL for "${filename}":`, err.message);
        return filename;
      }
    }

    // Local development – serve via static /uploads route
    return `/uploads/${path.basename(filename)}`;
  }

  /**
   * Alias for getFileUrl for video playback streaming
   */
  async getPlaybackUrl(storageKeyOrUrl, expiresIn = 3600) {
    return this.getFileUrl(storageKeyOrUrl, expiresIn);
  }

  /**
   * For Multer's `destination` function – only needed for local driver.
   */
  getUploadDir() {
    return localUploadDir;
  }

  /**
   * Delete a file from whichever backend is active.
   */
  async deleteFile(filename) {
    if (!filename) return false;
    if (this.driver === 'r2' && this.r2Client) {
      try {
        await this.r2Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: filename }));
        return true;
      } catch (err) {
        console.warn('[StorageService] R2 delete failed:', err.message);
        return false;
      }
    }

    // Local fallback
    const filePath = path.join(localUploadDir, path.basename(filename));
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        return true;
      } catch (err) {
        console.warn(`[StorageService] Could not remove local file ${filePath}:`, err.message);
        return false;
      }
    }
    return false;
  }

  getStorageInfo() {
    return {
      driver: this.driver,
      isPersistent: this.isPersistent,
      localDirectory: localUploadDir,
      r2Configured: Boolean(this.r2Client && this.driver === 'r2'),
      missingR2Vars: this.missingR2Vars,
      bucket: this.bucket || null
    };
  }
}

export const storageService = new StorageService();
