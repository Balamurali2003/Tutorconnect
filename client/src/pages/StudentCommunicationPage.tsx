import React, { useState, useEffect } from 'react';
import { WhatsAppOptIn, WhatsAppHistoryItem, BulkSendResponse } from '../types';
import {
  fetchAllClients,
  bulkSendWhatsAppMessages,
  fetchWhatsAppHistory
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
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  FileText,
  Clock,
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';

interface StudentClient {
  id: string;
  clientId: string;
  name: string;
  role: 'Student' | 'Parent';
  phone: string;
  details: string;
  location: string;
  whatsappOptIn: WhatsAppOptIn;
}

const STUDENT_TEMPLATES = [
  {
    id: 'tmpl-stud-academic',
    name: 'Academic Progress & Evaluation Report',
    category: 'Progress',
    content: 'Hello {{name}},\n\nThis is an academic evaluation update from "CHARITHRA"-Edutech.\n\nYour recent assessment and progress report for {{class}} has been reviewed by your mentor. Keep up the great work!\n\nPlease check your student dashboard for subject-wise notes.\n\nWarm regards,\n"CHARITHRA"-Edutech Academic Team'
  },
  {
    id: 'tmpl-stud-schedule',
    name: 'Class Schedule & Timing Alert',
    category: 'Schedule',
    content: 'Dear {{name}},\n\nReminder for your upcoming live tuition session with "CHARITHRA"-Edutech.\n\nClass: {{class}}\nScheduled Time: 5:30 PM - 7:00 PM\nMode: In-Person / Home Tuition\n\nPlease ensure your study materials are ready for the session.\n\nThank you,\n"CHARITHRA"-Edutech Desk'
  },
  {
    id: 'tmpl-stud-material',
    name: 'New Study Material Published',
    category: 'Academics',
    content: 'Dear {{name}},\n\nNew verified study materials have been uploaded on "CHARITHRA"-Edutech for your class (Class 1 to 12 Hub).\n\nTopic notes, solved worksheets, and revision papers are now available for download in the portal.\n\nHappy Learning,\n"CHARITHRA"-Edutech Study Hub'
  },
  {
    id: 'tmpl-stud-fee',
    name: 'Monthly Tuition Fee Reminder',
    category: 'Finance',
    content: 'Dear {{name}},\n\nThis is a gentle payment reminder from "CHARITHRA"-Edutech regarding your monthly tuition fee.\n\nKindly clear the dues before the 10th of this month for smooth continuation of classes.\n\nFor digital payment receipts, contact administration.\n\nRegards,\n"CHARITHRA"-Edutech Accounts'
  },
  {
    id: 'tmpl-stud-welcome',
    name: 'Welcome to CHARITHRA Platform',
    category: 'Onboarding',
    content: 'Welcome {{name}} to "CHARITHRA"-Edutech – premier educational platform for students!\n\nYour student profile is active. Our expert tutors will guide you from Class 1 through Class 12 with customized coaching.\n\nBest wishes for an outstanding academic journey!\n"CHARITHRA"-Edutech Team'
  }
];

export const StudentCommunicationPage: React.FC = () => {
  const { addToast, setActiveTab } = useApp();

  const [recipients, setRecipients] = useState<StudentClient[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STUDENT' | 'PARENT' | 'PRIMARY' | 'SECONDARY' | 'SENIOR'>('ALL');
  const [search, setSearch] = useState('');

  // Composer
  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkSendResponse | null>(null);

  // History
  const [history, setHistory] = useState<WhatsAppHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAllClients();
      if (res.success && res.clients) {
        // Filter only Students and Parents
        const studentParentList: StudentClient[] = res.clients
          .filter(c => c.role === 'Student' || c.role === 'Parent')
          .map(c => ({
            id: c.id,
            clientId: c.clientId,
            name: c.name,
            role: c.role as 'Student' | 'Parent',
            phone: c.phone,
            details: c.details,
            location: c.location,
            whatsappOptIn: c.whatsappOptIn
          }));
        setRecipients(studentParentList);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to fetch student communication list');
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
    loadData();
    loadHistory();
    setMessage(STUDENT_TEMPLATES[0].content);
    setSelectedTemplateId(STUDENT_TEMPLATES[0].id);
  }, []);

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = STUDENT_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setMessage(tmpl.content);
    }
  };

  // Filtered Recipients
  const filteredRecipients = recipients.filter(c => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.details.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (categoryFilter === 'STUDENT') return c.role === 'Student';
    if (categoryFilter === 'PARENT') return c.role === 'Parent';
    if (categoryFilter === 'PRIMARY') {
      const match = c.details.match(/Class (\d+)/i);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num >= 1 && num <= 5;
    }
    if (categoryFilter === 'SECONDARY') {
      const match = c.details.match(/Class (\d+)/i);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num >= 6 && num <= 10;
    }
    if (categoryFilter === 'SENIOR') {
      const match = c.details.match(/Class (\d+)/i);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num === 11 || num === 12;
    }
    return true;
  });

  const allSelected =
    filteredRecipients.length > 0 &&
    filteredRecipients.every(c => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const currentFilteredIds = new Set(filteredRecipients.map(c => c.id));
      setSelectedIds(prev => prev.filter(id => !currentFilteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredRecipients.map(c => c.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendBroadcast = async () => {
    if (selectedIds.length === 0) {
      addToast('warning', 'Selection Required', 'Please select at least one student or parent to message.');
      return;
    }
    if (!message.trim()) {
      addToast('warning', 'Message Empty', 'Please enter a message or choose a template.');
      return;
    }

    try {
      setIsSending(true);
      setBulkResult(null);

      const selectedClients = recipients.filter(c => selectedIds.includes(c.id));
      const res = await bulkSendWhatsAppMessages({
        recipients: selectedClients.map(c => ({
          id: c.id,
          name: c.name,
          fullName: c.name,
          phone: c.phone,
          role: c.role,
          type: c.role,
          location: c.location,
          whatsappOptIn: c.whatsappOptIn
        })),
        message: message.trim(),
        templateName: STUDENT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || 'Student Notification'
      });

      if (res.success) {
        setBulkResult(res);
        addToast(
          'success',
          'Broadcast Sent',
          `Successfully dispatched to ${res.sent} students & parents via Meta WhatsApp API!`
        );
        setSelectedIds([]);
        loadHistory();
      } else {
        addToast('error', 'Delivery Issue', 'One or more messages failed to dispatch.');
      }
    } catch (err: any) {
      addToast('error', 'Broadcast Error', err.message || 'Failed to send WhatsApp messages.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/50">
              5. Communication Desk
            </span>
            <span className="text-[11px] font-bold text-teal-200 bg-teal-800/40 px-2.5 py-0.5 rounded-full border border-teal-600/30">
              Students & Parents
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-2 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            Communication with Students & Parents
          </h1>
          <p className="text-xs text-emerald-200 mt-1 max-w-2xl leading-relaxed">
            Directly notify students and parents about class schedules, academic updates, study materials (Class 1-12), and fee alerts via Meta WhatsApp Business API.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('whatsapp-connect')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Meta API Connect</span>
          </button>
          <button
            onClick={() => setActiveTab('communication-teachers')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teachers Communication</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Composer on Left, Recipient Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WhatsApp Composer & Templates */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Student Broadcast Composer</h3>
                  <p className="text-[11px] text-slate-500">Targeted WhatsApp communication</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {selectedIds.length} Selected
              </span>
            </div>

            {/* Ready Templates */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Academic Templates
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {STUDENT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleApplyTemplate(t.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selectedTemplateId === t.id
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold truncate">{t.name}</p>
                      <span className="text-[10px] text-slate-400">{t.category}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Message Body <span className="text-slate-400 font-normal">({"{{name}}"} will be personalized)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Compose announcement, academic progress notes, or schedule changes..."
                rows={6}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendBroadcast}
              disabled={isSending || selectedIds.length === 0 || !message.trim()}
              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSending || selectedIds.length === 0 || !message.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting via Meta API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to ({selectedIds.length}) Recipients</span>
                </>
              )}
            </button>

            {/* Broadcast Results Summary */}
            {bulkResult && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Broadcast Report</span>
                  <span className="text-emerald-700 font-mono">
                    {bulkResult.sent}/{bulkResult.total} Sent
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg font-bold border border-emerald-200">
                    {bulkResult.sent} Sent
                  </div>
                  <div className="bg-rose-50 text-rose-800 p-1.5 rounded-lg font-bold border border-rose-200">
                    {bulkResult.failed} Failed
                  </div>
                  <div className="bg-slate-100 text-slate-700 p-1.5 rounded-lg font-bold border border-slate-200">
                    {bulkResult.summary?.skippedNotEligible || 0} Skipped
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Real-World Edutech Delivery</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When Meta WhatsApp credentials are configured in <strong>Meta WhatsApp Connect</strong>, messages are sent in real-time over official Meta Cloud API with template fallback.
            </p>
          </div>
        </div>

        {/* Right Column: Students & Parents Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students, parents, class or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'STUDENT', 'PARENT', 'PRIMARY', 'SECONDARY', 'SENIOR'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCategoryFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                      categoryFilter === tab
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'ALL'
                      ? 'All'
                      : tab === 'STUDENT'
                      ? 'Students'
                      : tab === 'PARENT'
                      ? 'Parents'
                      : tab === 'PRIMARY'
                      ? 'Class 1-5'
                      : tab === 'SECONDARY'
                      ? 'Class 6-10'
                      : 'Class 11-12'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Status Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {allSelected ? 'Deselect Filtered' : 'Select All Filtered'} ({filteredRecipients.length})
                </span>
              </button>

              <span className="text-[11px] font-mono text-slate-500">
                {selectedIds.length} recipient(s) chosen
              </span>
            </div>

            {/* Recipients List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center"></th>
                    <th className="py-2 px-3">Student / Parent</th>
                    <th className="py-2 px-3">Role & Grade</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3 text-center">WhatsApp Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading recipients...
                      </td>
                    </tr>
                  ) : filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students or parents match the search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map(item => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => toggleSelectOne(item.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 inline" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 inline" />
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.location || 'Local'}</p>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.role === 'Student'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {item.role}
                            </span>
                            <span className="text-[11px] text-slate-600 ml-1.5 font-medium">
                              {item.details}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                            {item.phone}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                item.whatsappOptIn === 'YES'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.whatsappOptIn === 'YES' ? 'Opted In' : item.whatsappOptIn}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Broadcast History */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Recent Broadcast Activity
                </h4>
              </div>
              <button
                onClick={loadHistory}
                className="text-[11px] text-slate-500 hover:text-emerald-600 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Refresh Logs
              </button>
            </div>

            {historyLoading ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No broadcast logs recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 6).map(h => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.tutorName || (h as any).name || 'Recipient'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{h.phoneNumber || h.phone}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{h.message}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          h.status === 'SENT' || h.status === 'Sent' || h.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {h.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {h.sentAt ? new Date(h.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunicationPage;
