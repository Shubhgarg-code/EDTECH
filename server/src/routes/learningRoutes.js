import express from 'express';
import {
  getLmsClassroomData,
  updateLectureProgress,
  getCertificateData,
  getEnrolledDashboard
} from '../controllers/learningController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getEnrolledDashboard);
router.get('/classroom/:courseId', protect, getLmsClassroomData);
router.post('/progress/:courseId', protect, updateLectureProgress);
router.get('/certificate/:courseId', protect, getCertificateData);

export default router;

