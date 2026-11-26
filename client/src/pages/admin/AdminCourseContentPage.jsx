import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, API_BASE } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { extractYouTubeId, getYouTubeEmbedUrl, isValidYouTubeUrl } from '../../utils/youtube';
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
  Play,
  Youtube,
  Cloud,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlertCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

export const AdminCourseContentPage = () => {
  const { courseId } = useParams();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Storage status check
  const [storageStatus, setStorageStatus] = useState(null);

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
  const [videoSource, setVideoSource] = useState('youtube'); // 'youtube' | 'r2' | 'external'
  const [videoUrl, setVideoUrl] = useState('');
  const [storageKey, setStorageKey] = useState('');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [notesSource, setNotesSource] = useState('text');
  const [notesUrl, setNotesUrl] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  // Video Upload State
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [activeUploadXhr, setActiveUploadXhr] = useState(null);

  // PDF Upload State
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

  const fetchStorageStatus = async () => {
    try {
      const res = await api.get('/media/status');
      if (res.success) {
        setStorageStatus(res.storage);
      }
    } catch {
      // Non-critical advisory
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchStorageStatus();
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
    setUploadProgress(0);
    setUploadError('');
    setUploadFileName('');
    setUploadFileSize('');

    if (lecture) {
      setEditingLectureId(lecture._id);
      setLectureTitle(lecture.title);
      setChapterTitle(lecture.chapterTitle || '');
      setDuration(lecture.duration || '15:00');
      setVideoSource(lecture.videoSource || (lecture.youtubeVideoId ? 'youtube' : 'external'));
      setVideoUrl(lecture.videoUrl || '');
      setStorageKey(lecture.storageKey || '');
      setIsFreePreview(!!lecture.isFreePreview);
      setIsPublished(lecture.isPublished !== undefined ? !!lecture.isPublished : true);
      setNotesSource(lecture.notesSource || 'text');
      setNotesUrl(lecture.notesUrl || '');
      setNotesContent(lecture.notesContent || '');
      setCodeSnippet(lecture.codeSnippet || '');
    } else {
      setEditingLectureId(null);
      setLectureTitle('');
      setChapterTitle('');
      setDuration('15:00');
      setVideoSource('youtube');
      setVideoUrl('');
      setStorageKey('');
      setIsFreePreview(false);
      setIsPublished(true);
      setNotesSource('text');
      setNotesUrl('');
      setNotesContent('');
      setCodeSnippet('');
    }
    setLectureModalOpen(true);
  };

  // Direct R2 Video Upload with Presigned PUT URL & Progress
  const handleR2DirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.mp4', '.webm'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      showToast('Only MP4 and WebM video formats are supported.', 'error');
      return;
    }

    // Validate size (max 500 MB)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast(`Video exceeds 500MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`, 'error');
      return;
    }

    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setUploadProgress(0);
    setUploadError('');
    setIsUploadingVideo(true);

    try {
      // 1. Get presigned upload URL from backend
      const presignRes = await api.post('/media/presign-upload', {
        fileName: file.name,
        fileType: file.type || 'video/mp4',
        fileSize: file.size,
        folder: 'lectures'
      });

      // If Cloud Storage is not configured, inform administrator and offer fallback
      if (!presignRes.uploadUrl && !presignRes.configured && presignRes.driver !== 'b2' && presignRes.driver !== 'r2') {
        setUploadError(
          presignRes.message ||
          'Cloud storage is not configured on Render yet. To enable direct uploads to Backblaze B2, set STORAGE_DRIVER=b2, B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT, and B2_REGION. You can use YouTube video lectures immediately.'
        );
        showToast('B2 storage is not active. Use YouTube or configure B2 in Render.', 'error');
        setIsUploadingVideo(false);
        return;
      }

      const { uploadUrl, storageKey: key, publicUrl } = presignRes;
      const activeDriver = presignRes.driver || storageStatus?.driver || 'b2';

      const fallbackToServerUpload = () => {
        if (file.size > 100 * 1024 * 1024) {
          setUploadError('Direct B2 upload blocked by CORS and file exceeds 100 MB server relay limit. Please configure B2 bucket CORS.');
          showToast('Upload failed: B2 CORS required for files > 100 MB.', 'error');
          setIsUploadingVideo(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
        const relayXhr = new XMLHttpRequest();
        setActiveUploadXhr(relayXhr);
        setUploadProgress(0);

        relayXhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        relayXhr.onload = () => {
          setActiveUploadXhr(null);
          try {
            const data = JSON.parse(relayXhr.responseText || '{}');
            if (relayXhr.status >= 200 && relayXhr.status < 300 && data.success && data.media) {
              const storedKey = data.media.filename;
              setStorageKey(storedKey);
              setVideoUrl(storedKey);
              setVideoSource(activeDriver === 'b2' ? 'b2' : (activeDriver === 'r2' ? 'r2' : 'b2'));
              setUploadProgress(100);
              setIsUploadingVideo(false);
              showToast('Video uploaded to Backblaze B2! 🎉', 'success');
              return;
            }
            setUploadError(data.message || `Upload failed with status ${relayXhr.status}.`);
          } catch {
            setUploadError(`Upload failed with status ${relayXhr.status}.`);
          }
          showToast('Video upload failed.', 'error');
          setIsUploadingVideo(false);
        };

        relayXhr.onerror = () => {
          setActiveUploadXhr(null);
          setUploadError('Network error during video upload. Please check your internet connection.');
          showToast('Upload network error.', 'error');
          setIsUploadingVideo(false);
        };

        relayXhr.open('POST', `${API_BASE}/media/upload`, true);
        if (token) {
          relayXhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        relayXhr.send(formData);
      };

      // 2. Direct upload to Backblaze B2 / Cloud Storage using XMLHttpRequest to monitor progress
      const xhr = new XMLHttpRequest();
      setActiveUploadXhr(xhr);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setActiveUploadXhr(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          setStorageKey(key);
          setVideoUrl(publicUrl || key);
          setVideoSource(activeDriver === 'b2' ? 'b2' : (activeDriver === 'r2' ? 'r2' : 'upload'));
          setUploadProgress(100);
          setIsUploadingVideo(false);
          const driverLabel = activeDriver === 'b2' ? 'Backblaze B2' : 'Cloud Storage';
          showToast(`Video uploaded directly to ${driverLabel}! 🎉`, 'success');

          // Confirm registration
          try {
            await api.post('/media/confirm-upload', {
              storageKey: key,
              originalName: file.name,
              mimeType: file.type || 'video/mp4',
              size: file.size,
              category: 'video'
            });
          } catch {
            // Optional registration log
          }
        } else if (xhr.status === 403 || xhr.status === 0) {
          fallbackToServerUpload();
        } else {
          setUploadError(`Storage direct upload failed with status ${xhr.status}.`);
          showToast('Video upload failed.', 'error');
          setIsUploadingVideo(false);
        }
      };

      xhr.onerror = () => {
        setActiveUploadXhr(null);
        // Direct B2 PUT blocked by CORS or network — fall back to authenticated backend upload
        fallbackToServerUpload();
      };

      xhr.open('PUT', uploadUrl, true);
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type);
      }
      xhr.send(file);
    } catch (err) {
      setUploadError(err.message || 'Failed to initiate R2 upload.');
      showToast(err.message || 'Upload error.', 'error');
      setIsUploadingVideo(false);
    }
  };

  const handleCancelUpload = () => {
    if (activeUploadXhr) {
      activeUploadXhr.abort();
      setActiveUploadXhr(null);
      setIsUploadingVideo(false);
      setUploadProgress(0);
      setUploadError('Upload cancelled.');
      showToast('Upload cancelled.', 'info');
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF documents are allowed for lecture formula sheets.', 'error');
      return;
    }

    const body = new FormData();
    body.append('file', file);

    setIsUploadingPdf(true);
    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.success && data.media) {
        setNotesUrl(data.media.filename || data.media.url);
        showToast('PDF notes attached successfully!', 'success');
      } else {
        showToast(data.message || 'PDF upload failed.', 'error');
      }
    } catch {
      showToast('Error uploading PDF file.', 'error');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSaveLecture = async (e) => {
    e.preventDefault();
    setUploadError('');

    // YouTube validation
    if (videoSource === 'youtube') {
      const yId = extractYouTubeId(videoUrl);
      if (!yId) {
        showToast('Please enter a valid YouTube video URL or ID.', 'error');
        return;
      }
    } else if (!videoUrl) {
      showToast('Please upload a video or enter a stream URL.', 'error');
      return;
    }

    setIsSubmittingLecture(true);

    const payload = {
      title: lectureTitle,
      chapterTitle,
      duration,
      videoSource,
      videoUrl,
      storageKey,
      isFreePreview,
      isPublished,
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
    if (!window.confirm(`Delete lecture "${title}"? Any uploaded video will be cleaned up.`)) return;
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

  // Lecture Reordering
  const handleReorderLecture = async (moduleId, currentIndex, direction) => {
    if (!course) return;
    const mod = course.modules.find((m) => m._id === moduleId);
    if (!mod || !mod.lectures) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= mod.lectures.length) return;

    const reordered = [...mod.lectures];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const lectureIds = reordered.map((l) => l._id);

    try {
      const res = await api.put(`/courses/${courseId}/modules/${moduleId}/lectures-reorder`, {
        lectureIds
      });
      if (res.success) {
        showToast('Lecture order updated.', 'info');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reorder lectures.', 'error');
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
        showToast('Problem set added to course!', 'success');
        setAssignmentModalOpen(false);
        setAssignmentTitle('');
        setAssignmentDescription('');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create problem set.', 'error');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this problem set?')) return;
    try {
      const res = await api.delete(`/courses/${courseId}/assignments/${assignmentId}`);
      if (res.success) {
        showToast('Problem set deleted.', 'success');
        fetchCourse();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete problem set.', 'error');
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
    return (
      <div className="py-16 text-center text-[#A7B5CC]">
        <p>Course not found.</p>
        <Link to="/admin/courses" className="text-[#3B82F6] hover:underline mt-2 inline-block">
          Return to Course List
        </Link>
      </div>
    );
  }

  const detectedYouTubeId = extractYouTubeId(videoUrl);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3B82F6]/20">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="p-2 rounded-xl bg-[#101A2C] border border-[#3B82F6]/20 text-[#A7B5CC] hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
                {course.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  course.isPublished
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-[#A7B5CC] mt-0.5">
              Course Syllabus Architecture • {course.modules?.length || 0} Modules • {course.totalLectures || 0} Lectures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/courses/${course.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#101A2C] border border-[#3B82F6]/25 text-[#A7B5CC] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Public</span>
          </Link>

          <Link
            to={`/learn/${course._id}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-[#60A5FA]" />
            <span>Student Classroom</span>
          </Link>

          <button
            onClick={() => handleOpenModuleModal()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Storage Status Notice: Backblaze B2 / Cloud Storage */}
      {storageStatus && (storageStatus.b2Configured || storageStatus.r2Configured) ? (
        <div className="bg-[#101A2C] border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#A7B5CC]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-300">
              {storageStatus.b2Configured ? 'Backblaze B2 Storage Connected' : 'Cloud Storage Connected'}
            </span>
            <p>
              Bucket: <code className="text-[#38BDF8] font-mono">{storageStatus.bucket}</code> • Region: <code className="text-[#38BDF8] font-mono">{storageStatus.region || 'us-east-005'}</code> • Presigned direct video and document uploads are fully active.
            </p>
          </div>
        </div>
      ) : (
        storageStatus && (
          <div className="bg-[#101A2C] border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#A7B5CC]">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Backblaze B2 Storage Advisory:</span>
              <p>
                Render is currently operating in local storage mode. <strong>YouTube video lectures are 100% active and recommended.</strong> To enable direct large MP4/WebM uploads straight to your Backblaze B2 bucket, set <code className="text-[#38BDF8]">STORAGE_DRIVER=b2</code>, <code className="text-[#38BDF8]">B2_KEY_ID</code>, <code className="text-[#38BDF8]">B2_APPLICATION_KEY</code>, <code className="text-[#38BDF8]">B2_BUCKET_NAME=mathematics-academy-storage</code>, <code className="text-[#38BDF8]">B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com</code>, and <code className="text-[#38BDF8]">B2_REGION=us-east-005</code> in the Render dashboard.
              </p>
            </div>
          </div>
        )
      )}

      {/* Course Modules List */}
      <div className="space-y-4">
        {course.modules?.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[#3B82F6]/30 bg-[#101A2C]/40 space-y-3">
            <Layers className="w-10 h-10 text-[#3B82F6] mx-auto opacity-70" />
            <h3 className="font-bold text-[#F8FAFC]">No Curriculum Modules Yet</h3>
            <p className="text-xs text-[#A7B5CC] max-w-sm mx-auto">
              Start building your mathematics syllabus by creating the first chapter or conceptual module.
            </p>
            <button
              onClick={() => handleOpenModuleModal()}
              className="mt-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Module</span>
            </button>
          </div>
        ) : (
          course.modules?.map((mod, modIdx) => (
            <div
              key={mod._id}
              className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 overflow-hidden shadow-xl"
            >
              {/* Module Header */}
              <div className="p-4 sm:p-5 bg-[#14213A]/70 border-b border-[#3B82F6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB]/20 text-[#60A5FA] border border-[#3B82F6]/40 flex items-center justify-center font-black text-xs shrink-0">
                    {modIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F8FAFC] text-sm sm:text-base">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-[#A7B5CC] mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
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
                    No lectures in this module yet. Click "Add Lecture" to attach YouTube or R2 video lessons.
                  </p>
                ) : (
                  mod.lectures?.map((lec, lecIdx) => (
                    <div
                      key={lec._id}
                      className="p-3.5 rounded-xl border border-[#3B82F6]/15 bg-[#0B1220] hover:bg-[#14213A]/60 flex items-center justify-between text-xs transition gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Source icon badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            lec.videoSource === 'youtube' || lec.youtubeVideoId
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-blue-500/10 text-[#60A5FA] border-[#3B82F6]/30'
                          }`}
                          title={lec.videoSource === 'youtube' ? 'YouTube Lecture' : 'Direct Video'}
                        >
                          {lec.videoSource === 'youtube' || lec.youtubeVideoId ? (
                            <Youtube className="w-4 h-4" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-[#3B82F6]" />
                          )}
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F8FAFC] truncate">{lec.title}</span>
                            {lec.isFreePreview && (
                              <span className="bg-[#14213A] text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                                Free Preview
                              </span>
                            )}
                            {lec.isPublished === false && (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#A7B5CC] mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[#3B82F6]" />
                              {lec.duration}
                            </span>
                            <span className="capitalize">
                              {lec.videoSource === 'youtube' || lec.youtubeVideoId
                                ? `YouTube: ${lec.youtubeVideoId || 'Linked'}`
                                : (lec.videoSource === 'b2' ? 'Backblaze B2' : (lec.videoSource === 'r2' ? 'Cloudflare R2' : 'External Stream'))}
                            </span>
                            {lec.notesUrl && (
                              <span className="text-[#60A5FA] font-semibold">• PDF Notes</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Reorder, Edit, Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Up / Down Reorder */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={lecIdx === 0}
                            onClick={() => handleReorderLecture(mod._id, lecIdx, -1)}
                            className="p-1 text-[#A7B5CC] hover:text-[#60A5FA] disabled:opacity-20 disabled:hover:text-[#A7B5CC] transition cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={lecIdx === mod.lectures.length - 1}
                            onClick={() => handleReorderLecture(mod._id, lecIdx, 1)}
                            className="p-1 text-[#A7B5CC] hover:text-[#60A5FA] disabled:opacity-20 disabled:hover:text-[#A7B5CC] transition cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

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
          <div className="bg-[#101A2C] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#3B82F6]/30 max-h-[92vh] overflow-y-auto space-y-5 text-[#F8FAFC]">
            <div className="border-b border-[#3B82F6]/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#F8FAFC] text-base">
                  {editingLectureId ? 'Edit Mathematics Lecture' : 'Add Mathematics Lecture'}
                </h3>
                <p className="text-xs text-[#A7B5CC] mt-0.5">
                  Configure YouTube video, direct Cloudflare R2 uploads, durations, and PDF notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLectureModalOpen(false)}
                className="text-[#A7B5CC] hover:text-white p-1 rounded-lg hover:bg-[#14213A] transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLecture} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Lecture Title *</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. Fundamental Theorem of Calculus & Definite Integrals"
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

              {/* VIDEO SOURCE SELECTION */}
              <div className="p-4 bg-[#14213A] rounded-xl border border-[#3B82F6]/25 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-[#F8FAFC]">Video Hosting Method *</label>
                  <div className="flex items-center gap-1.5 p-1 bg-[#070B14] rounded-xl border border-[#3B82F6]/30">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoSource('youtube');
                        setUploadError('');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                        videoSource === 'youtube'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-[#A7B5CC] hover:text-white'
                      }`}
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoSource(storageStatus?.driver === 'b2' ? 'b2' : 'r2');
                        setUploadError('');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                        videoSource === 'r2' || videoSource === 'b2'
                          ? 'bg-[#2563EB] text-white shadow'
                          : 'text-[#A7B5CC] hover:text-white'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{storageStatus?.driver === 'b2' ? 'B2 Upload' : 'Cloud Upload'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoSource('external');
                        setUploadError('');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                        videoSource === 'external'
                          ? 'bg-[#1E293B] text-white shadow'
                          : 'text-[#A7B5CC] hover:text-white'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>External URL</span>
                    </button>
                  </div>
                </div>

                {/* 1. YOUTUBE VIDEO SECTION */}
                {videoSource === 'youtube' && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[#A7B5CC] text-[11px]">
                      Paste YouTube Watch, youtu.be, Shorts, or Embed Link:
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                      required
                      className="w-full px-3.5 py-2.5 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />

                    {/* YouTube Real-Time Validation Feedback */}
                    {videoUrl.trim() && (
                      <div className="pt-1">
                        {detectedYouTubeId ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>Valid YouTube Video ID: <code className="font-mono bg-black/40 px-1 py-0.5 rounded">{detectedYouTubeId}</code></span>
                            </div>

                            {/* Live responsive preview */}
                            <div className="rounded-xl overflow-hidden border border-[#3B82F6]/30 aspect-video max-h-48 bg-black">
                              <iframe
                                src={getYouTubeEmbedUrl(detectedYouTubeId)}
                                title="Lecture Preview"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Invalid YouTube URL. Please check the link.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. BACKBLAZE B2 / CLOUD DIRECT UPLOAD SECTION */}
                {(videoSource === 'b2' || videoSource === 'r2') && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-[#A7B5CC]">
                      Upload MP4 or WebM video directly to {storageStatus?.b2Configured ? 'Backblaze B2' : 'Cloud Storage'} bucket. Max file size: 500 MB.
                    </p>

                    <div className="p-4 rounded-xl border border-dashed border-[#3B82F6]/40 bg-[#070B14] flex flex-col items-center justify-center text-center space-y-2">
                      <Cloud className="w-8 h-8 text-[#3B82F6]" />
                      <div className="text-xs">
                        <label className="text-[#60A5FA] font-bold hover:underline cursor-pointer">
                          Click to select video from computer
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={handleR2DirectUpload}
                            disabled={isUploadingVideo}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-[#A7B5CC] mt-0.5">MP4 or WebM • Max 500MB</p>
                      </div>
                    </div>

                    {/* Progress Bar & Details */}
                    {isUploadingVideo && (
                      <div className="p-3 bg-[#070B14] rounded-xl border border-[#3B82F6]/30 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#F8FAFC] truncate max-w-xs">
                            {uploadFileName} ({uploadFileSize})
                          </span>
                          <span className="font-mono text-[#60A5FA] font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#2563EB] to-[#38BDF8] h-full rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleCancelUpload}
                            className="text-[11px] text-rose-400 hover:underline"
                          >
                            Cancel Upload
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error display */}
                    {uploadError && (
                      <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Upload Issue</span>
                        </div>
                        <p className="text-[11px]">{uploadError}</p>
                      </div>
                    )}

                    {/* Uploaded Key / URL display */}
                    {videoUrl && !isUploadingVideo && (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">R2 Stored Key: <code className="font-mono">{storageKey || videoUrl}</code></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setStorageKey('');
                          }}
                          className="text-xs text-rose-400 hover:underline ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. EXTERNAL STREAM URL SECTION */}
                {videoSource === 'external' && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[#A7B5CC] text-[11px]">Direct MP4/WebM URL or CDN stream link:</label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/videos/lesson.mp4"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                )}
              </div>

              {/* Free Preview & Published Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0B1220] rounded-xl border border-[#3B82F6]/20">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freePreviewCheck"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="rounded text-[#2563EB] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="freePreviewCheck" className="text-xs font-semibold text-[#F8FAFC] cursor-pointer">
                    Allow Free Preview
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-[#2563EB] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="publishedCheck" className="text-xs font-semibold text-[#F8FAFC] cursor-pointer">
                    Publish Lecture (visible to students)
                  </label>
                </div>
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
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium bg-[#070B14] p-2.5 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">PDF File Attached: {notesUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotesUrl('')}
                      className="text-rose-400 hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[#A7B5CC] font-medium mb-1">
                    Markdown Notes / Key Proofs & Definitions
                  </label>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    rows={3}
                    placeholder="Enter markdown notes, definitions, theorems, or formula sheet..."
                    className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl bg-[#070B14] text-[#F8FAFC] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Key Formulae & Derivations */}
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1">Key Formulae & Theorem Derivations (Optional)</label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={2}
                  placeholder="// Paste key formulas or step-by-step problem derivations here"
                  className="w-full px-3.5 py-2 border border-[#3B82F6]/30 rounded-xl font-mono text-xs text-[#60A5FA] bg-[#070B14] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
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
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md cursor-pointer hover:brightness-110 transition"
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
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold rounded-xl shadow-md cursor-pointer hover:brightness-110 transition"
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
