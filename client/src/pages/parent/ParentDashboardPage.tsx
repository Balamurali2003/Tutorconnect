import { BrandLogo } from '../../components/common/BrandLogo';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchParentDashboard } from '../../services/api';
import {
  User,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Camera,
  CheckCircle2
} from 'lucide-react';

export const ParentDashboardPage: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentDashboard().then(res => setData(res)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-950/20 relative overflow-hidden border border-amber-500/20">
        <div className="relative z-10 flex items-start sm:items-center gap-5">
          <div className="shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10">
            <BrandLogo size="md" variant="dark" imageOnly />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-extrabold tracking-wider text-amber-300 mb-2">
              <span>PARENT DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Charithra Learning Hub
            </h1>
            <p className="text-amber-100 text-sm mt-1 max-w-xl leading-relaxed">
              Welcome, Parent of {data?.student?.studentName || currentUser?.studentName || currentUser?.name}! Empowering Learning. Connecting Tutors, Students &amp; Parents.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Profile</div>
          <div className="text-xl font-bold text-slate-900">{data?.student?.studentName || currentUser?.studentName}</div>
          <div className="text-xs text-slate-500 mt-1">{data?.student?.class || 'Class 10'} • {data?.student?.location || 'Tirunelveli'}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assigned Tutors</div>
          <div className="text-xl font-bold text-slate-900">{data?.assignedTutors?.length || 0} Tutors</div>
          <div className="text-xs text-slate-500 mt-1">Teaching {data?.assignedTutors?.map((t: any) => t.subject).join(', ') || 'Enrolled Subjects'}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Updates Received</div>
          <div className="text-xl font-bold text-slate-900">{data?.totalUpdates || 0} Reports</div>
          <div className="text-xs text-slate-500 mt-1">Daily learning notes recorded</div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Tutors */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Assigned Tutors</h2>
            <button
              onClick={() => setActiveTab('parent-student')}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.assignedTutors?.map((t: any) => (
              <div key={t.assignmentId} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{t.tutorName}</div>
                  <div className="text-xs font-semibold text-amber-700 mt-0.5">{t.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Days: {Array.isArray(t.days) ? t.days.join(', ') : t.days}</div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  {t.lessonType || 'Home Tuition'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Tutor Updates */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Latest Teaching Updates</h2>
            <button
              onClick={() => setActiveTab('parent-tutor-updates')}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentUpdates?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No updates posted yet.</div>
            ) : (
              data?.recentUpdates?.slice(0, 3).map((u: any) => (
                <div key={u.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{u.tutorName} ({u.subject})</span>
                    <span className="text-[10px] text-slate-400">{u.updateDate}</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{u.thought}</p>
                  {u.imageUrl && (
                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Photo Attached
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
