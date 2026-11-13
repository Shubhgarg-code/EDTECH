import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created'
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay UPI / Cards'
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    couponApplied: {
      code: String,
      discountPercentage: Number
    },
    receiptNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);

