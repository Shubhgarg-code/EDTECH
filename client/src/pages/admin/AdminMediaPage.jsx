import React, { useState, useEffect } from 'react';
import { api, API_BASE } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  FolderOpen,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  FileText,
  Video,
  Image,
  Search,
  ExternalLink,
  Loader2,
  HardDrive
} from 'lucide-react';

export const AdminMediaPage = () => {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchMedia = async () => {
    try {
      const res = await api.get(`/media?category=${categoryFilter}&search=${search}`);
      if (res.success) {
        setMediaList(res.media);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch media library.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [categoryFilter, search]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const body = new FormData();
    body.append('file', file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Uploaded "${data.media.originalName}" successfully!`, 'success');
        fetchMedia();
      } else {
        showToast(data.message || 'Upload failed.', 'error');
      }
    } catch (err) {
      showToast('Error uploading file.', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('File URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteMedia = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}" from server?`)) return;

    try {
      const res = await api.delete(`/media/${id}`);
      if (res.success) {
        showToast('File deleted permanently.', 'success');
        setMediaList((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete file.', 'error');
    }
  };

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'image', label: 'Images' },
    { id: 'document', label: 'Documents (PDF)' },
    { id: 'video', label: 'Videos' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Media Library</h1>
          <p className="text-xs text-[#64748B]">
            Upload, manage, and retrieve URLs for images, PDF notes, and lecture video assets.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition active:scale-95">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to Server...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload New File</span>
              </>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101A2C] p-4 rounded-2xl border border-[#1E293B] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === c.id
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-sm'
                  : 'bg-[#070B14] text-[#94A3B8] hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#1E293B] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-[#101A2C] rounded-2xl border border-[#1E293B] p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-[#F8FAFC] text-sm">No files uploaded yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Upload images for course thumbnails, PDFs for lecture notes, or MP4 videos for classroom streams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((file) => {
            const isImg = file.category === 'image';
            const isDoc = file.category === 'document';
            const isVid = file.category === 'video';

            return (
              <div
                key={file._id}
                className="bg-[#101A2C] rounded-2xl border border-[#1E293B] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Preview Thumbnail */}
                <div className="aspect-video bg-[#070B14] relative overflow-hidden flex items-center justify-center">
                  {isImg ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : isVid ? (
                    <div className="flex flex-col items-center text-slate-400">
                      <Video className="w-8 h-8 text-blue-500 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Video Asset</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <FileText className="w-8 h-8 text-rose-500 mb-1" />
                      <span className="text-[10px] font-bold uppercase">PDF Document</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-md">
                    {file.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-2">
                  <div>
                    <h4
                      className="font-bold text-[#F8FAFC] text-xs truncate"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {file.formattedSize || `${(file.size / 1024).toFixed(0)} KB`} •{' '}
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyUrl(file.url, file._id)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                    >
                      {copiedId === file._id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-[#94A3B8] rounded"
                        title="View file in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteMedia(file._id, file.originalName)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

