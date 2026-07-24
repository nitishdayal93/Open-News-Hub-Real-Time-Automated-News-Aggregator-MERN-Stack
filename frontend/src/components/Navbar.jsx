import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FiSun, FiMoon, FiGlobe, FiBookmark, FiClock, FiUser, FiLogOut, FiMenu, FiX, FiShield, FiBell } from 'react-icons/fi';
import API from '../services/api.js';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // DOM Refs for Click Outside Detection
  const langRef = useRef(null);
  const notifRef = useRef(null);
  const navContainerRef = useRef(null);

  // Auto-close popups when switching pages
  useEffect(() => {
    setShowNotifications(false);
    setShowLangDropdown(false);
    setIsOpen(false);
  }, [location.pathname]);

  // Click Outside & Escape Key Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowLangDropdown(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const { data } = await API.get('/notifications');
          setNotifications(data || []);
        } catch (error) {
          console.error('Failed to load notifications:', error.message);
        }
      };
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 30 * 1000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    try {
      await API.post(`/notifications/${notif._id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notif._id ? { ...n, isReadBy: [...(n.isReadBy || []), user._id] } : n)
      );
      if (notif.article) {
        navigate(`/article/${notif.article._id || notif.article}`);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error.message);
    }
  };

  const unreadCount = user ? notifications.filter(n => !n.isReadBy?.includes(user._id)).length : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'fr', name: 'Français' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav ref={navContainerRef} className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="rounded-full backdrop-blur-xl bg-white/80 dark:bg-[#161F30]/80 border border-[#EAE6DF] dark:border-[#25334D] shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-2.5 transition-all">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-black tracking-tight text-[#0F172A] dark:text-white transition-transform duration-300 hover:scale-105">
              <span className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-[#C89B63] text-[#C89B63] dark:text-[#0F172A] flex items-center justify-center font-bold text-sm shadow-md">
                ✦
              </span>
              <span className="font-extrabold tracking-tight">
                Open<span className="text-[#C89B63]">News</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link 
              to="/" 
              className={`text-xs font-bold transition-all duration-200 py-1.5 px-3.5 rounded-full ${
                isActive('/') 
                  ? 'text-white bg-[#0F172A] dark:bg-[#C89B63] dark:text-[#0F172A] shadow-sm' 
                  : 'text-[#6B7280] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1EFE9] dark:hover:bg-white/5'
              }`}
            >
              {t('home')}
            </Link>

            {user && (
              <>
                <Link 
                  to="/bookmarks" 
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 py-1.5 px-3.5 rounded-full ${
                    isActive('/bookmarks') 
                      ? 'text-white bg-[#0F172A] dark:bg-[#C89B63] dark:text-[#0F172A] shadow-sm' 
                      : 'text-[#6B7280] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1EFE9] dark:hover:bg-white/5'
                  }`}
                >
                  <FiBookmark size={14} className={isActive('/bookmarks') ? 'text-[#C89B63] dark:text-[#0F172A]' : 'text-[#6B7280]'} />
                  {t('bookmarks')}
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 py-1.5 px-3.5 rounded-full ${
                    isActive('/history') 
                      ? 'text-white bg-[#0F172A] dark:bg-[#C89B63] dark:text-[#0F172A] shadow-sm' 
                      : 'text-[#6B7280] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1EFE9] dark:hover:bg-white/5'
                  }`}
                >
                  <FiClock size={14} className={isActive('/history') ? 'text-[#C89B63] dark:text-[#0F172A]' : 'text-[#6B7280]'} />
                  {t('history')}
                </Link>
              </>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 py-1.5 px-3.5 rounded-full border ${
                  isActive('/admin') 
                    ? 'text-[#C89B63] bg-[#C89B63]/10 border-[#C89B63]/30' 
                    : 'text-[#C89B63] border-[#C89B63]/20 hover:bg-[#C89B63]/10'
                }`}
              >
                <FiShield size={14} />
                {t('admin_dashboard')}
              </Link>
            )}

            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 hover:bg-[#EADBC8] text-[#0F172A] dark:text-gray-200 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <FiGlobe size={13} className="text-[#C89B63]" />
                <span>{lang}</span>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-2xl bg-white dark:bg-[#161F30] border border-[#EAE6DF] dark:border-[#25334D] py-2 shadow-2xl backdrop-blur-xl z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setShowLangDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs transition-colors hover:bg-[#F1EFE9] dark:hover:bg-white/5 ${
                        lang === l.code ? 'text-[#C89B63] font-extrabold' : 'text-[#6B7280] dark:text-gray-300'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#0F172A] dark:text-gray-200 hover:border-[#C89B63] transition-all"
            >
              {isDark ? <FiSun size={14} className="text-[#C89B63]" /> : <FiMoon size={14} className="text-[#0F172A]" />}
            </button>

            {/* User Profile / Auth Links */}
            {user ? (
              <div className="flex items-center gap-3 relative">
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#0F172A] dark:text-gray-200 hover:border-[#C89B63] transition-all relative"
                  >
                    <FiBell size={14} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C89B63] rounded-full animate-ping" />
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white dark:bg-[#161F30] border border-[#EAE6DF] dark:border-[#25334D] py-2.5 shadow-2xl backdrop-blur-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-[#EAE6DF] dark:border-[#25334D] text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center justify-between">
                        <span>Notifications</span>
                        <span className="bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] px-2 py-0.5 rounded-full font-black">{unreadCount} New</span>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-[#6B7280] italic">No notifications.</p>
                      ) : (
                        notifications.map((notif) => {
                          const isRead = notif.isReadBy?.includes(user._id);
                          return (
                            <button
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left px-4 py-3 text-xs hover:bg-[#F1EFE9] dark:hover:bg-white/5 transition-all border-b border-[#EAE6DF] dark:border-[#25334D] last:border-0 ${
                                !isRead ? 'font-bold bg-[#EADBC8]/30 dark:bg-[#C89B63]/10 text-[#0F172A] dark:text-white' : 'text-[#6B7280] dark:text-gray-400'
                              }`}
                            >
                              <div className="line-clamp-1">{notif.title}</div>
                              <div className="text-[10px] text-[#6B7280] truncate mt-0.5">{notif.message}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Avatar & Name */}
                <Link to="/profile" className="flex items-center gap-2 group" title={t('profile')}>
                  <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-[#C89B63] text-white dark:text-[#0F172A] font-black text-xs uppercase flex items-center justify-center border border-[#C89B63]/30 shadow-md transition-all group-hover:scale-105">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-extrabold text-[#0F172A] dark:text-gray-200 group-hover:text-[#C89B63] transition-colors">{user.name.split(' ')[0]}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#6B7280] hover:text-red-500 hover:border-red-500/30 transition-all"
                >
                  <FiLogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 text-xs font-bold glass-btn-secondary rounded-full">
                  {t('login')}
                </Link>
                <Link to="/register" className="px-4 py-1.5 text-xs font-bold glass-btn-primary rounded-full">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#0F172A] dark:text-gray-200"
            >
              {isDark ? <FiSun size={15} className="text-[#C89B63]" /> : <FiMoon size={15} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full border border-[#EAE6DF] dark:border-[#25334D] bg-[#F1EFE9] dark:bg-white/5 text-[#0F172A] dark:text-gray-200"
            >
              {isOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 bg-white dark:bg-[#161F30] border border-[#EAE6DF] dark:border-[#25334D] rounded-3xl p-5 space-y-3 shadow-2xl backdrop-blur-xl">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-2.5 rounded-2xl text-xs font-bold ${
              isActive('/') 
                ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A]' 
                : 'text-[#6B7280] dark:text-gray-300 hover:bg-[#F1EFE9] dark:hover:bg-white/5'
            }`}
          >
            {t('home')}
          </Link>

          {user && (
            <>
              <Link
                to="/bookmarks"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold ${
                  isActive('/bookmarks') 
                    ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A]' 
                    : 'text-[#6B7280] dark:text-gray-300 hover:bg-[#F1EFE9] dark:hover:bg-white/5'
                }`}
              >
                <FiBookmark size={15} />
                {t('bookmarks')}
              </Link>
              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold ${
                  isActive('/history') 
                    ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A]' 
                    : 'text-[#6B7280] dark:text-gray-300 hover:bg-[#F1EFE9] dark:hover:bg-white/5'
                }`}
              >
                <FiClock size={15} />
                {t('history')}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold ${
                isActive('/admin') 
                  ? 'bg-[#C89B63] text-white' 
                  : 'text-[#C89B63] hover:bg-[#C89B63]/10'
              }`}
            >
              <FiShield size={15} />
              {t('admin_dashboard')}
            </Link>
          )}

          {/* User Options Mobile */}
          <div className="px-2 py-2 border-t border-[#EAE6DF] dark:border-[#25334D] mt-2">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-1 text-xs font-extrabold text-[#0F172A] dark:text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F172A] dark:bg-[#C89B63] text-white dark:text-[#0F172A] font-black text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 py-2 px-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <FiLogOut size={15} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center px-4 py-2.5 text-xs font-bold glass-btn-secondary rounded-full"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center px-4 py-2.5 text-xs font-bold glass-btn-primary rounded-full"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
