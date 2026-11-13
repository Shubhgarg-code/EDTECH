import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Github,
  ExternalLink,
  CheckCircle2,
  Clock,
  Edit,
  X,
  Loader2
} from 'lucide-react';

export const AdminAssignmentsPage = () => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState('Clean implementation and good architecture.');
  const [isGrading, setIsGrading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/assignments/all');
      if (res.success) {
        setSubmissions(res.submissions);
      }
    } catch (err) {
      showToast(err.message || 'Error fetching assignment submissions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenGradeModal = (sub) => {
    setSelectedSub(sub);
    setGradeScore(sub.score || 90);
    setGradeFeedback(sub.feedback || 'Good modular separation and test coverage.');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsGrading(true);

    try {
      const res = await api.put(`/assignments/grade/${selectedSub._id}`, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
        status: 'reviewed'
      });
      if (res.success) {
        showToast('Assignment graded and feedback saved.', 'success');
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit grade.', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Assignment Submissions</h1>
        <p className="text-xs text-[#64748B]">
          Review student code repositories, live demo deployments, and submit grades with mentor feedback.
        </p>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-[#101A2C] rounded-2xl border border-[#1E293B] p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-[#F8FAFC] text-sm">No assignment submissions yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            When students submit projects from inside the LMS classroom, their code will appear here for grading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className="bg-[#101A2C] rounded-2xl border border-[#1E293B] p-5 space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {sub.course?.title || 'Course'}
                    </span>
                    <h3 className="font-bold text-[#F8FAFC] text-sm leading-snug">{sub.title}</h3>
                    <p className="text-[#64748B] text-[11px] mt-0.5">
                      Student: <span className="font-semibold text-[#F8FAFC]">{sub.user?.name}</span> ({sub.user?.email})
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      sub.status === 'reviewed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sub.status === 'reviewed' ? `Graded: ${sub.score}/100` : 'Pending Review'}
                  </span>
                </div>

                {/* URLs */}
                <div className="flex flex-wrap gap-3 pt-1 text-xs">
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Solution Link</span>
                    </a>
                  )}
                  {sub.liveUrl && (
                    <a
                      href={sub.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Reference Link</span>
                    </a>
                  )}
                </div>

                {sub.submissionNotes && (
                  <p className="p-3 bg-[#0B1220] rounded-xl text-[#94A3B8] leading-relaxed border border-slate-100 italic text-[11px]">
                    "{sub.submissionNotes}"
                  </p>
                )}

                {sub.feedback && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] space-y-0.5">
                    <p className="text-blue-900 font-bold">Feedback ({sub.reviewedBy}):</p>
                    <p className="text-[#94A3B8]">{sub.feedback}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleOpenGradeModal(sub)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                  {sub.status === 'reviewed' ? 'Update Grade' : 'Grade Assignment'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GRADE MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101A2C] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-[#F8FAFC] text-sm">Grade Submission</h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#94A3B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-semibold text-[#F8FAFC]">{selectedSub.title}</p>

            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Score (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Mentor Feedback *</label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows={3}
                  required
                  placeholder="Constructive feedback for the student..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-3.5 py-1.5 border rounded-xl text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGrading}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isGrading ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

