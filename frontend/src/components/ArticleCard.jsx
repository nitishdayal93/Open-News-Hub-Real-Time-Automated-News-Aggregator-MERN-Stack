import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiHeart, FiEye, FiClock, FiShare2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';
import { decodeHTMLEntities, getCategoryFallbackImage } from '../utils/decodeHtml.js';
import API from '../services/api.js';

const ArticleCard = ({ article, isBookmarkedPage = false }) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Sync initial liked/bookmarked states from user data
  useEffect(() => {
    if (user) {
      setLiked(user.likedArticles?.includes(article._id) || false);
      
      // If we are in bookmarks page, it's bookmarked by default
      if (isBookmarkedPage) {
        setBookmarked(true);
      }
    }
  }, [user, article._id, isBookmarkedPage]);

  // If not on bookmarks page, check if bookmark status is available
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user && !isBookmarkedPage) {
        try {
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkBookmarkStatus();
  }, [user, article._id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (loadingAction) return;

    setLoadingAction(true);
    try {
      const { data } = await API.post(`/articles/${article._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (loadingAction) return;

    setLoadingAction(true);
    try {
      const { data } = await API.post(`/articles/${article._id}/bookmark`);
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(article.url);
      alert('Article link copied to clipboard!');
    }
  };

  const handleCardClick = () => {
    navigate(`/article/${article._id}`);
  };

  const categorySlug = article.category?.slug || 'world';
  const fallbackImg = getCategoryFallbackImage(categorySlug, article._id || article.title);

  const cleanTitle = decodeHTMLEntities(article.title);
  const cleanDesc = decodeHTMLEntities(article.description);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      className="flex flex-col h-full rounded-[24px] glass-card overflow-hidden cursor-pointer group"
    >
      {/* Article Image Container */}
      <div className="relative w-full h-52 overflow-hidden bg-[#F1EFE9] dark:bg-[#0B0F17]">
        <img
          src={article.imageUrl || fallbackImg}
          alt={cleanTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />
        {/* Source Logo Overlay */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 text-[10px] font-extrabold rounded-full bg-white/90 dark:bg-[#161F30]/90 border border-[#EAE6DF] dark:border-[#25334D] flex items-center gap-1.5 text-[#0F172A] dark:text-white shadow-sm backdrop-blur-md">
          {article.source?.logoUrl && (
            <img src={article.source.logoUrl} alt="" className="w-3.5 h-3.5 object-contain rounded-full" />
          )}
          <span>{article.source?.name || 'News Source'}</span>
        </div>

        {/* Breaking News Label */}
        {article.isBreaking && (
          <div className="absolute top-3.5 right-3.5 px-3 py-1 text-[9px] font-black uppercase tracking-wider bg-[#EF4444] text-white rounded-full shadow-md animate-pulse">
            Breaking
          </div>
        )}
      </div>

      {/* Article Content Area */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata: Category & Date */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63]">
              {article.category?.name || 'General'}
            </span>
            <span className="flex items-center gap-1 font-bold text-[#6B7280]">
              <FiClock size={12} className="text-[#C89B63]" />
              {formatRelativeTime(article.pubDate, lang)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-black text-base leading-snug line-clamp-2 text-[#0F172A] dark:text-white group-hover:text-[#C89B63] transition-colors">
            {cleanTitle}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#6B7280] dark:text-gray-400 line-clamp-3 leading-relaxed">
            {cleanDesc}
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#EAE6DF] dark:border-[#25334D]">
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-[#F1EFE9] dark:bg-white/5 border border-[#EAE6DF] dark:border-[#25334D] text-[#6B7280] dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Bar: Clicks & Action Buttons */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B7280]">
              <FiEye size={13} className="text-[#C89B63]" />
              <span>{article.clicksCount || 0} views</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-[#F1EFE9] dark:hover:bg-white/10 text-[#6B7280] hover:text-[#0F172A] dark:hover:text-white transition-all"
              >
                <FiShare2 size={14} />
              </button>
              <button
                onClick={handleLike}
                disabled={loadingAction || !user}
                className={`p-2 rounded-full transition-all duration-200 flex items-center gap-1 ${
                  !user 
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]' 
                    : liked ? 'text-[#EF4444] bg-[#EF4444]/10 font-bold' : 'text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10'
                }`}
                title={!user ? "Login required to Like" : ""}
              >
                <FiHeart size={14} fill={liked && user ? 'currentColor' : 'none'} />
                <span className="text-[10px] font-bold">{likesCount}</span>
              </button>
              <button
                onClick={handleBookmark}
                disabled={loadingAction || !user}
                className={`p-2 rounded-full transition-all duration-200 ${
                  !user 
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]' 
                    : bookmarked ? 'text-[#C89B63] bg-[#C89B63]/15 font-bold shadow-sm' : 'text-[#6B7280] hover:text-[#C89B63] hover:bg-[#C89B63]/10'
                }`}
                title={!user ? "Login required to Bookmark" : ""}
              >
                <FiBookmark size={14} fill={bookmarked && user ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
