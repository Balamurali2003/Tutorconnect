import React, { useState } from 'react';
import { Tutor } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { validateTutor, deleteTutor } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Eye, Edit3, Trash2, CheckCircle2, ShieldCheck, MessageCircle, Sparkles, Bot, UserCheck } from 'lucide-react';
import { WhatsAppComposerModal } from '../whatsapp/WhatsAppComposerModal';
import { PriorityBreakdownModal } from './PriorityBreakdownModal';

interface TutorTableProps {
  tutors: Tutor[];
  onSelectTutor: (tutor: Tutor) => void;
  onEditTutor: (tutor: Tutor) => void;
  onRefresh: () => void;
  selectedTutorIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onWhatsAppClick?: (tutor: Tutor) => void;
}

export const TutorTable: React.FC<TutorTableProps> = ({
  tutors,
  onSelectTutor,
  onEditTutor,
  onRefresh,
  selectedTutorIds,
  onToggleSelect,
  onSelectAll,
  onWhatsAppClick
}) => {
  const { addToast, triggerRefresh } = useApp();
  const [validatingTutor, setValidatingTutor] = useState<Tutor | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [whatsAppTutor, setWhatsAppTutor] = useState<Tutor | null>(null);
  const [breakdownTutor, setBreakdownTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmValidation = async () => {
    if (!validatingTutor) return;
    setLoading(true);
    try {
      const res = await validateTutor(validatingTutor.id);
      addToast('success', 'Tutor Validated', res.message || `${validatingTutor.fullName} has been validated and moved to Document Verification.`);
      setValidatingTutor(null);
      triggerRefresh();
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Validation Failed', err.message || 'Could not validate tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTutor) return;
    setLoading(true);
    try {
      await deleteTutor(deletingTutor.id);
      addToast('success', 'Tutor Deleted', `${deletingTutor.fullName} has been removed.`);
      setDeletingTutor(null);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete tutor');
    } finally {
      setLoading(false);
    }
  };

  if (tutors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No teachers found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No teacher records match the selected filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-bold text-slate-500">
              <tr>
                {selectedTutorIds !== undefined && onSelectAll && (
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTutorIds.length === tutors.length && tutors.length > 0}
                      onChange={onSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3.5 px-4">Tutor Name</th>
                <th className="py-3.5 px-4">Subjects</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Home Tuition</th>
                <th className="py-3.5 px-4 text-center">Priority Score</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tutors.map((t) => {
                const canValidate = !['VALIDATED', 'TUTOR_APPOINTED', 'ACTIVE', 'DOCUMENT_APPROVED'].includes(t.status);
                const isHomeTuition = t.homeTuitionAvailable?.toLowerCase() === 'yes';
                const score = t.priorityScore ?? 0;
                const level = t.priorityLevel || t.priority || 'LOW_PRIORITY';
                const isHigh = level === 'HIGH_PRIORITY';
                const isMedium = level === 'MEDIUM_PRIORITY';
                const isManual = t.prioritySource === 'MANUAL';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {selectedTutorIds !== undefined && onToggleSelect && (
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTutorIds.includes(t.id)}
                          onChange={() => onToggleSelect(t.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Tutor Name & Info */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${t.fullName}`}
                          alt={t.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{t.fullName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{t.tutorId}</span>
                            <span>&bull;</span>
                            <span>{t.mobile || t.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subjects */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[190px]">
                        {(t.subjects || []).slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                        {(t.subjects || []).length > 2 && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            +{t.subjects.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {t.experience || `${t.experienceYears}y`}
                    </td>

                    {/* Home Tuition */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isHomeTuition
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHomeTuition ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {isHomeTuition ? 'YES' : 'NO'}
                      </span>
                    </td>

                    {/* Priority Score (Clickable Pill) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setBreakdownTutor(t)}
                        title="Click to view full priority breakdown and metric analysis"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all transform hover:scale-105 shadow-2xs border ${
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
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wide border ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : isMedium
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {level.replace('_', ' ')}
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {canValidate ? (
                          <button
                            onClick={() => setValidatingTutor(t)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1 transition-all active:scale-95"
                            title="Validate this tutor"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validate</span>
                          </button>
                        ) : (
                          <span className="px-2 py-1 text-[11px] font-bold text-slate-400 bg-slate-100 rounded-lg">
                            Validated
                          </span>
                        )}

                        <button
                          onClick={() => onWhatsAppClick ? onWhatsAppClick(t) : setWhatsAppTutor(t)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Open WhatsApp chat with tutor"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectTutor(t)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditTutor(t)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Edit Tutor Info"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingTutor(t)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Tutor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Priority Breakdown Modal */}
      {breakdownTutor && (
        <PriorityBreakdownModal
          tutor={breakdownTutor}
          isOpen={!!breakdownTutor}
          onClose={() => setBreakdownTutor(null)}
          onUpdated={(updated) => {
            setBreakdownTutor(updated);
            onRefresh();
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

      {/* Validate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!validatingTutor}
        onClose={() => setValidatingTutor(null)}
        onConfirm={handleConfirmValidation}
        title="Confirm Tutor Validation"
        message={`Are you sure you want to validate ${validatingTutor?.fullName}? Once validated, they will move to Document Verification.`}
        confirmText="Confirm Validation"
        loading={loading}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTutor}
        onClose={() => setDeletingTutor(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Tutor Record"
        message={`Are you sure you want to delete ${deletingTutor?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </>
  );
};
