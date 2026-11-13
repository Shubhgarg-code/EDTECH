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
  Sparkles,
  Target,
  Brain,
  Compass,
  CheckCircle2,
  Atom
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
        if (coursesRes.success) {
          // De-duplicate courses by ID to eliminate any potential duplicate renders
          const rawCourses = coursesRes.courses || [];
          const uniqueMap = new Map();
          rawCourses.forEach((c) => {
            if (c && c._id && !uniqueMap.has(c._id)) {
              uniqueMap.set(c._id, c);
            }
          });
          setCourses(Array.from(uniqueMap.values()));
        }
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
      <div className="py-32 text-center bg-[#070B14]">
        <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium tracking-wide">
          Loading Mathematics Academy curriculum...
        </p>
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
    <div className="space-y-16 sm:space-y-20 pb-20 bg-[#070B14] text-[#F8FAFC]">
      {/* 1. Announcements Banner (if active) */}
      {sectionsVisibility?.showAnnouncements && activeAnnouncements.length > 0 && (
        <div className="bg-[#0B1220] text-[#A7B5CC] px-4 py-2 text-xs text-center border-b border-[#3B82F6]/20">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
            <span className="bg-[#14213A] text-[#60A5FA] uppercase text-[10px] px-2.5 py-0.5 rounded font-bold tracking-wider border border-[#3B82F6]/30">
              {activeAnnouncements[0].badge}
            </span>
            <span className="text-[#F8FAFC]">
              {activeAnnouncements[0].title}: {activeAnnouncements[0].content}
            </span>
            {activeAnnouncements[0].link && (
              <Link
                to={activeAnnouncements[0].link}
                className="text-[#60A5FA] underline font-semibold hover:text-white ml-1"
              >
                Learn More →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Section with Mathematical Visual Accents */}
      {sectionsVisibility?.showHero && (
        <section className="relative overflow-hidden math-gradient-hero border-b border-[#3B82F6]/20 py-16 sm:py-24">
          {/* Subtle geometric background grid */}
          <div className="absolute inset-0 math-grid-pattern opacity-60 pointer-events-none" />

          {/* Floating subtle math formula watermarks */}
          <div className="absolute top-12 left-10 text-[#3B82F6]/10 font-mono text-3xl font-black select-none pointer-events-none hidden md:block">
            ∫ e^(iπ) + 1 = 0 dx
          </div>
          <div className="absolute bottom-8 right-12 text-[#60A5FA]/10 font-mono text-3xl font-black select-none pointer-events-none hidden md:block">
            ∑_{'{n=1}'}^∞ (1/n²) = π²/6
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {hero?.badge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101A2C] border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-semibold shadow-inner">
                    <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
                    <span>{hero.badge}</span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.12]">
                  Structured <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent">Mathematics</span> Education
                </h1>

                <p className="text-sm sm:text-base text-[#A7B5CC] max-w-2xl leading-relaxed">
                  {hero?.subheading ||
                    'Concept-driven curriculum, rigorous problem solving, and structured modules crafted for school, boards, and competitive examinations.'}
                </p>

                {/* Mathematical pillars chips */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#101A2C] border border-[#3B82F6]/20 text-[#A7B5CC] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">✓</span> Pure Conceptual Proofs
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#101A2C] border border-[#3B82F6]/20 text-[#A7B5CC] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">✓</span> Step-by-Step Problem Sets
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#101A2C] border border-[#3B82F6]/20 text-[#A7B5CC] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">✓</span> Downloadable Formula Sheets
                  </span>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
                  <Link
                    to={hero?.primaryCtaLink || '/courses'}
                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition active:scale-95"
                  >
                    <span>{hero?.primaryCtaText || 'Explore Courses'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={hero?.secondaryCtaLink || '/about'}
                    className="px-6 py-3.5 rounded-xl bg-[#101A2C] hover:bg-[#14213A] text-[#F8FAFC] font-semibold text-xs sm:text-sm border border-[#3B82F6]/30 hover:border-[#60A5FA]/50 transition flex items-center justify-center gap-2"
                  >
                    <span>{hero?.secondaryCtaText || 'Teaching Philosophy'}</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Mathematics Identity */}
              <div className="lg:col-span-5">
                <div className="bg-[#101A2C] rounded-2xl p-3 border border-[#3B82F6]/30 shadow-2xl shadow-blue-950/60 relative group">
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#070B14] border border-[#3B82F6]/20 relative">
                    <img
                      src={
                        hero?.heroImage && !hero.heroImage.includes('photo-1517694712202')
                          ? hero.heroImage
                          : 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Mathematics Academy Educational Platform"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101A2C] via-transparent to-transparent opacity-75" />

                    {/* Overlay Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-[#0B1220]/80 backdrop-blur-md p-2.5 rounded-lg border border-[#3B82F6]/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                        <span className="font-bold text-[#F8FAFC]">Foundation to Advanced</span>
                      </div>
                      <span className="text-[#60A5FA] font-medium text-[11px]">Class 11, 12 & Competitive</span>
                    </div>
                  </div>

                  <div className="pt-3 px-2 flex items-center justify-between text-[11px] text-[#A7B5CC]">
                    <span className="font-semibold text-[#F8FAFC]">Mathematics Academy Core Curriculum</span>
                    <span className="text-[#60A5FA]">Verified Syllabus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Academic Approach / 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/20 space-y-3 hover:border-[#60A5FA]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA]">
              <Target className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Concept-First Foundations</h3>
            <p className="text-xs text-[#A7B5CC] leading-relaxed">
              Every mathematical topic starts from fundamental intuition and geometric proofs, avoiding rote memorisation.
            </p>
          </div>

          <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/20 space-y-3 hover:border-[#60A5FA]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA]">
              <Brain className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Methodical Problem Solving</h3>
            <p className="text-xs text-[#A7B5CC] leading-relaxed">
              Systematic problem breakdowns categorized from standard textbook exercises to high-difficulty competitive challenges.
            </p>
          </div>

          <div className="bg-[#101A2C] rounded-2xl p-6 border border-[#3B82F6]/20 space-y-3 hover:border-[#60A5FA]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA]">
              <Compass className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Structured Academic Progression</h3>
            <p className="text-xs text-[#A7B5CC] leading-relaxed">
              Carefully designed sequences connecting Algebra, Coordinate Geometry, Trigonometry, and Differential Calculus.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Featured Courses Section */}
      {sectionsVisibility?.showFeaturedCourses && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3B82F6]/20 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-[#3B82F6]" />
                <span>Academic Programs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
                Available Mathematics Courses
              </h2>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                        : 'bg-[#101A2C] text-[#A7B5CC] hover:text-white border border-[#3B82F6]/20 hover:border-[#60A5FA]/40'
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
            <div className="text-center py-16 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 p-8 space-y-3">
              <BookOpen className="w-12 h-12 text-[#3B82F6]/40 mx-auto" />
              <h3 className="font-bold text-[#F8FAFC] text-base">No courses currently published</h3>
              <p className="text-xs text-[#A7B5CC] max-w-sm mx-auto leading-relaxed">
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

      {/* 5. Subject Areas (CMS Driven) */}
      {sectionsVisibility?.showCategories && cmsCategories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="border-b border-[#3B82F6]/20 pb-3">
            <h2 className="text-xl font-bold text-[#F8FAFC]">
              Subject Disciplines
            </h2>
            <p className="text-xs text-[#A7B5CC] mt-0.5">
              Explore key mathematical domains taught with rigorous academic methodology.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cmsCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className="bg-[#101A2C] p-4 rounded-xl border border-[#3B82F6]/20 hover:border-[#60A5FA]/45 text-left cursor-pointer transition-all space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#14213A] text-[#60A5FA] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-xs truncate group-hover:text-[#60A5FA] transition">
                    {cat}
                  </h4>
                  <p className="text-[11px] text-[#A7B5CC] mt-0.5">Explore syllabus →</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. About Section Preview */}
      {sectionsVisibility?.showAbout && about && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-6 sm:p-9 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                Academy Methodology
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                {about.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#A7B5CC] leading-relaxed max-w-2xl">
                {about.description}
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  <span>Learn About Our Approach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-xl overflow-hidden aspect-video bg-[#070B14] border border-[#3B82F6]/30">
                <img
                  src={
                    about.aboutImage && !about.aboutImage.includes('photo-1522202176988')
                      ? about.aboutImage
                      : 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80'
                  }
                  alt="Mathematics Academy Classroom and Research"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQs Accordion */}
      {sectionsVisibility?.showFaq && faqs?.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="border-b border-[#3B82F6]/20 pb-3 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[#F8FAFC]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#A7B5CC] mt-0.5">
              Clear answers regarding curriculum structure, notes, assignments, and access.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq._id || index}
                className="bg-[#101A2C] rounded-xl border border-[#3B82F6]/20 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#F8FAFC] hover:text-[#60A5FA] transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#3B82F6] transition-transform duration-200 shrink-0 ml-2 ${
                      openFaq === index ? 'rotate-180 text-[#60A5FA]' : ''
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-4 pt-1 text-xs text-[#A7B5CC] leading-relaxed border-t border-[#3B82F6]/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Contact Banner */}
      {sectionsVisibility?.showContact && contact && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0B1220] via-[#101A2C] to-[#14213A] rounded-2xl p-7 border border-[#3B82F6]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                Academic Enquiries & Admissions
              </h3>
              <p className="text-xs text-[#A7B5CC]">
                Have questions regarding the mathematics curriculum? Contact our academic office at{' '}
                <span className="font-semibold text-[#60A5FA]">{contact.email}</span>.
              </p>
            </div>

            <Link
              to="/contact"
              className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-md shadow-blue-500/25"
            >
              Contact Academy
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
