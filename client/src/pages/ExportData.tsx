import React, { useState } from 'react';
import { Download, FileText, Table as TableIcon, FileJson, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const ExportData = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      const response = await api.get(`/clients/export/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    { 
      id: 'excel', 
      name: 'Microsoft Excel', 
      desc: 'Optimized for spreadsheet analysis (.xlsx)',
      icon: TableIcon, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    { 
      id: 'pdf', 
      name: 'PDF Document', 
      desc: 'Professional report format for sharing (.pdf)',
      icon: FileText, 
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30'
    },
    { 
      id: 'csv', 
      name: 'CSV File', 
      desc: 'Plain text data for system imports (.csv)',
      icon: FileJson, 
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30'
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-slate-500 dark:text-slate-400">Download your client records in various formats for offline use.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportOptions.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 flex flex-col items-center text-center group"
          >
            <div className={`${opt.bg} ${opt.color} p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform`}>
              <opt.icon size={40} />
            </div>
            <h2 className="text-xl font-bold mb-2">{opt.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              {opt.desc}
            </p>
            <button
              onClick={() => handleExport(opt.id)}
              disabled={exporting !== null}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                exporting === opt.id 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600'
              }`}
            >
              {exporting === opt.id ? (
                'Generating...'
              ) : (
                <><Download size={18} /> Export Now</>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6 border-dashed border-2 flex items-center gap-4 text-slate-500">
        <CheckCircle2 className="text-primary-500 shrink-0" size={24} />
        <p className="text-sm">
          All exports include the complete client history, including status, notes, and contact information. 
          Data is current as of <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleString()}</span>.
        </p>
      </div>
    </div>
  );
};

export default ExportData;
