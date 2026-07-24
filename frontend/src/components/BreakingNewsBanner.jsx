import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';
import API from '../services/api.js';

const BreakingNewsBanner = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [breakingArticles, setBreakingArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const { data } = await API.get('/articles/breaking');
        setBreakingArticles(data || []);
      } catch (error) {
        console.error('Failed to fetch breaking news banner:', error.message);
      }
    };
    fetchBreaking();

    // Re-fetch breaking news every 5 minutes
    const interval = setInterval(fetchBreaking, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    
    const cycle = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 7000);

    return () => clearInterval(cycle);
  }, [breakingArticles]);

  if (breakingArticles.length === 0) return null;

  const currentArticle = breakingArticles[currentIndex];

  const handleBannerClick = () => {
    if (currentArticle) {
      navigate(`/article/${currentArticle._id}`);
    }
  };

  return (
    <div 
      onClick={handleBannerClick}
      className="w-full mb-8 py-3 px-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-full flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.12)] cursor-pointer transition-all border border-[#C89B63]/40 hover:border-[#C89B63] group"
    >
      <div className="flex items-center gap-3.5 overflow-hidden">
        <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-[#C89B63] text-[#0F172A] rounded-full shadow-sm">
          <FiAlertCircle size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
          {t('breaking_news')}
        </span>
        <div className="relative h-6 flex-1 overflow-hidden min-w-[200px] sm:min-w-[400px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentArticle?._id || currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs sm:text-sm font-extrabold truncate leading-6 text-white group-hover:text-[#EADBC8] transition-colors"
            >
              {currentArticle?.title}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-widest pl-4 whitespace-nowrap text-[#C89B63]">
        <span>Explore</span>
        <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default BreakingNewsBanner;
