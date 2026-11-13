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
  MessageSquare,
  Sparkles
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
      <div className="py-32 text-center bg-[#070B14]">
        <div className="w-10 h-10 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A7B5CC] mt-4 font-medium">Loading contact information...</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 bg-[#070B14] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#3B82F6]/20 pb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4 text-[#3B82F6]" />
          <span>Academic Inquiries & Admissions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
          Contact the Academy
        </h1>
        <p className="text-sm text-[#A7B5CC] max-w-2xl mt-2 leading-relaxed">
          Reach our academic counselor desk or support team. All course enquiries are handled directly by faculty coordinators.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Contact Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-7 shadow-xl space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                Direct Communication Channels
              </h2>
              <p className="text-xs text-[#A7B5CC] mt-1">
                Official contacts for prospective students, parent inquiries, and enrolled learners.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              {/* Email */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#3B82F6]/15">
                <div className="w-9 h-9 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#A7B5CC] uppercase tracking-wider">
                    Academic Inquiries
                  </p>
                  <a
                    href={`mailto:${supportEmail || 'contact@mathematicsacademy.in'}`}
                    className="font-semibold text-[#F8FAFC] hover:text-[#60A5FA] transition text-sm"
                  >
                    {supportEmail || 'contact@mathematicsacademy.in'}
                  </a>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#3B82F6]/15">
                <div className="w-9 h-9 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#A7B5CC] uppercase tracking-wider">
                    Counselor Help Desk
                  </p>
                  <a
                    href={`tel:${supportPhone || '+9101149208000'}`}
                    className="font-semibold text-[#F8FAFC] hover:text-[#60A5FA] transition text-sm"
                  >
                    {supportPhone || '+91 (011) 4920-8000'}
                  </a>
                </div>
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#3B82F6]/15">
                <div className="w-9 h-9 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#A7B5CC] uppercase tracking-wider">
                    Academy Center
                  </p>
                  <p className="font-medium text-[#F8FAFC] leading-relaxed mt-0.5">
                    {address || 'Mathematics Academy Campus, Academic Zone, New Delhi, India'}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#A7B5CC] uppercase tracking-wider">
                    Academic Hours
                  </p>
                  <p className="font-medium text-[#F8FAFC] mt-0.5">
                    {workingHours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Notice */}
          {supportNotice && (
            <div className="p-4 rounded-xl bg-[#14213A] border border-[#3B82F6]/30 text-xs text-[#A7B5CC] flex items-start gap-3 leading-relaxed shadow-lg">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#F8FAFC]">Response Commitment</p>
                <p className="mt-0.5">{supportNotice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-[#101A2C] rounded-2xl border border-[#3B82F6]/25 p-7 sm:p-9 shadow-xl">
          <div className="border-b border-[#3B82F6]/15 pb-5 mb-6">
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              Submit an Official Inquiry
            </h2>
            <p className="text-xs text-[#A7B5CC] mt-1">
              Please provide accurate details so our academic counselors can assist you with the right syllabus.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[#14213A] rounded-2xl border border-[#3B82F6]/30 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-base">Inquiry Successfully Submitted</h3>
              <p className="text-xs text-[#A7B5CC] max-w-md mx-auto leading-relaxed">
                Thank you. Your inquiry has been registered in our administrative portal. Our mathematics faculty coordinator will respond within 24 business hours.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-[#101A2C] hover:bg-[#070B14] text-[#F8FAFC] border border-[#3B82F6]/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">
                    Student / Parent Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">
                    Contact Number <span className="text-[#A7B5CC]/60 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
                  />
                </div>

                <div>
                  <label className="block text-[#F8FAFC] font-semibold mb-1.5">
                    Area of Inquiry / Class <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Class 12 Calculus & Board Prep"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F8FAFC] font-semibold mb-1.5">
                  Detailed Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us about your current academic level, target goals, or syllabus questions..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#070B14] border border-[#3B82F6]/30 rounded-xl text-[#F8FAFC] placeholder-[#A7B5CC]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] leading-relaxed transition resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <p className="text-[11px] text-[#A7B5CC]">
                  Inquiries are logged directly into our administration portal.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/25 disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Inquiry</span>
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
