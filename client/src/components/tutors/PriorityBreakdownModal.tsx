import React, { useState } from 'react';
import { Tutor, PriorityLevel } from '../../types';
import { overrideTutorPriority } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  X,
  Award,
  Sparkles,
  Bot,
  UserCheck,
  RotateCcw,
  BookOpen,
  Briefcase,
  Home,
  GraduationCap,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';

interface PriorityBreakdownModalProps {
  tutor: Tutor;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedTutor: Tutor) => void;
}

export const PriorityBreakdownModal: React.FC<PriorityBreakdownModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onUpdated
}) => {
  const { addToast, triggerRefresh } = useApp();
  const [isOverriding, setIsOverriding] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<PriorityLevel>(
    tutor.manualPriorityLevel || tutor.priorityLevel || 'HIGH_PRIORITY'
  );
  const [reason, setReason] = useState(tutor.overrideReason || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const breakdown = tutor.priorityBreakdown || {
    experience: { score: 0, max: 30, detail: tutor.experience || 'Not Provided' },
    subjectDemand: { score: 0, max: 25, detail: (tutor.subjects || []).join(', ') || 'Not Provided' },
    homeTuition: { score: 0, max: 15, detail: tutor.homeTuitionAvailable || 'Not Provided' },
    qualification: { score: 0, max: 10, detail: tutor.qualification || 'Not Provided' },
    locationMatch: { score: 0, max: 10, detail: tutor.preferredLocation || 'Not Provided' },
    timingMatch: { score: 0, max: 10, detail: tutor.availableTiming || 'Not Provided' },
    total: tutor.priorityScore || 0,
    maxTotal: 100
  };

  const score = tutor.priorityScore ?? breakdown.total ?? 0;
  const isHigh = (tutor.priorityLevel || tutor.priority) === 'HIGH_PRIORITY';
  const isMedium = (tutor.priorityLevel || tutor.priority) === 'MEDIUM_PRIORITY';
  const isLow = (tutor.priorityLevel || tutor.priority) === 'LOW_PRIORITY';
  const isManual = tutor.prioritySource === 'MANUAL';

  const handleSaveOverride = async () => {
    if (!reason.trim()) {
      addToast('error', 'Reason Required', 'Please enter a justification reason for manual priority override.');
      return;
    }

    try {
      setSaving(true);
      const res = await overrideTutorPriority(tutor.id, {
        priorityLevel: selectedLevel,
        reason: reason.trim(),
        overriddenBy: 'Admin'
      });
      addToast('success', 'Priority Overridden', `Tutor priority set to ${selectedLevel.replace('_', ' ')}.`);
      setIsOverriding(false);
      if (onUpdated) onUpdated(res.tutor);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Override Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAutomatic = async () => {
    try {
      setSaving(true);
      const res = await overrideTutorPriority(tutor.id, {
        priorityLevel: 'AUTOMATIC',
        resetToAutomatic: true
      });
      addToast('success', 'Reset to Automatic', `Tutor priority restored to automatic score: ${res.tutor.priorityScore}/100.`);
      setIsOverriding(false);
      setReason('');
      if (onUpdated) onUpdated(res.tutor);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const metricCards = [
    {
      title: 'Teaching Experience',
      score: breakdown.experience?.score ?? 0,
      max: breakdown.experience?.max ?? 30,
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      detail: breakdown.experience?.detail || 'Verified teaching history',
      barColor: 'bg-blue-600'
    },
    {
      title: 'Subject Demand Coverage',
      score: breakdown.subjectDemand?.score ?? 0,
      max: breakdown.subjectDemand?.max ?? 25,
      icon: <BookOpen className="w-4 h-4 text-purple-600" />,
      detail: breakdown.subjectDemand?.detail || 'Active student queue demand',
      barColor: 'bg-purple-600'
    },
    {
      title: 'Home Tuition Availability',
      score: breakdown.homeTuition?.score ?? 0,
      max: breakdown.homeTuition?.max ?? 15,
      icon: <Home className="w-4 h-4 text-emerald-600" />,
      detail: breakdown.homeTuition?.detail || 'Comfortable with home visits',
      barColor: 'bg-emerald-600'
    },
    {
      title: 'Qualification',
      score: breakdown.qualification?.score ?? 0,
      max: breakdown.qualification?.max ?? 10,
      icon: <GraduationCap className="w-4 h-4 text-amber-600" />,
      detail: breakdown.qualification?.detail || 'Highest verified degree',
      barColor: 'bg-amber-500'
    },
    {
      title: 'Location Match',
      score: breakdown.locationMatch?.score ?? 0,
      max: breakdown.locationMatch?.max ?? 10,
      icon: <MapPin className="w-4 h-4 text-rose-600" />,
      detail: breakdown.locationMatch?.detail || 'Tirunelveli catchment area',
      barColor: 'bg-rose-500'
    },
    {
      title: 'Timing Match',
      score: breakdown.timingMatch?.score ?? 0,
      max: breakdown.timingMatch?.max ?? 10,
      icon: <Clock className="w-4 h-4 text-teal-600" />,
      detail: breakdown.timingMatch?.detail || 'Available teaching hours',
      barColor: 'bg-teal-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">{tutor.fullName}</h3>
                <span className="text-[11px] font-mono text-slate-400">({tutor.tutorId})</span>
              </div>
              <p className="text-xs text-slate-300">Tutor Priority Score & Metric Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Total Score & Level Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black shadow-md ${
                  isHigh
                    ? 'bg-rose-500 text-white shadow-rose-500/20'
                    : isMedium
                    ? 'bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-slate-600 text-white shadow-slate-600/20'
                }`}
              >
                <span className="text-xl leading-none">{score}</span>
                <span className="text-[10px] opacity-80 mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800'
                        : isMedium
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {tutor.priorityLevel?.replace('_', ' ') || tutor.priority?.replace('_', ' ') || 'LOW PRIORITY'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isManual
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isManual ? <UserCheck className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span>{isManual ? '👤 Manual Override' : '🤖 Automatic'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated across 6 measurable metrics against active student demand in Tirunelveli.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOverriding(!isOverriding)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-all self-end sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>{isOverriding ? 'Hide Override' : 'Override Priority'}</span>
            </button>
          </div>

          {/* Manual Override Drawer */}
          {isOverriding && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <span>Manual Priority Override</span>
                </div>
                {isManual && (
                  <button
                    onClick={handleResetToAutomatic}
                    disabled={saving}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset to Automatic
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['HIGH_PRIORITY', 'MEDIUM_PRIORITY', 'LOW_PRIORITY'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      selectedLevel === lvl
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100/50'
                    }`}
                  >
                    {lvl.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Override Reason (Required)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Exceptional demo class results, proven board exam coaching record"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOverriding(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOverride}
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
                >
                  {saving ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </div>
          )}

          {/* Metric Breakdown Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Metric Breakdown ({breakdown.total ?? score} / 100)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metricCards.map((m, idx) => {
                const pct = Math.min(100, Math.round((m.score / m.max) * 100));
                return (
                  <div key={idx} className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        {m.icon}
                        <span>{m.title}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {m.score} <span className="text-slate-400 font-normal">/ {m.max}</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${m.barColor} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate" title={m.detail}>
                      {m.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Explanation Section */}
          <div
            className={`p-4 rounded-2xl border ${
              isHigh
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : isMedium
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Priority Evaluation Analysis</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {tutor.priorityExplanation ||
                `Evaluated at ${score}/100 priority score based on verified database metrics.`}
            </p>

            {/* Low Priority Deduction List */}
            {isLow && tutor.lowPriorityReasons && tutor.lowPriorityReasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Identified Scoring Deductions:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {tutor.lowPriorityReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            Calculated: {tutor.lastPriorityCalculatedAt ? new Date(tutor.lastPriorityCalculatedAt).toLocaleDateString() : 'Active'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-xs"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
