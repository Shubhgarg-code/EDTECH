import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  Play,
  ArrowRight,
  Bell,
  CheckCircle2,
  FileText,
  Sparkles,
  Receipt
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/learn/dashboard');
        if (data.success) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-4">Loading your student dashboard...</p>
      </div>
    );
  }

  const { stats, enrolledCourses, progressList } = dashboardData || {
    stats: { totalCourses: 0, completedCourses: 0, totalCompletedLectures: 0, totalHoursLearned: 0 },
    enrolledCourses: [],
    progressList: []
  };

  // Find most recent active course progress
  const activeProgress = progressList && progressList.length > 0 ? progressList[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Session Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 📚
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            "Pure mathematics is, in its way, the poetry of logical ideas." Keep practising problems regularly and revise your notes.
          </p>
        </div>

        <Link
          to="/courses"
          className="self-start md:self-center px-5 py-3 rounded-xl bg-white text-blue-700 text-xs font-extrabold hover:bg-blue-50 transition shadow-md active:scale-95 shrink-0"
        >
          Explore More Courses
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.totalCourses}</p>
            <p className="text-xs text-slate-500 font-medium">Enrolled Courses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.totalCompletedLectures}</p>
            <p className="text-xs text-slate-500 font-medium">Lectures Finished</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.totalHoursLearned}h</p>
            <p className="text-xs text-slate-500 font-medium">Hours Studied</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.completedCourses}</p>
            <p className="text-xs text-slate-500 font-medium">Certificates Unlocked</p>
          </div>
        </div>
      </div>

      {/* Continue Learning Highlight Banner */}
      {activeProgress && activeProgress.course && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <img
              src={activeProgress.course.thumbnail}
              alt={activeProgress.course.title}
              className="w-24 h-16 sm:w-28 sm:h-20 rounded-2xl object-cover shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                Jump Back In
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {activeProgress.course.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${activeProgress.percentage}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-700">{activeProgress.percentage}% Completed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/learn/${activeProgress.course._id}`)}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Lecture</span>
          </button>
        </div>
      )}

      {/* My Enrolled Courses Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            My Enrolled Courses ({enrolledCourses.length})
          </h2>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">You haven't enrolled in any course yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore our mathematics courses and start building solid conceptual clarity today.
            </p>
            <Link
              to="/courses"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Browse Available Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((item) => {
              const course = item.course;
              if (!course) return null;

              const progress = progressList.find(
                (p) => p.course?._id === course._id || p.course === course._id
              );
              const pct = progress ? progress.percentage : 0;

              return (
                <div
                  key={item._id || course._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {course.batchName || 'Enrolled'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {course.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-bold text-slate-800">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/learn/${course._id}`)}
                      className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>Go to Classroom</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

