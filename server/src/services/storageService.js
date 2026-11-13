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

    if (ENV.NODE_ENV === 'production' && !this.isPersistent) {
      console.warn(
        '⚠️  [Storage Advisory]: Running with local disk storage in production. '
        + 'Files uploaded to /uploads will be ephemeral unless a persistent disk is mounted. '
        + 'Configure Cloudflare R2 via STORAGE_DRIVER=r2 for persistent storage.'
      );
    }

    // Initialise R2 client when driver is r2
    if (this.driver === 'r2') {
      const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
      const missing = required.filter(v => !process.env[v]);
      if (missing.length) {
        console.warn(`⚠️  [StorageService] Missing R2 env vars: ${missing.join(', ')}`);
      } else {
        this.r2Client = new S3Client({
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          region: 'auto', // Cloudflare uses a pseudo‑region
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
          }
        });
        this.bucket = process.env.R2_BUCKET_NAME;
        // Optional public base URL – e.g. https://public.r2.cloudflarestorage.com/<bucket>
        this.publicBase = process.env.R2_PUBLIC_URL?.replace(/\/*$/, '');
      }
    }
  }

  /**
   * For the local driver Multer writes directly to disk, so we just return the filename.
   * For R2 we upload the in‑memory buffer.
   */
  async uploadFile(file) {
    // Create a safe, unique key
    const safeBase = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `${safeBase}-${unique}${path.extname(file.originalname)}`;

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
   * Return a URL that can be used by the frontend to download the file.
   * For R2 we either use a configured public base URL or a signed URL (1 h expiry).
   */
  async getFileUrl(filename) {
    if (this.driver === 'r2' && this.r2Client) {
      if (this.publicBase) {
        return `${this.publicBase}/${filename}`;
      }
      // Signed URL fallback (1 hour)
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: filename });
      const signed = await getSignedUrl(this.r2Client, command, { expiresIn: 3600 });
      return signed;
    }
    // Local development – serve via static /uploads route
    return `/uploads/${filename}`;
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
      localDirectory: localUploadDir
    };
  }
}

export const storageService = new StorageService();
