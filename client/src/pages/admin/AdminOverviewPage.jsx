import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Users,
  FolderArchive,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

export const AdminOverviewPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/admin/overview');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load admin overview.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [showToast]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading database statistics...</p>
      </div>
    );
  }

  const { stats, recentActivity, recentCourses } = data || {
    stats: {},
    recentActivity: [],
    recentCourses: []
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Purposeful Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry and database record counts. Zero simulated analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/courses"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </Link>
          <Link
            to="/admin/media"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition flex items-center gap-1.5"
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
            <span>Media Library</span>
          </Link>
        </div>
      </div>

      {/* Database Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Courses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Published Courses
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalPublishedCourses || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.totalDraftCourses || 0} in draft mode
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Registered Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Enrolled Students
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalStudents || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified accounts
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Uploaded Media */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Uploaded Media
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalMedia || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Local storage files
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <FolderArchive className="w-4 h-4" />
          </div>
        </div>

        {/* Contact Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Visitor Inquiries
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalContactInquiries || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.unreadInquiries || 0} pending review
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Database Courses & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Courses List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Database Courses</span>
            </h2>
            <Link
              to="/admin/courses"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Manage Catalogue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No courses found in database. Create your first course above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCourses.map((c) => (
                <div key={c._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition truncate">
                      <Link to={`/admin/courses`}>{c.title}</Link>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enrolled: {c.totalEnrolled || 0} students
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${
                        c.isPublished
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Activity Stream */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Platform Audit Log</span>
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent administrative activity logged.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs pb-2.5 border-b border-slate-50 last:border-none last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 leading-snug">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{act.detail}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(act.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
