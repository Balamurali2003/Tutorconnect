import { BrandLogo } from '../common/BrandLogo';
import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  UserCheck,
  LogOut,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

export const TutorSidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, logout } = useApp();

  const menuItems = [
    { id: 'tutor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor-students', label: 'My Students', icon: Users },
    { id: 'tutor-classes', label: "Today's Classes", icon: Calendar },
    { id: 'tutor-history', label: 'Update History', icon: History },
    { id: 'tutor-profile', label: 'My Profile', icon: UserCheck }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="h-20 flex items-center px-5 border-b border-slate-800/80 bg-slate-900">
        <BrandLogo size="sm" variant="dark" subtitle="Tutor Dashboard" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tutor Profile Footer & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
            {currentUser?.name?.charAt(0) || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Appointed Tutor'}</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Appointed
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
