import { BrandLogo } from '../common/BrandLogo';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, LogOut, Calendar as CalIcon } from 'lucide-react';

interface TutorNavbarProps {
  onOpenUpdateModal: () => void;
}

export const TutorNavbar: React.FC<TutorNavbarProps> = ({ onOpenUpdateModal }) => {
  const { currentUser, logout } = useApp();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BrandLogo size="xs" imageOnly />
        <span className="hidden md:inline text-xs font-extrabold text-slate-800 tracking-tight mr-2">
          Charithra Learning Hub
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pl-2 border-l border-slate-200">
          <CalIcon className="w-4 h-4 text-emerald-600" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenUpdateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Post Daily Update</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <span className="text-xs font-bold text-slate-800">{currentUser?.name}</span>
          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            Tutor
          </span>
        </div>

        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
