import React, { useEffect, useState } from 'react';
import { Search, Filter, Edit2, Trash2, Phone, Calendar, MoreVertical, Check } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  meetingDate: string;
  status: 'Pending' | 'Completed' | 'Called' | 'Follow-up Required';
  notes: string;
}


const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const socket = useSocket();

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients', {
        params: { search, status: statusFilter }
      });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  useEffect(() => {
    if (!socket) return;

    socket.on('clients:changed', () => {
      fetchClients();
    });

    return () => {
      socket.off('clients:changed');
    };
  }, [socket, search, statusFilter]);


  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/clients/${id}/complete`);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Called': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Follow-up Required': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your client interactions.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Called">Called</option>
            <option value="Follow-up Required">Follow-up</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Business Type</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider">Meeting Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {clients.map((client) => (
                  <motion.tr
                    key={client._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-base">{client.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{client.email || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-bold">{client.phone}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{client.businessType || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-bold text-sm">
                      {client.meetingDate ? new Date(client.meetingDate).toLocaleDateString() : 'Not Set'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {client.status !== 'Completed' && (
                          <button 
                            onClick={() => handleComplete(client._id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {clients.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
