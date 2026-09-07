import React from 'react';
import { LeadSourceStat } from '../../types';

interface ChartsProps {
  pipeline: { stage: string; count: number; color: string }[];
  statusDistribution: { name: string; count: number }[];
  monthlyRegistrations: { month: string; count: number }[];
  subjectRequirements: { subject: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
  leadSourceStats?: LeadSourceStat[];
  onOpenLeadsInbox?: (source?: string) => void;
}

export const DashboardCharts: React.FC<ChartsProps> = ({
  pipeline,
  statusDistribution,
  monthlyRegistrations,
  subjectRequirements,
  locationDistribution,
  leadSourceStats = [],
  onOpenLeadsInbox
}) => {
  const maxPipeline = Math.max(...pipeline.map(p => p.count), 1);
  const maxSubject = Math.max(...subjectRequirements.map(s => s.count), 1);
  const maxLoc = Math.max(...locationDistribution.map(l => l.count), 1);
  const maxMonthly = Math.max(...monthlyRegistrations.map(m => m.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Tutor Recruitment Pipeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">1. Tutor Recruitment Pipeline</h4>
            <p className="text-xs text-slate-500">Funnel progression across standard recruitment milestones</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
            Live Conversion
          </span>
        </div>

        <div className="space-y-3">
          {pipeline.map((item, idx) => {
            const pct = Math.round((item.count / maxPipeline) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.stage}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{item.count} tutors</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tutor Status Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">2. Tutor Status Distribution</h4>
            <p className="text-xs text-slate-500">Breakdown of tutors across all active pipeline statuses</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {statusDistribution.map((item, idx) => {
            const colors = [
              'bg-indigo-50 border-indigo-200 text-indigo-900',
              'bg-blue-50 border-blue-200 text-blue-900',
              'bg-emerald-50 border-emerald-200 text-emerald-900',
              'bg-rose-50 border-rose-200 text-rose-900',
              'bg-amber-50 border-amber-200 text-amber-900',
              'bg-purple-50 border-purple-200 text-purple-900',
              'bg-cyan-50 border-cyan-200 text-cyan-900'
            ];
            const col = colors[idx % colors.length];

            return (
              <div key={idx} className={`p-3 rounded-xl border ${col} flex flex-col justify-between`}>
                <span className="text-[11px] font-bold tracking-tight truncate" title={item.name}>
                  {item.name.replace(/_/g, ' ')}
                </span>
                <span className="text-xl font-black mt-1 font-mono">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Monthly Tutor Registrations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">3. Monthly Tutor Registrations</h4>
            <p className="text-xs text-slate-500">Growth trajectory of inbound tutor applications</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+38% QoQ</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
          {monthlyRegistrations.map((m, idx) => {
            const heightPct = Math.round((m.count / maxMonthly) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {m.count}
                </span>
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all group-hover:from-indigo-700 group-hover:to-indigo-500 shadow-sm"
                  style={{ height: `${heightPct}%` }}
                ></div>
                <span className="text-[11px] font-semibold text-slate-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Student Subject Requirements */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">4. Student Subject Requirements</h4>
            <p className="text-xs text-slate-500">High demand subjects requested by parents & students</p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {subjectRequirements.map((sub, idx) => {
            const pct = Math.round((sub.count / maxSubject) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span className="font-semibold">{sub.subject}</span>
                  <span className="font-bold font-mono text-slate-900">{sub.count} students</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tutor Location Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">5. Tutor Location Distribution</h4>
            <p className="text-xs text-slate-500">Geographic spread of registered tutors across major cities</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {locationDistribution.map((loc, idx) => {
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <p className="text-xs font-bold text-slate-600 truncate">{loc.location}</p>
                <p className="text-xl font-black text-indigo-600 mt-1 font-mono">{loc.count}</p>
                <p className="text-[10px] text-slate-400">Available Tutors</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Lead Source Analytics Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-slate-900">6. Lead Source Analytics & Distribution</h4>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                Omnichannel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown across WhatsApp Business, Facebook Lead Ads, Instagram DMs, Excel Imports, and Manual Entry
            </p>
          </div>

          {onOpenLeadsInbox && (
            <button
              onClick={() => onOpenLeadsInbox('communication-all')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto flex items-center gap-1"
            >
              Open Social Leads Inbox &rarr;
            </button>
          )}
        </div>

        {/* Lead Source KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {leadSourceStats.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpenLeadsInbox && onOpenLeadsInbox(
                item.key === 'WHATSAPP' ? 'communication-whatsapp' :
                item.key === 'FACEBOOK' ? 'communication-facebook' :
                item.key === 'INSTAGRAM' ? 'communication-instagram' : 'communication-all'
              )}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold group-hover:text-indigo-600">
                  {item.key}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 truncate">{item.source}</p>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{item.count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Inbound Leads</p>
            </div>
          ))}
        </div>

        {/* Proportional Multi-Segment Progress Bar */}
        {(() => {
          const totalLeads = leadSourceStats.reduce((acc, curr) => acc + curr.count, 0) || 1;
          return (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Total Inbound Leads: <strong className="text-slate-900 font-mono">{totalLeads}</strong></span>
                <span>Share by Marketing Channel</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {leadSourceStats.map((item, idx) => {
                  const pct = ((item.count / totalLeads) * 100);
                  if (pct === 0) return null;
                  return (
                    <div
                      key={idx}
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                      className="h-full transition-all duration-500 relative group cursor-pointer"
                      title={`${item.source}: ${item.count} (${pct.toFixed(1)}%)`}
                    ></div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600 pt-1">
                {leadSourceStats.map((item, idx) => {
                  const pct = ((item.count / totalLeads) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.source}: <strong>{item.count}</strong> ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
