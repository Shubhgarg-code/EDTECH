import express from 'express';
import { uploadMediaFile, getAllMedia, deleteMedia } from '../controllers/mediaController.js';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Admin only routes for media
router.use(protect, authorize('admin'));

router.post('/upload', upload.single('file'), uploadMediaFile);
router.get('/', getAllMedia);
router.delete('/:id', deleteMedia);

export default router;
