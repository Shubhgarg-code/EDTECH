// storageService.js – Multi-cloud S3-compatible integration (Backblaze B2 & Cloudflare R2) + Local Disk
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

// AWS SDK v3 – S3 client (compatible with Backblaze B2 and Cloudflare R2)
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const localUploadDir = path.join(__dirname, '../../uploads');

// Ensure local upload directory exists (dev only)
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

/**
 * Storage Service Adapter – supports Backblaze B2, Cloudflare R2, and local disk.
 */
class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.isPersistent = this.driver !== 'local' || process.env.PERSISTENT_DISK === 'true';

    this.requiredB2Vars = ['B2_KEY_ID', 'B2_APPLICATION_KEY', 'B2_BUCKET_NAME', 'B2_ENDPOINT', 'B2_REGION'];
    this.requiredR2Vars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];

    this.s3Client = null;
    this.r2Client = null; // backward compatibility alias
    this.bucket = null;
    this.publicBase = null;
    this.missingVars = [];

    if (ENV.NODE_ENV === 'production' && !this.isPersistent) {
      console.warn(
        '⚠️  [Storage Advisory]: Running with local disk storage in production. '
        + 'Files uploaded to /uploads will be ephemeral unless a persistent disk is mounted. '
        + 'Configure Backblaze B2 (STORAGE_DRIVER=b2) or Cloudflare R2 (STORAGE_DRIVER=r2) for persistent storage.'
      );
    }

    // Initialize cloud driver if configured
    this.initClient();
  }

  initClient() {
    if (this.driver === 'b2') {
      const missing = this.requiredB2Vars.filter((v) => !process.env[v]);
      this.missingVars = missing;
      if (missing.length) {
        console.warn(`⚠️  [StorageService] Missing Backblaze B2 env vars: ${missing.join(', ')}`);
        this.s3Client = null;
        this.r2Client = null;
      } else {
        try {
          this.s3Client = new S3Client({
            endpoint: process.env.B2_ENDPOINT,
            region: process.env.B2_REGION || 'us-east-005',
            credentials: {
              accessKeyId: process.env.B2_KEY_ID,
              secretAccessKey: process.env.B2_APPLICATION_KEY
            }
          });
          this.r2Client = this.s3Client;
          this.bucket = process.env.B2_BUCKET_NAME;
          this.publicBase = process.env.B2_PUBLIC_URL?.replace(/\/*$/, '') || null;
          console.log(`✅ [StorageService] Backblaze B2 S3 client initialized for bucket "${this.bucket}" (${process.env.B2_REGION || 'us-east-005'})`);
        } catch (err) {
          console.error('❌ [StorageService] Error initializing Backblaze B2 S3 client:', err.message);
          this.s3Client = null;
          this.r2Client = null;
        }
      }
    } else if (this.driver === 'r2') {
      const missing = this.requiredR2Vars.filter((v) => !process.env[v]);
      this.missingVars = missing;
      if (missing.length) {
        console.warn(`⚠️  [StorageService] Missing R2 env vars: ${missing.join(', ')}`);
        this.s3Client = null;
        this.r2Client = null;
      } else {
        try {
          this.s3Client = new S3Client({
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: 'auto',
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
            }
          });
          this.r2Client = this.s3Client;
          this.bucket = process.env.R2_BUCKET_NAME;
          this.publicBase = process.env.R2_PUBLIC_URL?.replace(/\/*$/, '') || null;
          console.log(`✅ [StorageService] Cloudflare R2 client initialized for bucket "${this.bucket}"`);
        } catch (err) {
          console.error('❌ [StorageService] Error initializing R2 S3 client:', err.message);
          this.s3Client = null;
          this.r2Client = null;
        }
      }
    }
  }

  isCloudStorageConfigured() {
    return Boolean(this.s3Client && (this.driver === 'b2' || this.driver === 'r2'));
  }

  isB2Configured() {
    return {
      driver: this.driver,
      configured: Boolean(this.s3Client && this.driver === 'b2'),
      missing: this.driver === 'b2' ? this.missingVars : this.requiredB2Vars.filter((v) => !process.env[v]),
      bucket: this.driver === 'b2' ? this.bucket : null,
      endpoint: process.env.B2_ENDPOINT || null,
      region: process.env.B2_REGION || null
    };
  }

  isR2Configured() {
    return {
      driver: this.driver,
      configured: Boolean(this.s3Client && this.driver === 'r2'),
      missing: this.driver === 'r2' ? this.missingVars : this.requiredR2Vars.filter((v) => !process.env[v]),
      bucket: this.driver === 'r2' ? this.bucket : null,
      hasPublicBase: Boolean(this.publicBase)
    };
  }

  /**
   * Check if a file object exists in storage (HeadObject).
   */
  async checkFileExists(filename) {
    if (!filename) return false;
    if (this.isCloudStorageConfigured()) {
      try {
        await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: filename }));
        return true;
      } catch (err) {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
          return false;
        }
        throw err;
      }
    }

    // Local fallback check
    const filePath = path.join(localUploadDir, path.basename(filename));
    return fs.existsSync(filePath);
  }

  /**
   * Generate a Presigned PUT URL for direct browser uploads to Backblaze B2 / R2.
   * Large files upload directly to storage without passing through Render's Node memory buffer.
   */
  async getPresignedUploadUrl({ fileName, fileType, folder = 'videos', expiresIn = 3600 }) {
    if (!this.isCloudStorageConfigured()) {
      const driverName = this.driver === 'b2' ? 'Backblaze B2' : (this.driver === 'r2' ? 'Cloudflare R2' : 'Cloud Storage');
      const reqVars = this.driver === 'b2' ? this.requiredB2Vars : this.requiredR2Vars;
      return {
        success: false,
        driver: this.driver,
        configured: false,
        missing: this.missingVars.length ? this.missingVars : reqVars,
        message: `${driverName} is not configured on this server. Set ${reqVars.join(', ')} and STORAGE_DRIVER=${this.driver === 'r2' ? 'r2' : 'b2'}.`
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
        ContentType: fileType || 'application/octet-stream'
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        success: true,
        driver: this.driver,
        configured: true,
        uploadUrl,
        storageKey,
        bucket: this.bucket,
        publicUrl: this.publicBase ? `${this.publicBase}/${storageKey}` : null,
        expiresIn
      };
    } catch (err) {
      console.error(`[StorageService] Error creating presigned PUT URL for ${this.driver}:`, err);
      throw err;
    }
  }

  /**
   * Upload an in-memory buffer or disk file to storage.
   */
  async uploadFile(file) {
    const ext = path.extname(file.originalname);
    const safeBase = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `${safeBase}-${unique}${ext}`;

    if (this.isCloudStorageConfigured()) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
          })
        );
        return key;
      } catch (err) {
        console.error(`[StorageService] ${this.driver} upload error:`, err);
        throw err;
      }
    }

    // Local driver – Multer already persisted the file on disk
    return file.filename;
  }

  /**
   * Extract internal object key if a full B2/R2 URL for our bucket was accidentally stored.
   */
  extractCloudKey(filename) {
    if (!filename || (!filename.startsWith('http://') && !filename.startsWith('https://'))) {
      return filename;
    }
    if (!this.bucket) return null;
    try {
      const parsed = new URL(filename);
      const host = parsed.hostname.toLowerCase();
      const isOurB2 = host.includes('backblazeb2.com') && (host.startsWith(`${this.bucket.toLowerCase()}.`) || parsed.pathname.startsWith(`/${this.bucket}/`));
      const isOurR2 = host.includes('r2.cloudflarestorage.com') && (host.startsWith(`${this.bucket.toLowerCase()}.`) || parsed.pathname.startsWith(`/${this.bucket}/`));
      if (!isOurB2 && !isOurR2) return null;

      let key = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
      if (key.startsWith(`${this.bucket}/`)) {
        key = key.slice(this.bucket.length + 1);
      }
      return key || null;
    } catch {
      return null;
    }
  }

  /**
   * Return a URL that can be used by the frontend to stream or download the file.
   * For private B2/R2 buckets, returns a short-lived signed GET URL (default 1 hour expiry).
   */
  async getFileUrl(filename, expiresIn = 3600) {
    if (!filename) return '';

    let targetKey = filename;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      const extracted = this.extractCloudKey(filename);
      if (!extracted) {
        // External URL (e.g. YouTube, external CDN)
        return filename;
      }
      targetKey = extracted;
    }

    if (this.isCloudStorageConfigured()) {
      if (this.publicBase) {
        return `${this.publicBase}/${targetKey}`;
      }
      try {
        const command = new GetObjectCommand({ Bucket: this.bucket, Key: targetKey });
        const signed = await getSignedUrl(this.s3Client, command, { expiresIn });
        return signed;
      } catch (err) {
        console.warn(`[StorageService] Failed to sign ${this.driver} GET URL for "${targetKey}":`, err.message);
        return filename;
      }
    }

    // Local development – serve via static /uploads route
    return `/uploads/${path.basename(targetKey)}`;
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
    if (this.isCloudStorageConfigured()) {
      try {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: filename }));
        return true;
      } catch (err) {
        console.warn(`[StorageService] ${this.driver} delete failed:`, err.message);
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
      configured: this.isCloudStorageConfigured(),
      b2Configured: Boolean(this.s3Client && this.driver === 'b2'),
      r2Configured: Boolean(this.s3Client && this.driver === 'r2'),
      missingVars: this.missingVars,
      bucket: this.bucket || null,
      endpoint: this.driver === 'b2' ? process.env.B2_ENDPOINT : (this.driver === 'r2' && process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : null),
      region: this.driver === 'b2' ? process.env.B2_REGION : (this.driver === 'r2' ? 'auto' : null)
    };
  }
}

export const storageService = new StorageService();
