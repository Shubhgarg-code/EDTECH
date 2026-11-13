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

  const currentPrice = course.discountPrice;
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

      // 2. Simulate or execute payment verification
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

      showToast('Enrollment confirmed! Welcome to the batch.', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Secure Checkout</h3>
              <p className="text-[11px] text-slate-500">256-bit SSL Encrypted Transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isSuccess ? (
            <>
              {/* Course Item Summary */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 tracking-wide uppercase">
                    {course.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500">{course.batchName}</p>
                </div>
              </div>

              {/* Coupon Engine */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Have a Coupon Code?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MATH20"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                  >
                    {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon {appliedCoupon.code} applied! ({appliedCoupon.discountPercentage}% OFF)
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Try promo code <span className="font-semibold text-blue-600">MATH20</span> for 20% discount.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Course Fee</span>
                  <span>₹{course.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Scholarship Discount</span>
                  <span className="text-emerald-600">
                    - ₹{(course.price - course.discountPrice).toLocaleString('en-IN')}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% included)</span>
                  <span>₹0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Amount Payable</span>
                  <span className="text-blue-600">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Architecture Information */}
              <div className="rounded-xl p-3 bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold">Razorpay Ready:</span> Supports UPI, Google Pay, PhonePe, Paytm, NetBanking, and Debit/Credit Cards with automated webhook confirmation.
                </div>
              </div>
            </>
          ) : (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Payment Successful!
                </h4>
                <p className="text-xs text-slate-500">
                  You are now enrolled in <span className="font-semibold text-slate-800">{course.title}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-left space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between text-slate-500">
                  <span>Invoice Reference:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {receiptData?.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Order ID:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[150px]">
                    {receiptData?.orderId}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-600">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Invoice and enrollment receipt recorded in your dashboard.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          {!isSuccess ? (
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.98]"
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
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
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

