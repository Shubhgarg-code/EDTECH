import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Loader2,
  MessageSquare
} from 'lucide-react';

export const ContactPage = () => {
  const { showToast } = useToast();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get('/cms/settings');
        if (res.success && res.settings?.contact) {
          setContactInfo(res.settings.contact);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/cms/contact', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.success) {
        setSubmitted(true);
        showToast('Your message has been sent successfully.', 'success');
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting message.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading contact information...</p>
      </div>
    );
  }

  const {
    email: supportEmail,
    phone: supportPhone,
    address,
    workingHours,
    supportNotice
  } = contactInfo || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Compact Editorial Header */}
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5 text-slate-600" />
          <span>Admissions & Support</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed">
          Reach our admissions desk or support team.
          All inquiries are reviewed during operating hours.
        </p>
      </header>

      {/* Main Balanced Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Official Contact Coordinates (CMS Driven) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Direct Coordinates
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official communication channels for enquiring students and enrolled learners.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              {/* Email */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Admissions & Support
                  </p>
                  <a
                    href={`mailto:${supportEmail || 'contact@mathematicsacademy.in'}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition"
                  >
                    {supportEmail || 'contact@mathematicsacademy.in'}
                  </a>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Telephone Help Desk
                  </p>
                  <a
                    href={`tel:${supportPhone || '+9101149208000'}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition"
                  >
                    {supportPhone || '+91 (011) 4920-8000'}
                  </a>
                </div>
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Campus & Offices
                  </p>
                  <p className="font-medium text-slate-900 leading-relaxed mt-0.5">
                    {address || ''}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Operating Hours
                  </p>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {workingHours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SLA / Advisory Notice */}
          {supportNotice && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Support Response Commitment</p>
                <p className="mt-0.5">{supportNotice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-base font-bold text-slate-900">
              Submit an Official Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please provide accurate details so our team can respond to your inquiry effectively.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Message Submitted</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you. Your message has been logged in our administrative portal. A member of our
                admissions desk will follow up via email within business hours.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Subject / Area of Inquiry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Batch Schedule & Prerequisites"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Provide context regarding your question, academic background, or enrollment requirement..."
                  required
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 leading-relaxed transition resize-y"
                />
              </div>

              <div className="pt-1 flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">
                  Submissions are logged directly into our administrative portal.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
