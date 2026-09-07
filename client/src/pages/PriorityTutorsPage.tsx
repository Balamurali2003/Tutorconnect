import React, { useState, useEffect } from 'react';
import { Tutor, PriorityType, PriorityLevel } from '../types';
import { fetchTutors, validateTutor } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TutorFormModal } from '../components/tutors/TutorFormModal';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Edit2,
  Phone,
  Mail,
  BookOpen,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MessageCircle,
  Bot,
  UserCheck
} from 'lucide-react';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';
import { PriorityBreakdownModal } from '../components/tutors/PriorityBreakdownModal';

interface PriorityTutorsPageProps {
  type: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'LOW_PRIORITY' | 'NOT_ASSIGNED';
  onSelectTutor: (tutor: Tutor) => void;
}

export const PriorityTutorsPage: React.FC<PriorityTutorsPageProps> = ({ type, onSelectTutor }) => {
  const { addToast, refreshTrigger, triggerRefresh } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Validate Modal
  const [validatingTutor, setValidatingTutor] = useState<Tutor | null>(null);
  const [validatingLoading, setValidatingLoading] = useState<boolean>(false);

  // Edit Modal
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

  // Breakdown Modal
  const [breakdownTutor, setBreakdownTutor] = useState<Tutor | null>(null);

  // WhatsApp Modals
  const [whatsAppTutor, setWhatsAppTutor] = useState<Tutor | null>(null);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState<boolean>(false);

  const isHigh = type === 'HIGH_PRIORITY';
  const isMedium = type === 'MEDIUM_PRIORITY';
  const isLow = type === 'LOW_PRIORITY';
  const isNotAssigned = type === 'NOT_ASSIGNED';

  const loadPriorityTutors = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { priority: type };
      if (search) params.search = search;
      const res = await fetchTutors(params);
      setTutors(res.tutors || []);
    } catch (err: any) {
      addToast('error', 'Failed to load tutors', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorityTutors();
  }, [type, search, refreshTrigger]);

  // Handle Validation
  const handleConfirmValidate = async () => {
    if (!validatingTutor) return;
    try {
      setValidatingLoading(true);
      await validateTutor(validatingTutor.id);
      addToast(
        'success',
        'Tutor Validated!',
        `${validatingTutor.fullName} validated successfully. Moved to Document Verification.`
      );
      setValidatingTutor(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Validation Failed', err.message);
    } finally {
      setValidatingLoading(false);
    }
  };

  const pageTitle = isHigh
    ? 'High Priority Tutors'
    : isMedium
    ? 'Medium Priority Tutors'
    : isLow
    ? 'Low Priority Tutors'
    : 'Not Assigned Tutors';

  const scoreRangeText = isHigh
    ? 'Priority Score: 80 - 100'
    : isMedium
    ? 'Priority Score: 60 - 79'
    : isLow
    ? 'Priority Score: 0 - 59'
    : 'Pending priority score computation';

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
          isHigh
            ? 'bg-gradient-to-r from-rose-50 via-rose-50/60 to-white border-rose-200 text-rose-950'
            : isMedium
            ? 'bg-gradient-to-r from-amber-50 via-amber-50/60 to-white border-amber-200 text-amber-950'
            : isLow
            ? 'bg-gradient-to-r from-slate-100 via-slate-50 to-white border-slate-200 text-slate-900'
            : 'bg-gradient-to-r from-slate-50 to-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-2xs ${
              isHigh
                ? 'bg-rose-500 text-white'
                : isMedium
                ? 'bg-amber-500 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {isHigh ? '🔴' : isMedium ? '🟠' : '🟡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg tracking-tight">{pageTitle}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/80 border border-slate-200 shadow-2xs">
                {tutors.length} Total
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/60 border border-slate-200/80 font-bold">
                {scoreRangeText}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Priority scores are automatically calculated from measurable metrics. Click on any score pill to inspect full analysis or override.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsBulkWhatsAppOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-colors"
            title="Message priority tutors on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>💬 WhatsApp Tutors</span>
          </button>

          <button
            onClick={() => loadPriorityTutors()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{tutors.length}</span> educators in {type}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">Filtering priority educators...</p>
        </div>
      ) : tutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No {pageTitle} Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Currently no candidates fall into {type}. The system recalculates automatically as new student requirements or tutor credentials are updated.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Tutor Name</th>
                  <th className="py-3 px-4">Subjects</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Home Tuition</th>
                  <th className="py-3 px-4 text-center">Priority Score</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tutors.map((t) => {
                  const score = t.priorityScore ?? 0;
                  const isHome = t.homeTuitionAvailable?.toLowerCase() === 'yes';
                  const isManual = t.prioritySource === 'MANUAL';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tutor Name */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={t.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.fullName)}`}
                            alt={t.fullName}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                          />
                          <div>
                            <button
                              onClick={() => onSelectTutor(t)}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left block"
                            >
                              {t.fullName}
                            </button>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                              <span>{t.tutorId}</span>
                              <span>&bull;</span>
                              <span>{t.mobile || t.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subjects */}
                      <td className="py-3 px-4 text-slate-700 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(t.subjects) ? t.subjects : [t.subjectsText || 'General']).slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md truncate max-w-[120px]"
                            >
                              {s}
                            </span>
                          ))}
                          {Array.isArray(t.subjects) && t.subjects.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{t.subjects.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {t.experience || (t.experienceYears ? `${t.experienceYears} Years` : 'Not Provided')}
                      </td>

                      {/* Home Tuition */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isHome ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isHome ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {isHome ? 'YES' : 'NO'}
                        </span>
                      </td>

                      {/* Priority Score (Clickable Pill) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setBreakdownTutor(t)}
                          title="Click to view priority score analysis"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black border shadow-2xs transition-all hover:scale-105 ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : isMedium
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{score} / 100</span>
                        </button>
                      </td>

                      {/* Priority Level */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isMedium
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {(t.priorityLevel || t.priority || 'LOW_PRIORITY').replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            {isManual ? <UserCheck className="w-2.5 h-2.5 text-amber-600" /> : <Bot className="w-2.5 h-2.5 text-slate-400" />}
                            <span>{isManual ? 'Manual' : 'Auto'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={t.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setValidatingTutor(t)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors active:scale-95"
                            title="Validate credentials & move to Document Verification"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validate</span>
                          </button>

                          <button
                            onClick={() => setWhatsAppTutor(t)}
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                            title="Send WhatsApp Message"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => onSelectTutor(t)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="View Tutor Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingTutor(t)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit Tutor Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Priority Breakdown Modal */}
      {breakdownTutor && (
        <PriorityBreakdownModal
          tutor={breakdownTutor}
          isOpen={!!breakdownTutor}
          onClose={() => setBreakdownTutor(null)}
          onUpdated={(updated) => {
            setBreakdownTutor(updated);
            loadPriorityTutors();
          }}
        />
      )}

      {/* Validate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!validatingTutor}
        onClose={() => setValidatingTutor(null)}
        onConfirm={handleConfirmValidate}
        title="Confirm Tutor Validation"
        message={`Are you sure you want to validate ${validatingTutor?.fullName}? They will move to Document Verification.`}
        confirmText="Confirm Validation"
        loading={validatingLoading}
      />

      {/* Tutor Edit Modal */}
      {editingTutor && (
        <TutorFormModal
          isOpen={!!editingTutor}
          onClose={() => setEditingTutor(null)}
          initialData={editingTutor}
          onSave={async () => {
            setEditingTutor(null);
            triggerRefresh();
          }}
        />
      )}

      {/* WhatsApp Composer Modal */}
      {whatsAppTutor && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppTutor}
          onClose={() => setWhatsAppTutor(null)}
          recipients={[whatsAppTutor]}
        />
      )}

      {/* Bulk WhatsApp Modal */}
      {isBulkWhatsAppOpen && (
        <WhatsAppComposerModal
          isOpen={isBulkWhatsAppOpen}
          onClose={() => setIsBulkWhatsAppOpen(false)}
          recipients={tutors}
        />
      )}
    </div>
  );
};
