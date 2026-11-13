import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

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
        // Silent fallback
      }
    };
    fetchFooter();
  }, []);

  const footer = footerData?.footer;
  const contact = footerData?.contact;
  const brandName = footerData?.brandName || 'Mathematics Academy';

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                <GraduationCap className="w-4 h-4 text-slate-200" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                {brandName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {footer?.aboutText ||
                'Mathematics Academy is committed to delivering structured, concept-driven mathematics education for students at every level.'}
            </p>
          </div>

          {/* Courses & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Courses & Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white transition">
                  Available Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Our Teaching Approach
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Admissions & Enquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition">
                  Course Catalogue
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from CMS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact Information
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{contact?.email || 'contact@mathematicsacademy.in'}</span>
              </li>
              {contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{contact.phone}</span>
                </li>
              )}
              {contact?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>{footer?.copyrightText || '© 2026 Mathematics Academy. All rights reserved.'}</p>
          <p className="text-slate-400">
            Dedicated to conceptual understanding & structured mathematics education.
          </p>
        </div>
      </div>
    </footer>
  );
};
