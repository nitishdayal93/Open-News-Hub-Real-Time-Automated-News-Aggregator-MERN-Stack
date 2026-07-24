import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const from = location.state?.from || '/';
      navigate(from);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      {/* Decorative Glow elements */}
      <div className="glow-spot top-10 left-10 bg-[#C89B63]/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 rounded-[30px] glass-card relative shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      >
        <div className="text-center space-y-2 mb-8">
          <span className="w-10 h-10 rounded-full bg-[#0F172A] dark:bg-[#C89B63] text-[#C89B63] dark:text-[#0F172A] inline-flex items-center justify-center font-black text-base shadow-md mb-2">
            ✦
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {t('login')}
          </h2>
          <p className="text-xs text-[#6B7280] font-medium">Access your personalized OpenNews Hub AI feed</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-3.5 text-[#C89B63]" size={16} />
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full pl-11 pr-10 py-3 rounded-full glass-input text-xs font-semibold"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-[#C89B63]" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-11 pr-10 py-3 rounded-full glass-input text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[#6B7280] hover:text-[#C89B63] transition-colors focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-black text-xs uppercase tracking-widest glass-btn-primary mt-6 shadow-md"
          >
            {loading ? 'Logging in...' : t('login')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6B7280] font-medium">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-extrabold text-[#C89B63] hover:underline">
            {t('register')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
