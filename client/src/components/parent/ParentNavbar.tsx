import { BrandLogo } from '../common/BrandLogo';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Calendar as CalIcon, User } from 'lucide-react';

export const ParentNavbar: React.FC = () => {
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
          <CalIcon className="w-4 h-4 text-amber-600" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            {currentUser?.studentName || currentUser?.name}
          </span>
          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            Parent
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
