import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course, onQuickEnroll }) => {
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">
          {course.batchName || 'Cohort 2026'}
        </div>

        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Duration */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-600 font-semibold tracking-wider uppercase text-[10px]">
              {course.category}
            </span>
            <div className="flex items-center gap-1 text-slate-500 font-medium text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{course.duration || 'Self-paced'}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.slug}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition line-clamp-1">
              {course.title}
            </h3>
          </Link>

          {/* Tagline */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5">
            {course.tagline}
          </p>
        </div>

        {/* Pricing and Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tuition</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">
                ₹{course.discountPrice ? course.discountPrice.toLocaleString('en-IN') : course.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{course.price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course.slug}`}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            >
              Syllabus
            </Link>
            {onQuickEnroll && (
              <button
                onClick={() => onQuickEnroll(course)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1 cursor-pointer"
              >
                <span>Enroll</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
