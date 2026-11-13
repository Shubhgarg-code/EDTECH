import express from 'express';
import {
  getPlatformOverview,
  getAllStudents,
  getStudentDetails,
  toggleCourseEnrollment
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect, authorize('admin'));

router.get('/overview', getPlatformOverview);
router.get('/analytics', getPlatformOverview);
router.get('/students', getAllStudents);
router.get('/students/:studentId', getStudentDetails);
router.post('/enrollment', toggleCourseEnrollment);

export default router;
