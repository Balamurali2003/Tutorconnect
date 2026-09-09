import React, { useState, useEffect } from 'react';
import { WhatsAppOptIn, WhatsAppHistoryItem, BulkSendResponse } from '../types';
import {
  fetchAllClients,
  bulkSendWhatsAppMessages,
  fetchWhatsAppHistory,
  fetchWhatsAppTemplates
} from '../services/api';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Send,
  Users,
  Search,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  Phone,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  FileText,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ClientItem {
  id: string;
  clientId: string;
  name: string;
  role: 'Student' | 'Parent' | 'Tutor';
  phone: string;
  details: string;
  location: string;
  whatsappOptIn: WhatsAppOptIn;
}

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-academic-update',
    name: 'Academic Progress Update',
    category: 'Students & Parents',
    content: 'Hello {{name}},\n\nThis is an academic progress update from CHARITHRA Educational Platform.\n\nWe are pleased to inform you that the recent evaluation for {{class}} has been successfully recorded. Please review the updated performance insights on your student portal.\n\nWarm regards,\nCHARITHRA Academic Team'
  },
  {
    id: 'tmpl-class-schedule',
    name: 'Class Schedule Announcement',
    category: 'General Broadcast',
    content: 'Dear {{name}},\n\nPlease note your upcoming class schedule with CHARITHRA Educational Platform.\n\nSubject: {{subject}}\nTiming: 5:00 PM - 7:00 PM\nLocation: {{location}}\n\nPlease ensure you join on time.\n\nThank you,\nCHARITHRA Operations'
  },
  {
    id: 'tmpl-fee-reminder',
    name: 'Tuition Fee Payment Reminder',
    category: 'Parents',
    content: 'Dear {{name}},\n\nThis is a friendly reminder from CHARITHRA Educational Platform regarding the monthly tuition fee invoice.\n\nKindly complete the payment before the due date to ensure uninterrupted classes.\n\nFor any queries, please reach out to our accounts desk.\n\nThank you,\nCHARITHRA Finance Desk'
  },
  {
    id: 'tmpl-welcome-charithra',
    name: 'Welcome to CHARITHRA Platform',
    category: 'All Clients',
    content: 'Welcome {{name}} to CHARITHRA – an educational platform for the students!\n\nWe are thrilled to accompany you on your learning journey. Dedicated educators and customized coaching are now active on your account.\n\nBest wishes,\nCHARITHRA Team'
  }
];

