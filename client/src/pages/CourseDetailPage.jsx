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
      <div className="max-w-7xl mx-auto px-4 py-28 text-center bg-[#070B14]">
        <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium tracking-wide">
          Loading comprehensive curriculum...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-5 bg-[#070B14]">
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Course Not Found</h2>
        <p className="text-xs text-[#A7B5CC]">The course you are looking for may have been archived or rescheduled.</p>
        <Link to="/courses" className="inline-block px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
          Explore Other Courses
        </Link>
      </div>
    );
  }

  const discountPercent = Math.round(
    ((course.price - course.discountPrice) / course.price) * 100
  );

  return (
    <div className="pb-28 space-y-12 bg-[#070B14] text-[#F8FAFC]">
      {/* Course Header Banner */}
      <section className="relative overflow-hidden math-gradient-hero pt-14 pb-18 border-b border-[#3B82F6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Headline */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold px-3 py-0.5 rounded-md shadow-sm">
                  {course.category}
                </span>
                <span className="bg-[#14213A] text-[#A7B5CC] border border-[#3B82F6]/20 px-3 py-0.5 rounded-md">
                  {course.level}
                </span>
                <span className="text-[#60A5FA] font-semibold flex items-center gap-1.5 bg-[#101A2C] px-3 py-0.5 rounded-md border border-[#3B82F6]/20">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                  {course.batchName}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-[#A7B5CC] leading-relaxed max-w-2xl">
                {course.tagline}
              </p>

              {/* Course Meta Info Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[#A7B5CC] border-t border-[#3B82F6]/20">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                  <span>Duration: <strong className="text-[#F8FAFC]">{course.duration || 'Self-paced'}</strong></span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                  <span>Curriculum: <strong className="text-[#F8FAFC]">{course.modules?.length || 0} Modules ({course.totalLectures || 0} Lessons)</strong></span>
                </div>
                <div>
                  <span className="font-semibold text-[#60A5FA]">{course.schedule}</span>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="flex items-center gap-3.5 pt-3">
                <img
                  src={course.instructor?.avatar}
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#3B82F6]"
                />
                <div>
                  <p className="text-[11px] text-[#A7B5CC]">Curated by</p>
                  <p className="font-bold text-[#F8FAFC] text-sm">{course.instructor?.name}</p>
                  <p className="text-[11px] text-[#60A5FA]">{course.instructor?.title}</p>
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
          <div className="lg:col-span-8 space-y-8">
            {/* Overview & What You'll Learn */}
            <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-8 border border-[#3B82F6]/25 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                Key Mathematical Competencies Covered
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#A7B5CC]">
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Syllabus Accordion */}
            <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-8 border border-[#3B82F6]/25 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#3B82F6]/20 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Structured Syllabus & Lectures
                  </h2>
                  <p className="text-xs text-[#A7B5CC] mt-1">
                    {course.modules?.length} Modules • {course.totalLectures} In-Depth Video Lectures
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {course.modules?.map((mod, modIdx) => (
                  <div
                    key={mod._id || modIdx}
                    className="border border-[#3B82F6]/20 rounded-xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenModuleIndex(openModuleIndex === modIdx ? -1 : modIdx)}
                      className="w-full px-5 py-4 bg-[#14213A] hover:bg-[#1E293B] flex items-center justify-between text-left transition cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider">
                          Module {modIdx + 1}
                        </span>
                        <h3 className="font-bold text-[#F8FAFC] text-sm">{mod.title}</h3>
                        <p className="text-xs text-[#A7B5CC]">{mod.lectures?.length || 0} Lectures</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#3B82F6] transition-transform ${
                          openModuleIndex === modIdx ? 'rotate-180 text-[#60A5FA]' : ''
                        }`}
                      />
                    </button>

                    {openModuleIndex === modIdx && (
                      <div className="divide-y divide-[#3B82F6]/10 px-5 py-2 bg-[#0B1220]">
                        {mod.lectures?.map((lec, lecIdx) => (
                          <div
                            key={lec._id || lecIdx}
                            className="py-3 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-[10px]">
                                {lecIdx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-[#F8FAFC]">{lec.title}</p>
                                <p className="text-[11px] text-[#A7B5CC] flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3 text-[#3B82F6]" />
                                  <span>{lec.duration}</span>
                                </p>
                              </div>
                            </div>

                            <div>
                              {lec.isFreePreview ? (
                                <button
                                  onClick={() => setPreviewVideo(lec)}
                                  className="text-xs font-bold text-[#60A5FA] hover:text-white bg-[#14213A] border border-[#3B82F6]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-[#3B82F6]" />
                                  <span>Preview Free</span>
                                </button>
                              ) : (
                                <div className="text-[11px] text-[#A7B5CC]/70 flex items-center gap-1 font-medium">
                                  <Lock className="w-3 h-3 text-[#3B82F6]/50" />
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
            <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-8 border border-[#3B82F6]/25 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-[#F8FAFC]">Academic Prerequisites</h2>
              <ul className="space-y-2 text-xs text-[#A7B5CC] list-disc list-inside">
                {course.prerequisites?.map((req, idx) => (
                  <li key={idx} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Sticky Checkout Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/30 shadow-2xl space-y-6">
              {/* Promo Video Thumbnail preview */}
              <div
                onClick={() => setPreviewVideo({ title: `${course.title} - Video Preview`, videoUrl: course.promoVideoUrl })}
                className="relative rounded-xl overflow-hidden aspect-video bg-[#070B14] cursor-pointer group border border-[#3B82F6]/20"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2.5 left-2.5 bg-[#070B14]/80 text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Watch Course Preview
                </span>
              </div>

              {/* Pricing Box */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-[#F8FAFC]">
                    ₹{course.discountPrice?.toLocaleString('en-IN') || course.price?.toLocaleString('en-IN')}
                  </span>
                  {course.discountPrice && (
                    <span className="text-sm text-[#A7B5CC]/70 line-through">
                      ₹{course.price?.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-2 py-0.5 rounded shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A7B5CC]">
                  Full course access including all PDF notes and video updates
                </p>
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/learn/${course._id}`)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Enter LMS Classroom</span>
                </button>
              ) : (
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <span>Enroll in this Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Guarantees */}
              <div className="space-y-2.5 pt-3 border-t border-[#3B82F6]/15 text-xs text-[#A7B5CC]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span>Verified Mathematics Academy Syllabus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#3B82F6]" />
                  <span>Official Course Completion Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#3B82F6]" />
                  <span>Interactive Online Practice & Homework</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Lecture Preview Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#101A2C] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#3B82F6]/30">
            <div className="p-4 flex items-center justify-between text-[#F8FAFC] border-b border-[#3B82F6]/20 bg-[#0B1220]">
              <h3 className="text-sm font-bold truncate">{previewVideo.title}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-[#A7B5CC] hover:text-white text-xs font-semibold px-2.5 py-1 bg-[#14213A] border border-[#3B82F6]/30 rounded transition"
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
