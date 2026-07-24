import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiFileText, FiLink2, FiActivity, FiRefreshCw, FiTrash2, FiPlus, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import API from '../services/api.js';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State Groups
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, users, categories, logs
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Creation State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, usersRes, catsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/analytics'),
        API.get('/admin/users'),
        API.get('/categories'), // General categories list
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Failed to load admin stats:', error.message);
      setActionError('Access Denied or Database Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, isAdmin, navigate]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    setActionSuccess('');
    setActionError('');
    try {
      const { data } = await API.post('/admin/refresh');
      setActionSuccess(`Feeds synchronized successfully! Processed: ${data.result?.data?.totalProcessed || 0}, Created: ${data.result?.data?.newArticles || 0}.`);
      await loadData();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Manual feed sync failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!newCategoryName.trim()) return;

    try {
      const { data } = await API.post('/admin/categories', { name: newCategoryName });
      setCategories(prev => [...prev, data]);
      setNewCategoryName('');
      setActionSuccess(`Category "${data.name}" created successfully.`);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setActionError('');
    setActionSuccess('');

    try {
      await API.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      setActionSuccess(`Category "${name}" deleted.`);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to delete category.');
    }
  };

  const handleToggleUserRole = async (id, currentRole) => {
    setActionError('');
    setActionSuccess('');
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { data } = await API.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
      setActionSuccess(data.message);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to toggle user role.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) return;
    setActionError('');
    setActionSuccess('');

    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      setActionSuccess(`User "${name}" removed.`);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded skeleton-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl glass-card skeleton-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl glass-card skeleton-pulse" />
      </div>
    );
  }

  // Failed feeds filtered for logs tab
  const failedFeeds = stats?.sourcesHealth?.filter(s => !s.isHealthy) || [];

  return (
    <div className="w-full px-2 sm:px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-[#0F172A] dark:text-white tracking-tight">
          <FiActivity className="text-[#C89B63] animate-pulse" />
          <span>{t('admin_dashboard')}</span>
        </h1>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest glass-btn-primary disabled:opacity-50 shadow-md"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : t('refresh_button')}</span>
        </button>
      </div>

      {/* Success/Error Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold">
          {actionError}
        </div>
      )}

      {/* Statistics Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[24px] flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] border border-[#C89B63]/20">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{t('total_users')}</p>
            <p className="text-3xl font-black text-[#0F172A] dark:text-white">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[24px] flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] border border-[#C89B63]/20">
            <FiFileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{t('total_articles')}</p>
            <p className="text-3xl font-black text-[#0F172A] dark:text-white">{stats?.totalArticles || 0}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[24px] flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] border border-[#C89B63]/20">
            <FiLink2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{t('total_sources')}</p>
            <p className="text-3xl font-black text-[#0F172A] dark:text-white">{stats?.totalSources || 0}</p>
          </div>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-[#EAE6DF] dark:border-[#25334D] pb-1 overflow-x-auto gap-3">
        {['overview', 'users', 'categories', 'logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${
              activeSubTab === tab
                ? 'bg-[#0F172A] text-white dark:bg-[#C89B63] dark:text-[#0F172A] shadow-md'
                : 'text-[#6B7280] dark:text-gray-300 hover:bg-[#F1EFE9] dark:hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* 1. Overview Tab */}
        {activeSubTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feeds Health List (Col 2/3) */}
            <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-[24px] space-y-4">
              <h2 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 text-[#0F172A] dark:text-white">
                {t('feed_health')}
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-none">
                {stats?.sourcesHealth?.map((src) => (
                  <div key={src._id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F1EFE9] dark:bg-[#0B0F17] border border-[#EAE6DF] dark:border-[#25334D] text-xs font-bold text-[#0F172A] dark:text-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden mr-4">
                      {src.logoUrl && <img src={src.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0 rounded-full" />}
                      <span className="font-black text-[#0F172A] dark:text-white truncate">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] text-[#6B7280]">
                        Fetched: {src.lastFetched ? new Date(src.lastFetched).toLocaleTimeString() : 'Never'}
                      </span>
                      <span className={`px-3 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                        src.isHealthy 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20 animate-pulse'
                      }`}>
                        {src.isHealthy ? 'Healthy' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics (Col 1/3) */}
            <div className="space-y-6">
              {/* Category Counts */}
              <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-4">
                <h2 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 flex items-center gap-2 text-[#0F172A] dark:text-white">
                  <FiBarChart2 className="text-[#C89B63]" />
                  <span>Category Distribution</span>
                </h2>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                  {analytics?.articlesByCategory?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-xs font-bold text-[#6B7280]">
                      <span>{item.name}</span>
                      <span className="px-3 py-0.5 rounded-full bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63] font-black">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending search keys */}
              <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-4">
                <h2 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 text-[#0F172A] dark:text-white">
                  Trending Search Queries
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analytics?.popularSearches?.length === 0 ? (
                    <p className="text-xs text-[#6B7280]">No query data collected.</p>
                  ) : (
                    analytics?.popularSearches?.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs rounded-full bg-[#F1EFE9] dark:bg-white/5 text-[#0F172A] dark:text-gray-200 border border-[#EAE6DF] dark:border-[#25334D] font-bold flex items-center gap-1.5"
                      >
                        <span>{item.query}</span>
                        <span className="text-[9px] text-[#6B7280] font-black">({item.count})</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. User Management Tab */}
        {activeSubTab === 'users' && (
          <div className="glass-card rounded-[24px] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F1EFE9] dark:bg-[#0B0F17] border-b border-[#EAE6DF] dark:border-[#25334D] text-[#6B7280] font-black uppercase tracking-widest">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">{t('role')}</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-[#EAE6DF] dark:border-[#25334D] hover:bg-[#F1EFE9]/50 dark:hover:bg-white/5 text-[#0F172A] dark:text-gray-200 font-semibold transition-colors duration-150">
                      <td className="p-4 font-black">{u.name}</td>
                      <td className="p-4 text-[#6B7280]">{u.email}</td>
                      <td className="p-4 uppercase text-[10px]">
                        <span className={`px-3 py-0.5 rounded-full tracking-widest font-black ${u.role === 'admin' ? 'bg-[#EADBC8] dark:bg-[#C89B63]/20 text-[#A97843] dark:text-[#C89B63]' : 'bg-[#F1EFE9] dark:bg-white/5 text-[#6B7280]'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserRole(u._id, u.role)}
                          className="px-4 py-1.5 text-[10px] rounded-full glass-btn-primary font-black uppercase tracking-widest"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors inline-flex items-center justify-center align-middle"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Category Management Tab */}
        {activeSubTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Create Category Form (Col 1/3) */}
            <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-4 h-fit">
              <h2 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 flex items-center gap-1.5 text-[#0F172A] dark:text-white">
                <FiPlus className="text-[#C89B63]" />
                <span>Create Category</span>
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Science"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 rounded-full glass-input text-xs font-semibold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-full font-black text-xs uppercase tracking-widest glass-btn-primary shadow-md"
                >
                  Create
                </button>
              </form>
            </div>

            {/* Categories list table (Col 2/3) */}
            <div className="md:col-span-2 glass-card rounded-[24px] overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1EFE9] dark:bg-[#0B0F17] border-b border-[#EAE6DF] dark:border-[#25334D] text-[#6B7280] font-black uppercase tracking-widest">
                      <th className="p-4">Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id} className="border-b border-[#EAE6DF] dark:border-[#25334D] hover:bg-[#F1EFE9]/50 dark:hover:bg-white/5 text-[#0F172A] dark:text-gray-200 font-semibold transition-colors duration-150">
                        <td className="p-4 font-black">{c.name}</td>
                        <td className="p-4 text-[#6B7280]">{c.slug}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(c._id, c.name)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors inline-block"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Logs Tab */}
        {activeSubTab === 'logs' && (
          <div className="glass-card p-6 sm:p-8 rounded-[24px] space-y-4">
            <h2 className="font-black text-base border-b border-[#EAE6DF] dark:border-[#25334D] pb-3 flex items-center gap-2 text-[#EF4444]">
              <FiAlertTriangle className="animate-pulse" />
              <span>{t('error_logs')}</span>
            </h2>

            {failedFeeds.length === 0 ? (
              <p className="text-xs text-[#6B7280] font-bold">All RSS Feeds are fully operational. No fetch failures logged.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
                {failedFeeds.map((src) => (
                  <div key={src._id} className="p-4 rounded-2xl bg-[#EF4444]/5 border border-[#EF4444]/20 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#EF4444] font-black">{src.name}</span>
                      <span className="text-[10px] text-[#6B7280]">
                        Failed at: {src.lastFetched ? new Date(src.lastFetched).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <p className="text-[#6B7280] font-semibold truncate">Feed URL: {src.feedUrl}</p>
                    <div className="p-3.5 rounded-xl bg-[#0F172A] text-[#EF4444] font-mono text-[10px] border border-[#EF4444]/20 break-words">
                      {src.lastErrorMessage || 'Unknown Ingestion Failure.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
