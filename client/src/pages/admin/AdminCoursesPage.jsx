import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, API_BASE } from '../../api/apiClient';
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
  Clock,
  Sparkles
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
    instructorName: 'Academy Faculty',
    instructorTitle: 'Senior Mathematics Instructor',
    instructorBio: 'Dedicated to concept-first mathematics teaching and rigorous problem solving.',
    isPublished: true
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
      instructorName: 'Academy Faculty',
      instructorTitle: 'Senior Mathematics Instructor',
      instructorBio: 'Dedicated to concept-first mathematics teaching and rigorous problem solving.',
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
      category: c.category || 'Mathematics',
      level: c.level || 'All Levels',
      thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      price: c.price || 0,
      discountPrice: c.discountPrice || c.price,
      duration: c.duration || 'Self-paced',
      batchName: c.batchName || 'Batch 2026',
      startDate: c.startDate || 'Immediate Access',
      schedule: c.schedule || 'Flexible',
      instructorName: c.instructor?.name || 'Academy Faculty',
      instructorTitle: c.instructor?.title || 'Senior Mathematics Instructor',
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
      const res = await fetch(`${API_BASE}/media/upload`, {
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
    <div className="space-y-6 bg-[#070B14] text-[#F8FAFC]">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B82F6]/20 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            Mathematics Courses Catalogue
          </h1>
          <p className="text-xs text-[#A7B5CC] mt-1">
            Manage course syllabi, pricing, modules, and public publication states.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Mathematics Course</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#101A2C] px-3.5 py-2.5 rounded-xl border border-[#3B82F6]/30 shadow-md flex items-center gap-2.5 max-w-md">
        <Search className="w-4 h-4 text-[#3B82F6] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter courses by title, topic, or category..."
          className="w-full text-xs bg-transparent focus:outline-none text-[#F8FAFC] placeholder-[#A7B5CC]/40"
        />
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A7B5CC] mt-4 font-medium">Loading courses catalogue...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/20 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[#3B82F6]/40 mx-auto" />
          <h3 className="font-bold text-[#F8FAFC] text-base">No courses found</h3>
          <p className="text-xs text-[#A7B5CC]">
            Create a course using the button above to begin publishing curriculum.
          </p>
        </div>
      ) : (
        <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-[#3B82F6]/20 text-[#A7B5CC] uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Tuition</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Curriculum Structure</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B82F6]/10 text-[#A7B5CC]">
                {filteredCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-[#14213A]/50 transition">
                    {/* Thumbnail & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=120&auto=format&fit=crop&q=80'}
                          alt={c.title}
                          className="w-14 h-10 rounded-lg object-cover bg-[#070B14] border border-[#3B82F6]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#F8FAFC] truncate max-w-xs">{c.title}</p>
                          <p className="text-[10px] text-[#60A5FA] font-mono">/{c.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="bg-[#14213A] text-[#60A5FA] font-semibold px-2.5 py-0.5 rounded text-[10px] border border-[#3B82F6]/25">
                        {c.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-[#F8FAFC]">
                      ₹{c.discountPrice || c.price}
                      {c.discountPrice < c.price && (
                        <span className="text-[10px] text-[#A7B5CC]/70 line-through ml-1.5 font-normal">
                          ₹{c.price}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="p-4 text-[#A7B5CC]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>{c.duration || 'Self-paced'}</span>
                      </div>
                    </td>

                    {/* Modules Count */}
                    <td className="p-4">
                      <span className="font-bold text-[#F8FAFC]">
                        {c.modules?.length || 0} Modules
                      </span>
                      <span className="text-[11px] text-[#60A5FA] block">
                        ({c.totalLectures || 0} Lectures)
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(c._id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer border ${
                          c.isPublished
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-[#14213A] text-[#A7B5CC] border-[#3B82F6]/20 hover:bg-[#1E293B]'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {c.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-[#A7B5CC]" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/courses/${c._id}/content`}
                          className="px-3 py-1.5 bg-[#14213A] hover:bg-[#2563EB] text-[#60A5FA] hover:text-white rounded-lg text-xs font-semibold border border-[#3B82F6]/30 transition flex items-center gap-1.5"
                          title="Manage Modules & Lectures"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Curriculum</span>
                        </Link>

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-[#A7B5CC] hover:text-[#60A5FA] hover:bg-[#14213A] rounded-lg transition cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(c._id, c.title)}
                          className="p-1.5 text-[#A7B5CC] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#101A2C] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#3B82F6]/30 max-h-[90vh] overflow-y-auto space-y-6 text-[#F8FAFC]">
            <div className="border-b border-[#3B82F6]/20 pb-4">
              <h2 className="text-lg font-bold text-[#F8FAFC]">
                {editingCourseId ? 'Edit Mathematics Course' : 'Create New Mathematics Course'}
              </h2>
              <p className="text-xs text-[#A7B5CC] mt-1">
                Configure syllabus title, pricing, category, duration, and instructor profile.
              </p>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Course Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Higher Calculus & Differential Equations — Class 12"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Tagline *</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Concise educational summary"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Academic Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Calculus, Algebra, Geometry, Trigonometry"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Audience Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  >
                    <option value="Beginner" className="bg-[#101A2C]">Beginner</option>
                    <option value="Intermediate" className="bg-[#101A2C]">Intermediate</option>
                    <option value="Advanced" className="bg-[#101A2C]">Advanced</option>
                    <option value="All Levels" className="bg-[#101A2C]">All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">Curriculum Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Standard Tuition (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 12 Weeks"
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>
              </div>

              {/* Batch & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Batch Name</label>
                  <input
                    type="text"
                    value={formData.batchName}
                    onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">Faculty / Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-xs"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="p-4 bg-[#14213A] rounded-xl border border-[#3B82F6]/25 space-y-2.5">
                <label className="block text-[#F8FAFC] font-semibold">Course Thumbnail Image</label>
                <div className="flex items-center gap-3.5">
                  {formData.thumbnail && (
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-16 h-12 rounded-lg object-cover border border-[#3B82F6]/30 bg-[#070B14] shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="Paste image URL or upload image file"
                      className="w-full px-3 py-1.5 border border-[#3B82F6]/30 rounded-lg bg-[#070B14] text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs text-[#60A5FA] font-semibold cursor-pointer hover:underline">
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
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded bg-[#070B14] border-[#3B82F6]/40 text-[#2563EB] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="publishToggle" className="font-medium text-[#F8FAFC] cursor-pointer">
                  Publish to Public Catalogue Immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#3B82F6]/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#3B82F6]/30 rounded-xl text-[#A7B5CC] hover:text-white hover:bg-[#14213A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCourseId ? 'Save Changes' : 'Create Course'}</span>
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
