import React, { useState, useEffect } from 'react';
import { Tutor, PriorityType } from '../../types';
import { Modal } from '../common/Modal';

interface TutorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tutor>) => Promise<void>;
  initialData?: Tutor | null;
}

export const TutorFormModal: React.FC<TutorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Tutor>>({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    gender: 'Male',
    dob: '1995-05-15',
    qualification: '',
    specialization: '',
    experienceYears: 3,
    subjects: ['Mathematics'],
    preferredLocation: 'Tiruchirappalli',
    availableTiming: '5:00 PM - 7:00 PM',
    expectedSalary: 15000,
    priority: 'HIGH_PRIORITY'
  });

  const [loading, setLoading] = useState(false);
  const [subjectsInput, setSubjectsInput] = useState('Mathematics');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setSubjectsInput((initialData.subjects || []).join(', '));
    } else {
      setFormData({
        fullName: '',
        mobile: '',
        whatsapp: '',
        email: '',
        gender: 'Male',
        dob: '1995-05-15',
        qualification: '',
        specialization: '',
        experienceYears: 3,
        subjects: ['Mathematics'],
        preferredLocation: 'Tiruchirappalli',
        availableTiming: '5:00 PM - 7:00 PM',
        expectedSalary: 15000,
        priority: 'HIGH_PRIORITY'
      });
      setSubjectsInput('Mathematics');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedSubjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      await onSave({
        ...formData,
        subjects: parsedSubjects.length > 0 ? parsedSubjects : ['General']
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Tutor Profile' : 'Add New Tutor'}
      subtitle="Enter tutor professional details and recruitment priority"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="arun.kumar@gmail.com"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              value={formData.mobile || ''}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value, whatsapp: formData.whatsapp || e.target.value })}
              placeholder="+91 98421 54321"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+91 98421 54321"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
            <select
              value={formData.gender || 'Male'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob || '1995-01-01'}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Qualification *</label>
            <input
              type="text"
              required
              value={formData.qualification || ''}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. M.Sc Mathematics, B.Ed"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Specialization</label>
            <input
              type="text"
              value={formData.specialization || ''}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Calculus & Pure Mathematics"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Experience in Years */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Experience (Years) *</label>
            <input
              type="number"
              min="0"
              max="50"
              required
              value={formData.experienceYears ?? 0}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Expected Salary */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Expected Salary (?/month) *</label>
            <input
              type="number"
              min="0"
              step="500"
              required
              value={formData.expectedSalary ?? 15000}
              onChange={(e) => setFormData({ ...formData, expectedSalary: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Preferred Location */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Location *</label>
            <input
              type="text"
              required
              value={formData.preferredLocation || ''}
              onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
              placeholder="e.g. Tiruchirappalli"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Available Timing */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Available Timing</label>
            <input
              type="text"
              value={formData.availableTiming || ''}
              onChange={(e) => setFormData({ ...formData, availableTiming: e.target.value })}
              placeholder="e.g. 5:00 PM - 7:00 PM"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Recruitment Priority *</label>
            <select
              value={formData.priority || 'HIGH_PRIORITY'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-semibold"
            >
              <option value="HIGH_PRIORITY">?? High Priority</option>
              <option value="LOW_PRIORITY">?? Low Priority</option>
            </select>
          </div>

          {/* Subjects */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Subjects (Comma separated) *</label>
            <input
              type="text"
              required
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              placeholder="e.g. Mathematics, Vedic Maths, Science"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Tutor')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
