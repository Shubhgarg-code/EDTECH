import React from 'react';
import { X, Award, CheckCircle2, Printer, Download, GraduationCap } from 'lucide-react';

export const CertificateModal = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Certificate of Completion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold flex items-center gap-1.5 transition text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-50/40 via-white to-sky-50/40">
          <div className="relative border-4 border-double border-amber-300 p-8 sm:p-10 rounded-2xl bg-white shadow-lg text-center space-y-6">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 text-amber-400 text-lg">✦</div>
            <div className="absolute top-3 right-3 text-amber-400 text-lg">✦</div>
            <div className="absolute bottom-3 left-3 text-amber-400 text-lg">✦</div>
            <div className="absolute bottom-3 right-3 text-amber-400 text-lg">✦</div>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold tracking-wider uppercase mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Mathematics Academy
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                CERTIFICATE OF EXCELLENCE
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                This is proudly presented to
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2">
              <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-blue-900 border-b-2 border-slate-300 pb-2 inline-block px-8">
                {certificate.studentName}
              </h3>
            </div>

            {/* Course Information */}
            <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                for successfully completing all curriculum milestones, video lessons, problem sets, and assessments in
              </p>
              <p className="font-bold text-slate-900 text-base sm:text-lg">
                {certificate.courseTitle}
              </p>
              <p className="text-slate-400 text-xs">
                Verified Academic Completion
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 grid grid-cols-3 items-end text-xs text-slate-600 gap-4">
              <div className="text-center space-y-1">
                <p className="font-serif italic font-bold text-slate-800 text-sm">Academic Directorate</p>
                <div className="border-t border-slate-300 pt-1">
                  <p className="font-semibold text-slate-700">Academic Director</p>
                  <p className="text-[10px] text-slate-400">Curriculum Advisory</p>
                </div>
              </div>

              {/* Gold Medal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-amber-500 flex items-center justify-center shadow-lg text-amber-950 font-bold text-xs uppercase text-center p-1 leading-tight">
                  Verified Academic
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="font-serif italic font-bold text-slate-800 text-sm">Mathematics Faculty</p>
                <div className="border-t border-slate-300 pt-1">
                  <p className="font-semibold text-slate-700">Mathematics Faculty</p>
                  <p className="text-[10px] text-slate-400">Lead Educator</p>
                </div>
              </div>
            </div>

            {/* Footer ID */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Date: {new Date(certificate.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="font-mono font-semibold text-slate-600">
                ID: {certificate.certificateId}
              </span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Digitally Authenticated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

