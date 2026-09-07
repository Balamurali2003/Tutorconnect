import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { resetDatabase, fetchPriorityConfig, updatePriorityConfig, recalculateAllPriorities } from '../services/api';
import { PriorityWeightsConfig } from '../types';
import { BarChart3, Settings as SettingsIcon, RotateCcw, ShieldCheck, CheckCircle2, Sliders, Database, Users, Award, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-900">Recruitment & Operational Reports</h2>
        <p className="text-xs text-slate-500 mt-0.5">Comprehensive analytics on pipeline efficiency, conversion speed, and subject demands</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase block">Pipeline Conversion Rate</span>
          <span className="text-3xl font-black text-emerald-600 font-mono mt-1 block">68.4%</span>
          <p className="text-xs text-slate-500 mt-2">Percentage of validated applicants who achieve final parent appointment.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase block">Average Days to Placement</span>
          <span className="text-3xl font-black text-indigo-600 font-mono mt-1 block">8.2 Days</span>
          <p className="text-xs text-slate-500 mt-2">Average time from initial application submission to active placement.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase block">Parent Approval Rating</span>
          <span className="text-3xl font-black text-amber-500 font-mono mt-1 block">4.8 / 5.0</span>
          <p className="text-xs text-slate-500 mt-2">Consolidated satisfaction rating from demo classes across all centres.</p>
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { userRole, setUserRole, addToast, triggerRefresh } = useApp();
  const [centreName, setCentreName] = useState('TutorConnect Elite Academy');
  const [contactEmail, setContactEmail] = useState('contact@tutorconnect.org');
  const [resetting, setResetting] = useState(false);

  // Priority Weights Configuration State
  const [weights, setWeights] = useState<PriorityWeightsConfig>({
    experienceWeight: 30,
    subjectDemandWeight: 25,
    homeTuitionWeight: 15,
    qualificationWeight: 10,
    locationMatchWeight: 10,
    timingMatchWeight: 10
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingWeights, setSavingWeights] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const loadPriorityConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetchPriorityConfig();
      if (res.config) {
        setWeights(res.config);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadPriorityConfig();
  }, []);

  const totalWeight =
    (Number(weights.experienceWeight) || 0) +
    (Number(weights.subjectDemandWeight) || 0) +
    (Number(weights.homeTuitionWeight) || 0) +
    (Number(weights.qualificationWeight) || 0) +
    (Number(weights.locationMatchWeight) || 0) +
    (Number(weights.timingMatchWeight) || 0);

  const isTotalValid = totalWeight === 100;

  const handleSaveWeights = async () => {
    if (!isTotalValid) {
      addToast('error', 'Invalid Total', `Total weights must equal 100%. Current total is ${totalWeight}%.`);
      return;
    }

    try {
      setSavingWeights(true);
      const res = await updatePriorityConfig(weights);
      addToast(
        'success',
        'Configuration Saved',
        `Priority weights updated and all ${res.summary?.total || ''} tutors recalculated.`
      );
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message);
    } finally {
      setSavingWeights(false);
    }
  };

  const handleRecalculateNow = async () => {
    try {
      setRecalculating(true);
      const res = await recalculateAllPriorities();
      addToast('success', 'Recalculation Complete', res.message || 'All tutor priorities recalculated.');
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Recalculation Failed', err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database to pristine seed demo data?')) return;
    setResetting(true);
    try {
      await resetDatabase();
      addToast('success', 'Database Reset', 'System restored to default data.');
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-900">System Settings & Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage centre branding, roles, priority scoring weights, and operational workflows</p>
      </div>

      {/* ========================================================================= */}
      {/* TUTOR PRIORITY CONFIGURATION SECTION */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Tutor Priority Configuration</h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Configurable Scoring Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust the weight percentage assigned to each metric. The total weights across all 6 metrics must equal exactly 100%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                isTotalValid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {isTotalValid ? `✓ Total: ${totalWeight}%` : `⚠ Total: ${totalWeight}% (Must be 100%)`}
            </span>

            <button
              type="button"
              onClick={handleRecalculateNow}
              disabled={recalculating}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Run scoring engine on current data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Recalculate Scores'}</span>
            </button>
          </div>
        </div>

        {/* 6 Weight Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Teaching Experience */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">1. Teaching Experience</label>
              <span className="font-mono font-black text-indigo-600">{weights.experienceWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Points for 0y, 1-2y, 3-5y, and 6+y actual experience.</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.experienceWeight}
              onChange={(e) => setWeights({ ...weights, experienceWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          {/* 2. Subject Demand */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">2. Subject Demand</label>
              <span className="font-mono font-black text-indigo-600">{weights.subjectDemandWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Dynamic demand intelligence from active student requests.</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.subjectDemandWeight}
              onChange={(e) => setWeights({ ...weights, subjectDemandWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          {/* 3. Home Tuition Availability */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">3. Home Tuition Availability</label>
              <span className="font-mono font-black text-indigo-600">{weights.homeTuitionWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Points for YES (15 pts), NO (5 pts), Not Provided (0 pts).</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.homeTuitionWeight}
              onChange={(e) => setWeights({ ...weights, homeTuitionWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          {/* 4. Qualification */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">4. Qualification</label>
              <span className="font-mono font-black text-indigo-600">{weights.qualificationWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Postgraduate, Bachelor degree, and diploma scoring.</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.qualificationWeight}
              onChange={(e) => setWeights({ ...weights, qualificationWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          {/* 5. Location Match */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">5. Location Match</label>
              <span className="font-mono font-black text-indigo-600">{weights.locationMatchWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Distance & catchment matching in Tirunelveli.</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.locationMatchWeight}
              onChange={(e) => setWeights({ ...weights, locationMatchWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          {/* 6. Timing Match */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">6. Timing Match</label>
              <span className="font-mono font-black text-indigo-600">{weights.timingMatchWeight}%</span>
            </div>
            <p className="text-[11px] text-slate-500">Availability match with active student slots.</p>
            <input
              type="number"
              min="0"
              max="100"
              value={weights.timingMatchWeight}
              onChange={(e) => setWeights({ ...weights, timingMatchWeight: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setWeights({
                experienceWeight: 30,
                subjectDemandWeight: 25,
                homeTuitionWeight: 15,
                qualificationWeight: 10,
                locationMatchWeight: 10,
                timingMatchWeight: 10
              })
            }
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Reset Defaults (30/25/15/10/10/10)
          </button>

          <button
            type="button"
            onClick={handleSaveWeights}
            disabled={savingWeights || !isTotalValid}
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
              isTotalValid
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{savingWeights ? 'Saving & Recalculating...' : 'Save & Recalculate All Scores'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Centre Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Centre Identity</h4>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Centre Name</label>
            <input
              type="text"
              value={centreName}
              onChange={(e) => setCentreName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>
          <button
            onClick={() => addToast('success', 'Settings Saved', 'Centre information updated.')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
          >
            Save Information
          </button>
        </div>

        {/* Role Switcher & Database Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">User Roles & Access</h4>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Active User Role Simulation</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 font-bold"
            >
              <option value="Admin">Admin (Full Control across all modules)</option>
              <option value="Staff">Staff (Verification & Interviewer)</option>
              <option value="Tutor">Tutor (Application & Demo view)</option>
              <option value="Parent">Parent (Demo review & Approval Portal)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1">Database Demo Reset</label>
            <p className="text-xs text-slate-500 mb-3">Re-seed the persistent JSON database with clean data.</p>
            <button
              onClick={handleResetData}
              disabled={resetting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetting ? 'Resetting...' : 'Reset Database to Initial Seed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
