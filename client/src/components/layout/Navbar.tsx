import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Search, Bell, User, Sparkles, CheckCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    userRole,
    setUserRole,
    notifications,
    unreadNotificationCount,
    handleMarkRead,
    handleMarkAllRead,
    globalSearch,
    setGlobalSearch,
    setActiveTab
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);

  const roles: UserRole[] = ['Admin', 'Staff', 'Tutor', 'Parent'];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Global search by tutor name, subject, ID, location..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Role:</span>
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                userRole === role
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* AI Match Shortcut */}
        <button
          onClick={() => setActiveTab('tutor-matching')}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tutor Matching</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {unreadNotificationCount} new
                  </span>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        handleMarkRead(n.id);
                        if (n.link) {
                          const tab = n.link.replace('/', '');
                          if (tab) setActiveTab(tab);
                        }
                        setNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-transparent'}`}></span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {userRole[0]}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Admin User</p>
            <p className="text-[10px] text-emerald-600 font-semibold">{userRole} View</p>
          </div>
        </div>
      </div>
    </header>
  );
};
