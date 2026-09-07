import React from 'react';
import { DashboardMetrics } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Users,
  AlertCircle,
  FileCheck2,
  Calendar,
  Video,
  ThumbsUp,
  Award,
  GraduationCap,
  UserCheck,
  TrendingUp
} from 'lucide-react';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const { setActiveTab } = useApp();

  const cards = [
    {
      title: 'Total Tutors',
      value: metrics.totalTutors,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      tab: 'all-tutors',
      trend: '+12% this month'
    },
    {
      title: 'New Tutor Applications',
      value: metrics.newApplications,
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
      tab: 'new-applications',
      badge: 'Action Needed'
    },
    {
      title: 'Priority Not Assigned',
      value: metrics.notAssignedTutors ?? 0,
      icon: <span className="text-slate-600 font-extrabold text-base">⚪</span>,
      bg: 'bg-slate-100 border-slate-200',
      tab: 'all-tutors',
      badge: 'Assign Priority'
    },
    {
      title: 'High Priority Tutors',
      value: metrics.highPriorityTutors,
      icon: <span className="text-rose-600 font-extrabold text-base">🔴</span>,
      bg: 'bg-rose-50 border-rose-100',
      tab: 'high-priority',
      badge: 'Validate Now',
      highlight: true
    },
    {
      title: 'Low Priority Tutors',
      value: metrics.lowPriorityTutors,
      icon: <span className="text-amber-500 font-extrabold text-base">🟡</span>,
      bg: 'bg-amber-50 border-amber-100',
      tab: 'low-priority',
      badge: 'Review'
    },
    {
      title: 'Pending Doc Verification',
      value: metrics.pendingVerification,
      icon: <FileCheck2 className="w-5 h-5 text-orange-600" />,
      bg: 'bg-orange-50 border-orange-100',
      tab: 'recruitment-doc-verification'
    },
    {
      title: 'Interviews Scheduled',
      value: metrics.interviewsScheduled,
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100',
      tab: 'recruitment-interview'
    },
    {
      title: 'Demo Classes Pending',
      value: metrics.demoClassesPending,
      icon: <Video className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-100',
      tab: 'recruitment-demo'
    },
    {
      title: 'Parent Approvals Pending',
      value: metrics.parentApprovalsPending,
      icon: <ThumbsUp className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50 border-pink-100',
      tab: 'recruitment-parent-approval'
    },
    {
      title: 'Appointed Tutors',
      value: metrics.appointedTutors,
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      tab: 'appointed-tutors',
      badge: 'Active Placements'
    },
    {
      title: 'Total Students',
      value: metrics.totalStudents,
      icon: <GraduationCap className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-100',
      tab: 'students-all'
    },
    {
      title: 'Total Parents',
      value: metrics.totalParents,
      icon: <UserCheck className="w-5 h-5 text-violet-600" />,
      bg: 'bg-violet-50 border-violet-100',
      tab: 'parents-all'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <div
          key={idx}
          onClick={() => setActiveTab(c.tab)}
          className={`group relative bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden ${
            c.highlight ? 'ring-1 ring-rose-200' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{c.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${c.bg} group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            {c.badge ? (
              <span className={`font-bold px-2 py-0.5 rounded-md ${
                c.badge.includes('Validate') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {c.badge}
              </span>
            ) : (
              <span className="text-slate-400">View pipeline</span>
            )}
            <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
              Explore &rarr;
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
