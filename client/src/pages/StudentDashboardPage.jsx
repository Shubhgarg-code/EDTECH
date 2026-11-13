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
  CheckCircle2,
  Sparkles
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
      <div className="max-w-7xl mx-auto px-4 py-28 text-center bg-[#070B14]">
        <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium">Loading your student dashboard...</p>
      </div>
    );
  }

  const { stats, enrolledCourses, progressList } = dashboardData || {
    stats: { totalCourses: 0, completedCourses: 0, totalCompletedLectures: 0, totalHoursLearned: 0 },
    enrolledCourses: [],
    progressList: []
  };

  const activeProgress = progressList && progressList.length > 0 ? progressList[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#070B14] text-[#F8FAFC]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1220] via-[#101A2C] to-[#14213A] rounded-2xl p-7 sm:p-9 text-white border border-[#3B82F6]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101A2C] border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Active Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 📐
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B5CC] max-w-xl leading-relaxed">
            "Pure mathematics is, in its way, the poetry of logical ideas." Continue your lectures, practice assignments, and formula revision.
          </p>
        </div>

        <Link
          to="/courses"
          className="self-start md:self-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition active:scale-95 shrink-0"
        >
          Explore More Courses
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101A2C] p-5 rounded-xl border border-[#3B82F6]/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#F8FAFC]">{stats.totalCourses}</p>
            <p className="text-xs text-[#A7B5CC] font-medium">Enrolled Courses</p>
          </div>
        </div>

        <div className="bg-[#101A2C] p-5 rounded-xl border border-[#3B82F6]/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#F8FAFC]">{stats.totalCompletedLectures}</p>
            <p className="text-xs text-[#A7B5CC] font-medium">Lectures Finished</p>
          </div>
        </div>

        <div className="bg-[#101A2C] p-5 rounded-xl border border-[#3B82F6]/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#F8FAFC]">{stats.totalHoursLearned}h</p>
            <p className="text-xs text-[#A7B5CC] font-medium">Hours Studied</p>
          </div>
        </div>

        <div className="bg-[#101A2C] p-5 rounded-xl border border-[#3B82F6]/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#F8FAFC]">{stats.completedCourses}</p>
            <p className="text-xs text-[#A7B5CC] font-medium">Certificates Earned</p>
          </div>
        </div>
      </div>

      {/* Continue Learning Highlight Banner */}
      {activeProgress && activeProgress.course && (
        <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/25 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <img
              src={activeProgress.course.thumbnail}
              alt={activeProgress.course.title}
              className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover shrink-0 border border-[#3B82F6]/30"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-wide">
                Active Study Module
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] truncate">
                {activeProgress.course.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[#A7B5CC]">
                <div className="w-36 bg-[#070B14] rounded-full h-2 overflow-hidden border border-[#3B82F6]/20">
                  <div
                    className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] h-full rounded-full transition-all"
                    style={{ width: `${activeProgress.percentage}%` }}
                  />
                </div>
                <span className="font-semibold text-[#60A5FA]">{activeProgress.percentage}% Completed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/learn/${activeProgress.course._id}`)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Lecture</span>
          </button>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#3B82F6]/20 pb-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#3B82F6]" />
            My Mathematics Courses ({enrolledCourses.length})
          </h2>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 space-y-4 p-8">
            <BookOpen className="w-12 h-12 text-[#3B82F6]/40 mx-auto" />
            <h3 className="font-bold text-[#F8FAFC] text-base">You haven't enrolled in any course yet</h3>
            <p className="text-xs text-[#A7B5CC] max-w-sm mx-auto">
              Explore our mathematics courses and start building solid conceptual clarity today.
            </p>
            <Link
              to="/courses"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
            >
              Browse Mathematics Courses
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
                  className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 overflow-hidden shadow-lg hover:border-[#60A5FA]/40 transition flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-[#070B14]">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 bg-[#070B14]/80 backdrop-blur-md text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                      {course.batchName || 'Enrolled'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#3B82F6] uppercase">
                        {course.category}
                      </span>
                      <h3 className="font-bold text-[#F8FAFC] text-sm leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#3B82F6]/15">
                      <div className="flex justify-between text-xs text-[#A7B5CC]">
                        <span>Syllabus Progress</span>
                        <span className="font-bold text-[#F8FAFC]">{pct}%</span>
                      </div>
                      <div className="w-full bg-[#070B14] rounded-full h-2 overflow-hidden border border-[#3B82F6]/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/learn/${course._id}`)}
                      className="w-full py-2.5 bg-[#14213A] hover:bg-gradient-to-r hover:from-[#2563EB] hover:to-[#3B82F6] text-[#60A5FA] hover:text-white font-bold text-xs rounded-xl border border-[#3B82F6]/30 hover:border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer"
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
