import React, { useState, useEffect } from 'react';
import { WhatsAppContact, WhatsAppOptIn } from '../types';
import { fetchWhatsAppContactsList, updateTutorWhatsAppOptIn } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Filter,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const WhatsAppContactsPage: React.FC = () => {
  const { setActiveTab, setSelectedTutorId, addToast } = useApp();
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [optInFilter, setOptInFilter] = useState('ALL');

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppContactsList({ search, optIn: optInFilter });
      if (res.success) {
        setContacts(res.contacts || []);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [optInFilter]);

  const handleToggleOptIn = async (contact: WhatsAppContact) => {
    if (!contact.tutorId) return;
    const nextOptIn: WhatsAppOptIn =
      contact.whatsappOptIn === 'YES' ? 'NO' : contact.whatsappOptIn === 'NO' ? 'UNKNOWN' : 'YES';
    try {
      await updateTutorWhatsAppOptIn(contact.tutorId, nextOptIn);
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, whatsappOptIn: nextOptIn } : c))
      );
      addToast('success', 'Opt-in Updated', `WhatsApp consent for ${contact.displayName} set to ${nextOptIn}`);
    } catch (err: any) {
      addToast('error', 'Error', 'Failed to update opt-in consent');
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Contacts Directory</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} Contacts
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Official WhatsApp recipients linked to Tutor database profiles with opt-in status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadContacts}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveTab('whatsapp-messaging')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Broadcast Message</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search contacts by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Opt-in Consent:</span>
          <select
            value={optInFilter}
            onChange={(e) => setOptInFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="YES">Opt-In Confirmed (YES)</option>
            <option value="NO">Opt-Out / Denied (NO)</option>
            <option value="UNKNOWN">Not Provided (UNKNOWN)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                <th className="py-3.5 px-4">Tutor / Contact</th>
                <th className="py-3.5 px-4">WhatsApp Phone</th>
                <th className="py-3.5 px-4">Opt-In Consent</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Loading WhatsApp contacts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No contacts matching search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {c.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span>{c.displayName}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.phoneNumber || '—'}</td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleOptIn(c)}
                        title="Click to cycle consent (YES -> NO -> UNKNOWN)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          c.whatsappOptIn === 'YES'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : c.whatsappOptIn === 'NO'
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {c.whatsappOptIn === 'YES' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {c.whatsappOptIn === 'NO' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        {c.whatsappOptIn === 'UNKNOWN' && <HelpCircle className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{c.whatsappOptIn} (Click to toggle)</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setActiveTab('whatsapp-inbox')}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all"
                      >
                        Chat in Inbox
                      </button>
                      {c.tutorId && (
                        <button
                          onClick={() => setSelectedTutorId(c.tutorId!)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        >
                          Profile
                        </button>
                      )}
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
