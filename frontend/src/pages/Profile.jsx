import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCheck, FiBookmark, FiPlus, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import API from '../services/api.js';

const Profile = () => {
  const { user, updateProfile, toggleFollowCategory } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [categories, setCategories] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');

    // Fetch categories to manage follows
    const fetchCats = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const updateData = { name, email };
    if (password) {
      updateData.password = password;
    }

    const res = await updateProfile(updateData);
    setLoading(false);

    if (res.success) {
      setMessage('Profile updated successfully!');
      setPassword('');
    } else {
      setError(res.message);
    }
  };

  const isCategoryFollowed = (catId) => {
    return user?.followedCategories?.some(c => (c._id || c) === catId);
  };

  const handleFollowToggle = async (catId) => {
    try {
      await toggleFollowCategory(catId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title */}
      <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-[#0F172A] dark:text-white tracking-tight">
        <FiUser className="text-[#C89B63]" />
        <span>{t('profile')}</span>
      </h1>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info & Stats (Col 1/3) */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[24px] text-center space-y-4">
            <div className="w-20 h-20 bg-[#0F172A] dark:bg-[#C89B63] text-white dark:text-[#0F172A] font-black text-2xl rounded-full mx-auto flex items-center justify-center shadow-md">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-base text-[#0F172A] dark:text-white">{user.name}</h2>
              <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{user.email}</p>
              <span className="inline-block mt-2 px-3.5 py-0.5 text-[9px] font-black rounded-full bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] uppercase tracking-widest">
                {user.role}
              </span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[24px] space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-[#6B7280]">Activity Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-2 text-[#6B7280]"><FiBookmark className="text-[#C89B63]" /> Bookmarks</span>
                <span className="text-[#0F172A] dark:text-white font-extrabold">{user.bookmarks?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-2 text-[#6B7280]"><FiClock className="text-[#C89B63]" /> Reading Log</span>
                <span className="text-[#0F172A] dark:text-white font-extrabold">{user.readingHistory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editing Panels (Col 2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-6">
            <h3 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 text-[#0F172A] dark:text-white">Account Details</h3>
            
            {message && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {message}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-3.5 text-[#C89B63]" size={15} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-full glass-input text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-3.5 text-[#C89B63]" size={15} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-full glass-input text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-[#C89B63]" size={15} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full glass-input text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest glass-btn-primary shadow-md"
              >
                {loading ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* Followed Categories */}
          <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-4">
            <h3 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 text-[#0F172A] dark:text-white">
              {t('followed_categories')}
            </h3>
            <p className="text-xs text-[#6B7280] font-medium">Customize your personalized news feed by selecting categories below.</p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => {
                const followed = isCategoryFollowed(cat._id);
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleFollowToggle(cat._id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black border transition-all duration-300 ${
                      followed
                        ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] border-transparent shadow-md'
                        : 'border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#6B7280] dark:text-gray-300 hover:border-[#C89B63]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {followed ? <FiCheck size={12} className="text-white dark:text-[#0F172A]" /> : <FiPlus size={12} className="text-[#6B7280]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
