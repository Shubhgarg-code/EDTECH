import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  SlidersHorizontal,
  FileText,
  Mail,
  ToggleLeft,
  HelpCircle,
  Bell,
  Save,
  Plus,
  Trash2,
  Edit,
  Upload,
  Loader2,
  Building2,
  Layers,
  Inbox
} from 'lucide-react';

export const AdminCmsPage = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('hero'); // hero | about | contact | sections | faqs | announcements | footer
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annBadge, setAnnBadge] = useState('Important');
  const [annLink, setAnnLink] = useState('');

  // Hero & About Image Upload State
  const [isUploadingHeroImg, setIsUploadingHeroImg] = useState(false);
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);

  const fetchCmsData = async () => {
    try {
      const [settingsRes, inquiriesRes] = await Promise.all([
        api.get('/cms/settings'),
        api.get('/cms/messages')
      ]);

      if (settingsRes.success) setSettings(settingsRes.settings);
      if (inquiriesRes.success) setInquiries(inquiriesRes.messages);
    } catch (err) {
      showToast(err.message || 'Failed to fetch CMS settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put('/cms/settings', settings);
      if (res.success) {
        showToast('Website content updated and published live!', 'success');
        setSettings(res.settings);
      }
    } catch (err) {
      showToast(err.message || 'Error updating settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, targetField) => {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);

    if (targetField === 'hero') setIsUploadingHeroImg(true);
    if (targetField === 'about') setIsUploadingAboutImg(true);

    try {
      const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        if (targetField === 'hero') {
          setSettings((prev) => ({
            ...prev,
            hero: { ...prev.hero, heroImage: data.media.url }
          }));
        } else if (targetField === 'about') {
          setSettings((prev) => ({
            ...prev,
            about: { ...prev.about, aboutImage: data.media.url }
          }));
        }
        showToast('Image uploaded and applied.', 'success');
      }
    } catch (err) {
      showToast('Image upload failed.', 'error');
    } finally {
      setIsUploadingHeroImg(false);
      setIsUploadingAboutImg(false);
    }
  };

  // FAQ Operations
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (editingFaqId) {
        const res = await api.put(`/cms/faqs/${editingFaqId}`, {
          question: faqQuestion,
          answer: faqAnswer
        });
        if (res.success) {
          showToast('FAQ updated.', 'success');
          setSettings((prev) => ({ ...prev, faqs: res.faqs }));
          setFaqModalOpen(false);
        }
      } else {
        const res = await api.post('/cms/faqs', {
          question: faqQuestion,
          answer: faqAnswer
        });
        if (res.success) {
          showToast('FAQ created.', 'success');
          setSettings((prev) => ({ ...prev, faqs: res.faqs }));
          setFaqModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error saving FAQ.', 'error');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Remove this FAQ item?')) return;
    try {
      const res = await api.delete(`/cms/faqs/${faqId}`);
      if (res.success) {
        showToast('FAQ removed.', 'success');
        setSettings((prev) => ({ ...prev, faqs: res.faqs }));
      }
    } catch (err) {
      showToast(err.message || 'Error deleting FAQ.', 'error');
    }
  };

  // Announcement Operations
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cms/announcements', {
        title: annTitle,
        content: annContent,
        badge: annBadge,
        link: annLink
      });
      if (res.success) {
        showToast('Announcement posted.', 'success');
        setSettings((prev) => ({ ...prev, announcements: res.announcements }));
        setAnnouncementModalOpen(false);
        setAnnTitle('');
        setAnnContent('');
        setAnnLink('');
      }
    } catch (err) {
      showToast(err.message || 'Error posting announcement.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/cms/announcements/${annId}`);
      if (res.success) {
        showToast('Announcement removed.', 'success');
        setSettings((prev) => ({ ...prev, announcements: res.announcements }));
      }
    } catch (err) {
      showToast(err.message || 'Error removing announcement.', 'error');
    }
  };

  // Inquiry Status Update
  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    try {
      const res = await api.put(`/cms/messages/${inquiryId}`, { status });
      if (res.success) {
        showToast('Inquiry status updated.', 'success');
        setInquiries((prev) =>
          prev.map((m) => (m._id === inquiryId ? { ...m, status } : m))
        );
      }
    } catch (err) {
      showToast(err.message || 'Error updating message status.', 'error');
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      const res = await api.delete(`/cms/messages/${inquiryId}`);
      if (res.success) {
        showToast('Inquiry deleted.', 'success');
        setInquiries((prev) => prev.filter((m) => m._id !== inquiryId));
      }
    } catch (err) {
      showToast(err.message || 'Error deleting inquiry.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading CMS configuration...</p>
      </div>
    );
  }

  const unreadCount = inquiries.filter((m) => m.status === 'unread').length;

  const tabs = [
    { id: 'hero', label: 'Hero Header', icon: Layers },
    { id: 'about', label: 'About Us Content', icon: Building2 },
    { id: 'contact', label: 'Contact Coordinates', icon: Mail },
    { id: 'inquiries', label: 'Inquiries Inbox', icon: Inbox, badge: unreadCount },
    { id: 'sections', label: 'Section Visibility', icon: ToggleLeft },
    { id: 'faqs', label: 'FAQs Manager', icon: HelpCircle, badge: settings?.faqs?.length },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: settings?.announcements?.length },
    { id: 'footer', label: 'Footer & Legal', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Website Content CMS</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public website copy, banners, coordinates, FAQs, and visitor inquiries.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish Live</span>
            </>
          )}
        </button>
      </div>

      {/* Understated Administrative Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-medium gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2.5 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge > 0 && (
                <span className="bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO & BANNERS */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-3xl text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Homepage Hero Section</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Control the primary banner on the homepage.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Eyebrow Badge Text</label>
              <input
                type="text"
                value={settings?.hero?.badge || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, badge: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Main Headline *</label>
              <input
                type="text"
                value={settings?.hero?.heading || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, heading: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subheading Description</label>
              <textarea
                value={settings?.hero?.subheading || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, subheading: e.target.value }
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Button Label</label>
                <input
                  type="text"
                  value={settings?.hero?.primaryCtaText || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, primaryCtaText: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={settings?.hero?.primaryCtaLink || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, primaryCtaLink: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Hero Image */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-semibold">Hero Showcase Image</label>
              <div className="flex items-center gap-3">
                {settings?.hero?.heroImage && (
                  <img
                    src={settings.hero.heroImage}
                    alt="Hero Preview"
                    className="w-20 h-14 rounded object-cover border border-slate-300 bg-white shrink-0"
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={settings?.hero?.heroImage || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, heroImage: e.target.value }
                      })
                    }
                    placeholder="Paste image URL or upload file below"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingHeroImg ? 'Uploading...' : 'Upload Image to Media Library'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'hero')}
                      disabled={isUploadingHeroImg}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT US */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-3xl text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">About Us Page & Homepage Preview</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Define academic mission, vision, and pedagogy.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">About Section Title</label>
              <input
                type="text"
                value={settings?.about?.heading || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: { ...settings.about, heading: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Main Description</label>
              <textarea
                value={settings?.about?.description || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: { ...settings.about, description: e.target.value }
                  })
                }
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mission Statement</label>
                <textarea
                  value={settings?.about?.mission || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, mission: e.target.value }
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vision Statement</label>
                <textarea
                  value={settings?.about?.vision || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, vision: e.target.value }
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* About Image */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-semibold">About Section Showcase Image</label>
              <div className="flex items-center gap-3">
                {settings?.about?.aboutImage && (
                  <img
                    src={settings.about.aboutImage}
                    alt="About Preview"
                    className="w-20 h-14 rounded object-cover border border-slate-300 bg-white shrink-0"
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={settings?.about?.aboutImage || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        about: { ...settings.about, aboutImage: e.target.value }
                      })
                    }
                    placeholder="Image URL or upload file"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingAboutImg ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'about')}
                      disabled={isUploadingAboutImg}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT COORDINATES */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-3xl text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Institutional Contact Coordinates</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              These details populate the public /contact page and footer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Support Email</label>
              <input
                type="email"
                value={settings?.contact?.email || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings?.contact?.phone || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, phone: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Campus Physical Address</label>
            <input
              type="text"
              value={settings?.contact?.address || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, address: e.target.value }
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academic Office Hours</label>
              <input
                type="text"
                value={settings?.contact?.workingHours || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, workingHours: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Response SLA Advisory Notice</label>
              <input
                type="text"
                value={settings?.contact?.supportNotice || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, supportNotice: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Inbox className="w-4 h-4 text-slate-700" />
                <span>Contact Inquiries Inbox ({inquiries.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic messages submitted by visitors through the /contact page.
              </p>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No contact inquiries in database.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {inquiries.map((inq) => (
                <div key={inq._id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {inq.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 text-sm">{inq.subject}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                        <span className="font-medium text-slate-700">{inq.name}</span>
                        <span>{inq.email}</span>
                        {inq.phone && <span>{inq.phone}</span>}
                        <span className="font-mono text-slate-400">
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase border cursor-pointer ${
                          inq.status === 'unread'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : inq.status === 'responded'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="responded">Responded</option>
                      </select>

                      <button
                        onClick={() => handleDeleteInquiry(inq._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-200 text-xs">
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SECTION VISIBILITY */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-xl text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Homepage Section Visibility</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Toggle sections on or off on the public landing page.
            </p>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {[
              { key: 'showHero', label: 'Hero Header Section' },
              { key: 'showFeaturedCourses', label: 'Published Courses Catalogue' },
              { key: 'showCategories', label: 'Curriculum Categories Grid' },
              { key: 'showAbout', label: 'Institutional Methodology Preview' },
              { key: 'showFaq', label: 'Frequently Asked Questions' },
              { key: 'showContact', label: 'Contact Office Callout' },
              { key: 'showAnnouncements', label: 'Platform Announcements Banner' }
            ].map(({ key, label }) => (
              <div key={key} className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-slate-800">{label}</span>
                <input
                  type="checkbox"
                  checked={!!settings?.sectionsVisibility?.[key]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sectionsVisibility: {
                        ...settings.sectionsVisibility,
                        [key]: e.target.checked
                      }
                    })
                  }
                  className="rounded text-slate-900 w-4 h-4 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAQS MANAGER */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions shown in the FAQ accordion on the public website.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFaqId(null);
                setFaqQuestion('');
                setFaqAnswer('');
                setFaqModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {settings?.faqs?.map((faq) => (
              <div key={faq._id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">{faq.question}</h4>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingFaqId(faq._id);
                      setFaqQuestion(faq.question);
                      setFaqAnswer(faq.answer);
                      setFaqModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Announcements</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top notification bar displayed across public platform.
              </p>
            </div>
            <button
              onClick={() => setAnnouncementModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Announcement</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {settings?.announcements?.length === 0 ? (
              <p className="text-slate-400 italic py-4">No active announcements.</p>
            ) : (
              settings?.announcements?.map((ann) => (
                <div
                  key={ann._id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                        {ann.badge}
                      </span>
                      <span className="font-semibold text-slate-900">{ann.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{ann.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: FOOTER */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Footer Content Settings</h3>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Footer About Text</label>
            <textarea
              value={settings?.footer?.aboutText || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, aboutText: e.target.value }
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Copyright Notice</label>
            <input
              type="text"
              value={settings?.footer?.copyrightText || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, copyrightText: e.target.value }
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">{editingFaqId ? 'Edit FAQ' : 'Add FAQ'}</h3>
            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question *</label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  required
                  placeholder="e.g. How does course doubt support work?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Answer *</label>
                <textarea
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  required
                  rows={3}
                  placeholder="Clear and informative answer..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Post Announcement</h3>
            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Badge</label>
                <input
                  type="text"
                  value={annBadge}
                  onChange={(e) => setAnnBadge(e.target.value)}
                  placeholder="e.g. Important, New Cohort, Update"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Announcement Title *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  placeholder="Short headline"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Content *</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  rows={2}
                  placeholder="Detailed announcement copy..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Action Link (Optional)</label>
                <input
                  type="text"
                  value={annLink}
                  onChange={(e) => setAnnLink(e.target.value)}
                  placeholder="/courses or external link"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