export const WhatsAppBulkMessagingPage: React.FC = () => {
  const { addToast } = useApp();

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Student' | 'Parent' | 'Tutor'>('ALL');
  const [search, setSearch] = useState('');

  // Composer
  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkSendResponse | null>(null);

  // History
  const [history, setHistory] = useState<WhatsAppHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetchAllClients();
      if (res.success) {
        setClients(res.clients || []);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to fetch client list');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetchWhatsAppHistory();
      setHistory((res.history || []).slice(0, 15));
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    loadHistory();
    // Default template message
    setMessage(DEFAULT_TEMPLATES[0].content);
    setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
  }, []);

  // Filtered client list
  const filteredClients = clients.filter((c) => {
    const matchesRole = roleFilter === 'ALL' || c.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.details.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = DEFAULT_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setMessage(tmpl.content);
    }
  };

  const handleInsertVariable = (variable: string) => {
    setMessage((prev) => prev + ` ${variable}`);
  };

  const handleSendBulk = async () => {
    if (selectedIds.length === 0) {
      addToast('info', 'No Recipients Selected', 'Please select at least one client to message.');
      return;
    }
    if (!message.trim()) {
      addToast('error', 'Empty Message', 'Please enter a message or pick a template.');
      return;
    }

    const selectedClients = clients.filter((c) => selectedIds.includes(c.id));
    const recipientPayload = selectedClients.map((c) => ({
      id: c.id,
      name: c.name,
      fullName: c.name,
      phone: c.phone,
      type: c.role,
      role: c.role,
      location: c.location,
      whatsappOptIn: c.whatsappOptIn
    }));

    setIsSending(true);
    setBulkResult(null);

    try {
      const res = await bulkSendWhatsAppMessages({
        recipients: recipientPayload,
        message,
        templateName: DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Client Broadcast'
      });

      setBulkResult(res);
      addToast(
        res.sent > 0 ? 'success' : 'warning',
        'Bulk Dispatch Completed',
        `Dispatched to ${res.sent} of ${res.total} selected clients.`
      );
      loadHistory();
    } catch (err: any) {
      addToast('error', 'Dispatch Error', err.message || 'Failed to dispatch bulk messages');
    } finally {
      setIsSending(false);
    }
  };

  // Live preview with sample client
  const previewClient = clients.find((c) => selectedIds.includes(c.id)) || clients[0] || {
    name: 'Priya Sharma',
    phone: '+919876543210',
    details: 'Class 10',
    location: 'Tirunelveli',
    role: 'Student'
  };

  const previewMessage = message
    .replace(/{{name}}/g, previewClient.name)
    .replace(/{{client_name}}/g, previewClient.name)
    .replace(/{{student_name}}/g, previewClient.name)
    .replace(/{{parent_name}}/g, previewClient.name)
    .replace(/{{class}}/g, '10th Standard')
    .replace(/{{subject}}/g, 'Mathematics & Science')
    .replace(/{{location}}/g, previewClient.location || 'CHARITHRA Learning Centre')
    .replace(/{{phone_number}}/g, previewClient.phone)
    .replace(/{{centre_name}}/g, 'CHARITHRA Educational Platform');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
              CHARITHRA Client Communication
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Meta Cloud API Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Send className="w-7 h-7 text-sky-400 shrink-0" />
            <span>Send Bulk WhatsApp Messages to Clients</span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
            Broadcast personalized WhatsApp updates, class announcements, academic reports, and tuition fee notices to Students, Parents, and Tutors simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-sky-200 block">Selected Clients</span>
            <span className="text-2xl font-black text-white font-mono">{selectedIds.length}</span>
          </div>
        </div>
      </div>

      {/* Bulk Result Banner */}
      {bulkResult && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Bulk Dispatch Report Summary</span>
            </h3>
            <button
              onClick={() => setBulkResult(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-semibold text-[11px]">Total Selected</span>
              <span className="text-xl font-black text-slate-900 font-mono">{bulkResult.total}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 block font-semibold text-[11px]">Successfully Sent</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{bulkResult.sent}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-rose-700 block font-semibold text-[11px]">Failed</span>
              <span className="text-xl font-black text-rose-700 font-mono">{bulkResult.failed}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-amber-700 block font-semibold text-[11px]">Skipped / Invalid</span>
              <span className="text-xl font-black text-amber-700 font-mono">
                {(bulkResult.skipped || 0) + (bulkResult.invalid || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Selection & Filtering (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            {/* Audience Segment Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Clients', icon: <Users className="w-3.5 h-3.5" /> },
                { id: 'Student', label: 'Students', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                { id: 'Parent', label: 'Parents', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
                { id: 'Tutor', label: 'Tutors', icon: <Phone className="w-3.5 h-3.5" /> }
              ].map((tab) => {
                const count = tab.id === 'ALL'
                  ? clients.length
                  : clients.filter((c) => c.role === tab.id).length;
                const active = roleFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setRoleFilter(tab.id as any);
                      setSelectedIds([]);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      active ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Selection Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client name, phone, class, location..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {selectedIds.length === filteredClients.length && filteredClients.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {selectedIds.length === filteredClients.length && filteredClients.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </button>
              </div>
            </div>

            {/* Clients Table / List */}
            <div className="border border-slate-200/70 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                  Loading clients...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                  No matching clients found.
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isChecked = selectedIds.includes(client.id);
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleToggleSelect(client.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              {client.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              client.role === 'Student'
                                ? 'bg-indigo-100 text-indigo-700'
                                : client.role === 'Parent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {client.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {client.details}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-slate-700 block">
                          {client.phone}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          WhatsApp Opt-In: Yes
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredClients.length} clients</span>
              <span className="font-bold text-indigo-600 font-mono">
                {selectedIds.length} recipient{selectedIds.length === 1 ? '' : 's'} selected
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Message Composer & Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Compose Bulk Broadcast</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {selectedIds.length} Recipient{selectedIds.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Quick Campaign Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
              >
                <option value="">Custom Message (No Template)</option>
                {DEFAULT_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} ({tmpl.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Variable insertion tags */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                Click to Insert Dynamic Tag
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{{name}}', label: 'Client Name' },
                  { tag: '{{class}}', label: 'Class' },
                  { tag: '{{subject}}', label: 'Subject' },
                  { tag: '{{centre_name}}', label: 'CHARITHRA' },
                  { tag: '{{location}}', label: 'Location' }
                ].map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertVariable(v.tag)}
                    className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200/60 transition-colors"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Message Content</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {message.length} characters
                </span>
              </div>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your WhatsApp announcement or reminder..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Live WhatsApp Chat Preview (Sample: {previewClient.name})
              </span>
              <div className="p-4 rounded-2xl bg-[#0b141a] text-slate-100 text-xs shadow-inner">
                <div className="max-w-[90%] bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none shadow-md space-y-1 ml-auto">
                  <p className="whitespace-pre-wrap leading-relaxed text-[12px] font-sans">
                    {previewMessage}
                  </p>
                  <div className="text-[9px] text-emerald-200/70 text-right flex items-center justify-end gap-1 font-mono mt-1">
                    <span>12:00 PM</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendBulk}
              disabled={isSending || selectedIds.length === 0}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/25 transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSending
                  ? `Dispatching to ${selectedIds.length} Clients...`
                  : `Send Bulk Message (${selectedIds.length} Clients)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Delivery History */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Recent WhatsApp Client Broadcast History
              </h3>
              <p className="text-xs text-slate-400">
                Log of individual and bulk dispatches sent from CHARITHRA
              </p>
            </div>
          </div>

          <button
            onClick={loadHistory}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            Refresh History
          </button>
        </div>

        {historyLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No broadcast history found yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.slice(0, 10).map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{item.tutorName || 'Client'}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{item.phoneNumber || item.phone}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {item.templateName || 'Direct Message'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-1 max-w-xl">
                    {item.message}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    item.status === 'Sent' || item.status === 'SENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
