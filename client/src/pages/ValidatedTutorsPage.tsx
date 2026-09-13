import React, { useState, useEffect, useMemo } from 'react';
import { Tutor, PriorityType } from '../types';
import {
  fetchValidateTutors,
  validateTutor,
  deleteTutor,
  createTutor,
  updateTutor
} from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { TutorFormModal } from '../components/tutors/TutorFormModal';
import { BulkImportTutorsModal } from '../components/recruitment/BulkImportTutorsModal';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCheck2,
  Eye,
  RefreshCw,
  Phone,
  BookOpen,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Filter,
  Briefcase,
  Home,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';

interface ValidatedTutorsPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const ValidatedTutorsPage: React.FC<ValidatedTutorsPageProps> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger, triggerRefresh, setActiveTab } = useApp();

  // Data state
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [experienceFilter, setExperienceFilter] = useState<string>('ALL');
  const [homeTuitionFilter, setHomeTuitionFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [validatingTutor, setValidatingTutor] = useState<Tutor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load tutors awaiting validation
  const loadData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: String(pageSize)
      };

      if (search.trim()) params.search = search.trim();
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (subjectFilter !== 'ALL') params.subject = subjectFilter;
      if (experienceFilter !== 'ALL') params.experience = experienceFilter;
      if (homeTuitionFilter !== 'ALL') params.homeTuition = homeTuitionFilter;
      if (locationFilter !== 'ALL') params.location = locationFilter;

      const res = await fetchValidateTutors(params);
      setTutors(res.tutors || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      addToast('error', 'Error Loading Data', err.message || 'Could not load tutors awaiting validation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, priorityFilter, subjectFilter, experienceFilter, homeTuitionFilter, locationFilter, refreshTrigger]);

  // Handle Search input with debounce or trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // Distinct subjects & locations for filter dropdowns (derived from current view or common ones)
  const commonSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Tamil', 'Science', 'Social'];

  // Handle Add New Tutor
  const handleSaveNewTutor = async (data: Partial<Tutor>) => {
    try {
      await createTutor({
        ...data,
        status: 'NEW_APPLICATION',
        currentStage: 'VALIDATE_TUTOR',
        isValidated: false
      });
      addToast('success', 'Tutor Created', `${data.fullName} added to Validate Tutor queue.`);
      setIsAddModalOpen(false);
      triggerRefresh();
      loadData();
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message || 'Could not create tutor.');
    }
  };

  // Handle Edit Existing Tutor
  const handleSaveEditTutor = async (data: Partial<Tutor>) => {
    if (!editingTutor) return;
    try {
      await updateTutor(editingTutor.id, data);
      addToast('success', 'Tutor Updated', 'Tutor details updated successfully.');
      setEditingTutor(null);
      triggerRefresh();
      loadData();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update tutor.');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingTutor) return;
    try {
      setActionLoading(true);
      await deleteTutor(deletingTutor.id);
      addToast('success', 'Tutor Deleted', 'Tutor deleted successfully.');
      setDeletingTutor(null);
      triggerRefresh();
      loadData();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete tutor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Validate Action
  const handleConfirmValidate = async () => {
    if (!validatingTutor) return;
    try {
      setActionLoading(true);
      await validateTutor(validatingTutor.id);
      addToast(
        'success',
        'Tutor Validated',
        `${validatingTutor.fullName} has been validated and moved to Document Verification.`
      );
      setValidatingTutor(null);
      triggerRefresh();
      loadData();
    } catch (err: any) {
      addToast('error', 'Validation Failed', err.message || 'Could not validate tutor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate row display indices
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-indigo-50/40 to-white text-indigo-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg tracking-tight">Validate Tutor</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-indigo-800 border border-indigo-200 shadow-2xs">
                {totalCount} Awaiting Validation
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Review, edit, validate, or bulk import newly registered educators before advancing them to Document Verification.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
            title="Refresh candidate list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Add Tutor</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tutors by Name, Phone, Email, Subject, Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs border-t border-slate-100">
          {/* Priority Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH_PRIORITY">🔴 High Priority (80-100)</option>
              <option value="MEDIUM_PRIORITY">🟠 Medium Priority (60-79)</option>
              <option value="LOW_PRIORITY">🟡 Low Priority (0-59)</option>
              <option value="NOT_ASSIGNED">⚪ Not Assigned</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {commonSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => {
                setExperienceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Experience</option>
              <option value="0-1">0 - 1 Years</option>
              <option value="1-3">1 - 3 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>

          {/* Home Tuition Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Home Tuition</label>
            <select
              value={homeTuitionFilter}
              onChange={(e) => {
                setHomeTuitionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Modes</option>
              <option value="Yes">Yes (Home Visits)</option>
              <option value="No">No (Online/Centre Only)</option>
            </select>
          </div>

          {/* Location Search/Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Tirunelveli"
              value={locationFilter === 'ALL' ? '' : locationFilter}
              onChange={(e) => {
                const val = e.target.value;
                setLocationFilter(val.trim() === '' ? 'ALL' : val);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table or Loading/Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading tutors awaiting validation...</p>
        </div>
      ) : tutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">No Tutors Found in Validation Queue</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no candidates awaiting validation matching your filters. You can click &quot;Import Excel&quot; to import tutor spreadsheets or &quot;+ Add Tutor&quot; to create a new profile.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              Import Excel Now
            </button>
            <button
              onClick={() => {
                setSearch('');
                setPriorityFilter('ALL');
                setSubjectFilter('ALL');
                setExperienceFilter('ALL');
                setHomeTuitionFilter('ALL');
                setLocationFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
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
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tutors.map((t) => {
                  const score = t.priorityScore ?? 0;
                  const level = (t.priorityLevel || t.priority || 'LOW_PRIORITY').replace(/_/g, ' ');
                  const isHigh = (t.priorityLevel || t.priority) === 'HIGH_PRIORITY';
                  const isMed = (t.priorityLevel || t.priority) === 'MEDIUM_PRIORITY';

                  return (
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
                              className="font-bold text-slate-900 hover:text-indigo-700 transition-colors text-left block"
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
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.mobile || t.phone || 'Not Provided'}</span>
                        </div>
                      </td>

                      {/* 3. Subjects */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(t.subjects) && t.subjects.length > 0 ? (
                            t.subjects.slice(0, 3).map((sub, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 whitespace-nowrap"
                              >
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">General</span>
                          )}
                          {Array.isArray(t.subjects) && t.subjects.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{t.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Experience */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-semibold">
                          {t.experience || `${t.experienceYears || 0} Years`}
                        </span>
                      </td>

                      {/* 5. Priority */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isMed
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>{level}</span>
                          <span className="font-mono text-[9px] opacity-75">({score})</span>
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          VALIDATE
                        </span>
                      </td>

                      {/* 7. Actions: [ Edit ] [ Delete ] [ Validate ] */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Edit Tutor Details"
                        >
                          <Edit2 className="w-3 h-3 text-slate-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Delete Tutor"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Delete</span>
                        </button>

                        {/* Validate Button */}
                        <button
                          onClick={() => setValidatingTutor(t)}
                          className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="Validate and move to Document Verification"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Validate</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{startIndex}–{endIndex}</strong> of <strong className="text-slate-800">{totalCount}</strong> tutors
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const hasGap = prev && p - prev > 1;
                  return (
                    <React.Fragment key={p}>
                      {hasGap && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                          currentPage === p
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Tutors Modal */}
      <BulkImportTutorsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadData();
          triggerRefresh();
        }}
      />

      {/* Add Tutor Modal */}
      <TutorFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewTutor}
        initialData={null}
      />

      {/* Edit Tutor Modal */}
      {editingTutor && (
        <TutorFormModal
          isOpen={!!editingTutor}
          onClose={() => setEditingTutor(null)}
          onSave={handleSaveEditTutor}
          initialData={editingTutor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Delete Tutor?</h4>
                <p className="text-xs text-slate-500">Are you sure you want to delete this tutor?</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <p className="font-bold text-slate-900">{deletingTutor.fullName}</p>
              <p className="text-slate-600">Phone: {deletingTutor.mobile || deletingTutor.phone || 'Not Provided'}</p>
              <p className="text-slate-500 text-[11px]">Tutor ID: {deletingTutor.tutorId}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeletingTutor(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validate Confirmation Modal */}
      {validatingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto p-5 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Validate Educator</h4>
                <p className="text-xs text-slate-500">Advance tutor to Document Verification stage?</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{validatingTutor.fullName}</p>
              <p className="text-slate-600">Phone: {validatingTutor.mobile || validatingTutor.phone}</p>
              <p className="text-slate-500">Subjects: {(validatingTutor.subjects || []).join(', ')}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Once validated, this educator will be moved out of the Validate Tutor list and placed into the <strong className="text-slate-800">Document Verification</strong> stage.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setValidatingTutor(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmValidate}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading ? 'Validating...' : 'Validate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
