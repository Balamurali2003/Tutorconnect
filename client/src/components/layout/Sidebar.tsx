import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  FileCheck2,
  Calendar,
  Video,
  ThumbsUp,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  FileText,
  History,
  Inbox,
  Send,
  Terminal,
  Activity,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Group collapse state
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [studentOpen, setStudentOpen] = useState(true);
  const [teacherOpen, setTeacherOpen] = useState(true);
  const [recruitmentSubOpen, setRecruitmentSubOpen] = useState(true);
  const [materialsOpen, setMaterialsOpen] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(true);
  const [excelOpen, setExcelOpen] = useState(false);

  const navItem = (id: string, label: string, icon: React.ReactNode, badge?: string | number, badgeColor?: string) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={`${isActive ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
          {!collapsed && <span className="truncate">{label}</span>}
        </div>
        {!collapsed && badge !== undefined && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700')}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const groupHeader = (label: string, count: string, isOpen: boolean, onToggle: () => void) => {
    if (collapsed) {
      return <div className="border-t border-slate-100 my-2"></div>;
    }
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-indigo-600 font-mono font-bold">{count}</span>
          <span>{label}</span>
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    );
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col shrink-0 sticky top-0 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-slate-900 leading-tight">
                "CHARITHRA"-Edutech
              </h1>
              <p className="text-[9px] uppercase font-bold tracking-wider text-indigo-600">Educational Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links in Strict Order (1 to 6) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* ========================================================================= */}
        {/* 1. DASHBOARD */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Dashboard', '1.', dashboardOpen, () => setDashboardOpen(!dashboardOpen))}
          {(dashboardOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('dashboard', 'Platform Overview', <LayoutDashboard className="w-4 h-4" />)}
              {navItem('dashboard-students', 'Students Dashboard', <GraduationCap className="w-4 h-4 text-emerald-600" />, 'Class 1-12', 'bg-emerald-100 text-emerald-800')}
              {navItem('dashboard-teachers', 'Teachers Dashboard', <Users className="w-4 h-4 text-indigo-600" />, 'Pipeline', 'bg-indigo-100 text-indigo-800')}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. STUDENTS */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Students', '2.', studentOpen, () => setStudentOpen(!studentOpen))}
          {(studentOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('students-all', 'All Students', <GraduationCap className="w-4 h-4 text-blue-600" />, 28)}
              {navItem('student-requirements', 'Student Requirements', <AlertCircle className="w-4 h-4 text-amber-500" />, 'Active', 'bg-amber-100 text-amber-800')}
              {navItem('parents-all', 'All Parents', <UserCheck className="w-4 h-4 text-purple-600" />, 25)}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. TEACHERS (with Teacher Requirement Process) */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Teachers & Hiring', '3.', teacherOpen, () => setTeacherOpen(!teacherOpen))}
          {(teacherOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('all-tutors', 'All Teachers', <Users className="w-4 h-4" />)}
              {navItem('high-priority', 'High Priority Teachers', <span className="text-rose-500 font-bold">🔴</span>, 'Score 80+', 'bg-rose-100 text-rose-800')}
              {navItem('medium-priority', 'Medium Priority Teachers', <span className="text-amber-500 font-bold">🟠</span>, 'Score 60+', 'bg-amber-100 text-amber-800')}
              {navItem('low-priority', 'Low Priority Teachers', <span className="text-slate-400 font-bold">🟡</span>, 'Score <60', 'bg-slate-100 text-slate-700')}
              {navItem('validated-tutors', 'Validated Teachers', <ShieldCheck className="w-4 h-4 text-indigo-600" />)}
              {navItem('appointed-tutors', 'Appointed Teachers', <Award className="w-4 h-4 text-emerald-600" />)}
              {navItem('tutor-matching', 'AI Teacher Matching', <Sparkles className="w-4 h-4 text-indigo-500" />, 'AI', 'bg-indigo-100 text-indigo-800')}

              {/* Recruitment / Requirement Process Nested Subgroup */}
              <div className="pt-1.5 pb-0.5 pl-2 border-l-2 border-indigo-100 ml-2 space-y-0.5">
                {!collapsed && (
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                    Recruitment Process
                  </p>
                )}
                {navItem('recruitment-doc-verification', 'Document Verification', <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />)}
                {navItem('recruitment-interview', 'Interview Process', <Calendar className="w-3.5 h-3.5 text-blue-600" />)}
                {navItem('recruitment-demo', 'Demo Classes', <Video className="w-3.5 h-3.5 text-cyan-600" />)}
                {navItem('recruitment-parent-approval', 'Parent Approval', <ThumbsUp className="w-3.5 h-3.5 text-rose-600" />)}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. STUDY MATERIALS (Class 1 to 12) */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Study Materials', '4.', materialsOpen, () => setMaterialsOpen(!materialsOpen))}
          {(materialsOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('study-materials', 'Class 1 to 12 Hub', <BookOpen className="w-4 h-4 text-indigo-600" />, 'Admin', 'bg-indigo-100 text-indigo-800')}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. COMMUNICATION (Separated Students & Teachers) */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Communication', '5.', communicationOpen, () => setCommunicationOpen(!communicationOpen))}
          {(communicationOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('communication-students', 'With Students & Parents', <GraduationCap className="w-4 h-4 text-emerald-600" />, 'WhatsApp', 'bg-emerald-100 text-emerald-800')}
              {navItem('communication-teachers', 'With Teachers / Tutors', <Users className="w-4 h-4 text-blue-600" />, 'WhatsApp', 'bg-blue-100 text-blue-800')}
              {navItem('whatsapp-connect', 'Meta WhatsApp Connect', <MessageCircle className="w-4 h-4 text-emerald-600" />, 'Meta API', 'bg-emerald-100 text-emerald-800')}
              {navItem('whatsapp-bulk', 'Bulk WhatsApp Center', <Send className="w-4 h-4 text-sky-600" />)}
              {navItem('whatsapp-history', 'Broadcast History & Logs', <History className="w-4 h-4 text-slate-500" />)}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 6. EXCEL DATA IMPORT */}
        {/* ========================================================================= */}
        <div>
          {groupHeader('Excel Data Import', '6.', excelOpen, () => setExcelOpen(!excelOpen))}
          {(excelOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {navItem('import-tutors', 'Import Teachers', <FileSpreadsheet className="w-4 h-4 text-indigo-600" />)}
              {navItem('import-students', 'Import Students', <FileSpreadsheet className="w-4 h-4 text-blue-600" />)}
              {navItem('import-parents', 'Import Parents', <FileSpreadsheet className="w-4 h-4 text-purple-600" />)}
            </div>
          )}
        </div>

        {/* Reports & Settings (Preserved) */}
        <div className="border-t border-slate-100 pt-2 space-y-0.5">
          {navItem('reports', 'Reports & Analytics', <BarChart3 className="w-4 h-4 text-slate-500" />)}
          {navItem('settings', 'System Settings', <Settings className="w-4 h-4 text-slate-500" />)}
        </div>
      </div>

      {/* Footer / Status Indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-bold text-slate-700">"CHARITHRA"-Edutech</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v3.0 Pro</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
