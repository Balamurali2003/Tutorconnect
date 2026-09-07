import React, { useState, useEffect } from 'react';
import { WhatsAppHistoryItem } from '../types';
import { fetchWhatsAppHistory } from '../services/api';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import {
  History,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Eye,
  FileText
} from 'lucide-react';

export const WhatsAppHistoryPage: React.FC = () => {
  const { addToast, refreshTrigger } = useApp();

  const [history, setHistory] = useState<WhatsAppHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<WhatsAppHistoryItem | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await fetchWhatsAppHistory(params);
      setHistory(res.history || []);
    } catch (err: any) {
      addToast('error', 'Failed to load history', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search, statusFilter, refreshTrigger]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">WhatsApp Communication History</h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Audit log of all individual and bulk WhatsApp messages dispatched to educators
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl">
          Total Dispatched: {history.length}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutor, phone, or message..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Tutor</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Template</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Sent By</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No communication history records found.
                  </td>
                </tr>
              ) : (
                history.map((h) => {
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(h.date)}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {h.tutorName}
                      </td>

                      <td className="py-3 px-4 text-xs font-mono font-medium text-emerald-700 whitespace-nowrap">
                        {h.phone}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                          {h.templateName || 'Direct Message'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={h.message}>
                        {h.message}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            h.status === 'Sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.status === 'Failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {h.status === 'Sent' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{h.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {h.sentBy || 'Admin'}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedItem(h)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Full Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`WhatsApp Message - ${selectedItem.tutorName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Recipient</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedItem.tutorName}</p>
                <p className="font-mono text-emerald-700 mt-0.5">{selectedItem.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Template & Date</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedItem.templateName}</p>
                <p className="font-mono text-slate-500 mt-0.5">{formatDate(selectedItem.date)}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-600 mb-1">Full Message Content</p>
              <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-amber-900/10 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedItem.message}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
