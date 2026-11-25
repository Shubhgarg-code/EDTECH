import express from 'express';
import {
  getAllCourses,
  adminGetAllCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
  addModule,
  updateModule,
  deleteModule,
  addLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
  addAssignment,
  deleteAssignment
} from '../controllers/courseController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Public courses catalogue (only published courses)
router.get('/', getAllCourses);

// Admin get all courses (drafts + published)
router.get('/admin/all', protect, authorize('admin'), adminGetAllCourses);

// Public / Student course detail
router.get('/:slug', optionalProtect, getCourseBySlug);

// Admin-only Course CRUD
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.patch('/:id/toggle-publish', protect, authorize('admin'), togglePublish);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

// Admin-only Module Management
router.post('/:courseId/modules', protect, authorize('admin'), addModule);
router.put('/:courseId/modules/:moduleId', protect, authorize('admin'), updateModule);
router.delete('/:courseId/modules/:moduleId', protect, authorize('admin'), deleteModule);

// Admin-only Lecture Management
router.post('/:courseId/lectures', protect, authorize('admin'), addLecture);
router.post('/:courseId/modules/:moduleId/lectures', protect, authorize('admin'), addLecture);
router.put('/:courseId/modules/:moduleId/lectures-reorder', protect, authorize('admin'), reorderLectures);
router.put('/:courseId/modules/:moduleId/lectures/:lectureId', protect, authorize('admin'), updateLecture);
router.delete('/:courseId/modules/:moduleId/lectures/:lectureId', protect, authorize('admin'), deleteLecture);

// Admin-only Course Assignment Management
router.post('/:courseId/assignments', protect, authorize('admin'), addAssignment);
router.delete('/:courseId/assignments/:assignmentId', protect, authorize('admin'), deleteAssignment);

export default router;
