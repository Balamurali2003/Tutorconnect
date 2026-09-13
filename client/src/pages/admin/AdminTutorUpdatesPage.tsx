import React, { useState, useEffect } from 'react';
import { TutorDailyUpdate, AdminDailyUpdatesMetrics } from '../../types';
import {
  fetchAdminTutorUpdates,
  fetchAdminDailyUpdatesMetrics,
  deleteAdminTutorUpdate,
  archiveAdminTutorUpdate
} from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Calendar,
  Filter,
  Search,
  Camera,
  Trash2,
  Archive,
  Eye,
  X,
  Users,
  CheckCircle2
} from 'lucide-react';

export const AdminTutorUpdatesPage: React.FC = () => {
  const { addToast } = useApp();
  const [updates, setUpdates] = useState<TutorDailyUpdate[]>([]);
  const [metrics, setMetrics] = useState<AdminDailyUpdatesMetrics>({
    totalUpdates: 0,
    updatesToday: 0,
    tutorsPostedToday: 0,
    studentsWithUpdates: 0
  });

  const [tutorFilter, setTutorFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<TutorDailyUpdate | null>(null);

  const loadData = () => {
    fetchAdminDailyUpdatesMetrics().then(res => setMetrics(res.metrics)).catch(() => {});
    fetchAdminTutorUpdates({
      tutorId: tutorFilter || undefined,
      subject: subjectFilter || undefined,
      search: searchTerm || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    }).then(res => setUpdates(res.updates || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [tutorFilter, subjectFilter, searchTerm, dateFrom, dateTo]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tutor update permanently?')) return;
    try {
      await deleteAdminTutorUpdate(id);
      addToast('success', 'Deleted', 'Update deleted successfully.');
      loadData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAdminTutorUpdate(id);
      addToast('success', 'Archived', 'Update archived successfully.');
      loadData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tutor Daily Updates Oversight</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Consolidated daily teaching reports, thoughts, and classroom photos from all appointed tutors
        </p>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Updates</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalUpdates}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all appointed tutors</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Updates Today</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.updatesToday}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Logged today</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tutors Posted Today</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.tutorsPostedToday}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active tutors logged</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Reached</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.studentsWithUpdates}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Students with progress updates</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tutor, student, subject, topic..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <input
          type="text"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          placeholder="Filter subject..."
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-36"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        {(searchTerm || subjectFilter || tutorFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSubjectFilter('');
              setTutorFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-auto cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Updates Cards Table */}
      {updates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No tutor updates found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {updates.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">Tutor: {u.tutorName}</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                    Student: {u.studentName}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{u.subject}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {u.updateDate}
                  </span>
                  {u.status === 'ARCHIVED' && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">
                      Archived
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3 rounded-2xl">
                {u.thought}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {u.topicsCovered && <span><strong className="text-slate-700">Topics:</strong> {u.topicsCovered}</span>}
                {u.homework && <span><strong className="text-amber-700">Homework:</strong> {u.homework}</span>}
                {u.studentProgress && <span><strong className="text-emerald-700">Progress:</strong> {u.studentProgress}</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  {u.imageUrl && (
                    <button
                      onClick={() => setViewingImage(u.imageUrl || null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>View Attached Photo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleArchive(u.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              className="absolute top-4 right-4 p-2 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
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
    </div>
  );
};
