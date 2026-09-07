import React, { useState, useEffect } from 'react';
import { Tutor, WhatsAppOptIn } from '../types';
import { fetchTutors, updateTutorWhatsAppOptIn } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';
import {
  MessageCircle,
  Filter,
  CheckSquare,
  Square,
  Search,
  RotateCcw,
  Send,
  Users,
  ShieldCheck,
  AlertCircle,
  Phone,
  Sparkles,
  MapPin,
  GraduationCap
} from 'lucide-react';

export const WhatsAppMessagingPage: React.FC = () => {
  const { addToast, refreshTrigger } = useApp();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [subject, setSubject] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [experience, setExperience] = useState('ALL');
  const [homeTuition, setHomeTuition] = useState('ALL');
  const [optInFilter, setOptInFilter] = useState('ALL');

  // Composer Modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [singleRecipient, setSingleRecipient] = useState<Tutor | null>(null);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (priority !== 'ALL') params.priority = priority;
      if (status !== 'ALL') params.status = status;
      if (subject !== 'ALL') params.subject = subject;
      if (location !== 'ALL') params.location = location;
      if (experience !== 'ALL') params.minExp = experience;
      if (homeTuition !== 'ALL') params.homeTuition = homeTuition;

      const res = await fetchTutors(params);
      let list = res.tutors || [];
      if (optInFilter !== 'ALL') {
        list = list.filter((t) => (t.whatsappOptIn || 'YES') === optInFilter);
      }
      setTutors(list);
    } catch (err: any) {
      addToast('error', 'Failed to load tutors', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, [search, priority, status, subject, location, experience, homeTuition, optInFilter, refreshTrigger]);

  const handleSelectAll = () => {
    if (selectedIds.length === tutors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tutors.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setPriority('ALL');
    setStatus('ALL');
    setSubject('ALL');
    setLocation('ALL');
    setExperience('ALL');
    setHomeTuition('ALL');
    setOptInFilter('ALL');
  };

  const handleToggleOptIn = async (tutor: Tutor) => {
    const nextOpt: WhatsAppOptIn = tutor.whatsappOptIn === 'NO' ? 'YES' : 'NO';
    try {
      await updateTutorWhatsAppOptIn(tutor.id, nextOpt);
      addToast('success', 'Opt-in Updated', `${tutor.fullName} consent set to ${nextOpt}`);
      loadTutors();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const selectedTutors = tutors.filter((t) => selectedIds.includes(t.id));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">WhatsApp Tutor Messaging</h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Targeted individual and bulk communication with registered educators
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedIds.length === 0) {
                addToast('info', 'No Tutors Selected', 'Please select at least one tutor to message.');
                return;
              }
              setSingleRecipient(null);
              setIsComposerOpen(true);
            }}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>SEND WHATSAPP MESSAGE ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter Tutors Before Selecting</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search Name / Phone</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teacher..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH_PRIORITY">?? High Priority</option>
              <option value="LOW_PRIORITY">?? Low Priority</option>
              <option value="NOT_ASSIGNED">? Not Assigned</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Workflow Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="NEW_APPLICATION">New Application</option>
              <option value="VALIDATED">Validated</option>
              <option value="DOCUMENT_VERIFICATION">Document Verification</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="DEMO_CLASS_SCHEDULED">Demo Class</option>
              <option value="TUTOR_APPOINTED">Appointed</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          {/* Home Tuition */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Home Tuition</label>
            <select
              value={homeTuition}
              onChange={(e) => setHomeTuition(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">Any Availability</option>
              <option value="yes">Yes (Available)</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Opt-in */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Opt-In Consent</label>
            <select
              value={optInFilter}
              onChange={(e) => setOptInFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Candidates</option>
              <option value="YES">Consented (YES)</option>
              <option value="NO">Opted Out (NO)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selection Control Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            {selectedIds.length === tutors.length && tutors.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All Tutors ({tutors.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono">
            {selectedIds.length} tutors selected
          </span>

          <button
            onClick={() => {
              if (selectedIds.length === 0) return;
              setSingleRecipient(null);
              setIsComposerOpen(true);
            }}
            disabled={selectedIds.length === 0}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl shadow-sm transition-all"
          >
            Send WhatsApp Message
          </button>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === tutors.length && tutors.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Tutor</th>
                <th className="py-3.5 px-4">WhatsApp Phone</th>
                <th className="py-3.5 px-4">Subjects</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Opt-In Consent</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tutors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No tutors match the selected filters.
                  </td>
                </tr>
              ) : (
                tutors.map((t) => {
                  const isChecked = selectedIds.includes(t.id);
                  const isOptedIn = (t.whatsappOptIn || 'YES') === 'YES';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(t.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${t.fullName}`}
                            alt={t.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{t.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{t.tutorId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-mono font-medium text-emerald-700 whitespace-nowrap">
                        {t.whatsappPhoneNumber || t.mobile || t.phone}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(t.subjects || []).slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">
                        {t.experience || `${t.experienceYears || 1}y`}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            t.priority === 'HIGH_PRIORITY'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priority === 'LOW_PRIORITY'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {(t.priority || 'NOT_ASSIGNED').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={t.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleOptIn(t)}
                          title="Click to toggle consent"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                            isOptedIn
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOptedIn ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{isOptedIn ? 'YES' : 'NO'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSingleRecipient(t);
                            setIsComposerOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center justify-center gap-1 mx-auto transition-all shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
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

      {/* WhatsApp Composer Modal */}
      {isComposerOpen && (
        <WhatsAppComposerModal
          isOpen={isComposerOpen}
          onClose={() => {
            setIsComposerOpen(false);
            setSingleRecipient(null);
          }}
          recipients={singleRecipient ? [singleRecipient] : selectedTutors}
          onSuccess={() => {
            setSelectedIds([]);
            loadTutors();
          }}
        />
      )}
    </div>
  );
};
