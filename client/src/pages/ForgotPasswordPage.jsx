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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter your registered email to receive recovery instructions
          </p>
        </div>

        {!resetInfo ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
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
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 text-xs">
            <p className="font-bold text-blue-900">Password Reset Link Generated!</p>
            <p className="text-slate-600 leading-relaxed">
              In this environment, you can directly reset your password via the link below:
            </p>
            <Link
              to={`/reset-password/${resetInfo.resetToken}`}
              className="block p-2.5 bg-white rounded-xl border border-blue-200 text-blue-600 font-semibold text-center hover:bg-blue-50 transition truncate"
            >
              Click Here to Reset Password
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

