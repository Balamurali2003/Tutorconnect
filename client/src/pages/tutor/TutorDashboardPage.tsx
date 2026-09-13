import { BrandLogo } from '../../components/common/BrandLogo';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchTutorDashboardMetrics, fetchTutorStudents } from '../../services/api';
import { TutorDailyUpdateModal } from '../../components/tutor/TutorDailyUpdateModal';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Camera
} from 'lucide-react';

export const TutorDashboardPage: React.FC = () => {
  const { currentUser, setActiveTab, refreshTrigger, addToast } = useApp();
  const [metrics, setMetrics] = useState<any>({
    todayClassesCount: 0,
    assignedStudentsCount: 0,
    updatesTodayCount: 0,
    upcomingClassesCount: 0,
    totalUpdatesCount: 0
  });
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentForUpdate, setSelectedStudentForUpdate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          fetchTutorDashboardMetrics(),
          fetchTutorStudents()
        ]);
        setMetrics(mRes.metrics || {});
        setTodayClasses(mRes.todayClasses || []);
        setRecentUpdates(mRes.recentUpdates || []);
        setStudents(sRes.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [refreshTrigger]);

  const handleOpenForStudent = (studentId: string) => {
    setSelectedStudentForUpdate(studentId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10">
              <BrandLogo size="md" variant="dark" imageOnly />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-extrabold tracking-wider text-emerald-300 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>TUTOR DASHBOARD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Charithra Learning Hub
              </h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl leading-relaxed">
                Welcome back, {currentUser?.name}! Empowering Learning. Connecting Tutors, Students &amp; Parents.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedStudentForUpdate(undefined);
              setModalOpen(true);
            }}
            className="self-start md:self-auto px-5 py-3 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Post Today's Teaching Update</span>
          </button>
        </div>
      </div>

      {/* 4 Database Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Classes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.todayClassesCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Scheduled for today</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Students
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.assignedStudentsCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Active student tuitions</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Updates Posted Today
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.updatesTodayCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Sent to parents today</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Classes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.upcomingClassesCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total active weekly slots</div>
        </div>
      </div>

      {/* Two Columns: Students List and Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Assigned Students</h2>
              <p className="text-xs text-slate-500">Students assigned to you for regular tuition</p>
            </div>
            <button
              onClick={() => setActiveTab('tutor-students')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No students currently assigned.
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => (
                <div
                  key={s.assignmentId}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {s.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{s.studentName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-700">{s.subject}</span>
                        <span>•</span>
                        <span>{s.class}</span>
                        <span>•</span>
                        <span>{s.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenForStudent(s.studentId)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Post Update</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Updates</h2>
              <p className="text-xs text-slate-500">Your latest published notes</p>
            </div>
            <button
              onClick={() => setActiveTab('tutor-history')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUpdates.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs flex-1 flex flex-col items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
              <span>No daily updates posted yet.</span>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1">
              {recentUpdates.map((u) => (
                <div key={u.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{u.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{u.updateDate}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700">{u.subject}</div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {u.thought}
                  </p>
                  {u.imageUrl && (
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold pt-1">
                      <Camera className="w-3 h-3" />
                      <span>Photo Attached</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TutorDailyUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        presetStudentId={selectedStudentForUpdate}
        onSuccess={() => {
          addToast('success', 'Update Published', 'Your teaching update has been sent.');
        }}
      />
    </div>
  );
};
