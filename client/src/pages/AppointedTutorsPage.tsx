import React, { useState, useEffect } from 'react';
import { Tutor, Appointment, Student } from '../types';
import { fetchTutors, fetchAppointments, fetchStudents } from '../services/api';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';
import {
  Award,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  GraduationCap,
  RefreshCw,
  Eye,
  MessageCircle
} from 'lucide-react';

interface AppointedTutorsPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const AppointedTutorsPage: React.FC<AppointedTutorsPageProps> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [whatsAppTutor, setWhatsAppTutor] = useState<Tutor | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tutorRes, aptRes, stuRes] = await Promise.all([
        fetchTutors({ appointed: 'true' }),
        fetchAppointments(),
        fetchStudents()
      ]);

      const aptList = aptRes.appointments || [];
      const stuList = stuRes.students || [];
      setAppointments(aptList);
      setStudents(stuList);

      const allTutors = tutorRes.tutors || [];
      const appointedList = allTutors.filter(
        (t) =>
          t.status === 'TUTOR_APPOINTED' ||
          t.status === 'ACTIVE' ||
          t.isAppointed === true ||
          t.is_appointed === true ||
          aptList.some((a) => a.tutorId === t.id && a.status === 'ACTIVE')
      );
      setTutors(appointedList);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not load appointed tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const filteredTutors = tutors.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const apt = appointments.find((a) => a.tutorId === t.id);
    const stu = students.find((s) => s.id === (apt?.studentId || t.id));
    return (
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (stu && stu.studentName.toLowerCase().includes(q)) ||
      (apt && apt.subject && apt.subject.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white text-emerald-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg tracking-tight">Appointed & Active Tutors</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                {tutors.length} Total
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Educators who have successfully completed all recruitment milestones and are assigned to active students.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointed tutors by name, student, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredTutors.length}</span> appointed educators
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading appointed tutors...</p>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800">No Appointed Tutors Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Tutors will appear here once parents approve their demonstration class and formal appointments are confirmed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Tutor Name</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Parent</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Timing</th>
                  <th className="py-3.5 px-4">Appointment Date</th>
                  <th className="py-3.5 px-4">Appointment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTutors.map((t) => {
                  const apt = appointments.find((a) => a.tutorId === t.id);
                  const stu = students.find((s) => s.id === (apt?.studentId || (t as any).studentId));

                  const studentName = stu?.studentName || 'Assigned Student';
                  const studentClass = stu?.class || 'Standard';
                  const parentName = stu?.parentPhone ? `Parent (${stu.parentPhone})` : 'Parent Guardian';
                  const subject = apt?.subject || (t.subjects && t.subjects[0]) || 'General Coaching';
                  const location = apt?.location || t.preferredLocation || 'Student Residence';
                  const timing = apt?.timing || t.availableTiming || '5:00 PM - 7:00 PM';
                  const aptDate = apt?.startDate || (apt?.createdAt ? apt.createdAt.split('T')[0] : 'Active');
                  const aptStatus = apt?.status || (t.status === 'TUTOR_APPOINTED' ? 'ACTIVE' : t.status);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Tutor Name */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              t.photo ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.fullName)}`
                            }
                            alt={t.fullName}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                          />
                          <div>
                            <button
                              onClick={() => onSelectTutor(t)}
                              className="font-bold text-slate-900 hover:text-emerald-700 transition-colors text-left block"
                            >
                              {t.fullName}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.tutorId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Student */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block">{studentName}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{studentClass}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Parent */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-medium">{parentName}</span>
                        </div>
                      </td>

                      {/* 4. Subject */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                          {subject}
                        </span>
                      </td>

                      {/* 5. Location */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{location}</span>
                        </div>
                      </td>

                      {/* 6. Timing */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{timing}</span>
                        </div>
                      </td>

                      {/* 7. Appointment Date */}
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{aptDate}</span>
                        </div>
                      </td>

                      {/* 8. Appointment Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{aptStatus === 'ACTIVE' ? 'ACTIVE' : 'TUTOR APPOINTED'}</span>
                        </span>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setWhatsAppTutor(t)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                          title="Send WhatsApp Appointment Notice"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => onSelectTutor(t)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                          title="View Profile & Appointment Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* WhatsApp Appointment Notice Modal */}
      {whatsAppTutor && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppTutor}
          onClose={() => setWhatsAppTutor(null)}
          recipients={[whatsAppTutor]}
          defaultMessage={`Hello ${whatsAppTutor.fullName},\n\nOfficial Appointment Notice:\nYour tuition assignment for {{student_name}} ({{subject}}) has been finalized.\n\nTiming: {{availableTiming}}\nLocation: {{location}}\n\nPlease report on your scheduled start date.\n\nCongratulations,\nTutorConnect Tuition Centre.`}
          onSuccess={() => {
            setWhatsAppTutor(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
