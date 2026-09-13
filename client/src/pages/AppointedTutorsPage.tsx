import React, { useState, useEffect } from 'react';
import { Tutor, Student, TutorStudentAssignment, AssignmentMetrics } from '../types';
import {
  fetchTutors,
  fetchStudents,
  fetchTutorStudentAssignments,
  fetchAssignmentMetrics,
  deleteTutor,
  updateTutor
} from '../services/api';
import { TutorFormModal } from '../components/tutors/TutorFormModal';
import { useApp } from '../context/AppContext';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';
import { AssignStudentModal } from '../components/recruitment/AssignStudentModal';
import { ViewAssignedStudentsModal } from '../components/recruitment/ViewAssignedStudentsModal';
import {
  Award,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  GraduationCap,
  RefreshCw,
  Eye,
  MessageCircle,
  Plus,
  Users,
  BookOpen,
  UserX,
  Phone,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface AppointedTutorsPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const AppointedTutorsPage: React.FC<AppointedTutorsPageProps> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger, triggerRefresh } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<TutorStudentAssignment[]>([]);
  const [metrics, setMetrics] = useState<AssignmentMetrics>({
    totalAppointedTutors: 0,
    totalAssignedStudents: 0,
    activeAssignments: 0,
    unassignedStudents: 0,
    tutorsWithNoStudents: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [whatsAppTutor, setWhatsAppTutor] = useState<Tutor | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [preSelectedTutorId, setPreSelectedTutorId] = useState<string | null>(null);
  const [viewStudentsTutor, setViewStudentsTutor] = useState<Tutor | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deletingTutor) return;
    setIsDeleting(true);
    try {
      const res = await deleteTutor(deletingTutor.id);
      // Remove tutor immediately from state
      setTutors(prev => prev.filter(t => t.id !== deletingTutor.id));
      // Close confirmation modal
      setDeletingTutor(null);
      // Refresh global app data (counts, badges, dashboard)
      triggerRefresh();
      // Reload local data
      loadData();
      addToast('success', 'Deleted', res.message || 'Tutor and all related details deleted permanently.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Unable to delete tutor. No data was removed.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Edit Save
  const handleSaveEdit = async (data: Partial<Tutor>) => {
    if (!editingTutor) return;
    try {
      await updateTutor(editingTutor.id, data);
      addToast('success', 'Tutor Updated', 'Tutor details updated successfully.');
      setEditingTutor(null);
      triggerRefresh();
      loadData();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Failed to update tutor details.');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tutorRes, stuRes, assignRes, metricsRes] = await Promise.all([
        fetchTutors({ appointed: 'true' }),
        fetchStudents(),
        fetchTutorStudentAssignments(),
        fetchAssignmentMetrics()
      ]);

      const stuList = stuRes.students || [];
      const allTutors = tutorRes.tutors || [];
      const assignList = assignRes.assignments || [];

      setStudents(stuList);
      setAssignments(assignList);

      if (metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
      }

      // Appointed filter
      const appointedList = allTutors.filter(
        (t) =>
          t.status === 'TUTOR_APPOINTED' ||
          t.status === 'ACTIVE' ||
          t.isAppointed === true ||
          t.is_appointed === true ||
          assignList.some((a) => a.tutorId === t.id)
      );
      setTutors(appointedList);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not load appointed tutors data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleOpenAssignModal = (tutorId?: string) => {
    setPreSelectedTutorId(tutorId || null);
    setIsAssignModalOpen(true);
  };

  const handleOpenViewStudents = (tutor: Tutor) => {
    setViewStudentsTutor(tutor);
  };

  const filteredTutors = tutors.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const tutorAssignments = assignments.filter((a) => a.tutorId === t.id);
    const hasMatchingStudent = tutorAssignments.some(
      (a) =>
        (a.student?.studentName && a.student.studentName.toLowerCase().includes(q)) ||
        (a.subject && a.subject.toLowerCase().includes(q))
    );

    return (
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.preferredLocation && t.preferredLocation.toLowerCase().includes(q)) ||
      (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(q))) ||
      hasMatchingStudent
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner with Prominent + Add New Button */}
      <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-white text-emerald-950 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg tracking-tight">Appointed Tutors & Student Matching</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                {tutors.length} Appointed
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Manage appointed educators and assign tuition students with custom schedules, subjects, and fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Prominent + Add New Button */}
          <button
            onClick={() => handleOpenAssignModal()}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Total Appointed Tutors */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Appointed Tutors</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{metrics.totalAppointedTutors}</span>
            <span className="text-[11px] text-slate-400 font-medium">educators</span>
          </div>
        </div>

        {/* 2. Total Assigned Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Students</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600">{metrics.totalAssignedStudents}</span>
            <span className="text-[11px] text-slate-400 font-medium">enrolled</span>
          </div>
        </div>

        {/* 3. Active Assignments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Lessons</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-teal-600">{metrics.activeAssignments}</span>
            <span className="text-[11px] text-slate-400 font-medium">batches</span>
          </div>
        </div>

        {/* 4. Unassigned Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unassigned</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">{metrics.unassignedStudents}</span>
            <span className="text-[11px] text-slate-400 font-medium">awaiting tutor</span>
          </div>
        </div>

        {/* 5. Tutors With No Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Capacity</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">{metrics.tutorsWithNoStudents}</span>
            <span className="text-[11px] text-slate-400 font-medium">zero students</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tutor, student, subject, phone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredTutors.length}</span> appointed educators
        </div>
      </div>

      {/* Appointed Tutors Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading appointed tutors...</p>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">No Appointed Tutors Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Appointed tutors will appear here. Click &quot;+ Add New&quot; to assign students to an educator.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Tutor Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Subjects</th>
                  <th className="py-3.5 px-4 text-center">Assigned Students</th>
                  <th className="py-3.5 px-4 text-center">Active Lessons</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Timing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTutors.map((t) => {
                  const tutorAssignments = assignments.filter((a) => a.tutorId === t.id);
                  const assignedCount = tutorAssignments.length;
                  const activeAssignmentsCount = tutorAssignments.filter((a) => a.status === 'ACTIVE').length;

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

                      {/* 2. Phone Number */}
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.phone}</span>
                        </div>
                      </td>

                      {/* 3. Subjects */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.subjects && t.subjects.length > 0 ? (
                            t.subjects.map((sub, i) => (
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
                        </div>
                      </td>

                      {/* 4. Assigned Students (Clickable counter) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenViewStudents(t)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            assignedCount > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 shadow-2xs cursor-pointer'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 cursor-pointer'
                          }`}
                          title="Click to view assigned student list"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{assignedCount} Students</span>
                        </button>
                      </td>

                      {/* 5. Active Assignments */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            activeAssignmentsCount > 0
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {activeAssignmentsCount} Active
                        </span>
                      </td>

                      {/* 6. Location */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.preferredLocation || 'Any Location'}</span>
                        </div>
                      </td>

                      {/* 7. Timing */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.availableTiming || 'Flexible'}</span>
                        </div>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>APPOINTED</span>
                        </span>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {/* Edit ✏️ */}
                        <button
                          onClick={() => setEditingTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Edit Tutor"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete 🗑️ */}
                        <button
                          onClick={() => setDeletingTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Delete Tutor Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>

                        {/* View Students */}
                        <button
                          onClick={() => handleOpenViewStudents(t)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="View Assigned Students"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Students</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={() => setWhatsAppTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Send WhatsApp Notice"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Profile */}
                        <button
                          onClick={() => onSelectTutor(t)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Student to Tutor Modal */}
      <AssignStudentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setPreSelectedTutorId(null);
        }}
        appointedTutors={tutors}
        students={students}
        existingAssignments={assignments}
        preSelectedTutorId={preSelectedTutorId}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* View Assigned Students Modal */}
      <ViewAssignedStudentsModal
        isOpen={!!viewStudentsTutor}
        onClose={() => setViewStudentsTutor(null)}
        tutor={viewStudentsTutor}
        assignments={assignments}
        onRefresh={loadData}
        onAssignNewStudent={(tutorId) => {
          handleOpenAssignModal(tutorId);
        }}
      />

      {/* WhatsApp Modal */}
      {whatsAppTutor && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppTutor}
          onClose={() => setWhatsAppTutor(null)}
          recipients={[whatsAppTutor]}
          defaultMessage={`Hello ${whatsAppTutor.fullName},

Official Appointment Notice:
Your tuition assignment details have been confirmed.

Timing: ${whatsAppTutor.availableTiming || 'Flexible'}
Location: ${whatsAppTutor.preferredLocation || 'Agreed Location'}

Please check your schedule in the tutor portal.

Best regards,
Charithra Learning Hub.`}
          onSuccess={() => {
            setWhatsAppTutor(null);
            loadData();
          }}
        />
      )}
      {/* Edit Tutor Modal */}
      {editingTutor && (
        <TutorFormModal
          isOpen={!!editingTutor}
          onClose={() => setEditingTutor(null)}
          onSave={handleSaveEdit}
          initialData={editingTutor}
        />
      )}

      {/* Delete Tutor Permanently Confirmation Modal */}
      {deletingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 pb-4 bg-rose-50/70 border-b border-rose-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Delete Tutor Permanently?
                </h3>
                <p className="text-xs text-rose-700 font-semibold mt-1 leading-relaxed">
                  This action will permanently delete this tutor and all related records. This cannot be undone.
                </p>
              </div>
            </div>

            {/* Tutor Details Card */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Tutor Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{deletingTutor.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</span>
                  <span className="font-bold text-slate-800 font-mono">{deletingTutor.mobile || deletingTutor.phone || deletingTutor.whatsapp || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Email</span>
                  <span className="font-medium text-slate-700">{deletingTutor.email || 'Not Provided'}</span>
                </div>
              </div>

              {/* Student Safety Notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
                <span className="font-bold text-emerald-700 shrink-0">✓ Student Safety:</span>
                <span>Assigned students will NOT be deleted. They will remain safely in the system and become available for re-assignment.</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTutor(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
