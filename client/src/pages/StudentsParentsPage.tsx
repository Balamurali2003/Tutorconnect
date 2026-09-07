import React, { useState, useEffect } from 'react';
import { Student, Parent } from '../types';
import { fetchStudents, createStudent, updateStudent, deleteStudent, fetchParents, createParent, updateParent, deleteParent } from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { GraduationCap, UserPlus, Users, Sparkles, Edit3, Trash2, MapPin, Clock, Search, RotateCcw } from 'lucide-react';

/* -------------------------------------------------------------
 * 1. Students Page
 * ----------------------------------------------------------- */
export const StudentsPage: React.FC<{ requirementsOnly?: boolean }> = ({ requirementsOnly }) => {
  const { addToast, setActiveTab, setSelectedTutorId } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('10th Standard');
  const [formSchool, setFormSchool] = useState('');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formReq, setFormReq] = useState('');
  const [formLocation, setFormLocation] = useState('Tiruchirappalli');
  const [formTiming, setFormTiming] = useState('5:00 PM');
  const [formBudget, setFormBudget] = useState(15000);
  const [formParentId, setFormParentId] = useState('par-001');

  const loadData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (classFilter !== 'ALL') params.class = classFilter;
      if (platformFilter !== 'ALL') params.platform = platformFilter;

      const sRes = await fetchStudents(params);
      const pRes = await fetchParents();
      setStudents(sRes.students || []);
      setParents(pRes.parents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [search, classFilter, platformFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setClassFilter('ALL');
    setPlatformFilter('ALL');
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormClass('10th Standard');
    setFormSchool('');
    setFormSubject('Mathematics');
    setFormReq('');
    setFormLocation('Tiruchirappalli');
    setFormTiming('5:00 PM');
    setFormBudget(15000);
    setFormParentId(parents[0]?.id || 'par-001');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormName(s.studentName);
    setFormClass(s.class);
    setFormSchool(s.school || '');
    setFormSubject((s.requiredSubjects || []).join(', '));
    setFormReq(s.learningRequirements || '');
    setFormLocation(s.location || '');
    setFormTiming(s.preferredTiming || '');
    setFormBudget(s.budget || 0);
    setFormParentId(s.parentId);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = formSubject.split(',').map(s => s.trim()).filter(Boolean);
    const payload: Partial<Student> = {
      studentName: formName,
      class: formClass,
      school: formSchool,
      requiredSubjects: subjects,
      learningRequirements: formReq,
      location: formLocation,
      preferredTiming: formTiming,
      budget: formBudget,
      parentId: formParentId
    };

    if (editingStudent) {
      await updateStudent(editingStudent.id, payload);
      addToast('success', 'Student Updated', `${formName} records updated.`);
    } else {
      await createStudent(payload);
      addToast('success', 'Student Registered', `${formName} added to system.`);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    await deleteStudent(deletingStudent.id);
    addToast('success', 'Student Removed', `${deletingStudent.studentName} deleted.`);
    setDeletingStudent(null);
    loadData();
  };

  const displayList = requirementsOnly 
    ? students.filter(s => s.status === 'LOOKING_FOR_TUTOR')
    : students;

  // Unique classes for filter
  const classOptions = Array.from(new Set(students.map(s => s.class).filter(Boolean))).sort();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {requirementsOnly ? 'Unfilled Student Requirements' : 'Student Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {requirementsOnly ? 'Active tutoring requests waiting for tutor assignments' : 'Complete student registry, class levels, contact info, and campaign source'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Student Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name, phone, email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-medium"
            >
              <option value="ALL">All Classes</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-medium"
            >
              <option value="ALL">All Platforms</option>
              <option value="fb">Facebook (fb)</option>
              <option value="ig">Instagram (ig)</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Real Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent Contact Number</th>
                <th className="py-3 px-4">Parent Email</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayList.map(s => {
                  const createdStr = s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600 whitespace-nowrap">{s.studentId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {s.studentName}
                        {s.externalLeadId && (
                          <span className="text-[10px] text-slate-400 font-mono font-normal block">{s.externalLeadId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {s.class}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                        {s.parentPhone || s.phone || 'Not Provided'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[170px] truncate" title={s.parentEmail || s.email || ''}>
                        {s.parentEmail || s.email || 'Not Provided'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                          s.platform?.toLowerCase() === 'ig'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {s.platform || 'fb'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                        {createdStr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          s.status === 'TUTOR_ASSIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.status === 'TUTOR_ASSIGNED' ? 'Assigned' : 'Looking for Tutor'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveTab('tutor-matching')}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Find Matching Tutor"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            title="Edit Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Student Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class *</label>
              <input
                type="text"
                required
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">School</label>
              <input
                type="text"
                value={formSchool}
                onChange={(e) => setFormSchool(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subjects (Comma separated) *</label>
              <input
                type="text"
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Location *</label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Budget (?/month) *</label>
              <input
                type="number"
                required
                value={formBudget}
                onChange={(e) => setFormBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 font-bold"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Learning Requirements</label>
            <textarea
              rows={2}
              value={formReq}
              onChange={(e) => setFormReq(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-sm">Save Student</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${deletingStudent?.studentName}?`}
        type="danger"
      />
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. Parents Page (With 1-to-Many Associated Students View)
 * ----------------------------------------------------------- */
export const ParentsPage: React.FC = () => {
  const { addToast } = useApp();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [deletingParent, setDeletingParent] = useState<Parent | null>(null);

  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOcc, setFormOcc] = useState('');
  const [formBudget, setFormBudget] = useState(15000);
  const [formPref, setFormPref] = useState('Experienced tutor');

  const loadData = async () => {
    const pRes = await fetchParents();
    const sRes = await fetchStudents();
    setParents(pRes.parents || []);
    setStudents(sRes.students || []);
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingParent(null);
    setFormName('');
    setFormMobile('+91 98421 00000');
    setFormEmail('');
    setFormAddress('');
    setFormOcc('');
    setFormBudget(15000);
    setFormPref('Experienced CBSE tutor');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Parent) => {
    setEditingParent(p);
    setFormName(p.parentName);
    setFormMobile(p.mobile);
    setFormEmail(p.email);
    setFormAddress(p.address);
    setFormOcc(p.occupation);
    setFormBudget(p.budget);
    setFormPref(p.tutorPreference);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Parent> = {
      parentName: formName,
      mobile: formMobile,
      whatsapp: formMobile,
      email: formEmail,
      address: formAddress,
      occupation: formOcc,
      budget: formBudget,
      tutorPreference: formPref
    };

    if (editingParent) {
      await updateParent(editingParent.id, payload);
      addToast('success', 'Parent Updated', `${formName} details updated.`);
    } else {
      await createParent(payload);
      addToast('success', 'Parent Registered', `${formName} added.`);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingParent) return;
    await deleteParent(deletingParent.id);
    addToast('success', 'Parent Deleted', `${deletingParent.parentName} removed.`);
    setDeletingParent(null);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Parent Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Directory of parents and their 1-to-many associated students</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Parent</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-3 px-4">Parent ID</th>
              <th className="py-3 px-4">Parent Name</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Occupation</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Associated Students</th>
              <th className="py-3 px-4">Budget</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parents.map(p => {
              const myStudents = students.filter(s => s.parentId === p.id);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">{p.parentId}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.parentName}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className="font-semibold block">{p.mobile}</span>
                    <span className="text-slate-400 block">{p.email}</span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">{p.occupation}</td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[150px] truncate">{p.address}</td>
                  <td className="py-3 px-4 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {myStudents.length === 0 ? (
                        <span className="text-slate-400 italic">None</span>
                      ) : (
                        myStudents.map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            {s.studentName} ({s.class})
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono font-bold text-slate-900">?{p.budget?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingParent(p)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParent ? 'Edit Parent' : 'Add New Parent'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Parent Name *</label>
              <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile *</label>
              <input type="text" required value={formMobile} onChange={(e) => setFormMobile(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
              <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Occupation</label>
              <input type="text" value={formOcc} onChange={(e) => setFormOcc(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Address *</label>
            <input type="text" required value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-sm">Save Parent</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingParent}
        onClose={() => setDeletingParent(null)}
        onConfirm={handleDelete}
        title="Delete Parent"
        message={`Are you sure you want to delete ${deletingParent?.parentName}?`}
        type="danger"
      />
    </div>
  );
};
