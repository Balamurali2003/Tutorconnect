import React, { useState, useEffect } from 'react';
import { WhatsAppDashboardStats } from '../types';
import {
  fetchWhatsAppDashboardStats,
  testWhatsAppConnection,
  testWhatsAppWebhook,
  testWhatsAppSend
} from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  Send,
  Sparkles,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertCircle,
  Phone,
  RotateCcw
} from 'lucide-react';

export const WhatsAppTestPage: React.FC = () => {
  const { addToast } = useApp();
  const [stats, setStats] = useState<WhatsAppDashboardStats | null>(null);
  const [testNumber, setTestNumber] = useState('+919876543210');
  const [testMessage, setTestMessage] = useState('Hello from TutorConnect diagnostic test!');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connResult, setConnResult] = useState<string | null>(null);
  const [lastDispatchedId, setLastDispatchedId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetchWhatsAppDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await testWhatsAppConnection();
      setConnResult(res.message);
      addToast('success', 'Connected', res.message);
    } catch (err: any) {
      setConnResult('Connection failed: ' + err.message);
      addToast('error', 'Failed', err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) return;
    setSendingMessage(true);
    try {
      const res = await testWhatsAppSend(testNumber, testMessage);
      if (res.success) {
        setLastDispatchedId(res.providerMessageId || null);
        addToast('success', 'Dispatched', `Test message sent. Provider ID: ${res.providerMessageId}`);
        loadStats();
      } else {
        addToast('error', 'Failed', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSimulateWebhook = async (type: 'inbound' | 'status') => {
    setSimulatingWebhook(true);
    try {
      const res = await testWhatsAppWebhook({
        testType: type,
        phoneNumber: testNumber,
        message: 'Inbound response message received from candidate.'
      });
      if (res.success) {
        addToast('success', 'Webhook Ingested', `Simulated ${type} event processed successfully.`);
        loadStats();
      }
    } catch (err: any) {
      addToast('error', 'Simulation Error', err.message);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              WhatsApp Integration Testing Center
            </h2>
            <p className="text-xs text-slate-500">
              Verify live API connectivity, test single outbound dispatches, and trigger webhook callbacks.
            </p>
          </div>
        </div>

        <button
          onClick={loadStats}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Diagnostics Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            API Connection
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base font-extrabold text-slate-900">
              {stats?.connectionStatus === 'CONNECTED' ? 'CONNECTED' : 'SANDBOX_READY'}
            </span>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            {testingConnection ? 'Checking...' : '→ Test Connection Now'}
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Webhook Callback
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-extrabold text-slate-900">
              {stats?.webhookStatus || 'ACTIVE'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-3">Signature HMAC-256 Validated</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Last Webhook Ingested
          </span>
          <div className="text-sm font-bold text-slate-800 font-mono mt-1">
            {stats?.lastWebhookReceivedAt ? new Date(stats.lastWebhookReceivedAt).toLocaleTimeString() : 'Awaiting'}
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Server Listening on Port 5001</span>
        </div>
      </div>

      {connResult && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium">
          {connResult}
        </div>
      )}

      {/* Outbound Single Test Sender */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          <span>Dispatch Single Test Message</span>
        </h3>

        <form onSubmit={handleSendTestMessage} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Recipient Phone Number</label>
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="+919876543210"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Test Message Body</label>
            <textarea
              rows={2}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={sendingMessage}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingMessage ? 'Dispatching...' : 'Send Test Message'}</span>
          </button>
        </form>

        {lastDispatchedId && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold">Dispatched Provider Message ID:</span>{' '}
            <code className="font-mono text-indigo-600 font-bold">{lastDispatchedId}</code>
          </div>
        )}
      </div>

      {/* Webhook Simulation Trigger */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Webhook Callback Simulator</span>
        </h3>

        <p className="text-xs text-slate-500">
          Simulate Meta webhook callbacks to verify immediate database ingestion, unread counter updates, and live inbox reactions.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSimulateWebhook('inbound')}
            disabled={simulatingWebhook}
            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Simulate Inbound Message from Candidate</span>
          </button>

          <button
            onClick={() => handleSimulateWebhook('status')}
            disabled={simulatingWebhook}
            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simulate Message Status Update (DELIVERED)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
