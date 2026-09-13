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
    phone: '',
    whatsapp: '',
    email: '',
    gender: 'Male',
    dob: '1995-05-15',
    qualification: '',
    specialization: '',
    experienceYears: 3,
    experience: '3 Years',
    subjects: ['Mathematics'],
    preferredLocation: 'Tirunelveli',
    availableDays: 'Monday, Wednesday, Friday',
    availableTiming: '5:00 PM - 7:00 PM',
    expectedSalary: 15000,
    homeTuitionAvailable: 'Yes',
    priority: 'HIGH_PRIORITY',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [subjectsInput, setSubjectsInput] = useState('Mathematics');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        mobile: initialData.mobile || initialData.phone || '',
        phone: initialData.phone || initialData.mobile || '',
        homeTuitionAvailable: initialData.homeTuitionAvailable || 'Yes',
        availableDays: initialData.availableDays || 'Monday, Wednesday, Friday',
        notes: initialData.notes || ''
      });
      setSubjectsInput((initialData.subjects || []).join(', '));
    } else {
      setFormData({
        fullName: '',
        mobile: '',
        phone: '',
        whatsapp: '',
        email: '',
        gender: 'Male',
        dob: '1995-05-15',
        qualification: '',
        specialization: '',
        experienceYears: 3,
        experience: '3 Years',
        subjects: ['Mathematics'],
        preferredLocation: 'Tirunelveli',
        availableDays: 'Monday, Wednesday, Friday',
        availableTiming: '5:00 PM - 7:00 PM',
        expectedSalary: 15000,
        homeTuitionAvailable: 'Yes',
        priority: 'HIGH_PRIORITY',
        notes: ''
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
        phone: formData.mobile || formData.phone,
        experience: `${formData.experienceYears ?? 0} Years`,
        subjects: parsedSubjects.length > 0 ? parsedSubjects : ['General Coaching'],
        subjectsText: parsedSubjects.length > 0 ? parsedSubjects.join(', ') : 'General Coaching'
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
      subtitle="Update tutor professional details, teaching subjects, and recruitment priority"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 1. Full Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 2. Phone / Mobile */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number (Mobile) *</label>
            <input
              type="text"
              required
              value={formData.mobile || ''}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 3. Email */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="arun.kumar@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 4. WhatsApp Number */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 5. Qualification */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Qualification *</label>
            <input
              type="text"
              required
              value={formData.qualification || ''}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. M.Sc Mathematics, B.Ed"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 6. Experience in Years */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Teaching Experience (Years) *</label>
            <input
              type="number"
              min="0"
              max="50"
              required
              value={formData.experienceYears ?? 0}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 7. Preferred Location */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Location / Area *</label>
            <input
              type="text"
              required
              value={formData.preferredLocation || ''}
              onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
              placeholder="e.g. Tirunelveli, Palayamkottai"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 8. Available Days */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Available Days</label>
            <input
              type="text"
              value={formData.availableDays || ''}
              onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
              placeholder="e.g. Monday, Wednesday, Friday"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 9. Available Timing */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Available Timing</label>
            <input
              type="text"
              value={formData.availableTiming || ''}
              onChange={(e) => setFormData({ ...formData, availableTiming: e.target.value })}
              placeholder="e.g. 5:00 PM - 7:00 PM"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 10. Expected Salary */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Expected Salary (₹ / month)</label>
            <input
              type="number"
              min="0"
              step="500"
              value={formData.expectedSalary ?? 0}
              onChange={(e) => setFormData({ ...formData, expectedSalary: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 11. Home Tuition Availability */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Home Tuition Availability</label>
            <select
              value={formData.homeTuitionAvailable || 'Yes'}
              onChange={(e) => setFormData({ ...formData, homeTuitionAvailable: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-semibold"
            >
              <option value="Yes">Yes (Available for Home Visits)</option>
              <option value="No">No (Online / Centre Only)</option>
            </select>
          </div>

          {/* 12. Recruitment Priority */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Recruitment Priority *</label>
            <select
              value={formData.priority || 'HIGH_PRIORITY'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-semibold"
            >
              <option value="HIGH_PRIORITY">🔴 High Priority (Score 80-100)</option>
              <option value="MEDIUM_PRIORITY">🟠 Medium Priority (Score 60-79)</option>
              <option value="LOW_PRIORITY">🟡 Low Priority (Score 0-59)</option>
            </select>
          </div>

          {/* 13. Subjects */}
          <div className="md:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Subjects (Comma separated) *</label>
            <input
              type="text"
              required
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              placeholder="e.g. Mathematics, Physics, Chemistry"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 14. Notes */}
          <div className="md:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Candidate Notes / Remarks</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional background, preferred syllabus (CBSE/State Board), interview remarks..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Tutor')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
