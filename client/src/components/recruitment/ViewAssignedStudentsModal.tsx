import React, { useState } from 'react';
import { Tutor, TutorStudentAssignment, AssignmentStatus } from '../../types';
import { updateAssignmentStatus, updateTutorStudentAssignment } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  XCircle,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ViewAssignedStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  assignments: TutorStudentAssignment[];
  onRefresh: () => void;
  onAssignNewStudent: (tutorId: string) => void;
}

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const ViewAssignedStudentsModal: React.FC<ViewAssignedStudentsModalProps> = ({
  isOpen,
  onClose,
  tutor,
  assignments,
  onRefresh,
  onAssignNewStudent
}) => {
  const { addToast } = useApp();
  const [editingAssignment, setEditingAssignment] = useState<TutorStudentAssignment | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  if (!isOpen || !tutor) return null;

  const tutorAssignments = assignments.filter((a) => a.tutorId === tutor.id);

  const activeCount = tutorAssignments.filter((a) => a.status === 'ACTIVE').length;
  const pausedCount = tutorAssignments.filter((a) => a.status === 'PAUSED').length;
  const completedCount = tutorAssignments.filter((a) => a.status === 'COMPLETED').length;
  const totalMonthlyFee = tutorAssignments
    .filter((a) => a.status === 'ACTIVE')
    .reduce((sum, a) => sum + (Number(a.monthlyFee) || 0), 0);

  const handleStatusChange = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      setUpdatingStatusId(assignmentId);
      await updateAssignmentStatus(assignmentId, newStatus);
      addToast('success', 'Status Updated', `Assignment status changed to ${newStatus}`);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update assignment status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleStartEdit = (assignment: TutorStudentAssignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      class: assignment.class || '',
      lessonType: assignment.lessonType || 'Home Tuition',
      days: assignment.days || [],
      startTime: assignment.startTime || '17:00',
      endTime: assignment.endTime || '18:30',
      location: assignment.location || '',
      monthlyFee: assignment.monthlyFee || '',
      hourlyFee: assignment.hourlyFee || '',
      startDate: assignment.startDate || '',
      status: assignment.status || 'ACTIVE',
      notes: assignment.notes || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    if (!editFormData.days || editFormData.days.length === 0) {
      addToast('error', 'Validation Error', 'Please select at least one tuition day');
      return;
    }

    try {
      setSavingEdit(true);
      await updateTutorStudentAssignment(editingAssignment.id, {
        class: editFormData.class,
        lessonType: editFormData.lessonType,
        days: editFormData.days,
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        location: editFormData.location,
        monthlyFee: Number(editFormData.monthlyFee) || 0,
        hourlyFee: editFormData.hourlyFee ? Number(editFormData.hourlyFee) : undefined,
        startDate: editFormData.startDate,
        status: editFormData.status,
        notes: editFormData.notes
      });
      addToast('success', 'Assignment Updated', 'Tuition details updated successfully');
      setEditingAssignment(null);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Failed to update assignment details');
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleEditDay = (day: string) => {
    setEditFormData((prev: any) => {
      const currentDays = prev.days || [];
      if (currentDays.includes(day)) {
        return { ...prev, days: currentDays.filter((d: string) => d !== day) };
      } else {
        return { ...prev, days: [...currentDays, day] };
      }
    });
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ACTIVE
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <PauseCircle className="w-3 h-3 text-amber-600" />
            PAUSED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={
                tutor.photo ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(tutor.fullName)}`
              }
              alt={tutor.fullName}
              className="w-12 h-12 rounded-xl border-2 border-emerald-500 bg-slate-100 object-cover shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">
                  Assigned Students
                </h3>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  {tutor.fullName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">({tutor.tutorId})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {tutor.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {tutor.preferredLocation || 'Any Location'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {tutor.availableTiming || 'Flexible'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAssignNewStudent(tutor.id);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Another Student</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Total Assigned:</span>
            <span className="font-black text-slate-900 text-base">{tutorAssignments.length}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">Active:</span>
            <span className="font-black text-emerald-700 text-base">{activeCount}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between">
            <span className="text-amber-700 font-semibold">Paused:</span>
            <span className="font-black text-amber-700 text-base">{pausedCount}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-between">
            <span className="text-indigo-700 font-semibold">Active Monthly Fee:</span>
            <span className="font-black text-indigo-700 text-base font-mono">RM {totalMonthlyFee}</span>
          </div>
        </div>

        {/* Modal Body / Assignment List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {tutorAssignments.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Students Assigned Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {tutor.fullName} is appointed and available for student assignments.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAssignNewStudent(tutor.id);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Student Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tutorAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs hover:shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {assignment.student?.studentName || 'Student'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {assignment.class || 'Standard'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {assignment.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span>Student ID: {assignment.student?.studentId || assignment.studentId}</span>
                          {assignment.student?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {assignment.student.phone}
                            </span>
                          )}
                          {assignment.student?.parentPhone && (
                            <span className="flex items-center gap-1">
                              Parent: {assignment.student.parentPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {getStatusBadge(assignment.status)}
                      <button
                        onClick={() => handleStartEdit(assignment)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Assignment Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule, Location & Fee Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Schedule & Timing
                      </span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {assignment.startTime} - {assignment.endTime}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {assignment.days?.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-600"
                          >
                            {d.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Location & Mode
                      </span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{assignment.location || 'Student Address'}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {assignment.lessonType}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Fee & Start Date
                      </span>
                      <div className="font-bold text-slate-900 font-mono mt-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>RM {assignment.monthlyFee}/month</span>
                        {assignment.hourlyFee && (
                          <span className="text-[10px] text-slate-500 font-normal font-sans">
                            (RM {assignment.hourlyFee}/hr)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Starts: {assignment.startDate || 'Immediate'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="text-[11px] text-slate-500 italic truncate max-w-md">
                      {assignment.notes ? `Note: "${assignment.notes}"` : 'No additional notes'}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {assignment.status === 'ACTIVE' && (
                        <>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'PAUSED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <PauseCircle className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'COMPLETED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'CANCELLED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {assignment.status === 'PAUSED' && (
                        <>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'ACTIVE')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'COMPLETED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                          <button
                            disabled={updatingStatusId === assignment.id}
                            onClick={() => handleStatusChange(assignment.id, 'CANCELLED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {(assignment.status === 'COMPLETED' || assignment.status === 'CANCELLED') && (
                        <button
                          disabled={updatingStatusId === assignment.id}
                          onClick={() => handleStatusChange(assignment.id, 'ACTIVE')}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>Re-activate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Viewing {tutorAssignments.length} student assignments for {tutor.fullName}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Assignment Modal Sub-dialog */}
      {editingAssignment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm tracking-tight">
                  Edit Tuition Details
                </h4>
                <p className="text-xs text-slate-500">
                  {editingAssignment.student?.studentName} • {editingAssignment.subject}
                </p>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class / Standard</label>
                  <input
                    type="text"
                    value={editFormData.class}
                    onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Type</label>
                  <select
                    value={editFormData.lessonType}
                    onChange={(e) => setEditFormData({ ...editFormData, lessonType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Home Tuition">Home Tuition</option>
                    <option value="Online Tuition">Online Tuition</option>
                    <option value="Both">Both (Hybrid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tuition Days</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isSelected = editFormData.days?.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleEditDay(day)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (RM)</label>
                  <input
                    type="number"
                    value={editFormData.monthlyFee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Fee (Optional)</label>
                  <input
                    type="number"
                    value={editFormData.hourlyFee}
                    onChange={(e) => setEditFormData({ ...editFormData, hourlyFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
