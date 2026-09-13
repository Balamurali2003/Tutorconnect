import React from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, Mail, BookOpen, ShieldCheck, GraduationCap } from 'lucide-react';

export const TutorProfilePage: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your appointed tutor record in Charithra Learning Hub</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            {currentUser?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{currentUser?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Appointed Tutor
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentUser?.tutorId}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Registered Phone</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              {currentUser?.mobile || currentUser?.phone || 'Contact Centre'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              {currentUser?.email || 'Not Specified'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Subjects</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              {Array.isArray(currentUser?.subjects) ? currentUser.subjects.join(', ') : 'Mathematics, Science'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Qualification</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              {currentUser?.qualification || 'B.Sc / M.Sc'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
