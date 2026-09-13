import React, { useState, useEffect } from 'react';
import { SocialLead, LeadSource } from '../types';
import {
  fetchLeads,
  convertLead,
  linkLead,
  simulateInboundLead,
  createManualLead,
  deleteLead
} from '../services/api';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  Plus,
  Phone,
  Mail,
  Share2,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Trash2,
  Link as LinkIcon,
  Globe
} from 'lucide-react';

interface SocialLeadsInboxPageProps {
  initialSource?: 'ALL' | 'WEBSITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM';
}

export const SocialLeadsInboxPage: React.FC<SocialLeadsInboxPageProps> = ({
  initialSource = 'ALL'
}) => {
  const { addToast, refreshTrigger, triggerRefresh, setSelectedTutorId } = useApp();

  const [activeSource, setActiveSource] = useState<'ALL' | 'WEBSITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM'>(initialSource);
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedLead, setSelectedLead] = useState<SocialLead | null>(null);
  const [convertingLead, setConvertingLead] = useState<{ lead: SocialLead; targetType: 'TUTOR' | 'STUDENT' } | null>(null);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [manualLeadModalOpen, setManualLeadModalOpen] = useState(false);
  const [linkingLead, setLinkingLead] = useState<SocialLead | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Conversion Form State
  const [convertSubjects, setConvertSubjects] = useState('');
  const [convertExp, setConvertExp] = useState('');
  const [convertClass, setConvertClass] = useState('');

  // Simulation Form State
  const [simChannel, setSimChannel] = useState<'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM'>('WHATSAPP');
  const [simName, setSimName] = useState('Priya S');
  const [simPhone, setSimPhone] = useState('+919876543210');
  const [simEmail, setSimEmail] = useState('priya.tutor@example.com');
  const [simMessage, setSimMessage] = useState('Hello! I am looking for a physics home tutor for my 11th standard son in Tirunelveli.');
  const [simSubjects, setSimSubjects] = useState('Physics, Mathematics');
  const [simExperience, setSimExperience] = useState('4 years');

  // Manual Lead Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    leadSource: 'MANUAL_ENTRY' as LeadSource,
    message: '',
    subjects: 'Mathematics',
    experience: '1-2 years'
  });

  // Link Form State
  const [linkTargetType, setLinkTargetType] = useState<'TUTOR' | 'STUDENT'>('TUTOR');
  const [linkTargetId, setLinkTargetId] = useState('');

  useEffect(() => {
    setActiveSource(initialSource);
  }, [initialSource]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeSource !== 'ALL') params.source = activeSource;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await fetchLeads(params);
      setLeads(res.leads || []);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [activeSource, statusFilter, refreshTrigger]);

  const filteredLeads = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phoneNumber && l.phoneNumber.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q)) ||
      (l.campaignName && l.campaignName.toLowerCase().includes(q))
    );
  });

  const webCount = leads.filter((l) => l.leadSource === 'WEBSITE').length;
  const waCount = leads.filter((l) => l.leadSource === 'WHATSAPP').length;
  const fbCount = leads.filter((l) => l.leadSource === 'FACEBOOK').length;
  const igCount = leads.filter((l) => l.leadSource === 'INSTAGRAM').length;

  const handleOpenConvert = (lead: SocialLead, targetType: 'TUTOR' | 'STUDENT') => {
    setConvertingLead({ lead, targetType });
    setConvertSubjects(lead.subjects ? lead.subjects.join(', ') : 'Mathematics, Science');
    setConvertExp(lead.experience || '2 years');
    setConvertClass('10th Standard');
  };

  const handleExecuteConvert = async () => {
    if (!convertingLead) return;
    try {
      setActionLoading(true);
      const { lead, targetType } = convertingLead;
      const subjectsArr = convertSubjects.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await convertLead(lead.id, {
        targetType,
        fullName: lead.name,
        phoneNumber: lead.phoneNumber,
        email: lead.email,
        subjects: subjectsArr,
        class: convertClass,
        experience: convertExp
      });

      addToast(
        'success',
        targetType === 'TUTOR' ? 'Tutor Created!' : 'Student Created!',
        res.message || `Lead converted to ${targetType} successfully.`
      );

      setConvertingLead(null);
      setSelectedLead(null);
      triggerRefresh();
      loadLeads();

      if (targetType === 'TUTOR' && res.tutor) {
        setSelectedTutorId(res.tutor.id);
      }
    } catch (err: any) {
      addToast('error', 'Conversion Failed', err.message || 'Could not convert lead');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteLink = async () => {
    if (!linkingLead || !linkTargetId) return;
    try {
      setActionLoading(true);
      await linkLead(linkingLead.id, linkTargetType, linkTargetId.trim());
      addToast('success', 'Lead Linked', `Lead linked to ${linkTargetType} ${linkTargetId}`);
      setLinkingLead(null);
      triggerRefresh();
      loadLeads();
    } catch (err: any) {
      addToast('error', 'Linking Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteSimulate = async () => {
    try {
      setActionLoading(true);
      const subjectsArr = simSubjects.split(',').map((s) => s.trim()).filter(Boolean);
      await simulateInboundLead({
        channel: simChannel,
        name: simName,
        phone: simPhone,
        email: simEmail,
        message: simMessage,
        subjects: subjectsArr,
        experience: simExperience,
        campaignName: simChannel === 'WHATSAPP' ? 'Direct WhatsApp Inquiry' : simChannel === 'FACEBOOK' ? 'TEACHERS WANTED' : 'Instagram Story Ad'
      });

      addToast(
        'success',
        `New ${simChannel} Lead Ingested`,
        `Simulated webhook received from ${simName} (${simPhone})`
      );

      setSimulateModalOpen(false);
      triggerRefresh();
      loadLeads();
    } catch (err: any) {
      addToast('error', 'Simulation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phoneNumber) {
      addToast('error', 'Missing Information', 'Name and Phone Number are required.');
      return;
    }
    try {
      setActionLoading(true);
      const subjectsArr = manualForm.subjects.split(',').map((s) => s.trim()).filter(Boolean);
      await createManualLead({
        ...manualForm,
        subjects: subjectsArr
      });
      addToast('success', 'Lead Created', `Manual lead recorded for ${manualForm.name}`);
      setManualLeadModalOpen(false);
      setManualForm({
        name: '',
        phoneNumber: '',
        email: '',
        leadSource: 'MANUAL_ENTRY',
        message: '',
        subjects: 'Mathematics',
        experience: '1-2 years'
      });
      triggerRefresh();
      loadLeads();
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      addToast('info', 'Lead Deleted', 'Lead removed successfully.');
      triggerRefresh();
      loadLeads();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case 'WEBSITE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            🌐 Website
          </span>
        );
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            WhatsApp
          </span>
        );
      case 'FACEBOOK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Facebook Ads
          </span>
        );
      case 'INSTAGRAM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Instagram
          </span>
        );
      case 'EXCEL_IMPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Excel Import
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Manual
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_LEAD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            NEW LEAD
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> CONVERTED
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            CONTACTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl tracking-tight">Social Media & WhatsApp Leads Inbox</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
                {leads.length} Active Leads
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Consolidated real-time omnichannel inbox capturing inbound messages from WhatsApp Business Cloud API, Facebook Lead Ads, and Instagram DMs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={() => setSimulateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>[ + Simulate Inbound Lead ]</span>
          </button>
          <button
            onClick={() => setManualLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual</span>
          </button>
          <button
            onClick={loadLeads}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveSource('ALL')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeSource === 'ALL'
              ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
            <span>All Leads</span>
            <Share2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{leads.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Consolidated queue</div>
        </div>

        <div
          onClick={() => setActiveSource('WEBSITE')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeSource === 'WEBSITE'
              ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-amber-800 font-semibold mb-1">
            <span>Website Portal</span>
            <Globe className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">{webCount}</div>
          <div className="text-[10px] text-amber-700/70 mt-1 font-medium">Direct Enquiries & Forms</div>
        </div>

        <div
          onClick={() => setActiveSource('WHATSAPP')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeSource === 'WHATSAPP'
              ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-emerald-800 font-semibold mb-1">
            <span>WhatsApp Business</span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{waCount}</div>
          <div className="text-[10px] text-emerald-700/70 mt-1 font-medium">Cloud API Messages</div>
        </div>

        <div
          onClick={() => setActiveSource('FACEBOOK')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeSource === 'FACEBOOK'
              ? 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-blue-800 font-semibold mb-1">
            <span>Facebook Lead Ads</span>
            <span className="font-bold text-blue-600 text-xs">FB</span>
          </div>
          <div className="text-2xl font-black text-blue-950">{fbCount}</div>
          <div className="text-[10px] text-blue-700/70 mt-1 font-medium">Instant Form Submissions</div>
        </div>

        <div
          onClick={() => setActiveSource('INSTAGRAM')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeSource === 'INSTAGRAM'
              ? 'bg-pink-50 border-pink-200 shadow-sm ring-2 ring-pink-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-pink-800 font-semibold mb-1">
            <span>Instagram Leads</span>
            <span className="font-bold text-pink-600 text-xs">IG</span>
          </div>
          <div className="text-2xl font-black text-pink-950">{igCount}</div>
          <div className="text-[10px] text-pink-700/70 mt-1 font-medium">Direct Messages & Stories</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Source Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl self-start md:self-auto overflow-x-auto w-full md:w-auto">
          {(['ALL', 'WEBSITE', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSource(s)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeSource === s
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s === 'ALL' ? 'All Leads' : s === 'WEBSITE' ? '🌐 Website' : s === 'WHATSAPP' ? 'WhatsApp' : s === 'FACEBOOK' ? 'Facebook' : 'Instagram'}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, phone, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW_LEAD">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading social leads inbox...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">No {activeSource !== 'ALL' ? activeSource : ''} Leads Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            New messages from WhatsApp, Facebook Lead Ads, or Instagram will automatically appear here. Click <strong>[ + Simulate Inbound Lead ]</strong> above to test receiving an incoming lead immediately!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Lead Source</th>
                  <th className="py-3.5 px-4">Candidate / Sender</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Inquiry / Message</th>
                  <th className="py-3.5 px-4">Campaign / Ad</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSourceBadge(lead.leadSource)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{lead.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lead.externalLeadId ? lead.externalLeadId.slice(0, 18) : lead.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-mono text-slate-800">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phoneNumber}</span>
                        </div>
                        {lead.email && lead.email !== 'Not Provided' && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-700 font-medium leading-relaxed" title={lead.message}>
                        "{lead.message || 'Inbound inquiry'}"
                      </p>
                      {lead.messages && lead.messages.length > 1 && (
                        <span className="text-[10px] font-bold text-indigo-600 mt-0.5 inline-block">
                          {lead.messages.length} messages in thread
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          {lead.campaignName || 'Direct Campaign'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {lead.adName || 'General Ad'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString()} &bull;{' '}
                      {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Lead Thread"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {lead.status !== 'CONVERTED' ? (
                          <>
                            <button
                              onClick={() => handleOpenConvert(lead, 'TUTOR')}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                              title="Convert to Tutor Candidate"
                            >
                              + Tutor
                            </button>
                            <button
                              onClick={() => handleOpenConvert(lead, 'STUDENT')}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                              title="Convert to Student Lead"
                            >
                              + Student
                            </button>
                            <button
                              onClick={() => {
                                setLinkingLead(lead);
                                setLinkTargetId('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Link to Existing Record"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                            ? {lead.convertedType}
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: View Lead Details & Messages */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Lead Details: ${selectedLead.name}`}
          subtitle={`Source: ${selectedLead.leadSource} ? Phone: ${selectedLead.phoneNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Source & Platform</span>
                <div className="mt-0.5">{getSourceBadge(selectedLead.leadSource)}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Phone Number</span>
                <span className="font-mono font-bold text-slate-800">{selectedLead.phoneNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Email</span>
                <span className="font-semibold text-slate-700">{selectedLead.email || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Campaign Name</span>
                <span className="font-semibold text-slate-800">{selectedLead.campaignName || 'Direct'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">External Lead ID</span>
                <span className="font-mono text-slate-600 truncate block">{selectedLead.externalLeadId || selectedLead.id}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">Message History</h5>
              <div className="bg-slate-100/80 p-3.5 rounded-xl space-y-2.5 max-h-56 overflow-y-auto">
                {selectedLead.messages && selectedLead.messages.length > 0 ? (
                  selectedLead.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs max-w-[85%] ${
                        m.sender === 'user'
                          ? 'bg-white text-slate-800 shadow-2xs border border-slate-200 mr-auto'
                          : 'bg-indigo-600 text-white ml-auto'
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <span className={`text-[10px] block mt-1 font-mono ${m.sender === 'user' ? 'text-slate-400' : 'text-indigo-200'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No additional messages</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Status: <strong>{selectedLead.status}</strong>
              </span>

              {selectedLead.status !== 'CONVERTED' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenConvert(selectedLead, 'TUTOR')}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                  >
                    [ Convert to Tutor ]
                  </button>
                  <button
                    onClick={() => handleOpenConvert(selectedLead, 'STUDENT')}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    [ Convert to Student ]
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  ? Already Converted into {selectedLead.convertedType}
                </span>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Convert Lead */}
      {convertingLead && (
        <Modal
          isOpen={!!convertingLead}
          onClose={() => setConvertingLead(null)}
          title={`Convert to ${convertingLead.targetType === 'TUTOR' ? 'Tutor Candidate' : 'Student Record'}`}
          subtitle={`Lead: ${convertingLead.lead.name} (${convertingLead.lead.phoneNumber})`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              Converting will register <strong>{convertingLead.lead.name}</strong> into the CRM database with:
              {convertingLead.targetType === 'TUTOR' ? (
                <ul className="list-disc list-inside mt-1 font-semibold">
                  <li>Priority: NOT_ASSIGNED</li>
                  <li>Status: NEW_APPLICATION</li>
                  <li>6 Default Document Verification Records</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside mt-1 font-semibold">
                  <li>Status: NEW (LOOKING_FOR_TUTOR)</li>
                  <li>Linked Parent Guardian Record Created</li>
                </ul>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subjects *</label>
              <input
                type="text"
                value={convertSubjects}
                onChange={(e) => setConvertSubjects(e.target.value)}
                placeholder="e.g. Mathematics, Physics, Chemistry"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold"
              />
            </div>

            {convertingLead.targetType === 'TUTOR' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Experience</label>
                <input
                  type="text"
                  value={convertExp}
                  onChange={(e) => setConvertExp(e.target.value)}
                  placeholder="e.g. 3 years, 5+ years"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Class / Standard</label>
                <input
                  type="text"
                  value={convertClass}
                  onChange={(e) => setConvertClass(e.target.value)}
                  placeholder="e.g. 10th Standard, 12th CBSE"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteConvert}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Converting...' : `Confirm Convert to ${convertingLead.targetType}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: Simulate Webhook */}
      {simulateModalOpen && (
        <Modal
          isOpen={simulateModalOpen}
          onClose={() => setSimulateModalOpen(false)}
          title="Simulate Inbound Social Lead"
          subtitle="Test official WhatsApp Cloud API, Facebook Lead Ads, or Instagram webhooks"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Channel *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['WHATSAPP', 'FACEBOOK', 'INSTAGRAM'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setSimChannel(ch);
                      if (ch === 'WHATSAPP') {
                        setSimName('Kavitha Ramesh');
                        setSimPhone('+919842155432');
                        setSimMessage('Hello! Looking for a Class 10 Tamil and English home tutor in Tirunelveli.');
                      } else if (ch === 'FACEBOOK') {
                        setSimName('Suresh Kannan');
                        setSimPhone('+919943218765');
                        setSimEmail('suresh.physics@gmail.com');
                        setSimMessage('Submitted Teacher Wanted lead form on Facebook Ads');
                      } else {
                        setSimName('deepika_educator');
                        setSimPhone('+919789012345');
                        setSimMessage('Hi! Can I apply for Mathematics home tutoring CBSE?');
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      simChannel === ch
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Candidate / Sender Name *</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={simEmail}
                onChange={(e) => setSimEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Message / Form Payload *</label>
              <textarea
                rows={2}
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSimulateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteSimulate}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                {actionLoading ? 'Simulating...' : 'Dispatch Webhook Event'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Manual Lead */}
      {manualLeadModalOpen && (
        <Modal
          isOpen={manualLeadModalOpen}
          onClose={() => setManualLeadModalOpen(false)}
          title="Create Manual Lead Entry"
          subtitle="Record lead from walk-in, phone call, or external referral"
          maxWidth="md"
        >
          <form onSubmit={handleExecuteManualLead} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={manualForm.phoneNumber}
                  onChange={(e) => setManualForm({ ...manualForm, phoneNumber: e.target.value })}
                  placeholder="+91..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lead Source</label>
                <select
                  value={manualForm.leadSource}
                  onChange={(e) => setManualForm({ ...manualForm, leadSource: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="MANUAL_ENTRY">Manual Entry</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="WEBSITE">Website</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subjects</label>
              <input
                type="text"
                value={manualForm.subjects}
                onChange={(e) => setManualForm({ ...manualForm, subjects: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Message</label>
              <textarea
                rows={2}
                value={manualForm.message}
                onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setManualLeadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                {actionLoading ? 'Saving...' : 'Save Manual Lead'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 5: Link Record */}
      {linkingLead && (
        <Modal
          isOpen={!!linkingLead}
          onClose={() => setLinkingLead(null)}
          title={`Link Lead: ${linkingLead.name}`}
          subtitle="Connect this social inquiry with an existing Tutor or Student"
          maxWidth="sm"
        >
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Record Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkTargetType('TUTOR')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    linkTargetType === 'TUTOR'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Tutor Record
                </button>
                <button
                  type="button"
                  onClick={() => setLinkTargetType('STUDENT')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    linkTargetType === 'STUDENT'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Student Record
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {linkTargetType} ID (e.g. TUT-2026-001 or tut-001) *
              </label>
              <input
                type="text"
                value={linkTargetId}
                onChange={(e) => setLinkTargetId(e.target.value)}
                placeholder="Enter record ID..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLinkingLead(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !linkTargetId}
                onClick={handleExecuteLink}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Linking...' : 'Confirm Link'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
