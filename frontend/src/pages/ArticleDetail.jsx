import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiEye, FiHeart, FiBookmark, FiArrowLeft, FiCompass, FiCpu, FiExternalLink, FiMessageSquare, FiSend, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatFullDate, formatRelativeTime } from '../utils/formatDate.js';
import API from '../services/api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

const ArticleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Comments local states
  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/articles/${id}`);
        setArticle(data);
        setLikesCount(data.likesCount || 0);
        setCommentsList(data.comments || []);
        
        if (user) {
          setLiked(user.likedArticles?.includes(data._id) || false);
          // Check bookmark status
          const bookmarksRes = await API.get('/articles/user/bookmarks');
          const isBookmarked = bookmarksRes.data?.some(b => b._id === data._id);
          setBookmarked(isBookmarked);
        }

        // Fetch related articles
        const relatedRes = await API.get(`/articles/${id}/related`);
        setRelated(relatedRes.data || []);
      } catch (error) {
        console.error('Failed to load article detail:', error.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id, user, navigate]);

  const handleLike = async () => {
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
      console.error(error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBookmark = async () => {
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
      console.error(error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await API.post(`/articles/${article._id}/comments`, {
        text: commentText
      });
      setCommentsList(data);
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const { data } = await API.delete(`/articles/${article._id}/comments/${commentId}`);
      setCommentsList(data);
    } catch (error) {
      console.error('Failed to delete comment:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="w-16 h-8 rounded skeleton-pulse" />
        <div className="w-full h-10 rounded skeleton-pulse" />
        <div className="w-full h-96 rounded-3xl skeleton-pulse" />
        <div className="w-full h-40 rounded-2xl glass-card p-4 skeleton-pulse" />
        <div className="w-full h-64 rounded skeleton-pulse" />
      </div>
    );
  }

  if (!article) return null;

  const categoryImages = {
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'science': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    'world': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1200&auto=format&fit=crop',
    'entertainment': 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1200&auto=format&fit=crop',
    'health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop',
  };

  const categorySlug = article.category?.slug || 'world';
  const fallbackImg = categoryImages[categorySlug] || categoryImages['world'];

  return (
    <div className="w-full px-2 sm:px-4 py-6 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#6B7280] hover:text-[#C89B63] transition-colors py-1.5 px-3 rounded-full bg-[#F1EFE9] dark:bg-white/5 border border-[#EAE6DF] dark:border-[#25334D]"
        >
          <FiArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article content (Col 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63]">
                {article.category?.name || 'General'}
              </span>
              <span className="flex items-center gap-1 font-bold">
                <FiClock className="text-[#C89B63]" />
                {formatFullDate(article.pubDate, lang)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-[#0F172A] dark:text-white tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                {article.source?.logoUrl && (
                  <img src={article.source.logoUrl} alt="" className="w-4 h-4 object-contain rounded-full" />
                )}
                <span className="font-extrabold text-[#0F172A] dark:text-gray-200">{article.source?.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiEye className="text-[#C89B63]" />
                {article.clicksCount} views
              </span>
            </div>
          </div>

          {/* Large Image */}
          <div className="w-full h-80 sm:h-96 rounded-[24px] overflow-hidden relative border border-[#EAE6DF] dark:border-[#25334D] shadow-md">
            <img
              src={article.imageUrl || fallbackImg}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = fallbackImg;
              }}
            />
          </div>

          {/* Action buttons (Like, Bookmark, Read Source) */}
          <div className="flex flex-wrap gap-3 py-4 border-y border-[#EAE6DF] dark:border-[#25334D] justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                disabled={loadingAction || !user}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !user 
                    ? 'opacity-40 cursor-not-allowed bg-[#F1EFE9] text-[#6B7280]'
                    : liked 
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                      : 'glass-btn-secondary'
                }`}
                title={!user ? "Login required to Like" : ""}
              >
                <FiHeart size={14} fill={liked && user ? 'currentColor' : 'none'} />
                <span>{likesCount} Likes</span>
              </button>

              <button
                onClick={handleBookmark}
                disabled={loadingAction || !user}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !user 
                    ? 'opacity-40 cursor-not-allowed bg-[#F1EFE9] text-[#6B7280]'
                    : bookmarked 
                      ? 'bg-[#C89B63]/15 text-[#C89B63] border border-[#C89B63]/40'
                      : 'glass-btn-secondary'
                }`}
                title={!user ? "Login required to Bookmark" : ""}
              >
                <FiBookmark size={14} fill={bookmarked && user ? 'currentColor' : 'none'} />
                <span>Bookmark</span>
              </button>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black glass-btn-primary"
            >
              <span>{t('read_more')}</span>
              <FiExternalLink size={14} />
            </a>
          </div>

          {/* AI Summary Card */}
          {article.summary && (
            <div className="w-full bg-[#F1EFE9]/60 dark:bg-[#161F30] border-l-4 border-[#C89B63] p-6 rounded-[24px] relative overflow-hidden shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#C89B63] font-black text-xs uppercase tracking-widest">
                <FiCpu className="animate-spin text-[#C89B63]" style={{ animationDuration: '6s' }} />
                <span>{t('ai_summary')}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-[#0F172A] dark:text-gray-200">
                {article.summary}
              </p>
            </div>
          )}

          {/* Core Body text */}
          <div className="text-sm sm:text-base leading-relaxed text-[#111827] dark:text-gray-200 space-y-4 font-normal">
            <p>{article.content || article.description}</p>
          </div>

          {/* Tags badges */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-[#EAE6DF] dark:border-[#25334D] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] block">{t('ai_tags')}</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#EADBC8] dark:bg-white/5 text-[#A97843] dark:text-[#C89B63] border border-[#C89B63]/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-[#EAE6DF] dark:border-[#25334D] space-y-5">
            <h2 className="text-sm sm:text-base font-black flex items-center gap-2 text-[#0F172A] dark:text-white">
              <FiMessageSquare className="text-[#C89B63]" />
              <span>Comments ({commentsList.length})</span>
            </h2>

            {/* Post comment input box */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-2 items-start">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-4 rounded-2xl text-xs glass-input resize-none h-20"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="p-3.5 rounded-full glass-btn-primary flex-shrink-0"
                >
                  <FiSend size={15} />
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F1EFE9] dark:bg-white/5 border border-[#EAE6DF] dark:border-[#25334D] text-center text-xs text-[#6B7280] font-bold">
                🔒 Comments disabled. <Link to="/login" className="text-[#C89B63] hover:underline">Log in</Link> to leave a comment.
              </div>
            )}

            {/* List of comments */}
            <div className="space-y-3">
              {commentsList.length === 0 ? (
                <p className="text-xs text-[#6B7280] italic">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                commentsList.map((c) => (
                  <div key={c._id} className="p-4 rounded-2xl bg-white dark:bg-[#161F30] border border-[#EAE6DF] dark:border-[#25334D] text-xs space-y-1.5 flex justify-between items-start gap-4 shadow-sm">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                        <span className="font-black text-[#0F172A] dark:text-[#C89B63]">{c.userName}</span>
                        <span>&bull;</span>
                        <span>{formatRelativeTime(c.createdAt, lang)}</span>
                      </div>
                      <p className="text-[#111827] dark:text-gray-200 font-semibold whitespace-pre-wrap">{c.text}</p>
                    </div>
                    {(user && (user._id === c.user || user.role === 'admin')) && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Delete Comment"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Related articles recommendations (Col 1/3) */}
        <div className="space-y-6">
          <h2 className="text-base font-black flex items-center gap-2 border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 text-[#0F172A] dark:text-white">
            <FiCompass className="text-[#C89B63]" />
            <span>{t('related_articles')}</span>
          </h2>
          {related.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No related articles found.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {related.map((relArticle) => (
                <ArticleCard key={relArticle._id} article={relArticle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
