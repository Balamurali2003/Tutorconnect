import React, { useState, useEffect } from 'react';
import { WhatsAppWebhookLog } from '../types';
import { fetchWhatsAppWebhookLogs } from '../services/api';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, Filter, RotateCcw, Activity } from 'lucide-react';

export const WhatsAppWebhookLogsPage: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<WhatsAppWebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppWebhookLogs({
        eventType: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
        search
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [eventTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Webhook Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Live audit record of incoming Meta Cloud API deliveries, delivery receipts, and verification calls.
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search logs by phone number, message ID or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Event Type:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
          >
            <option value="ALL">All Events</option>
            <option value="message_status">Message Status Callbacks</option>
            <option value="inbound_message">Inbound Messages</option>
            <option value="verification">Verification Challenges</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Provider Message ID</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Summary / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading webhook logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No webhook logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                        {log.eventType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.providerMessageId || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{log.phoneNumber || '—'}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          log.processingStatus === 'Processed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.processingStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-md truncate">{log.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
