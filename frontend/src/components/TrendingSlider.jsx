import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiClock, FiEye } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';
import { decodeHTMLEntities, getCategoryFallbackImage } from '../utils/decodeHtml.js';
import API from '../services/api.js';

const TrendingSlider = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await API.get('/articles/trending');
        setTrending(data || []);
      } catch (error) {
        console.error('Failed to load trending slider articles:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="h-7 w-48 bg-gray-300 dark:bg-gray-800 rounded skeleton-pulse mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {[1, 2, 3].map((n) => (
            <div key={n} className="min-w-[280px] sm:min-w-[350px] h-48 rounded-2xl glass-card skeleton-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="w-full mb-10">
      {/* Title */}
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight text-[#0F172A] dark:text-white mb-5">
        <span className="w-6 h-6 rounded-full bg-[#C89B63] text-white flex items-center justify-center text-xs shadow-sm">
          ✦
        </span>
        <span className="uppercase tracking-wider text-xs font-black text-[#C89B63] mr-1">{t('trending_news')}</span>
      </h2>

      {/* Horizontal Carousel List */}
      <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
        {trending.map((article, idx) => {
          const categorySlug = article.category?.slug || 'world';
          const fallbackImg = getCategoryFallbackImage(categorySlug, article._id || article.title);
          const cleanTitle = decodeHTMLEntities(article.title);

          return (
            <motion.div
              key={article._id}
              onClick={() => navigate(`/article/${article._id}`)}
              whileHover={{ y: -4 }}
              className="min-w-[290px] sm:min-w-[370px] max-w-[420px] h-52 rounded-[24px] overflow-hidden relative cursor-pointer flex-shrink-0 snap-start shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-[#EAE6DF] dark:border-[#25334D]"
            >
              {/* Background image */}
              <img
                src={article.imageUrl || fallbackImg}
                alt={cleanTitle}
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.target.src = fallbackImg;
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent z-10" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col justify-end text-white space-y-2">
                <div className="flex justify-between text-[10px] font-extrabold text-[#EADBC8]">
                  <span className="uppercase tracking-widest">{article.category?.name || 'General'}</span>
                  <span className="flex items-center gap-1"><FiClock size={11} className="text-[#C89B63]" /> {formatRelativeTime(article.pubDate, lang)}</span>
                </div>
                <h3 className="font-black text-sm sm:text-base line-clamp-2 leading-snug text-white">
                  {cleanTitle}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-white/10">
                  <span className="font-semibold text-gray-300">{article.source?.name}</span>
                  <span className="flex items-center gap-1 font-bold text-[#EADBC8]">
                    <FiEye size={12} className="text-[#C89B63]" /> {article.clicksCount || 0}
                  </span>
                </div>
              </div>

              {/* Rank index tag */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#C89B63] text-[#0F172A] rounded-full flex items-center justify-center text-xs font-black z-20 shadow-md">
                #{idx + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingSlider;
