import React, { useState, useEffect } from 'react';
import { fetchTutorStudents } from '../../services/api';
import { TutorDailyUpdateModal } from '../../components/tutor/TutorDailyUpdateModal';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

export const TutorStudentsPage: React.FC = () => {
  const { addToast } = useApp();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchTutorStudents().then(res => setStudents(res.students || [])).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    (s.studentName && s.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.subject && s.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Assigned Students</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active students assigned to you through Charithra Learning Hub
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students, subjects..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No students found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((s) => (
            <div
              key={s.assignmentId}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-base flex items-center justify-center">
                      {s.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{s.studentName}</h3>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {s.subject}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                    {s.class}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Days: {Array.isArray(s.days) ? s.days.join(', ') : s.days || 'Mon - Fri'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Timing: {s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : 'Evening slots'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Location: {s.location || 'Local Area'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Parent Phone: {s.parentPhone || s.phone || 'Contact Centre'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  onClick={() => {
                    setTargetStudentId(s.studentId);
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Post Daily Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TutorDailyUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        presetStudentId={targetStudentId}
        onSuccess={() => {
          addToast('success', 'Update Published', 'Your teaching update has been sent.');
        }}
      />
    </div>
  );
};
