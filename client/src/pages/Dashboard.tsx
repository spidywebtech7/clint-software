import React, { useEffect, useState } from 'react';
import { Users, Clock, Calendar, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


interface Stats {
  total: number;
  pending: number;
  completed: number;
  meetings: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, completed: 0, meetings: 0 });
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
    { label: 'Total Clients', value: stats.total, icon: Users, color: 'bg-indigo-500' },
    { label: 'Pending Calls', value: stats.pending, icon: Clock, color: 'bg-emerald-500' },
    { label: 'Completed Calls', value: stats.completed, icon: CheckCircle2, color: 'bg-blue-500' },
    { label: 'Meetings', value: stats.meetings, icon: Calendar, color: 'bg-amber-500' },
  ];


  if (loading) return <div className="p-8 text-center">Loading stats...</div>;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Welcome back, here's an overview of your client calls.</p>
        </div>
        <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Performance +12%</span>
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
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link to="/clients" className="text-primary-500 text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 italic">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Your recent client interactions will appear here.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/add-client" className="w-full p-4 rounded-xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
              <Plus size={20} /> Add New Client
            </Link>
            <button className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
              <Calendar size={20} /> Schedule Meeting
            </button>
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-center text-sm">
              More features coming soon...
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Dashboard;
