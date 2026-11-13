import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetInfo(res);
      showToast('Password reset link created.', 'success');
    } catch (err) {
      showToast(err.message || 'Error requesting password reset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#070B14]">
      <div className="max-w-md w-full bg-[#101A2C] rounded-2xl p-8 border border-[#3B82F6]/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-[#A7B5CC]">
            Enter your registered email to receive recovery instructions
          </p>
        </div>

        {!resetInfo ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#F8FAFC] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#3B82F6] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@mathacademy.in"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 space-y-3 text-xs">
            <p className="font-bold text-[#60A5FA]">Password Reset Link Generated!</p>
            <p className="text-[#A7B5CC] leading-relaxed">
              In this environment, you can directly reset your password via the link below:
            </p>
            <Link
              to={`/reset-password/${resetInfo.resetToken}`}
              className="block p-2.5 bg-[#070B14] rounded-xl border border-[#3B82F6]/40 text-[#60A5FA] font-semibold text-center hover:bg-[#101A2C] transition truncate"
            >
              Click Here to Reset Password
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-[#A7B5CC]">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-[#60A5FA] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
