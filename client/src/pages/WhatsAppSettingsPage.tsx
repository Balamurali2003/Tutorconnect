import React, { useState, useEffect } from 'react';
import { WhatsAppSettingsConfig } from '../types';
import {
  fetchWhatsAppSettings,
  saveWhatsAppSettings,
  testWhatsAppConnection,
  testWhatsAppWebhook
} from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Settings,
  ShieldCheck,
  Radio,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Terminal,
  Activity,
  Server
} from 'lucide-react';

export const WhatsAppSettingsPage: React.FC = () => {
  const { addToast, setActiveTab } = useApp();
  const [settings, setSettings] = useState<WhatsAppSettingsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [testingHook, setTestingHook] = useState(false);

  const [form, setForm] = useState({
    businessAccountId: '',
    phoneNumberId: '',
    apiVersion: 'v20.0',
    webhookUrl: ''
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppSettings();
      if (res.success) {
        setSettings(res.settings);
        setForm({
          businessAccountId: res.settings.businessAccountId || '',
          phoneNumberId: res.settings.phoneNumberId || '',
          apiVersion: res.settings.apiVersion || 'v20.0',
          webhookUrl: res.settings.webhookUrl || ''
        });
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveWhatsAppSettings(form);
      if (res.success) {
        addToast('success', 'Saved', 'WhatsApp configuration updated successfully.');
        loadSettings();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    try {
      const res = await testWhatsAppConnection();
      if (res.success) {
        addToast('success', 'Connection Verified', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Connection Error', err.message);
    } finally {
      setTestingConn(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingHook(true);
    try {
      const res = await testWhatsAppWebhook({
        testType: 'inbound',
        phoneNumber: '+919942323234',
        message: 'Settings diagnostic webhook test'
      });
      if (res.success) {
        addToast('success', 'Webhook Dispatched', 'Simulated callback processed and logged successfully.');
      }
    } catch (err: any) {
      addToast('error', 'Webhook Error', err.message);
    } finally {
      setTestingHook(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Business API Settings</h2>
            <p className="text-xs text-slate-500">
              Cloud API account parameters, webhook verification, and server security configuration.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          {settings?.connectionStatus || 'ACTIVE'}
        </span>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Zero Credential Exposure Guarantee</span>
          Your Meta <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">WHATSAPP_ACCESS_TOKEN</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">WHATSAPP_APP_SECRET</code> are securely locked in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">server/.env</code> and never transmitted to the browser.
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Meta Cloud API Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Business Account ID</label>
            <input
              type="text"
              value={form.businessAccountId}
              onChange={(e) => setForm({ ...form, businessAccountId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Phone Number ID</label>
            <input
              type="text"
              value={form.phoneNumberId}
              onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">API Version</label>
            <input
              type="text"
              value={form.apiVersion}
              onChange={(e) => setForm({ ...form, apiVersion: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Webhook URL</label>
            <input
              type="text"
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Access Token (Masked)</label>
            <input
              type="text"
              disabled
              value={settings?.maskedAccessToken || '••••••••••••••••••••••••••••••••'}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">App Secret (Masked)</label>
            <input
              type="text"
              disabled
              value={settings?.maskedAppSecret || '••••••••••••••••••••••••••••••••'}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </div>
        </div>

        {/* Timestamps Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Last Webhook Event:</span>
            <span className="font-mono text-slate-700 font-bold">
              {settings?.lastWebhookReceivedAt ? new Date(settings.lastWebhookReceivedAt).toLocaleString() : 'None'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Last Outbound API Request:</span>
            <span className="font-mono text-slate-700 font-bold">
              {settings?.lastApiRequestAt ? new Date(settings.lastApiRequestAt).toLocaleString() : 'None'}
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConn}
              className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{testingConn ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testingHook}
              className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{testingHook ? 'Testing...' : 'Test Webhook'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
