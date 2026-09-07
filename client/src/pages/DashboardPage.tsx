import React, { useState, useEffect } from 'react';
import { fetchStats, fetchActivityLogs, fetchPriorityStats } from '../services/api';
import { MetricCards } from '../components/dashboard/MetricCards';
import { DashboardCharts } from '../components/dashboard/Charts';
import { DashboardMetrics, ActivityLog, PriorityDashboardStats, Tutor } from '../types';
import { useApp } from '../context/AppContext';
import { Sparkles, UserPlus, FileSpreadsheet, RotateCw, History, Award, ArrowUpRight, CheckCircle2, Bot, UserCheck } from 'lucide-react';
import { PriorityBreakdownModal } from '../components/tutors/PriorityBreakdownModal';

export const DashboardPage: React.FC = () => {
  const { setActiveTab, refreshTrigger } = useApp();
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
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreakdownTutor, setSelectedBreakdownTutor] = useState<Tutor | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, pStats, logRes] = await Promise.all([
        fetchStats(),
        fetchPriorityStats().catch(() => null),
        fetchActivityLogs()
      ]);
      setData(res);
      setPriorityStats(pStats);
      setLogs((logRes.logs || []).slice(0, 6));
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
        <p className="text-xs text-slate-500 font-semibold">Loading Dashboard Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-800/60 px-3 py-1 rounded-full border border-indigo-700/50">
            Tuition Centre CRM Portal
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-2">Welcome to TutorConnect</h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl leading-relaxed">
            Manage end-to-end tutor recruitment pipeline, automatic priority intelligence, demo classes, parent approvals, and smart student matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('tutor-matching')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-md hover:bg-indigo-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Tutor Matching</span>
          </button>
          <button
            onClick={() => setActiveTab('import-tutors')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold text-xs border border-indigo-600 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Bulk Import</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTOMATIC TUTOR PRIORITY DASHBOARD SECTION */}
      {/* ========================================================================= */}
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
            {/* Total Tutors */}
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

            {/* High Priority */}
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

            {/* Medium Priority */}
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

            {/* Low Priority */}
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

          {/* Top 10 Tutors Leaderboard Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Top 10 Prioritized Tutors Leaderboard
                </span>
                <span className="text-[10px] text-slate-500 font-mono">(Ranked by Measurable Priority Score)</span>
              </div>
              <button
                onClick={() => setActiveTab('all-tutors')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                <span>View All Tutors</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-4">Tutor</th>
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
                    const isManual = t.prioritySource === 'MANUAL';

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
            <h4 className="text-sm font-bold text-slate-900">Recent Recruitment Activities</h4>
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
