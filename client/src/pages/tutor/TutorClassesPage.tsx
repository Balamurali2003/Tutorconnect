import React, { useState, useEffect } from 'react';
import { fetchTutorClasses } from '../../services/api';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const TutorClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchTutorClasses().then(res => setClasses(res.classes || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Today's Classes & Timetable</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your weekly tuition schedule and active classroom commitments
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No scheduled classes found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  {c.subject}
                </span>
                <span className="text-xs font-semibold text-slate-500">{c.class}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{c.studentName}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{c.lessonType || 'Home Tuition'}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Days: {Array.isArray(c.days) ? c.days.join(', ') : c.days}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Time: {c.startTime && c.endTime ? `${c.startTime} - ${c.endTime}` : '05:00 PM - 06:30 PM'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Location: {c.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
