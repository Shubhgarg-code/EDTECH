import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  ChevronLeft,
  Plus,
  Layers,
  Video,
  FileText,
  Award,
  Trash2,
  Edit,
  Clock,
  Upload,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Play
} from 'lucide-react';

export const AdminCourseContentPage = () => {
  const { courseId } = useParams();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Module Modal State
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  // Lecture Modal State
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [duration, setDuration] = useState('15:00');
  const [videoSource, setVideoSource] = useState('external'); // 'upload' | 'external'
  const [videoUrl, setVideoUrl] = useState('');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [notesSource, setNotesSource] = useState('text'); // 'text' | 'upload'
  const [notesUrl, setNotesUrl] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isSubmittingLecture, setIsSubmittingLecture] = useState(false);

  // Assignment Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentModule, setAssignmentModule] = useState('General');
  const [assignmentRefFile, setAssignmentRefFile] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('Flexible');
  const [assignmentMaxMarks, setAssignmentMaxMarks] = useState(100);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  const fetchCourse = async () => {
    try {
      const res = await api.get('/courses/admin/all');
      if (res.success) {
        const found = res.courses.find((c) => c._id === courseId);
        if (found) {
          setCourse(found);
        } else {
          showToast('Course not found.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch course content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // MODULE OPERATIONS
  const handleOpenModuleModal = (mod = null) => {
    if (mod) {
      setEditingModuleId(mod._id);
      setModuleTitle(mod.title);
      setModuleDescription(mod.description || '');
    } else {
      setEditingModuleId(null);
      setModuleTitle('');
      setModuleDescription('');
    }
    setModuleModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setIsSubmittingModule(true);

    try {
      if (editingModuleId) {
        const res = await api.put(`/courses/${courseId}/modules/${editingModuleId}`, {
          title: moduleTitle,
          description: moduleDescription
        });
        if (res.success) {
          showToast('Module updated successfully!', 'success');
          setModuleModalOpen(false);
          fetchCourse();
        }
      } else {
        const res = await api.post(`/courses/${courseId}/modules`, {
          title: moduleTitle,
          description: moduleDescription
        });
        if (res.success) {
          showToast('Module added to syllabus!', 'success');
          setModuleModalOpen(false);
          fetchCourse();
        }
      }
    } catch (err) {
      showToast(err.message || 'Error saving module.', 'error');
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId, title) => {
    if (!window.confirm(`Delete "${title}" and all its lectures?`)) return;
    try {
      const res = await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      if (res.success) {
        showToast('Module deleted.', 'success');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete module.', 'error');
    }
  };

  // LECTURE OPERATIONS
  const handleOpenLectureModal = (moduleId, lecture = null) => {
    setTargetModuleId(moduleId);
    if (lecture) {
      setEditingLectureId(lecture._id);
      setLectureTitle(lecture.title);
      setChapterTitle(lecture.chapterTitle || '');
      setDuration(lecture.duration || '15:00');
      setVideoSource(lecture.videoSource || 'external');
      setVideoUrl(lecture.videoUrl || '');
      setIsFreePreview(!!lecture.isFreePreview);
      setNotesSource(lecture.notesSource || 'text');
      setNotesUrl(lecture.notesUrl || '');
      setNotesContent(lecture.notesContent || '');
      setCodeSnippet(lecture.codeSnippet || '');
    } else {
      setEditingLectureId(null);
      setLectureTitle('');
      setChapterTitle('');
      setDuration('15:00');
      setVideoSource('external');
      setVideoUrl('');
      setIsFreePreview(false);
      setNotesSource('text');
      setNotesUrl('');
      setNotesContent('');
      setCodeSnippet('');
    }
    setLectureModalOpen(true);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    setIsUploadingVideo(true);
    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        setVideoUrl(data.media.url);
        showToast('Video uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Video upload failed.', 'error');
      }
    } catch (err) {
      showToast('Error uploading video file.', 'error');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    setIsUploadingPdf(true);
    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        setNotesUrl(data.media.url);
        showToast('PDF notes uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'PDF upload failed.', 'error');
      }
    } catch (err) {
      showToast('Error uploading PDF file.', 'error');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSaveLecture = async (e) => {
    e.preventDefault();
    setIsSubmittingLecture(true);

    const payload = {
      title: lectureTitle,
      chapterTitle,
      duration,
      videoSource,
      videoUrl,
      isFreePreview,
      notesSource,
      notesUrl,
      notesContent,
      codeSnippet
    };

    try {
      if (editingLectureId) {
        const res = await api.put(
          `/courses/${courseId}/modules/${targetModuleId}/lectures/${editingLectureId}`,
          payload
        );
        if (res.success) {
          showToast('Lecture updated successfully!', 'success');
          setLectureModalOpen(false);
          fetchCourse();
        }
      } else {
        const res = await api.post(
          `/courses/${courseId}/modules/${targetModuleId}/lectures`,
          payload
        );
        if (res.success) {
          showToast('Lecture added to module!', 'success');
          setLectureModalOpen(false);
          fetchCourse();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save lecture.', 'error');
    } finally {
      setIsSubmittingLecture(false);
    }
  };

  const handleDeleteLecture = async (moduleId, lectureId, title) => {
    if (!window.confirm(`Delete lecture "${title}"?`)) return;
    try {
      const res = await api.delete(`/courses/${courseId}/modules/${moduleId}/lectures/${lectureId}`);
      if (res.success) {
        showToast('Lecture deleted.', 'success');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove lecture.', 'error');
    }
  };

  // ASSIGNMENT OPERATIONS
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setIsSubmittingAssignment(true);

    try {
      const res = await api.post(`/courses/${courseId}/assignments`, {
        title: assignmentTitle,
        description: assignmentDescription,
        moduleTitle: assignmentModule,
        referenceFileUrl: assignmentRefFile,
        dueDate: assignmentDueDate,
        maxMarks: Number(assignmentMaxMarks)
      });

      if (res.success) {
        showToast('Assignment added to course!', 'success');
        setAssignmentModalOpen(false);
        setAssignmentTitle('');
        setAssignmentDescription('');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create assignment.', 'error');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      const res = await api.delete(`/courses/${courseId}/assignments/${assignmentId}`);
      if (res.success) {
        showToast('Assignment deleted.', 'success');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete assignment.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center bg-[#070B14]">
        <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!course) {
    return <div className="py-20 text-center text-[#A7B5CC]">Course not found.</div>;
  }

  return (
    <div className="space-y-8 bg-[#070B14] text-[#F8FAFC]">
      {/* Back button & Course summary banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B82F6]/20 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            to="/admin/courses"
            className="p-2 rounded-xl border border-[#3B82F6]/30 bg-[#101A2C] text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase text-[#60A5FA] tracking-wider">
              Curriculum & Syllabus Builder
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">{course.title}</h1>
            <p className="text-xs text-[#A7B5CC] mt-0.5">
              {course.modules?.length || 0} Modules • {course.totalLectures || 0} Lectures • {course.assignments?.length || 0} Problem Sets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenModuleModal()}
            className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="px-4 py-2 bg-[#14213A] hover:bg-[#1E293B] border border-[#3B82F6]/30 text-[#60A5FA] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#3B82F6]" />
            <span>Add Problem Set</span>
          </button>
        </div>
      </div>

      {/* Modules & Lectures List */}
      <div className="space-y-6">
        {course.modules?.length === 0 ? (
          <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-[#3B82F6]/40 mx-auto" />
            <h3 className="font-bold text-[#F8FAFC] text-base">No modules added yet</h3>
            <p className="text-xs text-[#A7B5CC] max-w-sm mx-auto">
              Click the "Add Module" button above to start structuring chapters and video lectures.
            </p>
          </div>
        ) : (
          course.modules?.map((mod, modIdx) => (
            <div
              key={mod._id}
              className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 overflow-hidden shadow-xl space-y-3"
            >
              {/* Module Header Bar */}
              <div className="px-5 py-4 bg-[#0B1220] border-b border-[#3B82F6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {modIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#F8FAFC] text-sm">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-[#A7B5CC] mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLectureModal(mod._id)}
                    className="px-3 py-1.5 bg-[#14213A] text-[#60A5FA] hover:bg-[#2563EB] hover:text-white rounded-lg text-xs font-semibold border border-[#3B82F6]/30 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lecture</span>
                  </button>

                  <button
                    onClick={() => handleOpenModuleModal(mod)}
                    className="p-1.5 text-[#A7B5CC] hover:text-[#60A5FA] rounded-lg transition cursor-pointer"
                    title="Edit Module"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteModule(mod._id, mod.title)}
                    className="p-1.5 text-[#A7B5CC] hover:text-rose-400 rounded-lg transition cursor-pointer"
                    title="Delete Module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Module Lectures */}
              <div className="p-4 space-y-2">
                {mod.lectures?.length === 0 ? (
                  <p className="text-xs text-[#A7B5CC]/70 italic text-center py-4">
                    No lectures in this module yet. Click "Add Lecture" to attach video lessons.
                  </p>
                ) : (
                  mod.lectures?.map((lec) => (
                    <div
                      key={lec._id}
                      className="p-3.5 rounded-xl border border-[#3B82F6]/15 bg-[#0B1220] hover:bg-[#14213A] flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-xs shrink-0">
                          <Play className="w-3.5 h-3.5 fill-[#3B82F6]" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F8FAFC] truncate">{lec.title}</span>
                            {lec.isFreePreview && (
                              <span className="bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#A7B5CC] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#3B82F6]" />
                              {lec.duration}
                            </span>
                            <span className="capitalize">
                              Video: {lec.videoSource === 'upload' ? 'Cloudflare R2 / Local' : 'External Stream'}
                            </span>
                            {lec.notesUrl && (
                              <span className="text-[#60A5FA] font-semibold">• PDF Notes Attached</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenLectureModal(mod._id, lec)}
                          className="p-1.5 text-[#A7B5CC] hover:text-[#60A5FA] rounded-lg transition cursor-pointer"
                          title="Edit Lecture"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLecture(mod._id, lec._id, lec.title)}
                          className="p-1.5 text-[#A7B5CC] hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Delete Lecture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Assignments List */}
      <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#3B82F6]/20 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-bold text-[#F8FAFC] text-sm">Course Problem Sets & Assignments ({course.assignments?.length || 0})</h3>
          </div>
          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="text-xs font-semibold text-[#60A5FA] hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Problem Set</span>
          </button>
        </div>

        {course.assignments?.length === 0 ? (
          <p className="text-xs text-[#A7B5CC]/70 italic py-2">
            No problem sets attached to this course yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {course.assignments?.map((a) => (
              <div
                key={a._id}
                className="p-4 rounded-xl border border-[#3B82F6]/20 bg-[#0B1220] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{a.title}</span>
                    <span className="text-[10px] font-bold text-[#60A5FA] bg-[#14213A] border border-[#3B82F6]/30 px-2 py-0.5 rounded">
                      {a.maxMarks} Marks
                    </span>
                  </div>
                  <p className="text-[#A7B5CC] text-[11px] mt-1">{a.description}</p>
                </div>

                <div className="pt-2 border-t border-[#3B82F6]/15 flex items-center justify-between text-[11px]">
                  <span className="text-[#A7B5CC]">Due: {a.dueDate}</span>
                  <button
                    onClick={() => handleDeleteAssignment(a._id)}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODULE CREATE / EDIT MODAL */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101A2C] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#3B82F6]/30 space-y-4 text-[#F8FAFC]">
            <h3 className="font-bold text-[#F8FAFC] text-sm">
              {editingModuleId ? 'Edit Module' : 'Add New Module'}
            </h3>
            <form onSubmit={handleSaveModule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Module Title *</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3: Differential Calculus & Derivatives"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Description</label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of mathematical concepts covered in this module..."
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#3B82F6]/15">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-4 py-2 border border-[#3B82F6]/30 rounded-xl text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModule}
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingModule ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LECTURE CREATE / EDIT MODAL */}
      {lectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101A2C] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#3B82F6]/30 max-h-[90vh] overflow-y-auto space-y-5 text-[#F8FAFC]">
            <div className="border-b border-[#3B82F6]/20 pb-3">
              <h3 className="font-bold text-[#F8FAFC] text-sm">
                {editingLectureId ? 'Edit Mathematics Lecture' : 'Add Mathematics Lecture'}
              </h3>
              <p className="text-xs text-[#A7B5CC] mt-0.5">
                Configure lecture video, durations, PDF formula notes, and definitions.
              </p>
            </div>

            <form onSubmit={handleSaveLecture} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Lecture Title *</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. 1. Fundamental Theorem of Calculus & Definite Integrals"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1">Section / Chapter</label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="e.g. Integral Calculus"
                    className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="24:10"
                    className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Video Source Option */}
              <div className="p-4 bg-[#14213A] rounded-xl border border-[#3B82F6]/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#F8FAFC]">Video Hosting Source</label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setVideoSource('external')}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        videoSource === 'external' ? 'bg-[#2563EB] text-white' : 'bg-[#070B14] text-[#A7B5CC]'
                      }`}
                    >
                      External Stream URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource('upload')}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        videoSource === 'upload' ? 'bg-[#2563EB] text-white' : 'bg-[#070B14] text-[#A7B5CC]'
                      }`}
                    >
                      Upload Video File
                    </button>
                  </div>
                </div>

                {videoSource === 'external' ? (
                  <div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://commondatastorage.googleapis.com/... or Vimeo/CDN stream URL"
                      required
                      className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-[#A7B5CC] mt-1">
                      Direct MP4/WebM URL or supported stream link.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="File URL will appear here upon upload"
                      required
                      className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-[11px] mb-2"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] text-white font-semibold rounded-lg cursor-pointer hover:brightness-110 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingVideo ? 'Uploading Video...' : 'Choose MP4/WebM File'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoUpload}
                        disabled={isUploadingVideo}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Free Preview Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="freePreviewCheck"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                  className="rounded text-[#2563EB] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="freePreviewCheck" className="text-xs font-semibold text-[#F8FAFC] cursor-pointer">
                  Allow Free Preview (prospective students can watch before enrolling)
                </label>
              </div>

              {/* PDF Notes Upload or Text Notes */}
              <div className="p-4 bg-[#14213A] rounded-xl border border-[#3B82F6]/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#F8FAFC]">Mathematics Notes & Formula PDF</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#60A5FA] font-semibold cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPdf ? 'Uploading PDF...' : 'Attach PDF File'}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={isUploadingPdf}
                      className="hidden"
                    />
                  </label>
                </div>

                {notesUrl && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-[#070B14] p-2.5 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">PDF File Attached: {notesUrl}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[#A7B5CC] font-medium mb-1">
                    Markdown Notes / Key Proofs & Formulae
                  </label>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    rows={3}
                    placeholder="Enter markdown notes, definitions, theorems, or formula sheet..."
                    className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Key Formulae & Derivations */}
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Key Formulae & Theorem Derivations (Optional)</label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={3}
                  placeholder="// Paste key formulas or step-by-step problem derivations here"
                  className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl font-mono text-xs text-[#60A5FA] bg-[#070B14]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3B82F6]/15">
                <button
                  type="button"
                  onClick={() => setLectureModalOpen(false)}
                  className="px-4 py-2 border border-[#3B82F6]/30 rounded-xl text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLecture || isUploadingVideo || isUploadingPdf}
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {isSubmittingLecture ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Lecture...</span>
                    </>
                  ) : (
                    <span>{editingLectureId ? 'Save Lecture' : 'Add to Module'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENT CREATE MODAL */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101A2C] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#3B82F6]/30 space-y-4 text-[#F8FAFC]">
            <h3 className="font-bold text-[#F8FAFC] text-sm">Add Mathematics Problem Set</h3>
            <form onSubmit={handleSaveAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Problem Set Title *</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Problem Set: Differential Equations & Definite Integrals"
                  required
                  className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Instructions & Problem Prompts *</label>
                <textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Provide problem statements, proof questions, or exercise references..."
                  className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={assignmentMaxMarks}
                    onChange={(e) => setAssignmentMaxMarks(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    placeholder="e.g. 7 Days or Flexible"
                    className="w-full px-3.5 py-2 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#3B82F6]/15">
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="px-4 py-2 border border-[#3B82F6]/30 rounded-xl text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssignment}
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSubmittingAssignment ? 'Saving...' : 'Add Problem Set'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
