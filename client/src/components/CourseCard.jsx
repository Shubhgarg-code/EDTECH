import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

export const CourseCard = ({ course, onQuickEnroll }) => {
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <div className="group flex flex-col bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-950/50 hover:border-[#60A5FA]/45 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#070B14]">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101A2C] via-transparent to-transparent opacity-60" />

        <div className="absolute top-3 left-3 bg-[#070B14]/85 backdrop-blur-md text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
          {course.batchName || 'Cohort 2026'}
        </div>

        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Duration */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-[#3B82F6] font-bold tracking-wider uppercase text-[10px] bg-[#14213A] px-2 py-0.5 rounded border border-[#3B82F6]/20">
              {course.category}
            </span>
            <div className="flex items-center gap-1.5 text-[#A7B5CC] font-medium text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>{course.duration || 'Self-paced'}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.slug}`}>
            <h3 className="font-bold text-[#F8FAFC] text-base leading-snug hover:text-[#60A5FA] transition line-clamp-1">
              {course.title}
            </h3>
          </Link>

          {/* Tagline */}
          <p className="text-xs text-[#A7B5CC] line-clamp-2 leading-relaxed mt-2">
            {course.tagline}
          </p>
        </div>

        {/* Pricing and Action Footer */}
        <div className="pt-3.5 border-t border-[#3B82F6]/15 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#A7B5CC] uppercase tracking-wider block font-medium">Fee</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#F8FAFC]">
                ₹{course.discountPrice ? course.discountPrice.toLocaleString('en-IN') : course.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#A7B5CC]/70 line-through">
                  ₹{course.price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course.slug}`}
              className="px-3 py-1.5 rounded-lg border border-[#3B82F6]/30 text-[#F8FAFC] hover:bg-[#14213A] hover:border-[#60A5FA]/50 text-xs font-medium transition"
            >
              Curriculum
            </Link>
            {onQuickEnroll && (
              <button
                onClick={() => onQuickEnroll(course)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1 active:scale-95 cursor-pointer"
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
