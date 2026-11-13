import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  SlidersHorizontal,
  FolderArchive,
  Users,
  Award,
  ExternalLink,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  Shield
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Courses Management', to: '/admin/courses', icon: BookOpen },
    { label: 'Website CMS & Settings', to: '/admin/cms', icon: SlidersHorizontal },
    { label: 'Media Library', to: '/admin/media', icon: FolderArchive },
    { label: 'Students Directory', to: '/admin/students', icon: Users },
    { label: 'Grading & Problem Sets', to: '/admin/assignments', icon: Award }
  ];

  const getCurrentSectionTitle = () => {
    const item = navItems.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    );
    if (location.pathname.includes('/content')) return 'Course Content & Syllabus';
    return item ? item.label : 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-[#0B1220] text-white px-4 py-3 flex items-center justify-between border-b border-[#3B82F6]/20 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#F8FAFC]">
            Mathematics Academy <span className="text-[#60A5FA] font-light text-xs">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-[#A7B5CC] hover:text-white hover:bg-[#14213A] cursor-pointer"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-[#0B1220] text-[#A7B5CC] flex flex-col shrink-0 border-r border-[#3B82F6]/20 transition-all duration-200 z-40 fixed inset-y-0 left-0 md:static ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#3B82F6]/15">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#F8FAFC]">
                Mathematics Academy
              </span>
              <p className="text-[10px] text-[#60A5FA] font-semibold tracking-wider uppercase mt-0.5">
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-[#A7B5CC]/70 uppercase tracking-wider mb-2">
            Academy Operations
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#14213A] text-white border-l-3 border-[#3B82F6] shadow-md shadow-blue-500/10'
                      : 'text-[#A7B5CC] hover:text-white hover:bg-[#101A2C]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-[#3B82F6]" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-[#3B82F6]/15 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Public Website</span>
            </div>
            <span className="text-[10px] text-[#60A5FA] font-mono">Live ↗</span>
          </Link>

          <div className="p-2.5 rounded-xl bg-[#101A2C] border border-[#3B82F6]/25 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">{user?.name || 'Administrator'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-[#60A5FA] font-mono">Faculty Access</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#A7B5CC] hover:text-rose-400 hover:bg-[#14213A] transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#070B14]">
        {/* Top Header Bar */}
        <header className="bg-[#0B1220]/95 backdrop-blur-md border-b border-[#3B82F6]/20 px-6 py-3.5 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#A7B5CC] font-medium">
            <span>Administration</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#F8FAFC] font-bold">{getCurrentSectionTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14213A] text-[#60A5FA] text-[11px] font-semibold border border-[#3B82F6]/30">
              <Shield className="w-3 h-3 text-[#3B82F6]" />
              <span>Full Control Access</span>
            </span>

            <Link
              to="/"
              target="_blank"
              className="text-xs text-[#A7B5CC] hover:text-white font-medium flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-[#14213A] transition"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3 h-3 text-[#3B82F6]" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
