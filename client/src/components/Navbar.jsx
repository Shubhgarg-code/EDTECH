import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Info,
  Mail,
  Compass
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#3B82F6]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#F8FAFC]">
                Mathematics<span className="text-[#60A5FA] font-light"> Academy</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#A7B5CC] -mt-1">
                Concept-First Mathematics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-[#A7B5CC]">
            <Link
              to="/courses"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isActive('/courses')
                  ? 'text-white bg-[#14213A] border border-[#3B82F6]/30 font-semibold'
                  : 'hover:text-white hover:bg-[#101A2C]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Courses</span>
            </Link>

            <Link
              to="/about"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isActive('/about')
                  ? 'text-white bg-[#14213A] border border-[#3B82F6]/30 font-semibold'
                  : 'hover:text-white hover:bg-[#101A2C]'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>About Us</span>
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isActive('/contact')
                  ? 'text-white bg-[#14213A] border border-[#3B82F6]/30 font-semibold'
                  : 'hover:text-white hover:bg-[#101A2C]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Contact</span>
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-white bg-[#14213A] border border-[#3B82F6]/30 font-semibold'
                    : 'hover:text-white hover:bg-[#101A2C]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[#60A5FA] bg-[#14213A] hover:bg-[#1E293B] font-semibold border border-[#3B82F6]/40 ml-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Admin CMS</span>
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#A7B5CC] hover:text-white px-3.5 py-2 rounded-lg hover:bg-[#14213A] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 px-4 py-2 rounded-lg transition shadow-md shadow-blue-500/25 active:scale-95"
                >
                  Student Register
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-[#3B82F6]/30 hover:border-[#60A5FA]/60 bg-[#101A2C] hover:bg-[#14213A] transition cursor-pointer"
                >
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#F8FAFC] leading-tight">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-[#A7B5CC] uppercase tracking-wider">{user?.role}</p>
                  </div>
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white font-semibold text-xs flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#A7B5CC] mr-0.5" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#101A2C] rounded-xl shadow-2xl border border-[#3B82F6]/30 py-1.5 z-50 animate-in fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-[#3B82F6]/15">
                      <p className="text-xs font-semibold text-[#F8FAFC] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#A7B5CC] truncate">{user?.email}</p>
                    </div>

                    {!isAdmin && (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#A7B5CC] hover:bg-[#14213A] hover:text-white transition"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>My Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#A7B5CC] hover:bg-[#14213A] hover:text-white transition"
                    >
                      <User className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#60A5FA] bg-[#14213A]/60 hover:bg-[#14213A] transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-[#3B82F6]/15 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#3B82F6]/20 bg-[#0B1220] px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
          >
            Courses
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
                >
                  My Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7B5CC] hover:text-white hover:bg-[#14213A]"
              >
                Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#60A5FA] bg-[#14213A]"
                >
                  Admin CMS Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-lg border border-[#3B82F6]/30 text-sm font-semibold text-[#F8FAFC] hover:bg-[#14213A]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-sm font-semibold text-white shadow-md"
              >
                Student Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
