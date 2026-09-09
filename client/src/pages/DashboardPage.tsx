import React, { useState, useEffect } from 'react';
import {
  fetchStats,
  fetchActivityLogs,
  fetchPriorityStats,
  fetchStudentsAnalytics,
  fetchTeachersAnalytics
} from '../services/api';
import { MetricCards } from '../components/dashboard/MetricCards';
import { DashboardCharts } from '../components/dashboard/Charts';
import {
  DashboardMetrics,
  ActivityLog,
  PriorityDashboardStats,
  Tutor,
  StudentsAnalytics,
  TeachersAnalytics
} from '../types';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  UserPlus,
  FileSpreadsheet,
  RotateCw,
  History,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Bot,
  UserCheck,
  GraduationCap,
  Users,
  LayoutDashboard,
  BookOpen,
  Send,
  Calendar,
  ShieldCheck,
  Video,
  ThumbsUp,
  FileCheck2,
  TrendingUp,
  Clock,
  ChevronRight,
  Phone
} from 'lucide-react';
import { PriorityBreakdownModal } from '../components/tutors/PriorityBreakdownModal';

interface DashboardPageProps {
  initialView?: 'overview' | 'students' | 'teachers';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialView = 'overview' }) => {
  const { setActiveTab, refreshTrigger } = useApp();
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'students' | 'teachers'>(initialView);

  useEffect(() => {
    if (initialView) {
      setActiveDashboardTab(initialView);
    }
  }, [initialView]);

  const [data, setData] = useState<{
    metrics: DashboardMetrics;
    pipeline: any[];
    statusDistribution: any[];
    monthlyRegistrations: any[];
    subjectRequirements: any[];
    locationDistribution: any[];
    leadSourceStats?: any[];
  } | null>(null);
  const [priorityStats, setPriorityStats] = useState<PriorityDashboardStats | null>(null);
  const [studentsAnalytics, setStudentsAnalytics] = useState<StudentsAnalytics | null>(null);
  const [teachersAnalytics, setTeachersAnalytics] = useState<TeachersAnalytics | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreakdownTutor, setSelectedBreakdownTutor] = useState<Tutor | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, pStats, logRes, studRes, teachRes] = await Promise.all([
        fetchStats(),
        fetchPriorityStats().catch(() => null),
        fetchActivityLogs(),
        fetchStudentsAnalytics().catch(() => null),
        fetchTeachersAnalytics().catch(() => null)
      ]);
      setData(res);
      setPriorityStats(pStats);
      setLogs((logRes.logs || []).slice(0, 6));
      setStudentsAnalytics(studRes);
      setTeachersAnalytics(teachRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading "CHARITHRA"-Edutech Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-800/60 px-3 py-1 rounded-full border border-indigo-700/50">
              1. Master Dashboard
            </span>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-900/40 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Class 1 to 12 Edutech
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-2 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
            "CHARITHRA"-Edutech
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl leading-relaxed">
            Educational Platform for Students – comprehensive management of student requirements, teacher recruitment pipeline, Class 1-12 study materials, and Meta WhatsApp broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('tutor-matching')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-md hover:bg-indigo-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Tutor Matching</span>
          </button>
          <button
            onClick={() => setActiveTab('study-materials')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-400/40 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Class 1-12 Materials</span>
          </button>
          <button
            onClick={() => setActiveTab('import-tutors')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold text-xs border border-indigo-600 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Import</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-TAB DASHBOARD SWITCHER: Platform Overview | Students | Teachers */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-sm flex items-center gap-1">
        <button
          onClick={() => setActiveDashboardTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDashboardTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('students')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDashboardTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students Dashboard</span>
          {studentsAnalytics && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeDashboardTab === 'students' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {studentsAnalytics.totalStudents}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveDashboardTab('teachers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDashboardTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teachers Dashboard</span>
          {teachersAnalytics && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeDashboardTab === 'teachers' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {teachersAnalytics.totalTeachers}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STUDENTS DASHBOARD */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'students' && (
        <div className="space-y-6">
          {/* Students KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('students-all')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                {studentsAnalytics?.totalStudents || 28}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Class 1 to Class 12</p>
            </div>

            <div
              onClick={() => setActiveTab('students-all')}
              className="bg-white p-5 rounded-2xl border border-emerald-200 hover:border-emerald-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tutor Assigned</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
                {studentsAnalytics?.assignedCount || 18}
              </div>
              <p className="text-[11px] text-emerald-800">Classes actively ongoing</p>
            </div>

            <div
              onClick={() => setActiveTab('student-requirements')}
              className="bg-white p-5 rounded-2xl border border-amber-200 hover:border-amber-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Looking for Tutor</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-amber-700 font-mono mt-2">
                {studentsAnalytics?.lookingCount || 10}
              </div>
              <p className="text-[11px] text-amber-800">Pending tutor allocation</p>
            </div>

            <div
              onClick={() => setActiveTab('parents-all')}
              className="bg-white p-5 rounded-2xl border border-blue-200 hover:border-blue-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Parents</span>
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-blue-700 font-mono mt-2">
                {studentsAnalytics?.totalParents || 25}
              </div>
              <p className="text-[11px] text-blue-800">Guardian contacts on file</p>
            </div>
          </div>

          {/* Class 1 to 12 Enrollment Breakdown Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Class 1 to Class 12 Student Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic cohort overview across primary, middle, and senior secondary grades
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('study-materials')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manage Class 1-12 Study Materials</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }, (_, i) => {
                const gradeNum = i + 1;
                const gradeKey = `Class ${gradeNum}`;
                const match = (studentsAnalytics?.classDistribution || []).find(
                  c => c.classGrade === gradeKey || c.classGrade === `Grade ${gradeNum}`
                );
                const count = match ? match.count : 0;

                return (
                  <div
                    key={gradeKey}
                    onClick={() => setActiveTab('students-all')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">{gradeKey}</span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">{count}</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, count * 20)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400">{count} enrolled</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Demand & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subject Demand */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                High Demand Subject Requirements
              </h3>

              <div className="space-y-3">
                {(studentsAnalytics?.subjectDemand || [
                  { subject: 'Mathematics', count: 18 },
                  { subject: 'Physics', count: 14 },
                  { subject: 'Chemistry', count: 12 },
                  { subject: 'English', count: 10 },
                  { subject: 'Biology', count: 8 },
                  { subject: 'Computer Science', count: 6 }
                ]).map((sub, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sub.subject}</span>
                      <span className="font-mono font-bold text-indigo-600">{sub.count} requests</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-teal-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, sub.count * 6)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions for Students */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Student Operations & Communication
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Seamlessly broadcast academic updates, fee notices, and schedule alerts directly to enrolled students and parents.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('communication-students')}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-all group"
                >
                  <Send className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-bold text-slate-900 text-xs">Notify Students</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Bulk WhatsApp alert</p>
                </button>

                <button
                  onClick={() => setActiveTab('tutor-matching')}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-left transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-indigo-600 mb-2" />
                  <p className="font-bold text-slate-900 text-xs">AI Matching</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Match unassigned</p>
                </button>

                <button
                  onClick={() => setActiveTab('study-materials')}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-amber-600 mb-2" />
                  <p className="font-bold text-slate-900 text-xs">Class 1-12 Notes</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Publish syllabus files</p>
                </button>

                <button
                  onClick={() => setActiveTab('import-students')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group"
                >
                  <FileSpreadsheet className="w-5 h-5 text-slate-600 mb-2" />
                  <p className="font-bold text-slate-900 text-xs">Import Students</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Excel file upload</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHERS DASHBOARD */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'teachers' && (
        <div className="space-y-6">
          {/* Teachers KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('all-tutors')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Teachers</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                {teachersAnalytics?.totalTeachers || (priorityStats ? priorityStats.totalTutors : 20)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Verified & registered pool</p>
            </div>

            <div
              onClick={() => setActiveTab('high-priority')}
              className="bg-white p-5 rounded-2xl border border-rose-200 hover:border-rose-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">High Priority (80-100)</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-rose-700 font-mono mt-2">
                {priorityStats ? priorityStats.highPriority.count : 7}
              </div>
              <p className="text-[11px] text-rose-800">Top candidate priority</p>
            </div>

            <div
              onClick={() => setActiveTab('appointed-tutors')}
              className="bg-white p-5 rounded-2xl border border-emerald-200 hover:border-emerald-300 cursor-pointer shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Appointed Teachers</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
                {teachersAnalytics?.activeAppointments || 12}
              </div>
              <p className="text-[11px] text-emerald-800">Placed in active home tuitions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm transition-all">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Average Score</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-amber-700 font-mono mt-2">
                {priorityStats ? priorityStats.averageScore : 68.5} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-amber-800">AI dynamic metric</p>
            </div>
          </div>

          {/* Teacher Recruitment & Requirement Pipeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-600" />
                  Teacher Requirement & Recruitment Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  End-to-end progress tracker from initial application through demo classes and parent approval
                </p>
              </div>
              <button
                onClick={() => setActiveTab('communication-teachers')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify Teachers via WhatsApp</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {(teachersAnalytics?.pipeline || [
                { stage: 'Applications', count: 20, color: '#3b82f6', action: 'all-tutors' },
                { stage: 'Priority Scored', count: 18, color: '#eab308', action: 'high-priority' },
                { stage: 'Validated', count: 15, color: '#6366f1', action: 'validated-tutors' },
                { stage: 'Documents', count: 12, color: '#f97316', action: 'recruitment-doc-verification' },
                { stage: 'Interviews', count: 8, color: '#8b5cf6', action: 'recruitment-interview' },
                { stage: 'Demo Classes', count: 6, color: '#06b6d4', action: 'recruitment-demo' },
                { stage: 'Parent Approval', count: 5, color: '#ec4899', action: 'recruitment-parent-approval' },
                { stage: 'Appointed', count: 12, color: '#10b981', action: 'appointed-tutors' }
              ]).map((item: any, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab(item.action || 'all-tutors')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">{item.count}</div>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">{item.stage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Tutor Priority Intelligence card with Top 10 Table */}
          {priorityStats && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-900 text-base">Automatic Tutor Priority Intelligence</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      AI Dynamic Scoring (0-100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Objective prioritization calculated dynamically from experience, active student demand, home tuition, qualifications, and schedule match.
                  </p>
                </div>
              </div>

              {/* Top 10 Tutors Leaderboard Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Top Prioritized Teachers Leaderboard
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">(Ranked by Measurable Priority Score)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('all-tutors')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                  >
                    <span>View All Teachers</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                        <th className="py-2.5 px-4">Teacher</th>
                        <th className="py-2.5 px-4">Subjects</th>
                        <th className="py-2.5 px-4">Experience</th>
                        <th className="py-2.5 px-4">Home Tuition</th>
                        <th className="py-2.5 px-4 text-center">Score</th>
                        <th className="py-2.5 px-4 text-center">Priority</th>
                        <th className="py-2.5 px-4 text-right">Analysis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {priorityStats.top10Tutors.map((t, index) => {
                        const score = t.priorityScore ?? 0;
                        const level = t.priorityLevel || t.priority || 'LOW_PRIORITY';
                        const isHigh = level === 'HIGH_PRIORITY';
                        const isMedium = level === 'MEDIUM_PRIORITY';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 text-center font-bold text-slate-400 font-mono">
                              #{index + 1}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={t.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.fullName)}`}
                                  alt={t.fullName}
                                  className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{t.fullName}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{t.tutorId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 max-w-[160px] truncate" title={(t.subjects || []).join(', ')}>
                              {(t.subjects || []).slice(0, 2).join(', ')}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                              {t.experience || (t.experienceYears ? `${t.experienceYears}y` : '—')}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.homeTuitionAvailable?.toLowerCase() === 'yes'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {t.homeTuitionAvailable?.toLowerCase() === 'yes' ? 'YES' : 'NO'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-lg font-mono font-black text-xs ${
                                isHigh ? 'bg-rose-100 text-rose-800' : isMedium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {score} / 100
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isHigh ? 'bg-rose-50 text-rose-700 border border-rose-200' : isMedium ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {level.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedBreakdownTutor(t)}
                                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              >
                                Inspect Breakdown
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLATFORM OVERVIEW (EXISTING FULL SUITE PRESERVED) */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'overview' && (
        <div className="space-y-6">
          {/* Priority Dashboard intelligence summary */}
          {priorityStats && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-900 text-base">Automatic Tutor Priority Intelligence</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      AI Dynamic Scoring (0-100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Objective prioritization calculated dynamically from experience, active student demand, home tuition, qualifications, and schedule match.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Average Tutor Score</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{priorityStats.averageScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
                  </div>
                </div>
              </div>

              {/* 4 KPI Cards: Total, High %, Medium %, Low % */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div
                  onClick={() => setActiveTab('all-tutors')}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Tutors</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">{priorityStats.totalTutors}</div>
                  <p className="text-[11px] text-slate-500">Registered candidates</p>
                </div>

                <div
                  onClick={() => setActiveTab('high-priority')}
                  className="p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100/60 border border-rose-200 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-rose-600">
                    <span className="text-[11px] font-bold uppercase tracking-wider">High Priority</span>
                    <span className="text-xs font-mono font-bold">{priorityStats.highPriority.percentage}%</span>
                  </div>
                  <div className="text-2xl font-black text-rose-700 font-mono">{priorityStats.highPriority.count}</div>
                  <p className="text-[11px] text-rose-800/80">Score 80 - 100 &bull; Immediate placement</p>
                </div>

                <div
                  onClick={() => setActiveTab('medium-priority')}
                  className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/60 border border-amber-200 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Medium Priority</span>
                    <span className="text-xs font-mono font-bold">{priorityStats.mediumPriority.percentage}%</span>
                  </div>
                  <div className="text-2xl font-black text-amber-800 font-mono">{priorityStats.mediumPriority.count}</div>
                  <p className="text-[11px] text-amber-900/80">Score 60 - 79 &bull; Secondary pipeline</p>
                </div>

                <div
                  onClick={() => setActiveTab('low-priority')}
                  className="p-4 rounded-2xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-300 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Low Priority</span>
                    <span className="text-xs font-mono font-bold">{priorityStats.lowPriority.percentage}%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-700 font-mono">{priorityStats.lowPriority.count}</div>
                  <p className="text-[11px] text-slate-600">Score 0 - 59 &bull; Missing/low demand</p>
                </div>
              </div>
            </div>
          )}

          {/* 11 Modern Analytics Cards */}
          <MetricCards metrics={data.metrics} />

          {/* 6 High-Definition Dashboard Charts including Lead Source Analytics */}
          <DashboardCharts
            pipeline={data.pipeline}
            statusDistribution={data.statusDistribution}
            monthlyRegistrations={data.monthlyRegistrations}
            subjectRequirements={data.subjectRequirements}
            locationDistribution={data.locationDistribution}
            leadSourceStats={data.leadSourceStats}
            onOpenLeadsInbox={(tab) => setActiveTab(tab || 'communication-all')}
          />

          {/* Recent Activity Stream */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Recent Platform Activities</h4>
              </div>
              <button
                onClick={loadData}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
              >
                <RotateCw className="w-3.5 h-3.5" /> Refresh Stream
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-400 font-mono text-[10px]">
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-bold text-indigo-600">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="font-semibold text-slate-800 mt-1 line-clamp-2">{log.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Actor: {log.actor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Priority Breakdown Modal */}
      {selectedBreakdownTutor && (
        <PriorityBreakdownModal
          tutor={selectedBreakdownTutor}
          isOpen={!!selectedBreakdownTutor}
          onClose={() => setSelectedBreakdownTutor(null)}
          onUpdated={(updated) => {
            setSelectedBreakdownTutor(updated);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
