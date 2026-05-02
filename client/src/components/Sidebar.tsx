import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Download, 
  LogOut,
  Moon,
  Sun,
  PhoneCall
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Client List', path: '/clients' },
    { icon: UserPlus, label: 'Add Client', path: '/add-client' },
    { icon: Download, label: 'Export Data', path: '/export' },
  ];

  return (
    <div className="w-64 h-screen glass-card rounded-none border-y-0 border-l-0 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20">
          <PhoneCall size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">CallCRM</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/40" 
                : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-transform group-hover:scale-110",
            )} />
            <span className="font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 p-3 rounded-xl w-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
