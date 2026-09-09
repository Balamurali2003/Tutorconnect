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
  ExternalLink,
  Server,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  HelpCircle,
  Globe,
  Activity,
  MessageCircle,
  PhoneCall
} from 'lucide-react';

export const MetaWhatsAppConnectPage: React.FC = () => {
  const { addToast } = useApp();
  const [settings, setSettings] = useState<WhatsAppSettingsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [testingHook, setTestingHook] = useState(false);

  // Form state
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [apiVersion, setApiVersion] = useState('v20.0');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('tutorconnect_meta_verify_token_2026');
  const [accessToken, setAccessToken] = useState('');
  const [appSecret, setAppSecret] = useState('');

  // Visibility toggles
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Connection result info
  const [connectionDetails, setConnectionDetails] = useState<{
    status: string;
    message: string;
    verifiedName?: string;
    displayPhoneNumber?: string;
  } | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppSettings();
      if (res.success) {
        setSettings(res.settings);
        setBusinessAccountId(res.settings.businessAccountId || '');
        setPhoneNumberId(res.settings.phoneNumberId || '');
        setApiVersion(res.settings.apiVersion || 'v20.0');
        setWebhookUrl(res.settings.webhookUrl || `${window.location.origin}/api/webhooks/whatsapp`);
        setVerifyToken(res.settings.verifyToken || 'tutorconnect_meta_verify_token_2026');
        if (res.settings.connectionStatus === 'CONNECTED') {
          setConnectionDetails({
            status: 'CONNECTED',
            message: 'Active and verified with Meta Graph API',
            verifiedName: res.settings.verifiedName || undefined,
            displayPhoneNumber: res.settings.displayPhoneNumber || undefined
          });
        }
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

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
    addToast('info', 'Copied', 'Copied to clipboard');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<WhatsAppSettingsConfig> = {
        businessAccountId,
        phoneNumberId,
        apiVersion,
        webhookUrl,
        verifyToken
      };
      if (accessToken) payload.accessToken = accessToken;
      if (appSecret) payload.appSecret = appSecret;

      const res = await saveWhatsAppSettings(payload);
      if (res.success) {
        addToast('success', 'Saved', 'Meta WhatsApp configuration updated successfully.');
        setAccessToken('');
        setAppSecret('');
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
        setConnectionDetails({
          status: res.status,
          message: res.message,
          verifiedName: res.meta?.verified_name,
          displayPhoneNumber: res.meta?.display_phone_number
        });
        addToast('success', 'Connection Verified', res.message);
        loadSettings();
      } else {
        setConnectionDetails({
          status: 'ERROR',
          message: res.message || 'Meta connection test rejected'
        });
        addToast('error', 'Connection Error', res.message);
      }
    } catch (err: any) {
      setConnectionDetails({
        status: 'ERROR',
        message: err.message || 'Failed to connect to Meta Graph API'
      });
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
        message: 'Meta WhatsApp diagnostic webhook test'
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

  const isConnected = settings?.connectionStatus === 'CONNECTED' || connectionDetails?.status === 'CONNECTED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner with Meta for Developers Action */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              CHARITHRA Meta Integration
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              {isConnected ? 'META CONNECTED' : 'SANDBOX / SETUP'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-emerald-400 shrink-0" />
            <span>Connect WhatsApp with Meta for Developers</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Configure your official WhatsApp Business Cloud API credentials directly from Meta for Developers to broadcast bulk messages and manage client communications.
          </p>
        </div>

        {/* Action button to open Meta for Developers */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-emerald-50 transition-all active:scale-95 text-center"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Open Meta for Developers</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Connection Status Card */}
      {connectionDetails && (
        <div className={`p-5 rounded-2xl border transition-all ${
          isConnected
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isConnected ? 'Meta WhatsApp Cloud API Connected' : 'Meta WhatsApp Sandbox Mode Active'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">{connectionDetails.message}</p>
                {(connectionDetails.verifiedName || connectionDetails.displayPhoneNumber) && (
                  <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono">
                    {connectionDetails.verifiedName && (
                      <span className="bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                        Verified Name: {connectionDetails.verifiedName}
                      </span>
                    )}
                    {connectionDetails.displayPhoneNumber && (
                      <span className="bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                        Phone: {connectionDetails.displayPhoneNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testingConn}
              className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
            >
              {testingConn ? 'Verifying...' : 'Re-verify'}
            </button>
          </div>
        </div>
      )}

      {/* 4-Step Quick Setup Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>How to connect with 'Meta for Developers'</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
            <h5 className="font-bold text-slate-800">Go to Meta Developers</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Visit <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">developers.facebook.com</a> and click <strong>Create App</strong> or open your existing App.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
            <h5 className="font-bold text-slate-800">Add WhatsApp</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              In your App dashboard, add the <strong>WhatsApp</strong> product to unlock Cloud API access.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
            <h5 className="font-bold text-slate-800">Copy API Credentials</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Under <strong>WhatsApp &gt; API Setup</strong>, copy your <strong>Phone Number ID</strong>, <strong>Business Account ID</strong>, and <strong>Access Token</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
            <h5 className="font-bold text-slate-800">Paste &amp; Connect</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Paste credentials in the form below and click <strong>Save &amp; Test Connection</strong> to establish live connectivity.
            </p>
          </div>
        </div>
      </div>

      {/* Meta Credentials Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Meta WhatsApp Cloud API Credentials
            </h3>
            <p className="text-xs text-slate-500">
              Live configuration parameters stored securely in backend database and environment
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Meta API</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Phone Number ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                <span>Phone Number ID <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">From Meta API Setup</span>
            </div>
            <input
              type="text"
              required
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g. 109283746501928"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs transition-all"
            />
          </div>

          {/* Business Account ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>WhatsApp Business Account ID <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">WABA ID</span>
            </div>
            <input
              type="text"
              required
              value={businessAccountId}
              onChange={(e) => setBusinessAccountId(e.target.value)}
              placeholder="e.g. 192837465019283"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs transition-all"
            />
          </div>

          {/* Meta Access Token */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>Meta Access Token (Temporary or System User Permanent Token)</span>
              </label>
              {settings?.hasToken && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Active Token Saved ({settings.maskedAccessToken})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={settings?.hasToken ? 'Enter new token to overwrite existing saved token...' : 'Paste EAAG... Meta Access Token from Meta API Setup'}
                className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For continuous production delivery, generate a Permanent System User Token with <code className="bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_messaging</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_management</code> permissions in Meta Business Manager.
            </p>
          </div>

          {/* App Secret */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Meta App Secret (for Webhook Signature Validation)</span>
              </label>
              {settings?.hasSecret && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Saved ({settings.maskedAppSecret})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder={settings?.hasSecret ? 'Enter new secret to update...' : 'Paste App Secret from App Settings > Basic'}
                className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showSecret ? 'Hide secret' : 'Show secret'}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* API Version */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Graph API Version</label>
            <input
              type="text"
              value={apiVersion}
              onChange={(e) => setApiVersion(e.target.value)}
              placeholder="v20.0"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs"
            />
          </div>

          {/* Webhook Callback URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 block">Webhook Callback URL</label>
              <button
                type="button"
                onClick={() => handleCopy(webhookUrl, 'webhookUrl')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copiedField === 'webhookUrl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'webhookUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs"
            />
          </div>

          {/* Verify Token */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 block">Webhook Verify Token</label>
              <button
                type="button"
                onClick={() => handleCopy(verifyToken, 'verifyToken')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copiedField === 'verifyToken' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'verifyToken' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConn}
              className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/80 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Server className="w-4 h-4" />
              <span>{testingConn ? 'Validating with Meta Graph API...' : 'Test Meta API Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testingHook}
              className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{testingHook ? 'Testing Webhook...' : 'Test Inbound Callback'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Meta Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
