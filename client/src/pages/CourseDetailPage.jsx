import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckoutModal } from '../components/CheckoutModal';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  Play,
  FileText,
  ChevronDown,
  Award,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(0);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.get(`/courses/${slug}`);
        if (data.success) {
          setCourse(data.course);
          setIsEnrolled(data.isEnrolled);
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-4">Loading comprehensive curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-xs text-slate-500">The course you are looking for may have been archived or rescheduled.</p>
        <Link to="/courses" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Explore Other Courses
        </Link>
      </div>
    );
  }

  const discountPercent = Math.round(
    ((course.price - course.discountPrice) / course.price) * 100
  );

  return (
    <div className="pb-24 space-y-12">
      {/* Course Header Banner */}
      <section className="bg-slate-900 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Headline */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                  {course.category}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                  {course.level}
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {course.batchName}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {course.tagline}
              </p>

              {/* Course Meta Info Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Duration: <strong className="text-white">{course.duration || 'Self-paced'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Structure: <strong className="text-white">{course.modules?.length || 0} Modules ({course.totalLectures || 0} Lectures)</strong></span>
                </div>
                <div>
                  <span className="font-bold text-white">{course.schedule}</span>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="flex items-center gap-3.5 pt-4">
                <img
                  src={course.instructor?.avatar}
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="font-bold text-white text-sm">{course.instructor?.name}</p>
                  <p className="text-[11px] text-blue-400">{course.instructor?.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Enrollment Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Syllabus, Details, FAQ */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview & What You'll Learn */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                What You'll Learn in this Course
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Syllabus Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Curriculum & Lecture Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    {course.modules?.length} Modules • {course.totalLectures} Interactive Lectures
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {course.modules?.map((mod, modIdx) => (
                  <div
                    key={mod._id || modIdx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenModuleIndex(openModuleIndex === modIdx ? -1 : modIdx)}
                      className="w-full px-5 py-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-blue-600 uppercase">
                          Module {modIdx + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{mod.title}</h3>
                        <p className="text-xs text-slate-500">{mod.lectures?.length || 0} Lectures</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          openModuleIndex === modIdx ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>

                    {openModuleIndex === modIdx && (
                      <div className="divide-y divide-slate-100 px-5 py-2 bg-white">
                        {mod.lectures?.map((lec, lecIdx) => (
                          <div
                            key={lec._id || lecIdx}
                            className="py-3 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                                {lecIdx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{lec.title}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lec.duration}</span>
                                </p>
                              </div>
                            </div>

                            <div>
                              {lec.isFreePreview ? (
                                <button
                                  onClick={() => setPreviewVideo(lec)}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                                >
                                  <Play className="w-3 h-3 fill-blue-600" />
                                  <span>Preview Free</span>
                                </button>
                              ) : (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>Enrolled Only</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Prerequisites & Requirements</h2>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                {course.prerequisites?.map((req, idx) => (
                  <li key={idx} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Sticky Checkout Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6">
              {/* Promo Video Thumbnail preview */}
              <div
                onClick={() => setPreviewVideo({ title: `${course.title} - Promo Preview`, videoUrl: course.promoVideoUrl })}
                className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 cursor-pointer group"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                    <Play className="w-6 h-6 fill-blue-600 ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Watch Course Preview
                </span>
              </div>

              {/* Pricing Box */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{course.discountPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{course.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full lifetime access including future course updates
                </p>
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/learn/${course._id}`)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Enter LMS Classroom</span>
                </button>
              ) : (
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>Enroll in this Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Guarantees */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>7-Day Full Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Accredited Completion Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>100% Online & Flexible Schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Lecture Preview Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 flex items-center justify-between text-white border-b border-slate-800">
              <h3 className="text-sm font-bold truncate">{previewVideo.title}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded"
              >
                Close Preview
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        course={course}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
};

