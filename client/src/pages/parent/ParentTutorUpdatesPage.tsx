import React, { useState, useEffect } from 'react';
import { TutorDailyUpdate } from '../../types';
import { fetchParentTutorUpdates } from '../../services/api';
import {
  Calendar,
  BookOpen,
  Camera,
  CheckCircle2,
  X,
  Eye,
  Clock
} from 'lucide-react';

export const ParentTutorUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<TutorDailyUpdate[]>([]);
  const [total, setTotal] = useState(0);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentTutorUpdates()
      .then(res => {
        setUpdates(res.updates || []);
        setTotal(res.total || 0);
        setLatestDate(res.latestUpdateDate);
        setThisWeekCount(res.updatesThisWeekCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tutor Daily Updates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching notes, topics covered, homework, and classroom photos for your child
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            Total Updates: <span className="text-amber-600">{total}</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            This Week: <span className="text-emerald-600">{thisWeekCount}</span>
          </div>
        </div>
      </div>

      {updates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No daily updates recorded for your child yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {updates.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
                    {u.tutorName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{u.tutorName}</h3>
                    <span className="text-xs font-semibold text-amber-700">{u.subject}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {u.updateDate}
                  </span>
                  {u.classTiming && <span>• {u.classTiming}</span>}
                  {u.studentProgress && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {u.studentProgress}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-slate-800 leading-relaxed font-normal bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Today's Teaching Thought / Progress
                  </span>
                  {u.thought}
                </div>

                {u.topicsCovered && (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900">Topics Covered: </span>
                    {u.topicsCovered}
                  </div>
                )}

                {u.homework && (
                  <div className="text-xs text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                    <span className="font-bold">Homework Given: </span>
                    {u.homework}
                  </div>
                )}

                {u.imageUrl && (
                  <div className="pt-2">
                    <button
                      onClick={() => setViewingImage(u.imageUrl || null)}
                      className="inline-flex items-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <img
                        src={u.imageUrl}
                        alt="Class whiteboard"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 px-2">
                        <Eye className="w-3.5 h-3.5" /> View Photo
                      </span>
                    </button>
                  </div>
                )}
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
