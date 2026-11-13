import express from 'express';
import {
  getPublicSettings,
  updateSettings,
  addFaq,
  updateFaq,
  deleteFaq,
  addAnnouncement,
  deleteAnnouncement,
  submitContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage
} from '../controllers/cmsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Public routes
router.get('/settings', getPublicSettings);
router.post('/contact', submitContactMessage);

// Admin CMS routes
router.put('/settings', protect, authorize('admin'), updateSettings);
router.post('/faqs', protect, authorize('admin'), addFaq);
router.put('/faqs/:faqId', protect, authorize('admin'), updateFaq);
router.delete('/faqs/:faqId', protect, authorize('admin'), deleteFaq);

router.post('/announcements', protect, authorize('admin'), addAnnouncement);
router.delete('/announcements/:announcementId', protect, authorize('admin'), deleteAnnouncement);

router.get('/messages', protect, authorize('admin'), getAllContactMessages);
router.put('/messages/:messageId', protect, authorize('admin'), updateContactMessageStatus);
router.delete('/messages/:messageId', protect, authorize('admin'), deleteContactMessage);

export default router;
