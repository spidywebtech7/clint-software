import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary-600 p-4 rounded-2xl text-white shadow-xl shadow-primary-500/20 mb-6">
            <PhoneCall size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-500">Sign in to manage your client calls.</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-sm border border-rose-100 dark:border-rose-900/50">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="admin21@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 rounded-xl font-bold bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : (
                <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Demo access: <span className="text-slate-600 dark:text-slate-200 font-medium">admin21@gmail.com / admin123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
