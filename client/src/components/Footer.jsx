import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { GraduationCap, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export const Footer = () => {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await api.get('/cms/settings');
        if (res.success && res.settings) {
          setFooterData({
            footer: res.settings.footer,
            contact: res.settings.contact,
            brandName: res.settings.brandName
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchFooter();
  }, []);

  const footer = footerData?.footer;
  const contact = footerData?.contact;
  const brandName = footerData?.brandName || 'Mathematics Academy';

  return (
    <footer className="bg-[#070B14] text-[#A7B5CC] border-t border-[#3B82F6]/20 relative overflow-hidden">
      {/* Subtle blue accent ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
                {brandName}
              </span>
            </div>
            <p className="text-xs text-[#A7B5CC] leading-relaxed">
              {footer?.aboutText ||
                'Mathematics Academy is committed to delivering structured, concept-driven mathematics education for students at every level.'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101A2C] border border-[#3B82F6]/20 text-[11px] text-[#60A5FA]">
              <Sparkles className="w-3 h-3 text-[#3B82F6]" />
              <span>Rigorous. Analytical. Structured.</span>
            </div>
          </div>

          {/* Courses & Resources */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Curriculum & Programs
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A7B5CC]">
              <li>
                <Link to="/courses" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> All Mathematics Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> Teaching Methodology
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> Student Admissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A7B5CC]">
              <li>
                <Link to="/" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> Course Catalogue
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> About Academy
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#60A5FA] transition flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">›</span> Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from CMS */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Academy Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A7B5CC]">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <a
                  href={`mailto:${contact?.email || 'amanmishra7211@gmail.com'}`}
                  className="truncate hover:text-[#60A5FA] transition"
                >
                  {contact?.email || 'amanmishra7211@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <a
                  href={`tel:${(contact?.phone || '+91 85957 42861').replace(/[^\d+]/g, '')}`}
                  className="hover:text-[#60A5FA] transition"
                >
                  {contact?.phone || '+91 85957 42861'}
                </a>
              </li>
              {contact?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />
                  <span className="leading-snug">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#3B82F6]/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A7B5CC] gap-3">
          <p>{footer?.copyrightText || '© 2026 Mathematics Academy. All rights reserved.'}</p>
          <p className="text-[#60A5FA]">
            Structured Mathematics • Pure Concepts • Analytical Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
