import React, { useState, useEffect } from 'react';
import { Tutor, TutorInterview, DemoClass, ParentApproval } from '../types';
import {
  fetchTutors,
  fetchTutorDetail,
  fetchDemos,
  fetchInterviews,
  submitInterviewEvaluation,
  moveToDemoClass,
  submitDemoEvaluation,
  decideParentApproval
} from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import {
  InterviewModal,
  DemoModal,
  ParentApprovalModal,
  ScheduleDemoModal
} from '../components/recruitment/RecruitmentModals';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Video,
  ThumbsUp,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  MapPin,
  AlertCircle,
  User,
  GraduationCap,
  Sparkles,
  Award,
  MessageCircle
} from 'lucide-react';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';

/* -------------------------------------------------------------
 * 1. Interview Process Page
 * ----------------------------------------------------------- */
export const InterviewProcessPage: React.FC<{ onSelectTutor: (tutor: Tutor) => void }> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger, setActiveTab } = useApp();
  const [tab, setTab] = useState<'pending' | 'selected' | 'on_hold' | 'failed' | 'all'>('pending');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [interviews, setInterviews] = useState<TutorInterview[]>([]);
  const [activeInterview, setActiveInterview] = useState<TutorInterview | null>(null);
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [whatsAppTutor, setWhatsAppTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tutorRes, interviewRes] = await Promise.all([
        fetchTutors(),
        fetchInterviews()
      ]);
      const allTutors: Tutor[] = tutorRes.tutors || [];
      const allInterviews: TutorInterview[] = interviewRes.interviews || [];
      setInterviews(allInterviews);

      const interviewList = allTutors.filter(t =>
        t.status.startsWith('INTERVIEW_') ||
        t.status === 'DOCUMENT_APPROVED' ||
        allInterviews.some(i => i.tutorId === t.id)
      );
      setTutors(interviewList);
    } catch (err) {
      console.error('Error loading interview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleOpenEvaluation = async (t: Tutor) => {
    setActiveTutor(t);
    try {
      const detail = await fetchTutorDetail(t.id);
      if (detail.interviews && detail.interviews.length > 0) {
        setActiveInterview(detail.interviews[0]);
      } else {
        const existingInv = interviews.find(i => i.tutorId === t.id);
        if (existingInv) {
          setActiveInterview(existingInv);
        } else {
          setActiveInterview({
            id: 'int-' + t.id,
            interviewId: 'INT-' + t.tutorId,
            tutorId: t.id,
            date: new Date().toISOString().split('T')[0],
            time: '04:00 PM',
            interviewer: 'Academic Panel Lead',
            type: 'Online',
            communicationRating: 4,
            subjectKnowledgeRating: 4,
            teachingAbilityRating: 4,
            overallRating: 4.0,
            result: 'SELECTED',
            comments: ''
          });
        }
      }
      setEvaluating(true);
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const getInterviewResult = (t: Tutor) => {
    const inv = interviews.find(i => i.tutorId === t.id);
    return (inv?.result || inv?.interviewResult || (t as any).interviewResult || '').toUpperCase();
  };

  const pendingTutors = tutors.filter(t => {
    const r = getInterviewResult(t);
    return t.status !== 'INTERVIEW_SELECTED' &&
           t.status !== 'INTERVIEW_FAILED' &&
           t.status !== 'INTERVIEW_ON_HOLD' &&
           r !== 'SELECTED' &&
           r !== 'FAILED' &&
           r !== 'REJECTED' &&
           r !== 'ON_HOLD';
  });

  const selectedTutors = tutors.filter(t => {
    const r = getInterviewResult(t);
    return t.status === 'INTERVIEW_SELECTED' || r === 'SELECTED';
  });

  const onHoldTutors = tutors.filter(t => {
    const r = getInterviewResult(t);
    return t.status === 'INTERVIEW_ON_HOLD' || r === 'ON_HOLD';
  });

  const failedTutors = tutors.filter(t => {
    const r = getInterviewResult(t);
    return t.status === 'INTERVIEW_FAILED' || r === 'FAILED' || r === 'REJECTED';
  });

  const displayedTutors =
    tab === 'pending'
      ? pendingTutors
      : tab === 'selected'
      ? selectedTutors
      : tab === 'on_hold'
      ? onHoldTutors
      : tab === 'failed'
      ? failedTutors
      : tutors;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Panel Interview Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate candidates across Communication, Subject Knowledge, and Pedagogy. Selected tutors advance to Demo Class.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('recruitment-demo')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
        >
          <span>Go to Demo Classes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Required Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'pending', label: '1. Pending Evaluation', count: pendingTutors.length, color: 'text-amber-600 bg-amber-50' },
          { id: 'selected', label: '2. Selected', count: selectedTutors.length, color: 'text-emerald-600 bg-emerald-50' },
          { id: 'on_hold', label: '3. On Hold', count: onHoldTutors.length, color: 'text-blue-600 bg-blue-50' },
          { id: 'failed', label: '4. Failed', count: failedTutors.length, color: 'text-rose-600 bg-rose-50' },
          { id: 'all', label: '5. All Interviews', count: tutors.length, color: 'text-slate-600 bg-slate-100' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              tab === item.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-3 px-4">Tutor</th>
              <th className="py-3 px-4">Qualification</th>
              <th className="py-3 px-4">Subjects</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Current Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTutors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                  {tab === 'pending'
                    ? 'No candidates waiting for evaluation.'
                    : tab === 'selected'
                    ? 'No tutors currently selected in interview.'
                    : tab === 'on_hold'
                    ? 'No tutors placed on hold.'
                    : tab === 'failed'
                    ? 'No tutors failed the interview round.'
                    : 'No tutors found in interview queue.'}
                </td>
              </tr>
            ) : (
              displayedTutors.map(t => {
                const isSelected = t.status === 'INTERVIEW_SELECTED' || getInterviewResult(t) === 'SELECTED';
                const isFailed = t.status === 'INTERVIEW_FAILED' || getInterviewResult(t) === 'FAILED' || getInterviewResult(t) === 'REJECTED';
                const isOnHold = t.status === 'INTERVIEW_ON_HOLD' || getInterviewResult(t) === 'ON_HOLD';

                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={t.photo} alt={t.fullName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.tutorId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">{t.qualification}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{t.subjects.join(', ')}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{t.preferredLocation}</td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} size="sm" /></td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isSelected ? (
                          <>
                            <button
                              onClick={() => setActiveTab('recruitment-demo')}
                              className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all"
                            >
                              View in Demo Classes &rarr;
                            </button>
                            <button
                              onClick={() => handleOpenEvaluation(t)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            >
                              Re-Evaluate
                            </button>
                          </>
                        ) : isFailed ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                              Interview Failed
                            </span>
                            <button
                              onClick={() => handleOpenEvaluation(t)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            >
                              Re-Evaluate
                            </button>
                          </div>
                        ) : isOnHold ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
                              On Hold
                            </span>
                            <button
                              onClick={() => handleOpenEvaluation(t)}
                              className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                            >
                              Evaluate Now
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setWhatsAppTutor(t)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-all"
                              title="Send WhatsApp interview schedule to tutor"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => handleOpenEvaluation(t)}
                              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
                            >
                              ACTION &rarr; EVALUATE INTERVIEW
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {evaluating && activeTutor && (
        <InterviewModal
          isOpen={evaluating}
          onClose={() => setEvaluating(false)}
          interview={activeInterview}
          tutor={activeTutor}
          onSuccess={loadData}
        />
      )}

      {/* WhatsApp Interview Composer Modal */}
      {whatsAppTutor && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppTutor}
          onClose={() => setWhatsAppTutor(null)}
          recipients={[whatsAppTutor]}
          defaultMessage={`Hello ${whatsAppTutor.fullName},

Your interview with Charithra Learning Hub has been scheduled.

Date: {{interview_date}}
Time: {{interview_time}}

Please be available at the scheduled time.

Thank you.`}
          onSuccess={() => {
            setWhatsAppTutor(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
/* -------------------------------------------------------------
 * 2. Demo Classes Page (With 5 Required Tabs: Pending, Scheduled, Completed, Passed, Failed)
 * ----------------------------------------------------------- */
export const DemoClassesPage: React.FC<{ onSelectTutor: (tutor: Tutor) => void }> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger, setActiveTab } = useApp();
  const [tab, setTab] = useState<'pending' | 'scheduled' | 'completed' | 'passed' | 'failed'>('pending');
  const [demos, setDemos] = useState<DemoClass[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [schedulingDemo, setSchedulingDemo] = useState<{ demo: DemoClass | null; tutor: Tutor } | null>(null);
  const [evaluatingDemo, setEvaluatingDemo] = useState<{ demo: DemoClass; tutor: Tutor } | null>(null);
  const [whatsAppDemoItem, setWhatsAppDemoItem] = useState<{ demo?: DemoClass | null; tutor: Tutor } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [demoRes, tutorRes] = await Promise.all([
        fetchDemos(),
        fetchTutors()
      ]);

      const allDemos: DemoClass[] = demoRes.demoClasses || [];
      const allTutors: Tutor[] = tutorRes.tutors || [];
      setDemos(allDemos);
      setTutors(allTutors);
    } catch (err) {
      console.error('Failed to load demo classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Helper to check if tutor failed interview
  const isFailedInterview = (t: Tutor | undefined, d?: DemoClass) => {
    if (!t) return false;
    if (t.status === 'INTERVIEW_FAILED' || (t as any).interviewResult === 'FAILED') return true;
    const inv = d?.interview;
    if (inv && (inv.result === 'FAILED' || inv.interviewResult === 'FAILED' || inv.result === 'Rejected')) return true;
    return false;
  };

  // Tab 1: Pending Demo Classes
  const pendingDemos: { demo: DemoClass | null; tutor: Tutor }[] = [];

  tutors.forEach(t => {
    if (isFailedInterview(t)) return;
    const demo = demos.find(d => d.tutorId === t.id);
    const isEligibleTutorStatus = ['DEMO_CLASS_SCHEDULED', 'DEMO_CLASS_PENDING', 'INTERVIEW_SELECTED'].includes(t.status);
    const isPendingDemoStatus = demo && (demo.status === 'DEMO_CLASS_PENDING' || demo.status === 'PENDING' || (!demo.date && demo.result === 'Pending'));

    if (isPendingDemoStatus || (isEligibleTutorStatus && (!demo || !demo.date))) {
      if (!pendingDemos.some(p => p.tutor.id === t.id)) {
        pendingDemos.push({ demo: demo || null, tutor: t });
      }
    }
  });

  demos.forEach(d => {
    const t = d.tutor || tutors.find(item => item.id === d.tutorId);
    if (!t || isFailedInterview(t, d)) return;
    if (d.status === 'DEMO_CLASS_PENDING' || d.status === 'PENDING' || (!d.date && d.result === 'Pending')) {
      if (!pendingDemos.some(p => p.tutor.id === t.id)) {
        pendingDemos.push({ demo: d, tutor: t });
      }
    }
  });

  // Tab 2: Scheduled
  const scheduledDemos = demos.filter(d => {
    const t = d.tutor || tutors.find(item => item.id === d.tutorId);
    if (isFailedInterview(t, d)) return false;
    return (d.status === 'DEMO_CLASS_SCHEDULED' || d.status === 'SCHEDULED' || (d.date && d.result === 'Pending')) &&
           d.result !== 'Passed' && d.result !== 'Failed';
  });

  // Tab 3: Completed
  const completedDemos = demos.filter(d => {
    const t = d.tutor || tutors.find(item => item.id === d.tutorId);
    if (isFailedInterview(t, d)) return false;
    return d.status === 'DEMO_CLASS_COMPLETED' || d.status === 'COMPLETED' || d.result === 'Passed' || d.result === 'Failed';
  });

  // Tab 4: Passed
  const passedDemos = demos.filter(d => {
    const t = d.tutor || tutors.find(item => item.id === d.tutorId);
    if (isFailedInterview(t, d)) return false;
    return d.status === 'DEMO_CLASS_PASSED' || d.result === 'Passed';
  });

  // Tab 5: Failed
  const failedDemos = demos.filter(d => {
    const t = d.tutor || tutors.find(item => item.id === d.tutorId);
    if (isFailedInterview(t, d)) return false;
    return d.status === 'DEMO_CLASS_FAILED' || d.result === 'Failed';
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/50">
            Phase 6 &bull; Live Demonstration
          </span>
          <h2 className="text-2xl font-black mt-2">Demo Classes & Student Feedback</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Schedule live demo trial sessions with students, record ratings from Admin, Student, and Parent, and advance qualified tutors to Parent Approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 transition-all"
          >
            Refresh Stream
          </button>
        </div>
      </div>

      {/* 5 Required Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'pending', label: '1. Pending Demo Classes', count: pendingDemos.length, color: 'text-amber-600 bg-amber-50' },
          { id: 'scheduled', label: '2. Scheduled', count: scheduledDemos.length, color: 'text-blue-600 bg-blue-50' },
          { id: 'completed', label: '3. Completed', count: completedDemos.length, color: 'text-slate-600 bg-slate-100' },
          { id: 'passed', label: '4. Passed', count: passedDemos.length, color: 'text-emerald-600 bg-emerald-50' },
          { id: 'failed', label: '5. Failed', count: failedDemos.length, color: 'text-rose-600 bg-rose-50' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              tab === item.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: PENDING DEMO CLASSES */}
      {tab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{pendingDemos.length} candidate(s)</strong> passed interview and are awaiting demo class scheduling. Click <strong>[ SCHEDULE DEMO CLASS ]</strong> to assign a student, date, and time.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Tutor Name</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Subjects</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Interview Result</th>
                  <th className="py-3 px-4">Demo Class Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingDemos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      No pending demo classes. Complete an interview with result "Selected" to see tutors here!
                    </td>
                  </tr>
                ) : (
                  pendingDemos.map(({ demo, tutor }) => (
                    <tr key={tutor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tutor.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={tutor.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{tutor.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tutor.tutorId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                        {tutor.qualification}
                        <span className="text-[10px] text-slate-400 block">{tutor.experienceYears} Years Exp</span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600">
                        {tutor.subjects?.join(', ') || 'General'}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600">
                        {tutor.preferredLocation}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Selected
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setWhatsAppDemoItem({ tutor, demo })}
                            className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                            title="Send WhatsApp update to tutor"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => setSchedulingDemo({ demo, tutor })}
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>[ SCHEDULE DEMO CLASS ]</span>
                          </button>
                          <button
                            onClick={() => onSelectTutor(tutor)}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                            title="View Profile"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED DEMO CLASSES */}
      {tab === 'scheduled' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>{scheduledDemos.length} demo class(es) scheduled</strong> with assigned students. Click <strong>[ ASSESS DEMO CLASS ]</strong> to record observer ratings and decide Pass/Fail.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Tutor</th>
                  <th className="py-3 px-4">Assigned Student</th>
                  <th className="py-3 px-4">Subject & Class</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduledDemos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      No scheduled demo classes found. Schedule a pending demo class to see it here!
                    </td>
                  </tr>
                ) : (
                  scheduledDemos.map(demo => {
                    const tutor = demo.tutor || tutors.find(t => t.id === demo.tutorId);
                    if (!tutor) return null;

                    return (
                      <tr key={demo.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={tutor.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={tutor.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{tutor.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{tutor.tutorId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <span className="font-bold text-slate-800 block">
                            {demo.student ? demo.student.studentName : 'Assigned Student'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {demo.student ? demo.student.school : ''}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <span className="font-bold text-indigo-600 block">{demo.subject}</span>
                          <span className="text-[10px] text-slate-500 block">{demo.class || '10th Standard'}</span>
                        </td>

                        <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                          <div>{demo.date || demo.demoDate}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{demo.time || demo.demoTime}</div>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-600 truncate max-w-[140px]" title={demo.location || ''}>
                          {demo.location || 'Residence'}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Scheduled
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setWhatsAppDemoItem({ tutor, demo })}
                              className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-1 transition-all"
                              title="Send WhatsApp scheduled demo details to tutor"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => setEvaluatingDemo({ demo, tutor })}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                              [ ASSESS DEMO CLASS ]
                            </button>
                            <button
                              onClick={() => setSchedulingDemo({ demo, tutor })}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED DEMO CLASSES */}
      {tab === 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Tutor</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Ratings (Admin/Student/Parent)</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Feedback / Notes</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedDemos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No completed demo classes yet.
                  </td>
                </tr>
              ) : (
                completedDemos.map(demo => {
                  const tutor = demo.tutor || tutors.find(t => t.id === demo.tutorId);
                  if (!tutor) return null;

                  return (
                    <tr key={demo.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={tutor.photo} alt={tutor.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 block">{tutor.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tutor.tutorId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                        {demo.student ? demo.student.studentName : 'Student'}
                      </td>

                      <td className="py-3 px-4 text-xs font-bold text-indigo-600">{demo.subject}</td>

                      <td className="py-3 px-4 text-xs font-mono">
                        <span className="font-bold text-slate-800">{demo.adminRating}/5</span> (Admin) &bull;{' '}
                        <span className="font-bold text-slate-800">{demo.studentRating}/5</span> (Student) &bull;{' '}
                        <span className="font-bold text-slate-800">{demo.parentRating}/5</span> (Parent)
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={demo.result} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[180px] truncate" title={demo.comments || ''}>
                        {demo.comments || 'No feedback recorded'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onSelectTutor(tutor)}
                          className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          View Details &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PASSED DEMOS */}
      {tab === 'passed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passedDemos.length === 0 ? (
            <div className="col-span-3 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              No passed demo classes yet.
            </div>
          ) : (
            passedDemos.map(demo => {
              const tutor = demo.tutor || tutors.find(t => t.id === demo.tutorId);
              if (!tutor) return null;

              return (
                <div key={demo.id} className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={tutor.photo} alt={tutor.fullName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{tutor.fullName}</h4>
                      <p className="text-[11px] text-slate-500">{tutor.qualification} &bull; {demo.subject}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-xl border border-emerald-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Admin</span>
                      <span className="font-black text-indigo-600 text-base">{demo.adminRating}/5</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Student</span>
                      <span className="font-black text-indigo-600 text-base">{demo.studentRating}/5</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Parent</span>
                      <span className="font-black text-indigo-600 text-base">{demo.parentRating}/5</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                    "{demo.comments || 'Student very receptive.'}"
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Passed &amp; Moved to Parent Approval
                    </span>
                    <button
                      onClick={() => setActiveTab('recruitment-parent-approval')}
                      className="px-3 py-1.5 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-sm"
                    >
                      Parent Portal &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: FAILED DEMOS */}
      {tab === 'failed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {failedDemos.length === 0 ? (
            <div className="col-span-3 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              No failed demo classes.
            </div>
          ) : (
            failedDemos.map(demo => {
              const tutor = demo.tutor || tutors.find(t => t.id === demo.tutorId);
              if (!tutor) return null;

              return (
                <div key={demo.id} className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={tutor.photo} alt={tutor.fullName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{tutor.fullName}</h4>
                      <p className="text-[11px] text-slate-500">{tutor.qualification} &bull; {demo.subject}</p>
                    </div>
                  </div>

                  <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <span className="font-bold block mb-1">Feedback Discrepancy:</span>
                    "{demo.comments || 'Did not meet student interaction standard.'}"
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <StatusBadge status="DEMO_CLASS_FAILED" size="sm" />
                    <button
                      onClick={() => onSelectTutor(tutor)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Profile &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      {schedulingDemo && (
        <ScheduleDemoModal
          isOpen={!!schedulingDemo}
          onClose={() => setSchedulingDemo(null)}
          demo={schedulingDemo.demo}
          tutor={schedulingDemo.tutor}
          onSuccess={loadData}
        />
      )}

      {evaluatingDemo && (
        <DemoModal
          isOpen={!!evaluatingDemo}
          onClose={() => setEvaluatingDemo(null)}
          demo={evaluatingDemo.demo}
          tutor={evaluatingDemo.tutor}
          onSuccess={loadData}
        />
      )}

      {/* WhatsApp Demo Class Composer Modal */}
      {whatsAppDemoItem && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppDemoItem}
          onClose={() => setWhatsAppDemoItem(null)}
          recipients={[whatsAppDemoItem.tutor]}
          extraParams={{
            student_name: whatsAppDemoItem.demo?.student?.studentName || 'Assigned Student',
            subject: whatsAppDemoItem.demo?.subject || (whatsAppDemoItem.tutor.subjects && whatsAppDemoItem.tutor.subjects[0]) || 'Tuition Subject',
            demo_date: whatsAppDemoItem.demo?.date || whatsAppDemoItem.demo?.demoDate || '10 Sep 2026',
            demo_time: whatsAppDemoItem.demo?.time || whatsAppDemoItem.demo?.demoTime || '05:00 PM',
            location: whatsAppDemoItem.demo?.location || whatsAppDemoItem.tutor.preferredLocation || 'Student Residence'
          }}
          defaultMessage={`Hello ${whatsAppDemoItem.tutor.fullName},\n\nCongratulations! You have successfully cleared the interview stage.\n\nYour demo class has been scheduled.\n\nStudent: {{student_name}}\nSubject: {{subject}}\nDate: {{demo_date}}\nTime: {{demo_time}}\nLocation: {{location}}\n\nPlease be available on time.\n\nThank you,\nCharithra Learning Hub Team`}
          onSuccess={() => {
            setWhatsAppDemoItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. Parent Approval Page
 * ----------------------------------------------------------- */
export const ParentApprovalPage: React.FC<{ onSelectTutor: (tutor: Tutor) => void }> = ({ onSelectTutor }) => {
  const { refreshTrigger } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [activeApproval, setActiveApproval] = useState<ParentApproval | null>(null);
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [whatsAppApprovalTutor, setWhatsAppApprovalTutor] = useState<Tutor | null>(null);

  const loadData = async () => {
    const res = await fetchTutors();
    const approvalList = (res.tutors || []).filter(t => t.status.startsWith('PARENT_') || t.status === 'DEMO_CLASS_PASSED');
    setTutors(approvalList);
  };

  useEffect(() => { loadData(); }, [refreshTrigger]);

  const handleOpenApproval = async (t: Tutor) => {
    setActiveTutor(t);
    const detail = await fetchTutorDetail(t.id);
    setActiveApproval(detail.parentApprovals[0] || null);
    setEvaluating(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-pink-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-xl font-black">Parent Review & Approval Portal</h2>
        <p className="text-xs text-pink-200 mt-1 max-w-xl">
          Parents review the tutor's demonstration class, credential summary, rate the tutor, and give formal approval or rejection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutors.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img src={t.photo} alt={t.fullName} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.fullName}</h4>
                  <p className="text-[11px] text-slate-500">{t.qualification} &bull; {t.experienceYears}y exp</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <p><strong>Subjects:</strong> {t.subjects.join(', ')}</p>
                <p><strong>Location:</strong> {t.preferredLocation}</p>
                <p><strong>Expected Salary:</strong> ?{t.expectedSalary?.toLocaleString()} / mo</p>
                <div className="mt-2"><StatusBadge status={t.status} size="sm" /></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectTutor(t)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Profile
                </button>
                <button
                  onClick={() => setWhatsAppApprovalTutor(t)}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                  title="WhatsApp Tutor Selected Notice"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
              <button
                onClick={() => handleOpenApproval(t)}
                className="px-4 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-sm transition-all"
              >
                Parent Action &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {evaluating && activeTutor && (
        <ParentApprovalModal
          isOpen={evaluating}
          onClose={() => setEvaluating(false)}
          approval={activeApproval}
          tutor={activeTutor}
          onSuccess={loadData}
        />
      )}
      {/* WhatsApp Tutor Selected Modal */}
      {whatsAppApprovalTutor && (
        <WhatsAppComposerModal
          isOpen={!!whatsAppApprovalTutor}
          onClose={() => setWhatsAppApprovalTutor(null)}
          recipients={[whatsAppApprovalTutor]}
          defaultMessage={`Hello ${whatsAppApprovalTutor.fullName},\n\nGreat news! The parent has approved your demo class and selected you for the tuition assignment for {{subject}}.\n\nOur team will reach out to finalize your appointment schedule.\n\nWelcome aboard,\nCharithra Learning Hub.`}
          onSuccess={() => {
            setWhatsAppApprovalTutor(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
