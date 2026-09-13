import React, { useState, useEffect, useMemo } from 'react';
import { Tutor, Student, TutorStudentAssignment } from '../../types';
import { createTutorStudentAssignment } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Check,
  ChevronDown
} from 'lucide-react';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointedTutors: Tutor[];
  students: Student[];
  existingAssignments: TutorStudentAssignment[];
  preSelectedTutorId?: string | null;
  onSuccess: () => void;
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

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  onClose,
  appointedTutors,
  students,
  existingAssignments,
  preSelectedTutorId,
  onSuccess
}) => {
  const { addToast } = useApp();

  // Selection states
  const [selectedTutorId, setSelectedTutorId] = useState<string>(preSelectedTutorId || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [tutorDropdownOpen, setTutorDropdownOpen] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  // Form fields
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [lessonType, setLessonType] = useState<'Home Tuition' | 'Online Tuition' | 'Both'>('Home Tuition');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [startTime, setStartTime] = useState('05:00 PM');
  const [endTime, setEndTime] = useState('07:00 PM');
  const [location, setLocation] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(5000);
  const [hourlyFee, setHourlyFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preSelectedTutorId) {
      setSelectedTutorId(preSelectedTutorId);
    }
  }, [preSelectedTutorId]);

  // Selected entities
  const selectedTutor = useMemo(
    () => appointedTutors.find((t) => t.id === selectedTutorId),
    [appointedTutors, selectedTutorId]
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  // When student changes, update defaults
  useEffect(() => {
    if (selectedStudent) {
      setStudentClass(selectedStudent.class || '10th Standard');
      setLocation(selectedStudent.location || '');
      // If student has required subjects, pick the first one matching tutor or first student subject
      const reqSubs = selectedStudent.requiredSubjects || [];
      if (reqSubs.length > 0) {
        if (selectedTutor) {
          const tSubs = Array.isArray(selectedTutor.subjects)
            ? selectedTutor.subjects
            : [selectedTutor.subjects || ''];
          const matched = reqSubs.find((rs) =>
            tSubs.some((ts) => ts.toLowerCase().includes(rs.toLowerCase()))
          );
          setSelectedSubject(matched || reqSubs[0]);
        } else {
          setSelectedSubject(reqSubs[0]);
        }
      }
    }
  }, [selectedStudent, selectedTutor]);

  // When tutor changes, set default fee if empty
  useEffect(() => {
    if (selectedTutor && selectedTutor.expectedSalary) {
      setMonthlyFee(selectedTutor.expectedSalary);
    }
  }, [selectedTutor]);

  // Filtered lists for searchable pickers
  const filteredTutors = useMemo(() => {
    const q = tutorSearch.toLowerCase();
    return appointedTutors.filter(
      (t) =>
        (t.fullName && t.fullName.toLowerCase().includes(q)) ||
        (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
        (t.preferredLocation && t.preferredLocation.toLowerCase().includes(q))
    );
  }, [appointedTutors, tutorSearch]);

  // Distinguish Available vs. Already Assigned Students
  const { availableStudents, assignedStudentsList } = useMemo(() => {
    const q = studentSearch.toLowerCase();
    const filtered = students.filter(
      (s) =>
        (s.studentName && s.studentName.toLowerCase().includes(q)) ||
        (s.class && s.class.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q))
    );

    const avail: Student[] = [];
    const assigned: Student[] = [];

    filtered.forEach((s) => {
      const hasActive = existingAssignments.some(
        (a) => a.studentId === s.id && a.status === 'ACTIVE'
      );
      if (hasActive) {
        assigned.push(s);
      } else {
        avail.push(s);
      }
    });

    return { availableStudents: avail, assignedStudentsList: assigned };
  }, [students, studentSearch, existingAssignments]);

  // Dynamic available subjects
  const availableSubjectOptions = useMemo(() => {
    const setOfSubs = new Set<string>();
    if (selectedStudent?.requiredSubjects) {
      selectedStudent.requiredSubjects.forEach((s) => setOfSubs.add(s));
    }
    if (selectedTutor?.subjects) {
      const subs = Array.isArray(selectedTutor.subjects)
        ? selectedTutor.subjects
        : [selectedTutor.subjects];
      subs.forEach((s) => setOfSubs.add(s));
    }
    // Fallback standard subjects if none listed
    ['Mathematics', 'Science', 'English', 'Tamil', 'Physics', 'Chemistry', 'Social Studies'].forEach(
      (s) => setOfSubs.add(s)
    );
    return Array.from(setOfSubs);
  }, [selectedStudent, selectedTutor]);

  // Conflict Warnings Calculation
  const conflictWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!selectedTutor || !selectedStudent) return warnings;

    // 1. Duplicate check (will also block submission)
    const isDup = existingAssignments.some(
      (a) =>
        a.tutorId === selectedTutor.id &&
        a.studentId === selectedStudent.id &&
        (a.subject || '').toLowerCase() === (selectedSubject || '').toLowerCase() &&
        a.status === 'ACTIVE'
    );
    if (isDup) {
      warnings.push(
        `DUPLICATE ERROR: Tutor ${selectedTutor.fullName} is already actively assigned to ${selectedStudent.studentName} for ${selectedSubject}.`
      );
    }

    // 2. Location mismatch warning
    const tutorLoc = (selectedTutor.preferredLocation || '').toLowerCase();
    const effLoc = (location || selectedStudent.location || '').toLowerCase();
    if (
      tutorLoc &&
      effLoc &&
      !tutorLoc.includes(effLoc) &&
      !effLoc.includes(tutorLoc)
    ) {
      warnings.push(
        `Location Mismatch: Tutor preferred location is "${selectedTutor.preferredLocation}", while student tuition location is "${location || selectedStudent.location}".`
      );
    }

    // 3. Timing overlap warning with tutor's other active lessons
    const otherActive = existingAssignments.filter(
      (a) => a.tutorId === selectedTutor.id && a.status === 'ACTIVE'
    );
    for (const ex of otherActive) {
      const exDays = Array.isArray(ex.days) ? ex.days : [ex.days];
      const common = selectedDays.filter((d) => exDays.includes(d));
      if (common.length > 0 && ex.startTime === startTime) {
        warnings.push(
          `Schedule Overlap: Tutor already has an active lesson (${ex.subject}) on ${common.join(', ')} at ${ex.startTime}.`
        );
        break;
      }
    }

    // 4. Subject compatibility warning
    if (selectedSubject) {
      const tSubs = Array.isArray(selectedTutor.subjects)
        ? selectedTutor.subjects
        : [selectedTutor.subjects || ''];
      const teaches = tSubs.some((s) =>
        s.toLowerCase().includes(selectedSubject.toLowerCase())
      );
      if (!teaches) {
        warnings.push(
          `Subject Alert: ${selectedTutor.fullName}'s listed profile subjects (${tSubs.join(', ')}) do not explicitly include "${selectedSubject}".`
        );
      }
    }

    return warnings;
  }, [
    selectedTutor,
    selectedStudent,
    selectedSubject,
    location,
    selectedDays,
    startTime,
    existingAssignments
  ]);

  const isDuplicateBlocking = conflictWarnings.some((w) => w.startsWith('DUPLICATE ERROR'));

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorId || !selectedStudentId || !selectedSubject || !startDate) {
      addToast('error', 'Missing Information', 'Please complete all required fields.');
      return;
    }

    if (isDuplicateBlocking) {
      addToast('error', 'Duplicate Assignment', 'This tutor is already actively assigned to this student for this subject.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTutorStudentAssignment({
        tutorId: selectedTutorId,
        studentId: selectedStudentId,
        subject: selectedSubject,
        class: studentClass,
        lessonType,
        days: selectedDays,
        startTime,
        endTime,
        location,
        monthlyFee: Number(monthlyFee) || 5000,
        hourlyFee: hourlyFee ? Number(hourlyFee) : undefined,
        startDate,
        notes
      });

      if (res.success) {
        addToast('success', 'Student Assigned', 'Student assigned successfully.');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      addToast('error', 'Assignment Failed', err.message || 'Failed to save student assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Assign Student to Tutor</h3>
              <p className="text-xs text-slate-500">
                Match an available student with an appointed educator and configure tuition schedule & fees.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conflict Warnings Box */}
          {conflictWarnings.length > 0 && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isDuplicateBlocking
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  {isDuplicateBlocking ? 'Action Blocked: Duplicate Active Assignment' : 'Assignment Advisory Warnings'}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {conflictWarnings.map((w, idx) => (
                  <li key={idx} className="font-medium">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Tutor & Student Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tutor Picker */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Appointed Tutor *</span>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase">Recruitment Approved</span>
              </label>

              <div
                onClick={() => setTutorDropdownOpen(!tutorDropdownOpen)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                {selectedTutor ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        selectedTutor.photo ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedTutor.fullName)}`
                      }
                      alt={selectedTutor.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{selectedTutor.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {Array.isArray(selectedTutor.subjects) ? selectedTutor.subjects.join(', ') : selectedTutor.subjects} &bull; {selectedTutor.preferredLocation}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Select Appointed Tutor...</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Dropdown Menu */}
              {tutorDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 max-h-60 overflow-y-auto">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search tutor name or location..."
                      value={tutorSearch}
                      onChange={(e) => setTutorSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filteredTutors.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTutorId(t.id);
                          setTutorDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                          t.id === selectedTutorId ? 'bg-emerald-50/80 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{t.fullName}</div>
                          <div className="text-[10px] text-slate-500">
                            {Array.isArray(t.subjects) ? t.subjects.join(', ') : t.subjects} | {t.preferredLocation}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {t.whatsappPhoneNumber || t.mobile || t.phone}
                          </div>
                        </div>
                        {t.id === selectedTutorId && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Picker */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Student to Assign *</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Tirunelveli Inquiries</span>
              </label>

              <div
                onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                {selectedStudent ? (
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {selectedStudent.studentName} ({selectedStudent.class || 'Class 10'})
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Req: {selectedStudent.requiredSubjects?.join(', ') || 'General'} | {selectedStudent.location}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Select Student Candidate...</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Student Dropdown Menu with Available vs Assigned tabs */}
              {studentDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 max-h-64 overflow-y-auto">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search student by name, class, area..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                    />
                  </div>

                  {/* Available Students Group */}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 rounded-lg mb-1 flex items-center justify-between">
                    <span>Available Students ({availableStudents.length})</span>
                    <span className="text-[9px] font-normal">No Active Tutor</span>
                  </div>
                  <div className="divide-y divide-slate-100 mb-2">
                    {availableStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setStudentDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                          s.id === selectedStudentId ? 'bg-emerald-50/80 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{s.studentName}</div>
                          <div className="text-[10px] text-slate-500">
                            {s.class} &bull; {s.requiredSubjects?.join(', ')} &bull; {s.location}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Contact: {s.phone || s.parentPhone}</div>
                        </div>
                        {s.id === selectedStudentId && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {/* Already Assigned Students Group */}
                  {assignedStudentsList.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 rounded-lg mb-1 flex items-center justify-between">
                        <span>Already Assigned Students ({assignedStudentsList.length})</span>
                        <span className="text-[9px] font-normal">Eligible for other subjects</span>
                      </div>
                      <div className="divide-y divide-slate-100 opacity-80">
                        {assignedStudentsList.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setStudentDropdownOpen(false);
                            }}
                            className={`p-2 rounded-xl text-xs hover:bg-slate-100 cursor-pointer flex items-center justify-between transition-colors ${
                              s.id === selectedStudentId ? 'bg-slate-100 font-bold' : ''
                            }`}
                          >
                            <div>
                              <div className="font-medium text-slate-800">{s.studentName}</div>
                              <div className="text-[10px] text-slate-500">
                                {s.class} &bull; {s.requiredSubjects?.join(', ')} &bull; {s.location}
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Assigned
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Subject, Class & Lesson Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subject to Teach *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-semibold"
              >
                {availableSubjectOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class / Grade</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="e.g. 10th Standard"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lesson Type</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                {(['Home Tuition', 'Online Tuition', 'Both'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLessonType(type)}
                    className={`py-1.5 rounded-lg transition-all text-center truncate ${
                      lessonType === type
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Days Multi-Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Class Days (Weekly Schedule)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Timing & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="05:00 PM"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="07:00 PM"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tuition Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Palayamkottai, Tirunelveli"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 5: Fees & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Fee (₹)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Fee (Optional ₹)</label>
              <input
                type="number"
                value={hourlyFee}
                onChange={(e) => setHourlyFee(e.target.value)}
                placeholder="e.g. 350"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assignment Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Special Notes / Syllabus Plan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Board exam revision, weekly practice tests, chapter reviews..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || isDuplicateBlocking || !selectedTutorId || !selectedStudentId}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Assigning...' : 'Assign Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
