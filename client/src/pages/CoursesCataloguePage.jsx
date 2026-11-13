import React, { useState, useEffect } from 'react';
import { CourseCard } from '../components/CourseCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { api } from '../api/apiClient';
import { Search, Filter, BookOpen, Sparkles, Layers } from 'lucide-react';

export const CoursesCataloguePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('popular');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category !== 'All') queryParams.append('category', category);
        if (level !== 'All') queryParams.append('level', level);
        if (search) queryParams.append('search', search);
        if (sort) queryParams.append('sort', sort);

        const data = await api.get(`/courses?${queryParams.toString()}`);
        if (data.success) {
          // De-duplicate courses to guarantee unique cards
          const rawCourses = data.courses || [];
          const uniqueMap = new Map();
          rawCourses.forEach((c) => {
            if (c && c._id && !uniqueMap.has(c._id)) {
              uniqueMap.set(c._id, c);
            }
          });
          setCourses(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [category, level, search, sort]);

  const categories = ['All', 'Mathematics', 'Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#070B14] text-[#F8FAFC]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#101A2C] border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Curriculum Catalogue</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
          Explore Mathematics Courses
        </h1>
        <p className="text-sm text-[#A7B5CC] leading-relaxed">
          Concept-first courses spanning Foundation, Class 11, Class 12, Calculus, and Olympiad problem-solving.
        </p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#3B82F6] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by topic (e.g. Calculus, Trigonometry, Sets, Algebra)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] placeholder-[#A7B5CC]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition"
            />
          </div>

          {/* Level Filter */}
          <div className="sm:col-span-3">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-[#101A2C] text-[#F8FAFC]">
                  Level: {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#070B14] border border-[#3B82F6]/30 text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="popular" className="bg-[#101A2C] text-[#F8FAFC]">Most Popular</option>
              <option value="rating" className="bg-[#101A2C] text-[#F8FAFC]">Highest Rated</option>
              <option value="price-low" className="bg-[#101A2C] text-[#F8FAFC]">Price: Low to High</option>
              <option value="price-high" className="bg-[#101A2C] text-[#F8FAFC]">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-[#3B82F6]/15">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                category === cat
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#14213A] text-[#A7B5CC] hover:text-white border border-[#3B82F6]/20 hover:border-[#60A5FA]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-[#101A2C] border border-[#3B82F6]/20 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 space-y-4 p-8">
          <BookOpen className="w-14 h-14 text-[#3B82F6]/40 mx-auto" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">No matching mathematics courses found</h3>
          <p className="text-xs text-[#A7B5CC] max-w-sm mx-auto">
            Try adjusting your topic search, changing the level filter, or clearing selected categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onQuickEnroll={(c) => setSelectedCourseForEnroll(c)}
            />
          ))}
        </div>
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
