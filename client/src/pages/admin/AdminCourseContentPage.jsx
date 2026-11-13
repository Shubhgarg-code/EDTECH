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
          showToast('Module updated.', 'success');
          setModuleModalOpen(false);
          fetchCourse();
        }
      } else {
        const res = await api.post(`/courses/${courseId}/modules`, {
          title: moduleTitle,
          description: moduleDescription
        });
        if (res.success) {
          showToast('Module added successfully!', 'success');
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
    if (!window.confirm(`Delete module "${title}" and all its lectures?`)) return;

    try {
      const res = await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      if (res.success) {
        showToast('Module deleted.', 'success');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting module.', 'error');
    }
  };

  // LECTURE OPERATIONS
  const handleOpenLectureModal = (moduleId, lec = null) => {
    setTargetModuleId(moduleId);
    if (lec) {
      setEditingLectureId(lec._id);
      setLectureTitle(lec.title);
      setChapterTitle(lec.chapterTitle || '');
      setDuration(lec.duration || '15:00');
      setVideoSource(lec.videoSource || 'external');
      setVideoUrl(lec.videoUrl || '');
      setIsFreePreview(!!lec.isFreePreview);
      setNotesSource(lec.notesSource || 'text');
      setNotesUrl(lec.notesUrl || '');
      setNotesContent(lec.notesContent || '');
      setCodeSnippet(lec.codeSnippet || '');
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

  // Lecture Video Upload Handler
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
        setVideoSource('upload');
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

  // Lecture PDF Notes Upload Handler
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
        setNotesSource('upload');
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
    if (!videoUrl.trim()) {
      showToast('Please provide a video URL or upload a video file.', 'error');
      return;
    }

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
          showToast('Lecture updated successfully.', 'success');
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
        showToast('Lecture removed.', 'success');
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
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!course) {
    return <div className="py-20 text-center text-slate-500">Course not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Back button & Course summary banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
              Curriculum & Content Builder
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{course.title}</h1>
            <p className="text-xs text-slate-500">
              {course.modules?.length || 0} Modules • {course.totalLectures || 0} Lectures • {course.assignments?.length || 0} Assignments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModuleModal()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Modules & Lectures List */}
      <div className="space-y-6">
        {course.modules?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No modules added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Add Module" button above to start structuring chapters and video lectures.
            </p>
          </div>
        ) : (
          course.modules?.map((mod, modIdx) => (
            <div
              key={mod._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3"
            >
              {/* Module Header Bar */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {modIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLectureModal(mod._id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lecture</span>
                  </button>

                  <button
                    onClick={() => handleOpenModuleModal(mod)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                    title="Edit Module"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteModule(mod._id, mod.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module Lectures */}
              <div className="p-4 space-y-2">
                {mod.lectures?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No lectures in this module yet. Click "Add Lecture" to add video lessons.
                  </p>
                ) : (
                  mod.lectures?.map((lec, lecIdx) => (
                    <div
                      key={lec._id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Play className="w-3.5 h-3.5 fill-blue-700" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{lec.title}</span>
                            {lec.isFreePreview && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lec.duration}
                            </span>
                            <span className="capitalize">
                              Video: {lec.videoSource === 'upload' ? 'Local Upload' : 'External URL'}
                            </span>
                            {lec.notesUrl && (
                              <span className="text-blue-600 font-semibold">• PDF Notes Attached</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenLectureModal(mod._id, lec)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                          title="Edit Lecture"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLecture(mod._id, lec._id, lec.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Course Assignments ({course.assignments?.length || 0})</h3>
          </div>
          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assignment</span>
          </button>
        </div>

        {course.assignments?.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No assignments attached to this course yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {course.assignments?.map((a) => (
              <div
                key={a._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.title}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {a.maxMarks} Marks
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{a.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Due: {a.dueDate}</span>
                  <button
                    onClick={() => handleDeleteAssignment(a._id)}
                    className="text-rose-600 hover:underline flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingModuleId ? 'Edit Module' : 'Add New Module'}
            </h3>
            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Module Title *</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3: Advanced State Management"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of concepts covered in this module..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-3.5 py-1.5 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModule}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingLectureId ? 'Edit Lecture' : 'Add Video Lecture'}
              </h3>
              <p className="text-xs text-slate-500">
                Support for both locally uploaded video files and external hosted video providers.
              </p>
            </div>

            <form onSubmit={handleSaveLecture} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lecture Title *</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. 1. Event Loop & Microtask Queue"
                  required
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chapter / Section</label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="e.g. JavaScript Runtime"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="24:10"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Video Source Option */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Video Hosting Source</label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setVideoSource('external')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        videoSource === 'external' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      External Stream URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource('upload')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        videoSource === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
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
                      className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
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
                      className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-[11px] mb-2"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 transition">
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
                  className="rounded text-blue-600 w-4 h-4"
                />
                <label htmlFor="freePreviewCheck" className="text-xs font-semibold text-slate-700">
                  Allow Free Preview (prospective students can watch before enrolling)
                </label>
              </div>

              {/* PDF Notes Upload or Text Notes */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Lecture Notes</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
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
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">PDF File Attached: {notesUrl}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Markdown Notes / Key Takeaways
                  </label>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    rows={3}
                    placeholder="Enter markdown notes, bullet points, or cheat-sheet..."
                    className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Starter Code Snippet */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Starter Code Snippet (Optional)</label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={3}
                  placeholder="// Paste starter code or solution snippet here"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs text-blue-900 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLectureModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLecture || isUploadingVideo || isUploadingPdf}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Course Assignment</h3>
            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assignment Title *</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Build an API Rate Limiter"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Requirements *</label>
                <textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Detailed instructions for the student..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={assignmentMaxMarks}
                    onChange={(e) => setAssignmentMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    placeholder="e.g. 7 Days or Flexible"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="px-3.5 py-1.5 border rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssignment}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  {isSubmittingAssignment ? 'Saving...' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
