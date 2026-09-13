import React, { useState, useEffect } from 'react';
import { fetchParentDashboard } from '../../services/api';
import { User, BookOpen, MapPin, Phone, GraduationCap } from 'lucide-react';

export const ParentStudentProfilePage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchParentDashboard().then(res => setData(res)).catch(() => {});
  }, []);

  const student = data?.student;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Academic registration details in Charithra Learning Hub</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            {student?.studentName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{student?.studentName}</h2>
            <div className="text-xs text-slate-500 mt-1">{student?.class} • ID: {student?.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              {student?.phone || student?.parentPhone}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Location</span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              {student?.location}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Learning Requirements</span>
            <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {student?.learningRequirements || 'Concept coaching and academic improvement'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
