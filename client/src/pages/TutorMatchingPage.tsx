import React, { useState, useEffect } from 'react';
import { Student, Tutor, MatchRecommendation } from '../types';
import { fetchStudents, getTutorMatches, createAppointment } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  MapPin,
  Clock,
  Briefcase,
  Award,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Filter
} from 'lucide-react';

interface TutorMatchingPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const TutorMatchingPage: React.FC<TutorMatchingPageProps> = ({ onSelectTutor }) => {
  const { addToast, triggerRefresh } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningTutorId, setAssigningTutorId] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      const res = await fetchStudents();
      const stList = res.students || [];
      setStudents(stList);
      if (stList.length > 0) {
        setSelectedStudentId(stList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateMatches = async (studentId: string) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getTutorMatches({ studentId });
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      calculateMatches(selectedStudentId);
    }
  }, [selectedStudentId]);

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const handleAssignTutor = async (tutor: Tutor) => {
    if (!currentStudent) return;
    setAssigningTutorId(tutor.id);
    try {
      await createAppointment({
        tutorId: tutor.id,
        studentId: currentStudent.id,
        subject: currentStudent.requiredSubjects?.[0] || 'Mathematics',
        location: currentStudent.location,
        timing: currentStudent.preferredTiming,
        salary: tutor.expectedSalary
      });

      confetti({ particleCount: 100, spread: 70 });
      addToast('success', 'Tutor Assigned!', `${tutor.fullName} assigned to student ${currentStudent.studentName}.`);
      triggerRefresh();
      calculateMatches(currentStudent.id);
    } catch (err: any) {
      addToast('error', 'Assignment Notice', err.message || 'Cannot assign tutor before workflow completion');
    } finally {
      setAssigningTutorId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-primary-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/40 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI Compatibility Match Engine
          </div>
          <h2 className="text-2xl font-black mt-2">Smart Student-Tutor Matching System</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Calculates multi-dimensional match scores across subject mastery, geographic proximity, timing availability, experience, budget fit, and priority level.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Selector & Requirement Profile */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Student Requirement</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.studentName} ({s.class} &bull; {s.location})
                  </option>
                ))}
              </select>
            </div>

            {currentStudent && (
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Student:</span>
                    <span className="font-bold text-slate-900">{currentStudent.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Class:</span>
                    <span className="font-bold text-slate-800">{currentStudent.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Required:</span>
                    <span className="font-bold text-indigo-600">{currentStudent.requiredSubjects?.join(', ')} Tutor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Location:</span>
                    <span className="font-bold text-slate-800">{currentStudent.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Timing:</span>
                    <span className="font-bold text-slate-800">{currentStudent.preferredTiming}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Budget:</span>
                    <span className="font-mono font-bold text-slate-900">?{currentStudent.budget?.toLocaleString()}</span>
                  </div>
                </div>

                {currentStudent.learningRequirements && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">Learning Goals</span>
                    {currentStudent.learningRequirements}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recommended Tutors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Recommended Tutors for {currentStudent?.studentName}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Ranked by Multi-Factor Compatibility Score
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Computing match compatibility matrix...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
              No matching tutors found for this criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, rank) => {
                const t = rec.tutor;
                const isTop = rank === 0;

                return (
                  <div
                    key={t.id}
                    className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isTop ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-md' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={t.photo}
                          alt={t.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                        <span className="absolute -top-2 -left-2 w-5 h-5 bg-slate-900 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                          #{rank + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{t.fullName}</h4>
                          <StatusBadge priority={t.priority} size="sm" />
                          <StatusBadge status={t.status} size="sm" />
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.qualification} &bull; {t.experienceYears}y exp &bull; {t.preferredLocation}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-600">
                          <span><strong>Timing:</strong> {t.availableTiming}</span>
                          <span><strong>Salary:</strong> ?{t.expectedSalary?.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end gap-3 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Compatibility Score</span>
                        <span className={`text-xl font-black font-mono ${
                          rec.matchScore >= 90 ? 'text-emerald-600' : rec.matchScore >= 75 ? 'text-indigo-600' : 'text-amber-600'
                        }`}>
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectTutor(t)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleAssignTutor(t)}
                          disabled={assigningTutorId === t.id}
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {assigningTutorId === t.id ? 'Assigning...' : '[ ASSIGN TUTOR ]'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
