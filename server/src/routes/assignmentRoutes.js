import express from 'express';
import {
  submitAssignment,
  getStudentSubmissions,
  getAllSubmissions,
  gradeSubmission
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.post('/submit', protect, submitAssignment);
router.get('/student/:courseId', protect, getStudentSubmissions);

// Admin review routes
router.get('/all', protect, authorize('admin'), getAllSubmissions);
router.put('/grade/:submissionId', protect, authorize('admin'), gradeSubmission);

export default router;

