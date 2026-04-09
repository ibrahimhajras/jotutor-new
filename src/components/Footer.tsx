
import React, { useEffect, useState } from 'react';
import { Page, FooterContent } from '../types';
import { fetchPublicData } from '../googleSheetService';

interface FooterProps {
  onNavigate: (page: Page) => void;
  strings: { [key: string]: string };
}

const Footer: React.FC<FooterProps> = ({ onNavigate, strings }) => {
  const isEn = document.documentElement.lang === 'en';
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [socialLinks, setSocialLinks] = useState({
      facebook: '',
      instagram: '',
      youtube: '',
      linkedin: ''
  });

  useEffect(() => {
    fetchPublicData().then(res => {
        if (res.success && res.data.config) {
            const content = isEn ? res.data.config.siteContentEn || res.data.config.siteContent : res.data.config.siteContent;
            if (content?.footer) setFooterData(content.footer);
            if (content?.contact) {
                setSocialLinks({
                    facebook: content.contact.facebook || '#',
                    instagram: content.contact.instagram || '#',
                    youtube: content.contact.youtube || '#',
                    linkedin: content.contact.linkedin || '#'
                });
            }
        }
    });
  }, [isEn]);

  const footerLinks: { label: string; page: Page | 'join' }[] = [
    { label: strings.navAbout, page: 'about' },
    { label: strings.footerJoinTeacher, page: 'join' },
    { label: strings.footerFAQ, page: 'faq' },
    { label: strings.navBlog, page: 'blog' },
  ];

  const legalLinks: { label: string; page: Page }[] = [
    { label: strings.privacyTitle, page: 'privacy' },
    { label: strings.termsTitle, page: 'terms' },
    { label: strings.paymentRefundTitle, page: 'payment-refund' },
  ];

  const joinTeacherUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdR8nxLM30CJgzGiBLyeY9Txcug_YfrRXa2xMVYOUe0ldSUZw/viewform?usp=sf_link";

  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 space-x-reverse mb-4">
                <img src="https://i.ibb.co/XxGsLR3D/15.png" alt="JoTutor Logo" className="h-10 w-auto bg-white rounded-md p-1" />
                <span className="font-bold text-2xl">JoTutor</span>
            </button>
            <p className="text-blue-200">
              {isEn 
                ? (footerData?.description_en || strings.footerDescription) 
                : (footerData?.description || strings.footerDescription)}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h5 className="font-bold text-lg mb-4">{strings.footerQuickLinks}</h5>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.page}>
                  {link.page === 'join' ? (
                    <a href={joinTeacherUrl} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <button onClick={() => onNavigate(link.page as Page)} className="text-blue-200 hover:text-white transition-colors">{link.label}</button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-bold text-lg mb-4">{strings.footerLegal}</h5>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.page}>
                  <button onClick={() => onNavigate(link.page)} className="text-blue-200 hover:text-white transition-colors">{link.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-300 text-sm">
            &copy; {new Date().getFullYear()} {isEn ? (footerData?.rights_en || strings.footerRights) : (footerData?.rights || strings.footerRights)}
          </p>
          
          <div className="flex space-x-4 space-x-reverse mt-4 md:mt-0">
             {socialLinks.facebook !== '#' && (
                 <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all p-2 bg-blue-800 rounded-full hover:scale-110" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                 </a>
             )}
             {socialLinks.instagram !== '#' && (
                 <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all p-2 bg-blue-800 rounded-full hover:scale-110" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                 </a>
             )}
             {socialLinks.youtube !== '#' && (
                 <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all p-2 bg-blue-800 rounded-full hover:scale-110" aria-label="YouTube">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                 </a>
             )}
             {socialLinks.linkedin !== '#' && (
                 <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all p-2 bg-blue-800 rounded-full hover:scale-110" aria-label="LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                 </a>
             )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
