import React, { useEffect, useState } from 'react';
import { Users, PhoneOutgoing, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

interface Stats {
  total: number;
  called: number;
  pending: number;
  followUp: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, called: 0, pending: 0, followUp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/clients/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Clients', value: stats.total, icon: Users, color: 'bg-blue-500' },
    { label: 'Calls Made', value: stats.called, icon: PhoneOutgoing, color: 'bg-emerald-500' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'Follow-ups', value: stats.followUp, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  const chartData = [
    { name: 'Called', value: stats.called, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Follow-up', value: stats.followUp, color: '#f43f5e' },
  ];

  if (loading) return <div className="p-8 text-center">Loading stats...</div>;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, here's an overview of your client calls.</p>
        </div>
        <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">Performance +12%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex items-center gap-4 group hover:scale-[1.02] transition-transform cursor-default"
          >
            <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-8"
        >
          <h2 className="text-xl font-bold mb-6">Call Status Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full p-4 rounded-xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors">
              Schedule Call
            </button>
            <button className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              View Reports
            </button>
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-center text-sm">
              More actions coming soon...
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
