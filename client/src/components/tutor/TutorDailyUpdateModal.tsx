import React, { useState, useEffect } from 'react';
import { TutorDailyUpdate } from '../../types';
import { createTutorDailyUpdate, updateTutorDailyUpdate, fetchTutorStudents } from '../../services/api';
import {
  X,
  Calendar,
  User,
  BookOpen,
  Clock,
  Sparkles,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TutorDailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialUpdate?: TutorDailyUpdate | null;
  presetStudentId?: string;
}

export const TutorDailyUpdateModal: React.FC<TutorDailyUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialUpdate,
  presetStudentId
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [thought, setThought] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [homework, setHomework] = useState('');
  const [studentProgress, setStudentProgress] = useState('Good');
  const [classTiming, setClassTiming] = useState('05:00 PM - 06:30 PM');
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetchTutorStudents().then(res => setStudents(res.students || [])).catch(() => {});

    if (initialUpdate) {
      setDate(initialUpdate.updateDate || new Date().toISOString().slice(0, 10));
      setStudentId(initialUpdate.studentId || 'ALL');
      setSubject(initialUpdate.subject || '');
      setThought(initialUpdate.thought || '');
      setTopicsCovered(initialUpdate.topicsCovered || '');
      setHomework(initialUpdate.homework || '');
      setStudentProgress(initialUpdate.studentProgress || 'Good');
      setClassTiming(initialUpdate.classTiming || '05:00 PM - 06:30 PM');
      setNotes(initialUpdate.notes || '');
      setImagePreview(initialUpdate.imageUrl || null);
      setSelectedFile(null);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setStudentId(presetStudentId || '');
      setSubject('');
      setThought('');
      setTopicsCovered('');
      setHomework('');
      setStudentProgress('Good');
      setClassTiming('05:00 PM - 06:30 PM');
      setNotes('');
      setImagePreview(null);
      setSelectedFile(null);
    }
    setError(null);
  }, [isOpen, initialUpdate, presetStudentId]);

  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    if (id && id !== 'ALL') {
      const match = students.find(s => s.studentId === id);
      if (match && match.subject) {
        setSubject(match.subject);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Please select or enter the subject.');
      return;
    }
    if (!thought.trim()) {
      setError("Please enter today's teaching update details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('date', date);
      formData.append('updateDate', date);
      formData.append('studentId', studentId || 'ALL');
      formData.append('subject', subject.trim());
      formData.append('thought', thought.trim());
      formData.append('topicsCovered', topicsCovered.trim());
      formData.append('homework', homework.trim());
      formData.append('studentProgress', studentProgress);
      formData.append('classTiming', classTiming.trim());
      formData.append('notes', notes.trim());

      if (selectedFile) {
        formData.append('photo', selectedFile);
      } else if (!imagePreview && initialUpdate?.imageUrl) {
        formData.append('imageUrl', '');
      }

      if (initialUpdate) {
        await updateTutorDailyUpdate(initialUpdate.id, formData);
      } else {
        await createTutorDailyUpdate(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save daily update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialUpdate ? 'Edit Daily Teaching Update' : 'Post Daily Teaching Update'}
              </h2>
              <p className="text-xs text-slate-500">
                Update parents and administrators on today\'s lesson and student progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Student *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Student...</option>
                  <option value="ALL">General Update (All Students)</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.class} - {s.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Science"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class Timing
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classTiming}
                  onChange={(e) => setClassTiming(e.target.value)}
                  placeholder="e.g. 05:00 PM - 06:30 PM"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Today\'s Teaching Update / Thought *
              </label>
              <span className="text-[11px] text-slate-400">{thought.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="What was taught today? How was the student\'s response? Share key learning highlights..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topics Covered
              </label>
              <input
                type="text"
                value={topicsCovered}
                onChange={(e) => setTopicsCovered(e.target.value)}
                placeholder="e.g. Exercise 4.2, Formula method"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Homework Assigned
              </label>
              <input
                type="text"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="e.g. Solve Q1 to Q10 in notebook"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Student Progress
              </label>
              <select
                value={studentProgress}
                onChange={(e) => setStudentProgress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="Excellent">⭐ Excellent (Mastered concept)</option>
                <option value="Good">👍 Good (Understands well)</option>
                <option value="Average">👌 Average (Needs revision)</option>
                <option value="Needs Attention">⚠️ Needs Attention (Struggling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Private Remarks (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks for tuition centre or parent"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Classroom / Whiteboard / Homework Photo (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">JPG, PNG, WEBP (Max 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Class update preview"
                  className="max-h-48 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl shadow-lg hover:bg-rose-700 transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-indigo-600">Click to upload photo</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Capture whiteboard work or homework sheet</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {initialUpdate ? 'Save Changes' : 'Publish Daily Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
