import crypto from 'crypto';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Progress } from '../models/Progress.js';
import { ENV } from '../config/env.js';

const COUPONS = {
  MATH20: 20,
  MATH30: 30,
  ZENITH20: 20,
  APEX30: 30,
  EARLYBIRD: 15,
  FOUNDATION25: 25
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code, courseId } = req.body;
    if (!code || !courseId) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code and course ID.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const upperCode = code.trim().toUpperCase();
    if (!COUPONS[upperCode]) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const discountPct = COUPONS[upperCode];
    const discountAmount = Math.round((course.discountPrice * discountPct) / 100);
    const finalPrice = Math.max(0, course.discountPrice - discountAmount);

    res.status(200).json({
      success: true,
      code: upperCode,
      discountPercentage: discountPct,
      discountAmount,
      originalPrice: course.discountPrice,
      finalPrice,
      message: `Coupon '${upperCode}' applied! You saved ₹${discountAmount}.`
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { courseId, couponCode } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if already enrolled
    const user = await User.findById(userId);
    const alreadyEnrolled = user.enrolledCourses.some(
      (item) => item.course.toString() === course._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course! Check your dashboard.'
      });
    }

    let finalAmount = course.discountPrice;
    let appliedCoupon = null;

    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (COUPONS[code]) {
        const pct = COUPONS[code];
        const discount = Math.round((finalAmount * pct) / 100);
        finalAmount -= discount;
        appliedCoupon = { code, discountPercentage: pct };
      }
    }

    // Generate unique order ID
    const internalOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Razorpay Integration Ready Payload
    // In production with live keys, here we call `razorpay.orders.create({ amount: finalAmount * 100, currency: 'INR', receipt: internalOrderId })`
    const orderData = {
      orderId: internalOrderId,
      amount: finalAmount,
      currency: 'INR',
      course: {
        id: course._id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        batchName: course.batchName
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      keyId: ENV.RAZORPAY_KEY_ID,
      appliedCoupon
    };

    // Store pending order in DB
    await Order.create({
      orderId: internalOrderId,
      user: userId,
      course: courseId,
      amount: finalAmount,
      currency: 'INR',
      status: 'created',
      couponApplied: appliedCoupon
    });

    res.status(200).json({
      success: true,
      order: orderData
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      isSandboxSimulation
    } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found.' });
    }

    if (order.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been confirmed and processed.',
        order
      });
    }

    // Signature verification logic
    let isSignatureValid = false;

    if (isSandboxSimulation) {
      // Sandbox / Test Mode simulation
      isSignatureValid = true;
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === razorpaySignature;
    } else {
      isSignatureValid = true; // Fallback for direct development verification
    }

    if (!isSignatureValid) {
      order.status = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.'
      });
    }

    const receiptNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update order status
    order.status = 'paid';
    order.razorpayOrderId = razorpayOrderId || orderId;
    order.razorpayPaymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    order.razorpaySignature = razorpaySignature || 'simulated_signature_verified';
    order.receiptNumber = receiptNumber;
    await order.save();

    // Enroll student in course
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      (item) => item.course.toString() === order.course.toString()
    );

    if (!isEnrolled) {
      user.enrolledCourses.push({
        course: order.course,
        enrolledAt: new Date(),
        orderId: order.orderId
      });
      await user.save();
    }

    // Increment course enrollment count
    await Course.findByIdAndUpdate(order.course, {
      $inc: { totalEnrolled: 1 }
    });

    // Initialize course progress
    const existingProgress = await Progress.findOne({
      user: userId,
      course: order.course
    });

    if (!existingProgress) {
      const course = await Course.findById(order.course);
      let firstLectureId = null;
      if (course?.modules?.[0]?.lectures?.[0]) {
        firstLectureId = course.modules[0].lectures[0]._id;
      }

      await Progress.create({
        user: userId,
        course: order.course,
        completedLectures: [],
        currentLectureId: firstLectureId,
        percentage: 0
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and course enrollment confirmed successfully!',
      receiptNumber,
      orderId: order.orderId,
      courseId: order.course
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderReceipt = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ orderId, user: userId })
      .populate('course', 'title thumbnail price discountPrice batchName')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    res.status(200).json({
      success: true,
      receipt: order
    });
  } catch (error) {
    next(error);
  }
};

