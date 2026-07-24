import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FiSearch, FiCalendar, FiFilter, FiCheck, FiPlus } from 'react-icons/fi';
import BreakingNewsBanner from '../components/BreakingNewsBanner.jsx';
import TrendingSlider from '../components/TrendingSlider.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

const Home = () => {
  const { t, lang } = useLanguage();
  const { user, toggleFollowCategory } = useAuth();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Page states for pagination / infinite scroll
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active view: 'all' or 'followed' (only available if logged in)
  const [activeTab, setActiveTab] = useState('all');

  // Fetch categories and sources on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, srcRes] = await Promise.all([
          API.get('/categories'),
          API.get('/sources'),
        ]);
        setCategories(catRes.data || []);
        setSources(srcRes.data || []);
      } catch (error) {
        console.error('Failed to fetch categories/sources:', error.message);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch articles when filters or page changes
  const fetchArticles = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      // Build query string
      let url = `/articles?page=${pageNum}&limit=9`;
      if (search.trim()) url += `&search=${encodeURIComponent(search)}`;
      if (selectedSource) url += `&source=${selectedSource}`;
      if (selectedDate) url += `&dateFilter=${selectedDate}`;

      // Handle category filtering based on tab
      if (activeTab === 'followed' && user) {
        // Query backend for followed categories
        const followedIds = user.followedCategories?.map(c => c._id || c) || [];
        if (followedIds.length > 0) {
          url += `&category=${followedIds.join(',')}`;
        } else {
          // If user follows nothing, set articles empty
          setArticles([]);
          setTotalPages(1);
          setLoading(false);
          setLoadingMore(false);
          return;
        }
      } else if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }

      const { data } = await API.get(url);
      
      if (append) {
        setArticles(prev => [...prev, ...data.articles]);
      } else {
        setArticles(data.articles || []);
      }
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Failed to load articles:', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Run search and filters
  useEffect(() => {
    setPage(1);
    fetchArticles(1, false);
  }, [search, selectedCategory, selectedSource, selectedDate, activeTab]);

  // Load more trigger
  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  };

  const handleFollowCategoryClick = async (e, categoryId) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await toggleFollowCategory(categoryId);
    } catch (err) {
      console.error(err);
    }
  };

  const isCategoryFollowed = (catId) => {
    if (!user) return false;
    return user.followedCategories?.some(c => (c._id || c) === catId);
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 space-y-8">
      {/* Luxury Editorial Hero Section */}
      <div className="relative py-12 px-6 sm:px-12 rounded-[30px] bg-white dark:bg-[#161F30] border border-[#EAE6DF] dark:border-[#25334D] shadow-[0_12px_40px_rgba(15,23,42,0.04)] overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="glow-spot -top-20 -left-20 bg-[#C89B63]/20" />
        <div className="max-w-2xl space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EADBC8] dark:bg-[#C89B63]/20 border border-[#C89B63]/30 text-[#A97843] dark:text-[#C89B63] text-xs font-black uppercase tracking-widest">
            <span>✦</span> AI-Powered Intelligence Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight leading-[1.1]">
            Real-Time AI & Tech News <br className="hidden sm:inline" />
            <span className="text-[#C89B63]">Aggregated for Developers</span>
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-gray-300 font-medium leading-relaxed max-w-xl">
            Automated RSS data ingestion, AI-generated bullet summaries, category indexing, and developer API feeds in one luxury platform.
          </p>
        </div>

        {/* Hero Decorative Floating Metric Badge */}
        <div className="hidden lg:flex flex-col gap-3 z-10">
          <div className="p-4 rounded-2xl bg-[#F8F7F4] dark:bg-[#0B0F17] border border-[#EAE6DF] dark:border-[#25334D] shadow-sm w-52 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Real-Time Sync</span>
            <div className="text-xl font-black text-[#0F172A] dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              Active Feeds
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F7F4] dark:bg-[#0B0F17] border border-[#EAE6DF] dark:border-[#25334D] shadow-sm w-52 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">AI Model</span>
            <div className="text-xl font-black text-[#C89B63]">
              Gemini Flash
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic banners */}
      <BreakingNewsBanner />
      <TrendingSlider />

      {/* Main Filter Section */}
      <div className="w-full glass-card p-6 rounded-[24px] space-y-6">
        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs for Feed Selection */}
          {user && (
            <div className="flex gap-1.5 bg-[#F1EFE9] dark:bg-[#0B0F17] border border-[#EAE6DF] dark:border-[#25334D] p-1.5 rounded-full w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedCategory('all');
                }}
                className={`flex-1 md:flex-none px-5 py-2 text-xs font-black rounded-full transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] shadow-md'
                    : 'text-[#6B7280] dark:text-gray-300 hover:text-[#0F172A]'
                }`}
              >
                {t('all')} Feed
              </button>
              <button
                onClick={() => {
                  setActiveTab('followed');
                  setSelectedCategory('all');
                }}
                className={`flex-1 md:flex-none px-5 py-2 text-xs font-black rounded-full transition-all duration-300 ${
                  activeTab === 'followed'
                    ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] shadow-md'
                    : 'text-[#6B7280] dark:text-gray-300 hover:text-[#0F172A]'
                }`}
              >
                {t('followed_categories')}
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-full md:max-w-md flex-1">
            <FiSearch className="absolute left-4 top-3.5 text-[#C89B63]" size={18} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full glass-input text-xs font-semibold shadow-sm"
            />
          </div>
        </div>

        {/* Categories filters (Pills) */}
        {activeTab !== 'followed' && (
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] block">
              {t('categories')}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap md:flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-black border flex-shrink-0 transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] border-transparent shadow-md'
                    : 'border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#6B7280] dark:text-gray-300 hover:border-[#C89B63]'
                }`}
              >
                {t('all')}
              </button>
              {categories.map((cat) => {
                const followed = isCategoryFollowed(cat._id);
                return (
                  <div
                    key={cat._id}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border flex-shrink-0 transition-all duration-300 ${
                      selectedCategory === cat.slug
                        ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] border-transparent shadow-md'
                        : 'border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#6B7280] dark:text-gray-300 hover:border-[#C89B63]'
                    }`}
                  >
                    <button onClick={() => setSelectedCategory(cat.slug)}>
                      {cat.name}
                    </button>
                    {user && (
                      <button
                        onClick={(e) => handleFollowCategoryClick(e, cat._id)}
                        className={`ml-1 p-0.5 rounded-full transition-all duration-200 ${
                          followed
                            ? 'text-emerald-600 bg-emerald-500/20'
                            : 'text-[#6B7280] hover:text-[#C89B63]'
                        }`}
                        title={followed ? t('following') : t('follow')}
                      >
                        {followed ? <FiCheck size={11} /> : <FiPlus size={11} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dropdowns (Source & Date filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE6DF] dark:border-[#25334D]">
          {/* Source Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] flex items-center gap-1.5">
              <FiFilter size={12} className="text-[#C89B63]" />
              {t('sources')}
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-[#0B0F17] text-[#0F172A] dark:text-gray-200 focus:border-[#C89B63] text-xs font-bold appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">{t('all')} {t('sources')}</option>
              {sources.map((src) => (
                <option key={src._id} value={src._id} className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">
                  {src.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] flex items-center gap-1.5">
              <FiCalendar size={12} className="text-[#C89B63]" />
              {t('date')}
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-[#0B0F17] text-[#0F172A] dark:text-gray-200 focus:border-[#C89B63] text-xs font-bold appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">{t('all')} {t('date')}</option>
              <option value="today" className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">{t('today')}</option>
              <option value="week" className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">{t('this_week')}</option>
              <option value="month" className="bg-white dark:bg-[#161F30] text-[#0F172A] dark:text-white">{t('this_month')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="w-full py-20 text-center glass-card rounded-[24px]">
          <p className="text-[#6B7280] text-sm font-bold">{t('no_articles')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {/* Infinite Scroll / Load More Trigger */}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest glass-btn-primary shadow-md"
              >
                {loadingMore ? 'Loading...' : t('load_more')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
