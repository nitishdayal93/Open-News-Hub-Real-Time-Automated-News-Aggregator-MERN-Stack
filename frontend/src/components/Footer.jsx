import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-10 mt-16 border-t border-[#EAE6DF] dark:border-[#25334D] bg-white/50 dark:bg-[#161F30]/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#6B7280]">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#0F172A] dark:bg-[#C89B63] text-[#C89B63] dark:text-[#0F172A] flex items-center justify-center font-black text-xs shadow-sm">
            ✦
          </span>
          <span className="font-extrabold text-[#0F172A] dark:text-white">
            Open<span className="text-[#C89B63]">News</span> Hub
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="font-medium">&copy; {new Date().getFullYear()} OpenNews Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 font-bold">
          <a href="#" className="hover:text-[#C89B63] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#C89B63] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#C89B63] transition-colors">API Docs</a>
          <a href="#" className="hover:text-[#C89B63] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
