import React from 'react';
import { X, Award, CheckCircle2, Printer, GraduationCap } from 'lucide-react';

export const CertificateModal = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101A2C] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#3B82F6]/30 flex flex-col">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-[#0B1220] text-white flex items-center justify-between border-b border-[#3B82F6]/20">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-[#F8FAFC]">Official Certificate of Completion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-xs font-bold flex items-center gap-1.5 transition text-white shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas (Crisp Printable Document) */}
        <div className="p-8 sm:p-12 bg-[#070B14]">
          <div className="relative border-4 border-double border-amber-400/80 p-8 sm:p-10 rounded-2xl bg-[#0B1220] shadow-2xl text-center space-y-6">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 text-amber-400 text-lg">✦</div>
            <div className="absolute top-3 right-3 text-amber-400 text-lg">✦</div>
            <div className="absolute bottom-3 left-3 text-amber-400 text-lg">✦</div>
            <div className="absolute bottom-3 right-3 text-amber-400 text-lg">✦</div>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101A2C] border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-extrabold tracking-wider uppercase mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />
                Mathematics Academy
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                CERTIFICATE OF EXCELLENCE
              </h2>
              <p className="text-xs text-[#A7B5CC] uppercase tracking-widest font-semibold">
                This is proudly presented to
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2">
              <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-[#60A5FA] border-b-2 border-[#3B82F6]/40 pb-2 inline-block px-8">
                {certificate.studentName}
              </h3>
            </div>

            {/* Course Information */}
            <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-[#A7B5CC] leading-relaxed">
              <p>
                for successfully completing all curriculum milestones, video lectures, problem sets, and assessments in
              </p>
              <p className="font-bold text-[#F8FAFC] text-base sm:text-lg">
                {certificate.courseTitle}
              </p>
              <p className="text-[#A7B5CC]/70 text-xs">
                Verified Academic Completion
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 grid grid-cols-3 items-end text-xs text-[#A7B5CC] gap-4">
              <div className="text-center space-y-1">
                <p className="font-serif italic font-bold text-[#F8FAFC] text-sm">Academic Directorate</p>
                <div className="border-t border-[#3B82F6]/30 pt-1">
                  <p className="font-semibold text-[#F8FAFC]">Academic Director</p>
                  <p className="text-[10px] text-[#A7B5CC]">Curriculum Advisory</p>
                </div>
              </div>

              {/* Gold Medal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-amber-500 flex items-center justify-center shadow-lg text-amber-950 font-bold text-xs uppercase text-center p-1 leading-tight">
                  Verified Academic
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="font-serif italic font-bold text-[#F8FAFC] text-sm">Aman Mishra</p>
                <div className="border-t border-[#3B82F6]/30 pt-1">
                  <p className="font-semibold text-[#F8FAFC]">Aman Mishra</p>
                  <p className="text-[10px] text-[#A7B5CC]">Lead Mathematics Faculty</p>
                </div>
              </div>
            </div>

            {/* Footer ID */}
            <div className="pt-4 border-t border-[#3B82F6]/15 flex items-center justify-between text-[11px] text-[#A7B5CC]">
              <span>Date: {new Date(certificate.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="font-mono font-semibold text-[#60A5FA]">
                ID: {certificate.certificateId}
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Authenticated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
