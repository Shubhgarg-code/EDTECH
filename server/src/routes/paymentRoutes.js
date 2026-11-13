import express from 'express';
import {
  createOrder,
  verifyPayment,
  applyCoupon,
  getOrderReceipt
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply-coupon', protect, applyCoupon);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/receipt/:orderId', protect, getOrderReceipt);

export default router;

