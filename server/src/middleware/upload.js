import multer from 'multer';
import path from 'path';
import { storageService } from '../services/storageService.js';

// Storage engine – choose based on STORAGE_DRIVER
let storage;
if (process.env.STORAGE_DRIVER === 'r2') {
  // Use memory storage; actual upload happens in controller via storageService.uploadFile
  storage = multer.memoryStorage();
} else {
  // Local disk storage (default)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageService.getUploadDir());
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
  });
}

// Allowed MIME types
const allowedMimes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'text/plain',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type '${file.mimetype}'. Allowed types: JPG, PNG, WebP, PDF, DOCX, ZIP, MP4, WebM.`
      ),
      false
    );
  }
};

export const getCategoryFromMime = (mime) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || mime.includes('word') || mime.includes('document')) return 'document';
  if (mime.startsWith('video/')) return 'video';
  return 'other';
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max size
  }
});
