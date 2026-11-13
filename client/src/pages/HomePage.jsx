import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/CourseCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { api } from '../api/apiClient';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
  GraduationCap,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const HomePage = () => {
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, coursesRes] = await Promise.all([
          api.get('/cms/settings'),
          api.get('/courses')
        ]);

        if (settingsRes.success) setSettings(settingsRes.settings);
        if (coursesRes.success) setCourses(coursesRes.courses);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading academy curriculum...</p>
      </div>
    );
  }

  const {
    hero,
    about,
    contact,
    sectionsVisibility,
    faqs,
    announcements,
    categories: cmsCategories
  } = settings || {};

  const activeAnnouncements = announcements?.filter((a) => a.isActive) || [];

  const categories = [
    'All',
    ...(cmsCategories || ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics'])
  ];

  const filteredCourses =
    activeCategory === 'All'
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-14 sm:space-y-16 pb-16">
      {/* 1. Announcements Banner (if enabled in CMS) */}
      {sectionsVisibility?.showAnnouncements && activeAnnouncements.length > 0 && (
        <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs text-center border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
            <span className="bg-slate-800 text-slate-300 uppercase text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider border border-slate-700">
              {activeAnnouncements[0].badge}
            </span>
            <span className="text-slate-300">
              {activeAnnouncements[0].title}: {activeAnnouncements[0].content}
            </span>
            {activeAnnouncements[0].link && (
              <Link
                to={activeAnnouncements[0].link}
                className="text-white underline font-semibold hover:text-slate-100 ml-1"
              >
                Learn More →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Section (Controlled by CMS) */}
      {sectionsVisibility?.showHero && (
        <section className="bg-white border-b border-slate-200/90 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {hero?.badge && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                    <span>{hero.badge}</span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.18]">
                  {hero?.heading || 'Structured Mathematics Education for Every Learner'}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                  {hero?.subheading}
                </p>

                {/* Purposeful Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    to={hero?.primaryCtaLink || '/courses'}
                    className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>{hero?.primaryCtaText || 'Explore Courses'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={hero?.secondaryCtaLink || '/about'}
                    className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 transition flex items-center justify-center gap-2"
                  >
                    <span>{hero?.secondaryCtaText || 'Academic Philosophy'}</span>
                  </Link>
                </div>
              </div>

              {/* Right Showcase Image & Academic Note */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm">
                  <div className="rounded-lg overflow-hidden aspect-video bg-slate-200 border border-slate-200/60">
                    <img
                      src={
                        hero?.heroImage ||
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Mathematics Academy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 px-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">Structured Mathematics Curriculum</span>
                    <span>Self-Paced & Batch Courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Courses Section */}
      {sectionsVisibility?.showFeaturedCourses && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Course Catalogue</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Available Courses
              </h2>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Courses Grid or Authentic Empty State */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800 text-sm">No courses currently published</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Courses created in the Admin Panel will appear here once marked as published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onQuickEnroll={(c) => setSelectedCourseForEnroll(c)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. Course Categories (CMS Driven) */}
      {sectionsVisibility?.showCategories && cmsCategories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Subject Areas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organised by subject area and academic level.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {cmsCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 text-left cursor-pointer transition space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs truncate">{cat}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">View Courses →</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. About Section Preview (CMS Driven) */}
      {sectionsVisibility?.showAbout && about && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Our Teaching Approach
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {about.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {about.description}
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                >
                  <span>Learn About Our Approach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-lg overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                <img
                  src={
                    about.aboutImage ||
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
                  }
                  alt="About Us"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQs Accordion (CMS Driven) */}
      {sectionsVisibility?.showFaq && faqs?.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="border-b border-slate-200 pb-3 text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear answers about course delivery, access duration, and support.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <div
                key={faq._id || index}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 hover:text-slate-900 transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                      openFaq === index ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Contact Office CTA (CMS Driven) */}
      {sectionsVisibility?.showContact && contact && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-xl p-6 sm:p-7 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-slate-900">
                Enquiries & Admissions
              </h3>
              <p className="text-xs text-slate-600">
                Contact our team at{' '}
                <span className="font-semibold text-slate-900">{contact.email}</span> or visit our campus.
              </p>
            </div>

            <Link
              to="/contact"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shrink-0"
            >
              Contact Us
            </Link>
          </div>
        </section>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        course={selectedCourseForEnroll}
        isOpen={!!selectedCourseForEnroll}
        onClose={() => setSelectedCourseForEnroll(null)}
      />
    </div>
  );
};
