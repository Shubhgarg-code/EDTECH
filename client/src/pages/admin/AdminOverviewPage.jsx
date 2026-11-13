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
      <div className="py-24 text-center bg-[#070B14]">
        <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium">Loading academy system telemetry...</p>
      </div>
    );
  }

  const { stats, recentActivity, recentCourses } = data || {
    stats: {},
    recentActivity: [],
    recentCourses: []
  };

  return (
    <div className="space-y-8 bg-[#070B14] text-[#F8FAFC]">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B82F6]/20 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            Academic Operations Console
          </h1>
          <p className="text-xs text-[#A7B5CC] mt-1">
            Real-time curriculum metrics, student enrollment, and active inquiry log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </Link>
          <Link
            to="/admin/media"
            className="px-4 py-2 bg-[#101A2C] hover:bg-[#14213A] text-[#F8FAFC] font-semibold text-xs rounded-xl border border-[#3B82F6]/30 transition flex items-center gap-2"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Media Files</span>
          </Link>
        </div>
      </div>

      {/* Database Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Courses */}
        <div className="bg-[#101A2C] p-5 rounded-2xl border border-[#3B82F6]/20 shadow-xl flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#A7B5CC] uppercase tracking-wider block">
              Published Courses
            </span>
            <p className="text-3xl font-black text-[#F8FAFC] mt-1.5">
              {stats.totalPublishedCourses || 0}
            </p>
            <p className="text-[11px] text-[#60A5FA] mt-0.5">
              {stats.totalDraftCourses || 0} draft syllabi
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#3B82F6]" />
          </div>
        </div>

        {/* Registered Students */}
        <div className="bg-[#101A2C] p-5 rounded-2xl border border-[#3B82F6]/20 shadow-xl flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#A7B5CC] uppercase tracking-wider block">
              Enrolled Students
            </span>
            <p className="text-3xl font-black text-[#F8FAFC] mt-1.5">
              {stats.totalStudents || 0}
            </p>
            <p className="text-[11px] text-[#60A5FA] mt-0.5">
              Active student accounts
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#3B82F6]" />
          </div>
        </div>

        {/* Uploaded Media */}
        <div className="bg-[#101A2C] p-5 rounded-2xl border border-[#3B82F6]/20 shadow-xl flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#A7B5CC] uppercase tracking-wider block">
              Media Files
            </span>
            <p className="text-3xl font-black text-[#F8FAFC] mt-1.5">
              {stats.totalMedia || 0}
            </p>
            <p className="text-[11px] text-[#60A5FA] mt-0.5">
              PDFs, videos & formulas
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <FolderArchive className="w-5 h-5 text-[#3B82F6]" />
          </div>
        </div>

        {/* Contact Inquiries */}
        <div className="bg-[#101A2C] p-5 rounded-2xl border border-[#3B82F6]/20 shadow-xl flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#A7B5CC] uppercase tracking-wider block">
              Inquiries
            </span>
            <p className="text-3xl font-black text-[#F8FAFC] mt-1.5">
              {stats.totalContactInquiries || 0}
            </p>
            <p className="text-[11px] text-[#60A5FA] mt-0.5">
              {stats.unreadInquiries || 0} pending review
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-[#3B82F6]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Database Courses & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Courses List */}
        <div className="lg:col-span-7 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#3B82F6]/20 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Database Courses</span>
            </h2>
            <Link
              to="/admin/courses"
              className="text-xs font-semibold text-[#60A5FA] hover:text-white flex items-center gap-1 transition"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#A7B5CC]">
              No courses found in database. Create your first course above.
            </div>
          ) : (
            <div className="divide-y divide-[#3B82F6]/15">
              {recentCourses.map((c) => (
                <div key={c._id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-bold text-[#F8FAFC] hover:text-[#60A5FA] transition truncate">
                      <Link to={`/admin/courses`}>{c.title}</Link>
                    </h3>
                    <p className="text-[11px] text-[#A7B5CC] mt-0.5">
                      Enrolled: {c.totalEnrolled || 0} students • Category: {c.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                        c.isPublished
                          ? 'bg-[#14213A] text-[#60A5FA] border-[#3B82F6]/40'
                          : 'bg-[#070B14] text-[#A7B5CC] border-[#3B82F6]/20'
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
        <div className="lg:col-span-5 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-6 shadow-xl space-y-4">
          <div className="border-b border-[#3B82F6]/20 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Platform Audit Log</span>
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#A7B5CC]">
              No recent administrative activity logged.
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs pb-3 border-b border-[#3B82F6]/10 last:border-none last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#F8FAFC] leading-snug">{act.title}</p>
                    <p className="text-[11px] text-[#A7B5CC] truncate">{act.detail}</p>
                    <p className="text-[10px] text-[#60A5FA] font-mono mt-0.5">
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
