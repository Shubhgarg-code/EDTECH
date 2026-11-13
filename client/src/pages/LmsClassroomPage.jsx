import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { CertificateModal } from '../components/CertificateModal';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Github,
  Award,
  Send,
  Bell,
  Code,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Clock
} from 'lucide-react';

export const LmsClassroomPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // notes | resources | assignments | announcements
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Assignment submission state
  const [assignments, setAssignments] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  // Certificate Modal State
  const [certificateData, setCertificateData] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const data = await api.get(`/learn/classroom/${courseId}`);
        if (data.success) {
          setCourse(data.course);
          setProgress(data.progress);
          setAssignments(data.course.assignments || []);

          // Find current lecture or first lecture
          let activeLec = null;
          if (data.progress?.currentLectureId) {
            for (const mod of data.course.modules) {
              const found = mod.lectures.find(
                (l) => l._id === data.progress.currentLectureId
              );
              if (found) {
                activeLec = found;
                break;
              }
            }
          }

          if (!activeLec && data.course.modules?.[0]?.lectures?.[0]) {
            activeLec = data.course.modules[0].lectures[0];
          }

          setCurrentLecture(activeLec);
        }
      } catch (err) {
        showToast(err.message || 'Access denied to classroom.', 'error');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [courseId, navigate, showToast]);

  // Fetch student submissions for this course
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get(`/assignments/student/${courseId}`);
        if (res.success) {
          setStudentSubmissions(res.submissions);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };

    if (courseId) {
      fetchSubmissions();
    }
  }, [courseId]);

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    // Auto sync last watched lecture
    api.post(`/learn/progress/${courseId}`, {
      lectureId: lecture._id
    }).then((res) => {
      if (res.success) setProgress(res.progress);
    }).catch(() => {});
  };

  const handleToggleComplete = async (completed) => {
    if (!currentLecture) return;
    try {
      const res = await api.post(`/learn/progress/${courseId}`, {
        lectureId: currentLecture._id,
        completed
      });

      if (res.success) {
        setProgress(res.progress);
        showToast(completed ? 'Lecture marked as completed! 🎉' : 'Marked as incomplete', 'info');

        // Check if course just reached 100%
        if (res.progress.isCompleted) {
          try {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
          } catch (e) {}
          showToast('Congratulations! Course 100% completed. Certificate Unlocked! 🏆', 'success');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update progress.', 'error');
    }
  };

  const handleProgressTimeSync = (lastWatchTimeSeconds) => {
    if (!currentLecture) return;
    api.post(`/learn/progress/${courseId}`, {
      lectureId: currentLecture._id,
      lastWatchTimeSeconds
    }).catch(() => {});
  };

  const handleNextLecture = () => {
    if (!course || !currentLecture) return;
    const allLectures = course.modules.flatMap((m) => m.lectures);
    const currentIndex = allLectures.findIndex((l) => l._id === currentLecture._id);
    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      handleSelectLecture(allLectures[currentIndex + 1]);
    } else {
      showToast('You have reached the end of the syllabus! Great job.', 'success');
    }
  };

  const handlePrevLecture = () => {
    if (!course || !currentLecture) return;
    const allLectures = course.modules.flatMap((m) => m.lectures);
    const currentIndex = allLectures.findIndex((l) => l._id === currentLecture._id);
    if (currentIndex > 0) {
      handleSelectLecture(allLectures[currentIndex - 1]);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignmentId) {
      showToast('Please select which assignment you are submitting.', 'error');
      return;
    }

    const assignment = assignments.find((a) => a._id === selectedAssignmentId);
    setIsSubmittingAssignment(true);

    try {
      const res = await api.post('/assignments/submit', {
        courseId,
        assignmentId: selectedAssignmentId,
        title: assignment?.title || 'Assignment Submission',
        githubUrl,
        liveUrl,
        submissionNotes
      });

      if (res.success) {
        showToast('Assignment submitted for instructor review!', 'success');
        setGithubUrl('');
        setLiveUrl('');
        setSubmissionNotes('');

        // Refresh submissions
        const subRes = await api.get(`/assignments/student/${courseId}`);
        if (subRes.success) setStudentSubmissions(subRes.submissions);
      }
    } catch (err) {
      showToast(err.message || 'Submission error.', 'error');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleClaimCertificate = async () => {
    try {
      const res = await api.get(`/learn/certificate/${courseId}`);
      if (res.success) {
        setCertificateData(res.certificate);
        setShowCertificateModal(true);
      }
    } catch (err) {
      showToast(err.message || 'Complete 100% of lectures to unlock certificate.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCurrentCompleted = progress?.completedLectures?.some(
    (id) => id === currentLecture?._id || id.toString() === currentLecture?._id?.toString()
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Classroom Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to Student Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm">
              {course.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              {course.batchName} • Lecture: {currentLecture?.title}
            </p>
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="hidden sm:block w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress?.percentage || 0}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">
              {progress?.percentage || 0}%
            </span>
          </div>

          {progress?.percentage >= 100 ? (
            <button
              onClick={handleClaimCertificate}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Claim Certificate</span>
            </button>
          ) : (
            <button
              onClick={() => showToast(`Complete all lectures to unlock certificate (${progress?.percentage || 0}% / 100%)`, 'info')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 cursor-help"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate ({progress?.percentage || 0}%)</span>
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Classroom Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Video Stage + Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
            {/* Video Player Box */}
            <div className="space-y-3">
              <VideoPlayer
                src={currentLecture?.videoUrl}
                title={currentLecture?.title}
                isCompleted={isCurrentCompleted}
                onToggleComplete={handleToggleComplete}
                onProgressUpdate={handleProgressTimeSync}
                initialTime={progress?.lastWatchTimeSeconds || 0}
                onNextLecture={handleNextLecture}
              />

              {/* Prev / Next Controls Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={handlePrevLecture}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lecture</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(!isCurrentCompleted)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      isCurrentCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentCompleted ? 'Lecture Completed' : 'Mark as Complete'}</span>
                  </button>

                  <button
                    onClick={handleNextLecture}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>Next Lecture</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Workspace Tabs */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-800 text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Lecture Notes & Explanation</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Study Resources & Downloads ({currentLecture?.resources?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'assignments'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Assignments & Problem Sets ({assignments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'announcements'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Course Announcements</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 text-xs leading-relaxed text-slate-300">
                {/* 1. Lecture Notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">{currentLecture?.title}</h3>
                    {currentLecture?.notesContent ? (
                      <div className="prose prose-invert max-w-none text-slate-300 space-y-3 font-mono text-xs whitespace-pre-wrap bg-slate-900 p-4 rounded-xl border border-slate-800">
                        {currentLecture.notesContent}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No supplemental notes provided for this lecture.</p>
                    )}

                    {currentLecture?.codeSnippet && (
                      <div className="space-y-2">
                        <span className="font-bold text-slate-200 uppercase tracking-wide text-[10px]">
                          Key Formulae & Definitions
                        </span>
                        <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-blue-300 font-mono text-xs overflow-x-auto">
                          {currentLecture.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Resources */}
                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Lecture Downloads & Reference Materials</h3>
                    {currentLecture?.resources?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentLecture.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 transition flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              {res.type === 'pdf' ? (
                                <FileText className="w-4 h-4 text-rose-400" />
                              ) : (
                                <Download className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition">
                                {res.title}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">All necessary study materials are covered in the video lesson and notes.</p>
                    )}
                  </div>
                )}

                {/* 3. Assignments */}
                {activeTab === 'assignments' && (
                  <div className="space-y-6">
                    {/* Submit Form */}
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        Submit Project / Assignment for Mentor Review
                      </h3>

                      <form onSubmit={handleSubmitAssignment} className="space-y-3">
                        <div>
                          <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                            Select Assignment
                          </label>
                          <select
                            value={selectedAssignmentId}
                            onChange={(e) => setSelectedAssignmentId(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">-- Choose an Assignment --</option>
                            {assignments.map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.title} ({a.maxMarks} Marks)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                              Solution Link (Google Drive / PDF / Image link)
                            </label>
                            <input
                              type="url"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                              placeholder="https://drive.google.com/... or link to handwritten solution"
                              required
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                              Additional Reference URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={liveUrl}
                              onChange={(e) => setLiveUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                            Submission Notes / Explanation of Steps
                          </label>
                          <textarea
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            rows={2}
                            placeholder="Mention methods used, formulas applied, or questions attempted..."
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingAssignment}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingAssignment ? 'Submitting...' : 'Submit Assignment'}</span>
                        </button>
                      </form>
                    </div>

                    {/* Submissions History */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        My Submissions & Grades
                      </h4>
                      {studentSubmissions.length === 0 ? (
                        <p className="text-slate-500 text-xs italic">No assignments submitted yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {studentSubmissions.map((sub) => (
                            <div
                              key={sub._id}
                              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-slate-200">{sub.title}</h5>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    sub.status === 'reviewed'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {sub.status === 'reviewed' ? `Reviewed (${sub.score}/100)` : 'Under Review'}
                                </span>
                              </div>

                              <div className="flex gap-4 text-[11px] text-blue-400">
                                {sub.githubUrl && (
                                  <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Solution Link
                                  </a>
                                )}
                                {sub.liveUrl && (
                                  <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Reference Link
                                  </a>
                                )}
                              </div>

                              {sub.feedback && (
                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
                                  <p className="text-slate-400 font-semibold">
                                    Mentor Feedback ({sub.reviewedBy || 'TA'}):
                                  </p>
                                  <p className="text-slate-300 italic">{sub.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Announcements */}
                {activeTab === 'announcements' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Course Announcements & Live Doubt Links</h3>
                    {course.announcements?.length > 0 ? (
                      course.announcements.map((ann, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded">
                              {ann.badge || 'Announcement'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(ann.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-200 text-sm">{ann.title}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">{ann.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No announcements posted for this course yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Collapsible Curriculum Sidebar */}
        <aside
          className={`w-80 md:w-88 bg-slate-950 border-l border-slate-800 flex flex-col transition-all duration-300 z-20 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute md:relative md:translate-x-0 hidden md:flex'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Course Content
            </h3>
            <span className="text-xs font-mono text-blue-400 font-bold">
              {progress?.completedLectures?.length || 0} / {course.totalLectures} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {course.modules?.map((mod, modIdx) => (
              <div key={mod._id || modIdx} className="bg-slate-950">
                <div className="p-3.5 bg-slate-900/60 font-bold text-xs text-slate-300 flex items-center justify-between">
                  <span className="truncate max-w-[210px]">{mod.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {mod.lectures?.length} Lec
                  </span>
                </div>

                <div className="divide-y divide-slate-900/40">
                  {mod.lectures?.map((lec) => {
                    const isCompleted = progress?.completedLectures?.some(
                      (id) => id === lec._id || id.toString() === lec._id?.toString()
                    );
                    const isActive = currentLecture?._id === lec._id;

                    return (
                      <button
                        key={lec._id}
                        onClick={() => handleSelectLecture(lec)}
                        className={`w-full p-3 text-left flex items-start gap-3 transition ${
                          isActive
                            ? 'bg-blue-600/20 border-l-4 border-blue-500 text-white'
                            : 'hover:bg-slate-900/50 text-slate-400'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium leading-snug line-clamp-2 ${
                              isActive ? 'text-white font-bold' : 'text-slate-300'
                            }`}
                          >
                            {lec.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {lec.duration}
                            </span>
                            {lec.isFreePreview && (
                              <span className="text-blue-400 font-semibold">• Preview</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        certificate={certificateData}
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
    </div>
  );
};

