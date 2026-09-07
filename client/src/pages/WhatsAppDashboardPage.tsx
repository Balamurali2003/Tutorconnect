import React, { useState, useEffect } from 'react';
import { WhatsAppDashboardStats, WhatsAppMessage } from '../types';
import { fetchWhatsAppDashboardStats, testWhatsAppWebhook } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Send,
  CheckCheck,
  Eye,
  AlertTriangle,
  Inbox,
  Clock,
  Calendar,
  Sparkles,
  Layers,
  FileText,
  Users,
  Settings,
  Activity,
  Terminal,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const WhatsAppDashboardPage: React.FC = () => {
  const { setActiveTab, addToast } = useApp();
  const [stats, setStats] = useState<WhatsAppDashboardStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentMessages(res.recentMessages || []);
      }
    } catch (err: any) {
      console.error('Failed to load WhatsApp dashboard stats', err);
      addToast('error', 'Dashboard Error', err.message || 'Failed to fetch WhatsApp statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateInbound = async () => {
    try {
      setSimulating(true);
      const res = await testWhatsAppWebhook({
        testType: 'inbound',
        phoneNumber: '+919942323234',
        message: 'Hello Admin, I have confirmed my schedule for tomorrow.'
      });
      if (res.success) {
        addToast('success', 'Webhook Inbound Simulated', 'Inbound message received and processed into Inbox.');
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Simulation Failed', err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Business API Dashboard</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              {stats?.connectionStatus === 'CONNECTED' ? 'Meta Cloud API Live' : 'Sandbox Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time monitoring, official Cloud API delivery tracking, incoming inquiries, and candidate messaging hub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveTab('whatsapp-inbox')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Inbox className="w-4 h-4" />
            <span>Open WhatsApp Inbox</span>
          </button>
        </div>
      </div>

      {/* Top 8 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Contacts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Contacts</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.totalContacts ?? '—'}</span>
          <span className="text-[10px] text-slate-400 mt-1">Verified Tutors</span>
        </div>

        {/* Card 2: Messages Sent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sent</span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-sky-600">{stats?.messagesSent ?? '—'}</span>
          <span className="text-[10px] text-slate-400 mt-1">Outbound API</span>
        </div>

        {/* Card 3: Delivered */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{stats?.messagesDelivered ?? '—'}</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">✓✓ Recipient Got</span>
        </div>

        {/* Card 4: Read */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Read</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-600">{stats?.messagesRead ?? '—'}</span>
          <span className="text-[10px] text-blue-600 font-semibold mt-1">✓✓ Blue Ticks</span>
        </div>

        {/* Card 5: Failed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Failed</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600">{stats?.messagesFailed ?? 0}</span>
          <span className="text-[10px] text-rose-500 mt-1">Error/Unreachable</span>
        </div>

        {/* Card 6: Incoming */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Incoming</span>
            <Inbox className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-teal-600">{stats?.incomingMessages ?? '—'}</span>
          <span className="text-[10px] text-teal-600 mt-1">Tutor Inquiries</span>
        </div>

        {/* Card 7: Unread */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unread</span>
            <MessageCircle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{stats?.unreadMessages ?? 0}</span>
          <span className="text-[10px] text-amber-600 font-semibold mt-1">Requires Reply</span>
        </div>

        {/* Card 8: Today's Messages */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today</span>
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-2xl font-black text-violet-600">{stats?.todayMessages ?? '—'}</span>
          <span className="text-[10px] text-slate-400 mt-1">Activity Volume</span>
        </div>
      </div>

      {/* Quick Access Control Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('whatsapp-inbox')}
          className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base">Interactive Inbox</h4>
          <p className="text-xs text-white/80 mt-1">Two-way live WhatsApp chat with candidates and teachers.</p>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp-messaging')}
          className="p-5 bg-gradient-to-br from-indigo-600 to-primary-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base">Bulk WhatsApp Broadcast</h4>
          <p className="text-xs text-white/80 mt-1">Multi-tutor campaign with opt-in verification and delivery logs.</p>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp-templates')}
          className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base">Message Templates</h4>
          <p className="text-xs text-white/80 mt-1">Approved templates for interviews, demos, approvals & notices.</p>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp-settings')}
          className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h4 className="font-extrabold text-base">API Settings & Webhooks</h4>
          <p className="text-xs text-white/80 mt-1">Manage credentials, test webhooks, and check system health.</p>
        </button>
      </div>

      {/* Two Column Section: Recent Stream & Health Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Messages Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Message Deliveries</h3>
              <p className="text-xs text-slate-500">Live outbound and inbound WhatsApp communications stream</p>
            </div>
            <button
              onClick={() => setActiveTab('whatsapp-history')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View Full History →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Direction</th>
                  <th className="py-2.5">Recipient / Sender</th>
                  <th className="py-2.5">Message / Template</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No WhatsApp messages on record yet.
                    </td>
                  </tr>
                ) : (
                  recentMessages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.direction === 'INBOUND'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.direction === 'INBOUND' ? '← INBOUND' : '→ OUTBOUND'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-slate-900 whitespace-nowrap">
                        {m.phoneNumber}
                      </td>
                      <td className="py-3 max-w-[200px] truncate text-slate-600">
                        {m.templateName ? `[${m.templateName}] ` : ''}
                        {m.messageText}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'READ'
                              ? 'bg-blue-100 text-blue-800'
                              : m.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'SENT'
                              ? 'bg-sky-100 text-sky-800'
                              : m.status === 'RECEIVED'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: System Health & Webhook Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Integration Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold">API Environment</span>
                <span className="font-bold text-slate-900">
                  {stats?.connectionStatus === 'CONNECTED' ? 'Meta Production Cloud' : 'Developer Sandbox'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold">Webhook Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  {stats?.webhookStatus || 'ACTIVE'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold">Last Webhook Received</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {stats?.lastWebhookReceivedAt
                    ? new Date(stats.lastWebhookReceivedAt).toLocaleTimeString()
                    : 'Awaiting events'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold">Security Signature</span>
                <span className="font-bold text-slate-900">HMAC SHA-256 Validated</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={handleSimulateInbound}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{simulating ? 'Simulating...' : 'Test Inbound WhatsApp Webhook'}</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp-test')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Open Diagnostic Testing Center</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
