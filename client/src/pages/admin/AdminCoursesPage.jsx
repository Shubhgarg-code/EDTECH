import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Layers,
  Upload,
  Loader2,
  Search,
  Clock
} from 'lucide-react';

export const AdminCoursesPage = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Mathematics',
    level: 'All Levels',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    price: 4999,
    discountPrice: 3499,
    duration: '10 Weeks',
    batchName: 'Batch 2026',
    startDate: 'Immediate Access',
    schedule: 'Flexible Learning',
    instructorName: 'Academy Instructor',
    instructorTitle: 'Mathematics Instructor',
    instructorBio: 'Experienced instructor with deep expertise in conceptual mathematics.',
    isPublished: false
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/admin/all');
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourseId(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      category: 'Mathematics',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      price: 4999,
      discountPrice: 3499,
      duration: '10 Weeks',
      batchName: 'Batch 2026',
      startDate: 'Immediate Access',
      schedule: 'Flexible Learning',
      instructorName: 'Academy Instructor',
      instructorTitle: 'Mathematics Instructor',
      instructorBio: 'Experienced instructor with deep expertise in conceptual mathematics.',
      isPublished: true
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCourseId(c._id);
    setFormData({
      title: c.title,
      tagline: c.tagline || '',
      description: c.description || '',
      category: c.category || 'General',
      level: c.level || 'All Levels',
      thumbnail: c.thumbnail || '',
      price: c.price || 0,
      discountPrice: c.discountPrice || c.price,
      duration: c.duration || 'Self-paced',
      batchName: c.batchName || 'Batch 2026',
      startDate: c.startDate || 'Immediate Access',
      schedule: c.schedule || 'Flexible',
      instructorName: c.instructor?.name || 'Lead Instructor',
      instructorTitle: c.instructor?.title || 'Faculty Member',
      instructorBio: c.instructor?.bio || '',
      isPublished: !!c.isPublished
    });
    setModalOpen(true);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);

    setThumbnailUploading(true);
    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        setFormData((prev) => ({ ...prev, thumbnail: data.media.url }));
        showToast('Thumbnail uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Upload failed.', 'error');
      }
    } catch (err) {
      showToast('Error uploading thumbnail file.', 'error');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      thumbnail: formData.thumbnail,
      price: Number(formData.price),
      discountPrice: Number(formData.discountPrice),
      duration: formData.duration,
      batchName: formData.batchName,
      startDate: formData.startDate,
      schedule: formData.schedule,
      isPublished: formData.isPublished,
      instructor: {
        name: formData.instructorName,
        title: formData.instructorTitle,
        bio: formData.instructorBio
      }
    };

    try {
      if (editingCourseId) {
        const res = await api.put(`/courses/${editingCourseId}`, payload);
        if (res.success) {
          showToast('Course updated successfully!', 'success');
          setModalOpen(false);
          fetchCourses();
        }
      } else {
        const res = await api.post('/courses', payload);
        if (res.success) {
          showToast('Course created successfully!', 'success');
          setModalOpen(false);
          fetchCourses();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save course.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await api.patch(`/courses/${courseId}/toggle-publish`);
      if (res.success) {
        showToast(res.message, 'success');
        setCourses((prev) =>
          prev.map((c) => (c._id === courseId ? { ...c, isPublished: res.isPublished } : c))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Permanently delete "${title}" and all associated curriculum?`)) {
      return;
    }

    try {
      const res = await api.delete(`/courses/${courseId}`);
      if (res.success) {
        showToast('Course deleted successfully.', 'success');
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete course.', 'error');
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure courses, syllabi, metadata, and publication states.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Course</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter courses by title or discipline..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading courses catalogue...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No courses found</h3>
          <p className="text-xs text-slate-500">
            Create a course using the button above to begin publishing curriculum.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Course</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Tuition</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Syllabus Structure</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    {/* Thumbnail & Title */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&auto=format&fit=crop&q=80'}
                          alt={c.title}
                          className="w-12 h-9 rounded object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs">{c.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">/{c.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {c.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3.5 font-medium text-slate-900">
                      ₹{c.discountPrice || c.price}
                      {c.discountPrice < c.price && (
                        <span className="text-[10px] text-slate-400 line-through ml-1 font-normal">
                          ₹{c.price}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{c.duration || 'Self-paced'}</span>
                      </div>
                    </td>

                    {/* Modules Count */}
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800">
                        {c.modules?.length || 0} Modules
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        ({c.totalLectures || 0} Lectures)
                      </span>
                    </td>

                    {/* Published Status Toggle */}
                    <td className="p-3.5">
                      <button
                        onClick={() => handleTogglePublish(c._id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition cursor-pointer border ${
                          c.isPublished
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {c.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/courses/${c._id}/content`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 rounded text-xs font-medium border border-slate-200 transition flex items-center gap-1"
                          title="Manage Modules & Lectures"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Curriculum</span>
                        </Link>

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(c._id, c.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-7 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCourseId ? 'Edit Course Batch Details' : 'Create Course Batch'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure curriculum title, pricing, category, duration, and instructor profile.
              </p>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Systems & Microservices in Go"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tagline *</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Concise educational summary"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Audience Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Standard Tuition (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 12 Weeks"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Batch & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Batch Name</label>
                  <input
                    type="text"
                    value={formData.batchName}
                    onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-semibold">Course Thumbnail Image</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail && (
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-16 h-11 rounded object-cover border border-slate-300 bg-white shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="Paste image URL or upload image file"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer hover:underline">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{thumbnailUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={thumbnailUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Publish Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-slate-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="publishToggle" className="font-medium text-slate-800 cursor-pointer">
                  Publish to Public Catalogue Immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCourseId ? 'Save Changes' : 'Create Batch'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
