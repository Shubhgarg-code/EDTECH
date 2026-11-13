import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Media } from '../models/Media.js';
import { getCategoryFromMime } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

export const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload.' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const category = getCategoryFromMime(mimetype);
    const fileUrl = `/uploads/${filename}`;

    const media = await Media.create({
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size,
      url: fileUrl,
      category,
      uploadedBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      media
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMedia = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      media
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media file not found.' });
    }

    // Remove file from disk
    const filePath = path.join(uploadDir, media.filename);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn('Could not delete physical file from disk:', err.message);
      }
    }

    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media file permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
