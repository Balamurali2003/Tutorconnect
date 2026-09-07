import React, { useState, useEffect } from 'react';
import { WhatsAppApiLog } from '../types';
import { fetchWhatsAppApiLogs } from '../services/api';
import { useApp } from '../context/AppContext';
import { Terminal, Search, Filter, RotateCcw } from 'lucide-react';

export const WhatsAppApiLogsPage: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<WhatsAppApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestTypeFilter, setRequestTypeFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppApiLogs({
        requestType: requestTypeFilter !== 'ALL' ? requestTypeFilter : undefined,
        result: resultFilter !== 'ALL' ? resultFilter : undefined
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load API logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [requestTypeFilter, resultFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp API Dispatch Logs</h2>
            <p className="text-xs text-slate-500">
              Audit trail of all outbound HTTP transmissions to the Meta WhatsApp Business Cloud API.
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-600">Request Type:</span>
          <select
            value={requestTypeFilter}
            onChange={(e) => setRequestTypeFilter(e.target.value)}
            className="font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="SEND_TEXT">SEND_TEXT</option>
            <option value="SEND_TEMPLATE">SEND_TEMPLATE</option>
            <option value="BULK_SEND">BULK_SEND</option>
            <option value="TEST_SEND">TEST_SEND</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Result:</span>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Recipient / Tutor</th>
                <th className="py-3 px-4">Provider Message ID</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading API logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No API logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{l.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                        {l.requestType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{l.tutorName || '—'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{l.providerMessageId || '—'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">{l.httpStatus}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          l.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.result}
                      </span>
                    </td>
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
