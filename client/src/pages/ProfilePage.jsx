import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/apiClient';
import { User, Phone, Mail, FileText, Lock, Loader2, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone, bio, avatar });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Error changing password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#070B14] text-[#F8FAFC]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-[#A7B5CC] mt-1">
          Manage your personal details and authentication credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Avatar Card */}
        <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/25 text-center space-y-4 shadow-xl h-fit">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80'}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover mx-auto border-3 border-[#3B82F6] shadow-lg"
          />
          <div>
            <h3 className="font-bold text-[#F8FAFC] text-base">{user?.name}</h3>
            <p className="text-xs text-[#60A5FA] font-semibold capitalize mt-0.5">{user?.role} Account</p>
            <p className="text-xs text-[#A7B5CC] mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Right Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-7 border border-[#3B82F6]/25 shadow-xl space-y-4">
            <h3 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#3B82F6]" />
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#070B14]/60 border border-[#3B82F6]/15 rounded-xl text-[#A7B5CC] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Academic Bio / Goals</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-7 border border-[#3B82F6]/25 shadow-xl space-y-4">
            <h3 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3B82F6]" />
              Update Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 bg-[#14213A] hover:bg-[#1E293B] border border-[#3B82F6]/40 text-[#60A5FA] hover:text-white font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
