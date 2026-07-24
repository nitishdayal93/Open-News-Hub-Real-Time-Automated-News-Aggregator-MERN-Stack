import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrash2, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { formatFullDate, formatRelativeTime } from '../utils/formatDate.js';
import API from '../services/api.js';

const HistoryPage = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/articles/user/history');
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load reading history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your reading history?')) return;
    setClearing(true);
    try {
      await API.delete('/articles/user/history');
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear reading history:', error.message);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded skeleton-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-full h-16 rounded-xl glass-card skeleton-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 border-b border-[#EAE6DF] dark:border-[#25334D]">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-[#0F172A] dark:text-white tracking-tight">
          <FiClock className="text-[#C89B63]" />
          <span>{t('history')}</span>
        </h1>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-full transition-all border border-red-500/20"
          >
            <FiTrash2 size={13} />
            <span>{t('clear_history')}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="w-full py-20 text-center glass-card rounded-[24px]">
          <p className="text-[#6B7280] text-sm font-extrabold">Your reading history is clean.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => {
            const art = item.article;
            if (!art) return null;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/article/${art._id}`)}
                className="w-full p-4 rounded-[24px] glass-card flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Article Thumbnail */}
                  {art.imageUrl && (
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 border border-[#EAE6DF] dark:border-[#25334D]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="font-black text-xs sm:text-sm line-clamp-1 leading-snug text-[#0F172A] dark:text-white group-hover:text-[#C89B63] transition-colors">
                      {art.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-[#6B7280] font-bold">
                      <span className="text-[#C89B63]">{art.source?.name}</span>
                      <span className="flex items-center gap-1"><FiCalendar className="text-[#C89B63]" /> Read {formatRelativeTime(item.readAt, lang)}</span>
                    </div>
                  </div>
                </div>

                <div className="pl-4 text-[#6B7280] group-hover:text-[#C89B63] group-hover:translate-x-1 transition-all flex-shrink-0">
                  <FiArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
