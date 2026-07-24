import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import API from '../services/api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

const BookmarksPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const { data } = await API.get('/articles/user/bookmarks');
        setBookmarks(data || []);
      } catch (error) {
        console.error('Failed to load bookmarked articles:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded skeleton-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-8 space-y-6">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-[#0F172A] dark:text-white tracking-tight">
        <FiBookmark className="text-[#C89B63]" />
        <span>{t('bookmarks')}</span>
      </h1>

      {bookmarks.length === 0 ? (
        <div className="w-full py-20 text-center glass-card rounded-[24px]">
          <p className="text-[#6B7280] text-sm font-extrabold">{t('no_bookmarks') || 'You have not bookmarked any articles yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article) => (
            <ArticleCard key={article._id} article={article} isBookmarkedPage={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
