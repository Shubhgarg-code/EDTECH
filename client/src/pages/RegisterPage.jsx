import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, User, Phone, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please provide your full name, email, and password.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, phone, password });
      showToast('Account created successfully! Welcome to Mathematics Academy.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#070B14]">
      <div className="max-w-md w-full bg-[#101A2C] rounded-2xl p-8 border border-[#3B82F6]/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-[#A7B5CC]">
            Begin your conceptual mathematics learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#F8FAFC] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#3B82F6] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
              />
            </div>
          </div>

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
                placeholder="rohan@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#F8FAFC] mb-1.5">
              Phone Number <span className="text-[#A7B5CC]/60 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#3B82F6] absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#F8FAFC] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#3B82F6] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#A7B5CC] hover:text-[#F8FAFC] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register for Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#A7B5CC]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#60A5FA] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
