import React, { useState, useEffect } from 'react';
import { TutorDailyUpdate } from '../../types';
import { fetchTutorDailyUpdates, deleteTutorDailyUpdate, fetchTutorStudents } from '../../services/api';
import { TutorDailyUpdateModal } from '../../components/tutor/TutorDailyUpdateModal';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Camera,
  Trash2,
  Edit2,
  Filter,
  Eye,
  X
} from 'lucide-react';

export const TutorUpdateHistoryPage: React.FC = () => {
  const { addToast } = useApp();
  const [updates, setUpdates] = useState<TutorDailyUpdate[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [editUpdate, setEditUpdate] = useState<TutorDailyUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    fetchTutorStudents().then(res => setStudents(res.students || [])).catch(() => {});
    fetchTutorDailyUpdates({
      studentId: selectedStudent || undefined,
      date: selectedDate || undefined,
      subject: selectedSubject || undefined
    }).then(res => setUpdates(res.updates || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [selectedStudent, selectedDate, selectedSubject]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTutorDailyUpdate(id);
      addToast('success', 'Update Deleted', 'Daily update deleted successfully.');
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teaching Update History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, edit, or remove all daily updates you have posted for your students
          </p>
        </div>

        <button
          onClick={() => {
            setEditUpdate(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          + Post New Update
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </div>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Students</option>
          {students.map(s => (
            <option key={s.studentId} value={s.studentId}>{s.studentName}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />

        {(selectedStudent || selectedDate || selectedSubject) && (
          <button
            onClick={() => {
              setSelectedStudent('');
              setSelectedDate('');
              setSelectedSubject('');
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-auto cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {updates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No daily updates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {updates.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{u.studentName}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    {u.subject}
                  </span>
                  {u.studentProgress && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                      {u.studentProgress}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {u.updateDate}
                  </span>
                  {u.classTiming && <span>• {u.classTiming}</span>}
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {u.thought}
                </p>

                {u.topicsCovered && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <span className="font-bold text-slate-700">Topics Covered: </span>
                    {u.topicsCovered}
                  </div>
                )}

                {u.homework && (
                  <div className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="font-bold">Homework: </span>
                    {u.homework}
                  </div>
                )}

                {u.imageUrl && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setViewingImage(u.imageUrl || null)}
                      className="inline-flex items-center gap-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <img
                        src={u.imageUrl}
                        alt="Class whiteboard"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="text-xs font-semibold text-slate-700 px-2 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Full Photo
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditUpdate(u);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(u.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Update?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete this daily update? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingImage}
              alt="Class update"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <TutorDailyUpdateModal
        isOpen={isModalOpen}
        initialUpdate={editUpdate}
        onClose={() => {
          setIsModalOpen(false);
          setEditUpdate(null);
        }}
        onSuccess={() => {
          addToast('success', 'Saved', 'Update saved successfully.');
          loadData();
        }}
      />
    </div>
  );
};
