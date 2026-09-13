import { BrandLogo } from '../common/BrandLogo';
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
  BookOpen,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(true);
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);
  const [studentOpen, setStudentOpen] = useState(true);
  const [excelOpen, setExcelOpen] = useState(false);

  const navItem = (id: string, label: string, icon: React.ReactNode, badge?: string | number, badgeColor?: string) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <span className={`${isActive ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
          {!collapsed && <span className="truncate">{label}</span>}
        </div>
        {!collapsed && badge !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700')}`}>
            {badge}
          </span>
        )}
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
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100/90 bg-white">
        {!collapsed && (
          <BrandLogo size="sm" variant="light" subtitle="Admin Dashboard" />
        )}
        {collapsed && (
          <div className="mx-auto">
            <BrandLogo size="xs" variant="light" imageOnly />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Main Dashboard */}
        <div>{navItem('dashboard', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}</div>

        {/* Tutor Management Group */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setTutorOpen(!tutorOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
            >
              <span>Tutor Management</span>
              {tutorOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="border-t border-slate-100 my-2"></div>
          )}

          {(tutorOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              {navItem('all-tutors', 'All Tutors', <Users className="w-4 h-4" />)}
              {navItem('high-priority', 'High Priority', <span className="text-rose-500 font-bold">🔴</span>, 'Score 80-100', 'bg-rose-100 text-rose-800')}
              {navItem('medium-priority', 'Medium Priority', <span className="text-amber-500 font-bold">🟠</span>, 'Score 60-79', 'bg-amber-100 text-amber-800')}
              {navItem('low-priority', 'Low Priority', <span className="text-slate-400 font-bold">🟡</span>, 'Score 0-59', 'bg-slate-100 text-slate-700')}
              {navItem('validated-tutors', 'Validate Tutor', <ShieldCheck className="w-4 h-4 text-indigo-600" />)}
              {navItem('appointed-tutors', 'Appointed Tutors', <Award className="w-4 h-4 text-emerald-600" />)}
              {navItem('admin-tutor-updates', 'Tutor Daily Updates', <BookOpen className="w-4 h-4 text-teal-600" />)}
              {navItem('whatsapp-history', 'WhatsApp History', <History className="w-4 h-4 text-emerald-600" />)}
            </div>
          )}
        </div>

        {/* Communication Group */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setCommunicationOpen(!communicationOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
            >
              <span>Communication</span>
              {communicationOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="border-t border-slate-100 my-2"></div>
          )}

          {(communicationOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              {navItem('whatsapp', 'WhatsApp Dashboard', <MessageCircle className="w-4 h-4 text-emerald-600" />)}
              {navItem('whatsapp-inbox', 'WhatsApp Inbox', <Inbox className="w-4 h-4 text-teal-600" />)}
              {navItem('whatsapp-messaging', 'WhatsApp Messages', <Send className="w-4 h-4 text-sky-600" />)}
              {navItem('whatsapp-templates', 'WhatsApp Templates', <FileText className="w-4 h-4 text-indigo-600" />)}
              {navItem('whatsapp-contacts', 'WhatsApp Contacts', <Users className="w-4 h-4 text-violet-600" />)}
              {navItem('whatsapp-settings', 'WhatsApp Settings', <Settings className="w-4 h-4 text-slate-500" />)}
              {navItem('whatsapp-webhook-logs', 'Webhook Logs', <Activity className="w-4 h-4 text-amber-500" />)}
              {navItem('whatsapp-api-logs', 'API Logs', <Terminal className="w-4 h-4 text-slate-400" />)}
              {navItem('whatsapp-test', 'Integration Test', <Sparkles className="w-4 h-4 text-purple-600" />)}
              {navItem('communication-all', 'Social Leads Inbox', <MessageSquare className="w-4 h-4 text-slate-500" />)}
            </div>
          )}
        </div>

        {/* Recruitment Process Group */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setRecruitmentOpen(!recruitmentOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
            >
              <span>Recruitment Process</span>
              {recruitmentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="border-t border-slate-100 my-2"></div>
          )}

          {(recruitmentOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              {navItem('recruitment-doc-verification', 'Document Verification', <FileCheck2 className="w-4 h-4" />)}
              {navItem('recruitment-interview', 'Interview Process', <Calendar className="w-4 h-4" />)}
              {navItem('recruitment-demo', 'Demo Classes', <Video className="w-4 h-4" />)}
              {navItem('recruitment-parent-approval', 'Parent Approval', <ThumbsUp className="w-4 h-4" />)}
            </div>
          )}
        </div>

        {/* Students & Parents */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setStudentOpen(!studentOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
            >
              <span>Students & Parents</span>
              {studentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="border-t border-slate-100 my-2"></div>
          )}

          {(studentOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              {navItem('students-all', 'All Students', <GraduationCap className="w-4 h-4" />, 20)}
              {navItem('student-requirements', 'Student Requirements', <AlertCircle className="w-4 h-4 text-amber-500" />)}
              {navItem('parents-all', 'All Parents', <UserCheck className="w-4 h-4" />, 20)}
            </div>
          )}
        </div>

        {/* Bulk Import */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setExcelOpen(!excelOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
            >
              <span>Excel Import</span>
              {excelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="border-t border-slate-100 my-2"></div>
          )}

          {(excelOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              {navItem('import-tutors', 'Import Teachers', <FileSpreadsheet className="w-4 h-4" />)}
              {navItem('import-students', 'Import Students', <FileSpreadsheet className="w-4 h-4" />)}
            </div>
          )}
        </div>

        {/* Advanced Matching */}
        <div>
          {navItem(
            'tutor-matching',
            'Tutor Matching',
            <Sparkles className="w-4 h-4 text-indigo-500" />,
            'AI',
            'bg-indigo-100 text-indigo-800'
          )}
        </div>

        {/* Reports & Settings */}
        <div className="border-t border-slate-100 pt-3 space-y-1">
          {navItem('reports', 'Reports', <BarChart3 className="w-4 h-4" />)}
          {navItem('settings', 'Settings', <Settings className="w-4 h-4" />)}
        </div>
      </div>

      {/* Footer / Status Indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-semibold text-slate-700">System Online</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v2.4 Pro</span>
          </div>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>View Live Website 🌐</span>
          </a>

          <button
            onClick={logout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};
