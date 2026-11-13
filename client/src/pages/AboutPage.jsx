import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import {
  CheckCircle2,
  ArrowRight,
  Compass,
  Target,
  GraduationCap
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
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading institutional details...</p>
      </div>
    );
  }

  const { heading, description, mission, vision, features, aboutImage } = aboutData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Compact Institutional Header */}
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span>Our Teaching Philosophy</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {heading || 'About Mathematics Academy'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl mt-3 leading-relaxed">
          {description}
        </p>
      </header>

      {/* Mission & Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Mission */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Our Academic Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{mission}</p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Our Institutional Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{vision}</p>
        </div>
      </section>

      {/* Pedagogical Tenets & Showcase */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-9 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Academic Environment Image */}
          <div className="lg:col-span-5">
            <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={
                  aboutImage ||
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
                }
                alt="Learning Environment"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Structured lessons & guided problem-solving practice
            </p>
          </div>

          {/* Right: Core Features */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Our Approach
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                How We Teach Mathematics
              </h2>
            </div>

            <div className="space-y-3.5">
              {features?.map((f, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
