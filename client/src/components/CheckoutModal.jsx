import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/apiClient';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Lock
} from 'lucide-react';

export const CheckoutModal = ({ course, isOpen, onClose }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('MATH20');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isOpen || !course) return null;

  const currentPrice = course.discountPrice || course.price;
  const discountAmount = appliedCoupon
    ? Math.round((currentPrice * appliedCoupon.discountPercentage) / 100)
    : 0;
  const finalPayable = currentPrice - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const data = await api.post('/payments/apply-coupon', {
        code: couponCode,
        courseId: course._id
      });
      setAppliedCoupon(data);
      showToast(data.message, 'success');
    } catch (err) {
      showToast(err.message || 'Invalid coupon code', 'error');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!isAuthenticated) {
      showToast('Please log in or register before completing your enrollment.', 'info');
      navigate('/login', { state: { returnTo: `/courses/${course.slug}` } });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        courseId: course._id,
        couponCode: appliedCoupon ? appliedCoupon.code : ''
      });

      const { orderId } = orderRes.order;

      // 2. Execute payment verification
      const verifyRes = await api.post('/payments/verify', {
        orderId,
        isSandboxSimulation: true,
        razorpayPaymentId: `pay_rzp_${Date.now()}`
      });

      // 3. Success state
      setIsSuccess(true);
      setReceiptData({
        orderId: verifyRes.orderId,
        receiptNumber: verifyRes.receiptNumber,
        courseId: course._id
      });

      // Refresh current user enrolled state
      await refreshUser();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      showToast('Enrollment confirmed! Welcome to Mathematics Academy.', 'success');
    } catch (err) {
      showToast(err.message || 'Payment failed to complete.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToClassroom = () => {
    onClose();
    navigate(`/learn/${course._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101A2C] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#3B82F6]/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3B82F6]/20 flex items-center justify-between bg-[#0B1220]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">Secure Academy Checkout</h3>
              <p className="text-[11px] text-[#A7B5CC]">Encrypted Academic Enrollment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#F8FAFC]">
          {!isSuccess ? (
            <>
              {/* Course Item Summary */}
              <div className="flex gap-4 p-4 rounded-xl bg-[#14213A] border border-[#3B82F6]/25">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-16 rounded-lg object-cover shrink-0 border border-[#3B82F6]/20"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#60A5FA] tracking-wide uppercase">
                    {course.category}
                  </span>
                  <h4 className="font-bold text-[#F8FAFC] text-sm truncate">
                    {course.title}
                  </h4>
                  <p className="text-xs text-[#A7B5CC]">{course.batchName}</p>
                </div>
              </div>

              {/* Coupon Engine */}
              <div>
                <label className="text-xs font-semibold text-[#F8FAFC] block mb-1.5">
                  Scholarship / Discount Coupon
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#3B82F6] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MATH20"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="px-5 py-2 bg-[#14213A] hover:bg-[#1E293B] border border-[#3B82F6]/30 text-[#60A5FA] disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {isApplyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon {appliedCoupon.code} applied! ({appliedCoupon.discountPercentage}% OFF)
                  </p>
                )}
                <p className="text-[11px] text-[#A7B5CC] mt-1">
                  Use coupon <span className="font-bold text-[#60A5FA]">MATH20</span> for 20% scholarship.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-[#3B82F6]/15 pt-4">
                <div className="flex justify-between text-[#A7B5CC]">
                  <span>Tuition Fee</span>
                  <span>₹{course.price?.toLocaleString('en-IN')}</span>
                </div>
                {course.discountPrice && course.discountPrice < course.price && (
                  <div className="flex justify-between text-[#A7B5CC]">
                    <span>Standard Academic Subsidy</span>
                    <span className="text-emerald-400">
                      - ₹{(course.price - course.discountPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A7B5CC]">
                  <span>GST (18% included)</span>
                  <span>₹0.00</span>
                </div>
                <div className="border-t border-[#3B82F6]/20 pt-2.5 flex justify-between font-extrabold text-[#F8FAFC] text-sm">
                  <span>Net Payable Amount</span>
                  <span className="text-[#60A5FA] text-base">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Architecture */}
              <div className="rounded-xl p-3 bg-[#14213A] border border-[#3B82F6]/25 flex items-start gap-2.5 text-xs text-[#A7B5CC]">
                <Zap className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-[#F8FAFC]">Razorpay Gateway:</span> Instant access via UPI (GPay, PhonePe, Paytm), NetBanking, and Cards.
                </div>
              </div>
            </>
          ) : (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-[#F8FAFC]">
                  Enrollment Successful!
                </h4>
                <p className="text-xs text-[#A7B5CC]">
                  You are now enrolled in <span className="font-semibold text-[#60A5FA]">{course.title}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-xs text-left space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between text-[#A7B5CC]">
                  <span>Invoice Reference:</span>
                  <span className="font-mono font-semibold text-[#F8FAFC]">
                    {receiptData?.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between text-[#A7B5CC]">
                  <span>Order ID:</span>
                  <span className="font-mono text-[#A7B5CC] truncate max-w-[150px]">
                    {receiptData?.orderId}
                  </span>
                </div>
                <div className="flex justify-between text-[#A7B5CC]">
                  <span>Fee Paid:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#A7B5CC]">
                <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                <span>Invoice and enrollment receipt recorded in your student portal.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#0B1220] border-t border-[#3B82F6]/20">
          {!isSuccess ? (
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment Securely...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{finalPayable.toLocaleString('en-IN')} & Unlock Classroom</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleGoToClassroom}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <span>Enter LMS Classroom Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
