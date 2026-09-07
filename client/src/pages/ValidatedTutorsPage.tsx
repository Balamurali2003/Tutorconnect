import React, { useState, useEffect } from 'react';
import { Tutor } from '../types';
import { fetchTutors } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCheck2,
  Eye,
  RefreshCw,
  Phone,
  BookOpen
} from 'lucide-react';

interface ValidatedTutorsPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const ValidatedTutorsPage: React.FC<ValidatedTutorsPageProps> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger, setActiveTab } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadValidatedTutors = async () => {
    try {
      setLoading(true);
      const res = await fetchTutors({ validated: 'true' });
      const validatedList = (res.tutors || []).filter(
        (t) => t.isValidated === true || t.is_validated === true || t.status === 'VALIDATED'
      );
      setTutors(validatedList);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not load validated tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidatedTutors();
  }, [refreshTrigger]);

  const filteredTutors = tutors.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white text-emerald-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg tracking-tight">Validated Tutors</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                {tutors.length} Total
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Educators who have passed initial administrative validation and are actively proceeding through credential screening.
            </p>
          </div>
        </div>

        <button
          onClick={loadValidatedTutors}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search validated tutors by name, phone, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredTutors.length}</span> validated candidates
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading validated tutors...</p>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">No Validated Tutors Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Validate candidates from High Priority or Low Priority queues to begin their credential screening.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Tutor Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Subjects</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Validation Status</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTutors.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Tutor Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            t.photo ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.fullName)}`
                          }
                          alt={t.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                        />
                        <div>
                          <button
                            onClick={() => onSelectTutor(t)}
                            className="font-bold text-slate-900 hover:text-emerald-700 transition-colors text-left block"
                          >
                            {t.fullName}
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.tutorId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Phone */}
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {t.mobile || t.phone || 'Not Provided'}
                    </td>

                    {/* 3. Subjects */}
                    <td className="py-3 px-4 text-slate-700 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(t.subjects) ? t.subjects : [t.subjectsText || 'General'])
                          .slice(0, 2)
                          .map((s, idx) => (
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

                    {/* 4. Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge priority={t.priority} size="sm" />
                    </td>

                    {/* 5. Validation Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>? Validated</span>
                      </span>
                    </td>

                    {/* 6. Current Stage */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.currentStage ? t.currentStage.replace(/_/g, ' ') : 'Document Verification'}</span>
                      </span>
                    </td>

                    {/* 7. Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveTab('recruitment-doc-verification')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition-colors"
                          title="Open Document Verification"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>[ Document Verification ]</span>
                        </button>
                        <button
                          onClick={() => onSelectTutor(t)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
    </div>
  );
};
