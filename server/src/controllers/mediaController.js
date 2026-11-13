import { Media } from '../models/Media.js';
import { getCategoryFromMime } from '../middleware/upload.js';
import { storageService } from '../services/storageService.js';

export const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload.' });
    }

    const { originalname, mimetype, size } = req.file;
    const category = getCategoryFromMime(mimetype);
    // Upload to storage (R2 or local) and obtain stored name/key
    const storedName = await storageService.uploadFile(req.file);
    // Generate fresh URL for response (do NOT persist signed URL in DB)
    const freshUrl = await storageService.getFileUrl(storedName);

    let media;
    try {
      media = await Media.create({
        filename: storedName,
        originalName: originalname,
        mimeType: mimetype,
        size,
        url: '', // Do not persist signed URLs; dynamically generated on retrieval
        category,
        uploadedBy: req.user ? req.user._id : null
      });
    } catch (e) {
      // Cleanup uploaded file if DB record creation fails
      try {
        await storageService.deleteFile(storedName);
      } catch (delErr) {
        console.warn('Upload rollback failed:', delErr.message);
      }
      throw e; // propagate to error handler
    }

    // Attach fresh URL for client response
    const responseMedia = media.toObject();
    responseMedia.url = freshUrl;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      media: responseMedia
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
    const mediaDocs = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Generate fresh URLs for each record (R2 signed or local path) without persisting
    const media = await Promise.all(
      mediaDocs.map(async (doc) => {
        const obj = doc.toObject();
        try {
          const freshUrl = await storageService.getFileUrl(doc.filename);
          obj.url = freshUrl;
        } catch (e) {
          console.warn('Failed to generate URL for', doc.filename, e.message);
          obj.url = '';
        }
        return obj;
      })
    );

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

    // Attempt storage deletion
    const deleted = await storageService.deleteFile(media.filename);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete physical media file from storage. Database record preserved.'
      });
    }

    // Delete database record only after storage deletion succeeds
    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media file permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
