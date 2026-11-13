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
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Website CMS', to: '/admin/cms', icon: SlidersHorizontal },
    { label: 'Media Library', to: '/admin/media', icon: FolderArchive },
    { label: 'Students Directory', to: '/admin/students', icon: Users },
    { label: 'Grading Portal', to: '/admin/assignments', icon: Award }
  ];

  // Helper to determine current section name for breadcrumbs
  const getCurrentSectionTitle = () => {
    const item = navItems.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    );
    if (location.pathname.includes('/content')) return 'Course Content';
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4 text-slate-200" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Maths <span className="text-slate-400 font-normal text-xs">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 transition-all duration-200 z-40 fixed inset-y-0 left-0 md:static ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">
                  Mathematics Academy
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                Administration Console
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations & Content
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
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold border-l-2 border-blue-500 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Website</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live ↗</span>
          </Link>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px] flex items-center justify-center shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-mono">Admin Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Administration</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">{getCurrentSectionTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
              <Shield className="w-3 h-3 text-slate-500" />
              <span>Full Control Access</span>
            </span>

            <Link
              to="/"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-50 transition"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
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
