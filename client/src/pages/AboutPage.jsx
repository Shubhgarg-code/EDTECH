import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import {
  CheckCircle2,
  ArrowRight,
  Compass,
  Target,
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase,
  Clock,
  Award
} from 'lucide-react';

export const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get('/cms/settings');
        if (res.success && res.settings?.about) {
          setAboutData(res.settings.about);
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center bg-[#070B14]">
        <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium">Loading institutional details...</p>
      </div>
    );
  }

  const { heading, description, mission, vision, features, aboutImage } = aboutData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 bg-[#070B14] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#3B82F6]/20 pb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-2.5">
          <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
          <span>Academic Philosophy & Foundation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
          {heading || 'About Mathematics Academy'}
        </h1>
        <p className="text-sm sm:text-base text-[#A7B5CC] max-w-3xl mt-3.5 leading-relaxed">
          {description ||
            'Mathematics Academy was founded to deliver structured, concept-driven mathematics education. We focus on building rock-solid intuition, rigorous theorem proofs, and disciplined problem-solving methodologies.'}
        </p>
      </header>

      {/* Mission & Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Mission */}
        <div className="bg-[#101A2C] rounded-2xl p-7 border border-[#3B82F6]/25 shadow-xl space-y-3.5 hover:border-[#60A5FA]/40 transition">
          <div className="w-10 h-10 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Our Academic Mission</h2>
          <p className="text-xs sm:text-sm text-[#A7B5CC] leading-relaxed">{mission}</p>
        </div>

        {/* Vision */}
        <div className="bg-[#101A2C] rounded-2xl p-7 border border-[#3B82F6]/25 shadow-xl space-y-3.5 hover:border-[#60A5FA]/40 transition">
          <div className="w-10 h-10 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center">
            <Target className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Our Institutional Vision</h2>
          <p className="text-xs sm:text-sm text-[#A7B5CC] leading-relaxed">{vision}</p>
        </div>
      </section>

      {/* Meet Your Educator / Leadership Profile */}
      <section className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-7 sm:p-10 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Avatar Initials Badge */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] flex items-center justify-center font-extrabold text-white text-3xl sm:text-4xl border-2 border-[#60A5FA]/60 shadow-xl shadow-blue-500/20">
                AM
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#0B1220] border border-[#3B82F6]/40 text-[#60A5FA] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                Lead Educator
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              Aman Mishra
            </h3>
            <p className="text-xs text-[#60A5FA] font-medium mt-1">
              Founder & Lead Mathematics Educator
            </p>
          </div>

          {/* Details & Credentials */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                Educator Profile
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight mt-1">
                Learn Mathematics with Conceptual Clarity
              </h2>
              <p className="text-xs sm:text-sm text-[#A7B5CC] leading-relaxed mt-2.5">
                Aman Mishra leads Mathematics Academy with a dedication to transforming abstract mathematical concepts into intuitive, structured knowledge. His pedagogical methodology prioritises foundational clarity, algebraic fluency, and rigorous proof construction over rote memorisation.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#3B82F6]/25 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <p className="text-xs font-bold text-[#F8FAFC]">IIT Delhi Alumnus</p>
                <p className="text-[11px] text-[#A7B5CC]">Rigorous analytical background</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#3B82F6]/25 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <p className="text-xs font-bold text-[#F8FAFC]">Former Oracle Professional</p>
                <p className="text-[11px] text-[#A7B5CC]">Industry-tested problem solving</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#3B82F6]/25 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <p className="text-xs font-bold text-[#F8FAFC]">5 Years Experience</p>
                <p className="text-[11px] text-[#A7B5CC]">Proven track record in pedagogy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Tenets & Showcase */}
      <section className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-7 sm:p-10 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Academic Environment Image */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#070B14] border border-[#3B82F6]/30">
              <img
                src={
                  aboutImage && !aboutImage.includes('photo-1522202176988')
                    ? aboutImage
                    : 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80'
                }
                alt="Mathematics Academy Research and Classroom"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-[#A7B5CC] mt-2.5 text-center font-medium">
              Concept-driven lessons & guided mathematical problem solving
            </p>
          </div>

          {/* Right: Core Features */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                Teaching Standards
              </span>
              <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-1">
                How We Deliver Mathematics
              </h2>
            </div>

            <div className="space-y-3.5">
              {features?.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#14213A] rounded-xl p-4 border border-[#3B82F6]/20 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#101A2C] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F8FAFC] text-xs sm:text-sm">{f.title}</h3>
                    <p className="text-xs text-[#A7B5CC] leading-relaxed mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition"
              >
                <span>View Academy Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
