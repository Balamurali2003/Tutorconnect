import React, { useState, useEffect } from 'react';
import {
  Tutor,
  TutorDocument,
  TutorInterview,
  DemoClass,
  ParentApproval,
  Appointment,
  ActivityLog,
  Student,
  WhatsAppHistoryItem
} from '../types';
import {
  fetchTutorDetail,
  fetchStudents,
  moveToInterview,
  moveToDemoClass,
  validateTutor,
  fetchWhatsAppHistory
} from '../services/api';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/Badge';
import { WorkflowPipeline } from '../components/recruitment/WorkflowPipeline';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  DocReviewModal,
  InterviewModal,
  DemoModal,
  ParentApprovalModal,
  AppointmentModal,
  ScheduleDemoModal
} from '../components/recruitment/RecruitmentModals';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Briefcase,
  FileCheck,
  Calendar,
  Video,
  ThumbsUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Download,
  ArrowRight
} from 'lucide-react';

interface TutorDetailPageProps {
  tutorId: string;
  onBack: () => void;
  initialTab?: 'overview' | 'documents' | 'interview' | 'demo' | 'parentApproval' | 'appointment' | 'whatsapp' | 'logs';
}

export const TutorDetailPage: React.FC<TutorDetailPageProps> = ({ tutorId, onBack, initialTab }) => {
  const { addToast } = useApp();
  const [data, setData] = useState<{
    tutor: Tutor;
    documents: TutorDocument[];
    interviews: TutorInterview[];
    demos: DemoClass[];
    parentApprovals: ParentApproval[];
    appointment?: Appointment;
    logs: ActivityLog[];
  } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'interview' | 'demo' | 'parentApproval' | 'appointment' | 'whatsapp' | 'logs'>(initialTab || 'overview');
  const [whatsappDetailData, setWhatsappDetailData] = useState<any>(null);
  const [whatsappHistory, setWhatsappHistory] = useState<WhatsAppHistoryItem[]>([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<TutorDocument | null>(null);
  const [evalInterview, setEvalInterview] = useState<TutorInterview | null>(null);
  const [evalDemo, setEvalDemo] = useState<DemoClass | null>(null);
  const [evalApproval, setEvalApproval] = useState<ParentApproval | null>(null);
  const [schedulingDemo, setSchedulingDemo] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchTutorDetail(tutorId);
      setData(res);
      const stData = await fetchStudents();
      setStudents(stData.students || []);

      try {
        const waRes = await fetchWhatsAppHistory({ tutorId });
        setWhatsappHistory(waRes.history || []);
        try {
          const detailRes = await fetch(`/api/tutors/${tutorId}/whatsapp`);
          if (detailRes.ok) {
            const dJson = await detailRes.json();
            setWhatsappDetailData(dJson);
          }
        } catch (e) {}
      } catch (e) {
        console.error('Failed to load tutor WhatsApp history', e);
      }
    } catch (err: any) {
      addToast('error', 'Failed to load profile', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tutorId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading Tutor Profile...</p>
      </div>
    );
  }

  const { tutor, documents, interviews, demos, parentApprovals, appointment, logs } = data;
  const allDocsVerified = documents.length > 0 && documents.every(d => d.status === 'Verified');
  const anyDocRejected = documents.some(d => d.status === 'Rejected');

  const currentInterview = interviews[0] || null;
  const currentDemo = demos[0] || null;
  const currentApproval = parentApprovals[0] || null;

  const handleValidate = async () => {
    try {
      await validateTutor(tutor.id);
      addToast('success', 'Tutor Validated', tutor.fullName + ' is now validated and moved to Document Verification.');
      setShowValidateModal(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleMoveToInterview = async () => {
    try {
      await moveToInterview(tutor.id);
      addToast('success', 'Advanced to Interview', 'Interview slot scheduled. Tutor status updated.');
      loadData();
      setActiveTab('interview');
    } catch (err: any) {
      addToast('error', 'Validation Blocked', err.message);
    }
  };

  const handleMoveToDemo = async () => {
    try {
      await moveToDemoClass(tutor.id, { studentId: students[0]?.id });
      addToast('success', 'Advanced to Demo Class', 'Demo class scheduled. Tutor status updated.');
      loadData();
      setActiveTab('demo');
    } catch (err: any) {
      addToast('error', 'Action Blocked', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Back & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tutors</span>
        </button>

        <div className="flex items-center gap-2">
          {/* WhatsApp Tutor Button */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            title="Open WhatsApp Communication"
          >
            <MessageCircle className="w-4 h-4" />
            <span>💬 WhatsApp Tutor</span>
          </button>

          {['HIGH_PRIORITY', 'LOW_PRIORITY', 'NEW_APPLICATION'].includes(tutor.status) && (
            <button
              onClick={() => setShowValidateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate Tutor</span>
            </button>
          )}

          {(tutor.status === 'PARENT_APPROVED' || tutor.status === 'TUTOR_APPOINTED' || tutor.status === 'ACTIVE') && (
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{tutor.status === 'ACTIVE' ? 'View Appointment' : '?? Appoint Tutor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={tutor.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={tutor.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">{tutor.fullName}</h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                {tutor.tutorId}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {tutor.qualification} &bull; {tutor.specialization || 'General'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {tutor.mobile}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> {tutor.whatsapp}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {tutor.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col items-end gap-2 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex items-center gap-2">
            <StatusBadge priority={tutor.priority} size="md" />
            <StatusBadge status={tutor.status} size="md" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Expected Salary</span>
            <span className="text-base font-black text-slate-900 font-mono">?{tutor.expectedSalary?.toLocaleString()} / mo</span>
          </div>
        </div>
      </div>

      {/* Visual Recruitment Pipeline Stepper */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recruitment Pipeline Progress</h4>
        <WorkflowPipeline currentStatus={tutor.status} />
      </div>

      {/* Detail Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Qualifications', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'documents', label: 'Documents (' + documents.filter(d => d.status === 'Verified').length + '/' + documents.length + ')', icon: <FileCheck className="w-4 h-4" /> },
          { id: 'interview', label: 'Interview Process', icon: <Calendar className="w-4 h-4" /> },
          { id: 'demo', label: 'Demo Class', icon: <Video className="w-4 h-4" /> },
          { id: 'parentApproval', label: 'Parent Approval', icon: <ThumbsUp className="w-4 h-4" /> },
          { id: 'appointment', label: 'Appointment', icon: <Award className="w-4 h-4" /> },
          { id: 'whatsapp', label: 'WhatsApp History (' + whatsappHistory.length + ')', icon: <MessageCircle className="w-4 h-4 text-emerald-600" /> },
          { id: 'logs', label: 'Activity Timeline (' + logs.length + ')', icon: <History className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Academic & Professional Credentials</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Qualification</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{tutor.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Experience</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{tutor.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Specialization</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{tutor.specialization || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Gender & DOB</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{tutor.gender}, {tutor.dob}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-400 font-semibold text-xs block mb-2">Subject Competencies</span>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((sub, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Preferences & Availability</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Preferred City</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {tutor.preferredLocation}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Available Timing</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> {tutor.availableTiming}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Expected Monthly Salary</span>
                <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">?{tutor.expectedSalary?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Priority Level</span>
                <div className="mt-1"><StatusBadge priority={tutor.priority} size="sm" /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Document Verification Checklist</h4>
              <p className="text-xs text-slate-500">
                All 6 certificates must be verified before moving to the interview round.
              </p>
            </div>
            {allDocsVerified ? (
              <button
                onClick={handleMoveToInterview}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
              >
                <span>MOVE TO INTERVIEW</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : anyDocRejected ? (
              <span className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                DOCUMENT REJECTED
              </span>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pending Verification ({documents.filter(d => d.status !== 'Verified').length} remaining)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-900">{doc.docType}</span>
                    <StatusBadge status={doc.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{doc.fileName}</p>
                  {doc.remarks && (
                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block">Remarks:</span>
                      {doc.remarks}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => alert('Simulated downloading ' + doc.fileName)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Review / Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Interview */}
      {activeTab === 'interview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Panel Interview Record</h4>
              <p className="text-xs text-slate-500">Evaluation scores for communication, subject clarity, and pedagogy</p>
            </div>
            {currentInterview?.result === 'Selected' && (
              <button
                onClick={handleMoveToDemo}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
              >
                <span>MOVE TO DEMO CLASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {currentInterview ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Interview Date</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentInterview.date} at {currentInterview.time}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Interviewer</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentInterview.interviewer}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Interview Type</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentInterview.type}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Current Result</span>
                  <div className="mt-1"><StatusBadge status={currentInterview.result} size="sm" /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Communication</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentInterview.communicationRating} / 5</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Subject Knowledge</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentInterview.subjectKnowledgeRating} / 5</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Teaching Ability</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentInterview.teachingAbilityRating} / 5</span>
                </div>
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-center">
                  <span className="text-xs text-indigo-700 font-bold uppercase block">Overall Rating</span>
                  <span className="text-2xl font-black text-indigo-700 font-mono mt-1 block">{currentInterview.overallRating} / 5.0</span>
                </div>
              </div>

              {currentInterview.comments && (
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Interviewer Feedback</span>
                  {currentInterview.comments}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setEvalInterview(currentInterview)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
                >
                  Edit Interview Evaluation
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500">No interview scheduled yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Demo Class */}
      {activeTab === 'demo' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Demo Class & Student Feedback</h4>
              <p className="text-xs text-slate-500">Classroom trial session ratings</p>
            </div>
          </div>

          {currentDemo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Date & Time</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentDemo.date} at {currentDemo.time}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Subject & Class</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentDemo.subject} ({currentDemo.class})</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Location</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{currentDemo.location}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block">Demo Result</span>
                  <div className="mt-1"><StatusBadge status={currentDemo.result} size="sm" /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Admin Rating</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentDemo.adminRating} / 5</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Student Rating</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentDemo.studentRating} / 5</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase block">Parent Rating</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{currentDemo.parentRating} / 5</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSchedulingDemo(true)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Reschedule Demo
                </button>
                <button
                  onClick={() => setEvalDemo(currentDemo)}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Assess / Update Demo Evaluation
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-slate-500">No demo class scheduled yet.</p>
              {['INTERVIEW_SELECTED', 'DEMO_CLASS_SCHEDULED', 'DEMO_CLASS_PENDING'].includes(tutor.status) && (
                <button
                  onClick={() => setSchedulingDemo(true)}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  [ SCHEDULE DEMO CLASS ]
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Parent Approval */}
      {activeTab === 'parentApproval' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Parent Approval</h4>
              <p className="text-xs text-slate-500">Parent rating, feedback, and acceptance confirmation</p>
            </div>
            {currentApproval && (
              <button
                onClick={() => setEvalApproval(currentApproval)}
                className="px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200"
              >
                Review Parent Consent
              </button>
            )}
          </div>

          {currentApproval ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Decision</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    {currentApproval.status === 'APPROVED' ? '? PARENT APPROVED' : currentApproval.status === 'REJECTED' ? '? PARENT REJECTED' : '? PENDING REVIEW'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Rating</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{currentApproval.rating} / 5 Stars</span>
                </div>
              </div>
              {currentApproval.feedback && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Parent Feedback Remarks</span>
                  "{currentApproval.feedback}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500">Awaiting Demo Class completion to generate parent approval review.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Appointment */}
      {activeTab === 'appointment' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="text-base font-bold text-slate-900">Tutor Appointment</h4>
          </div>

          {appointment ? (
            <div className="space-y-4 bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Active Placement</span>
                  <h3 className="text-lg font-black text-emerald-950">Appointment ID: {appointment.appointmentId}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-emerald-200/60">
                <div>
                  <span className="text-emerald-700 font-semibold block">Subject</span>
                  <span className="font-bold text-slate-900 text-sm">{appointment.subject}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold block">Start Date</span>
                  <span className="font-bold text-slate-900 text-sm">{appointment.startDate}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold block">Schedule</span>
                  <span className="font-bold text-slate-900 text-sm">{appointment.timing}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold block">Salary</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">?{appointment.salary?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-slate-500">Tutor appointment has not been finalized yet.</p>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md"
              >
                ?? Finalize Tutor Appointment
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: WhatsApp Communication & Delivery Details */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <h4 className="text-lg font-bold text-slate-900">{tutor.fullName} - WhatsApp Details</h4>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    (tutor.whatsappOptIn || 'YES') === 'YES'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (tutor.whatsappOptIn || 'YES') === 'NO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Opt-In: {tutor.whatsappOptIn || 'YES'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Phone Number: {tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone} | Status: {tutor.status}
              </p>
            </div>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Message</span>
            </button>
          </div>

          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Messages</span>
              <span className="text-xl font-black text-slate-900">{whatsappDetailData?.stats?.total ?? whatsappHistory.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Sent</span>
              <span className="text-xl font-black text-sky-600">{whatsappDetailData?.stats?.sent ?? whatsappHistory.filter(h => h.status === 'Sent' || h.status === 'SENT').length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Delivered</span>
              <span className="text-xl font-black text-emerald-600">{whatsappDetailData?.stats?.delivered ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Read</span>
              <span className="text-xl font-black text-blue-600">{whatsappDetailData?.stats?.read ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Failed</span>
              <span className="text-xl font-black text-rose-600">{whatsappDetailData?.stats?.failed ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Received (Inbound)</span>
              <span className="text-xl font-black text-teal-600">{whatsappDetailData?.stats?.received ?? 0}</span>
            </div>
          </div>

          {/* Complete Message History Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Complete WhatsApp Message History
            </h4>

            {(!whatsappDetailData?.messages || whatsappDetailData.messages.length === 0) && whatsappHistory.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No WhatsApp messages recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click "Send WhatsApp Message" above to initiate communication with this candidate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3">Message</th>
                      <th className="py-2.5 px-3">Template</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Provider Message ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(whatsappDetailData?.messages || whatsappHistory).map((item: any) => {
                      const isDetail = Boolean(item.direction);
                      const direction = isDetail ? item.direction : 'OUTBOUND';
                      const dateStr = item.createdAt || item.date || item.sentAt;
                      const msgText = item.messageText || item.message;
                      const statusVal = item.status;
                      const pId = item.providerMessageId || '—';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(dateStr).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                direction === 'INBOUND'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {direction}
                            </span>
                          </td>

                          <td className="py-3 px-3 max-w-xs text-slate-800 whitespace-pre-wrap">
                            {msgText}
                          </td>

                          <td className="py-3 px-3 text-slate-500">
                            {item.templateName || 'Direct Message'}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                statusVal === 'READ'
                                  ? 'bg-blue-100 text-blue-800'
                                  : statusVal === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : statusVal === 'SENT' || statusVal === 'Sent'
                                  ? 'bg-sky-100 text-sky-800'
                                  : statusVal === 'RECEIVED'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {statusVal}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                            {pId}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      

      {/* TAB 8: Activity Log Timeline */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recruitment Activity History</h4>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4 pl-8">
                <span className="absolute left-2.5 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white"></span>
                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1 block">By: {log.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedDoc && (
        <DocReviewModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          tutorId={tutor.id}
          onSuccess={loadData}
        />
      )}

      {evalInterview && (
        <InterviewModal
          isOpen={!!evalInterview}
          onClose={() => setEvalInterview(null)}
          interview={evalInterview}
          tutor={tutor}
          onSuccess={loadData}
        />
      )}

      {evalDemo && (
        <DemoModal
          isOpen={!!evalDemo}
          onClose={() => setEvalDemo(null)}
          demo={evalDemo}
          tutor={tutor}
          onSuccess={loadData}
        />
      )}

      {schedulingDemo && (
        <ScheduleDemoModal
          isOpen={schedulingDemo}
          onClose={() => setSchedulingDemo(false)}
          demo={currentDemo}
          tutor={tutor}
          onSuccess={loadData}
        />
      )}

      {evalApproval && (
        <ParentApprovalModal
          isOpen={!!evalApproval}
          onClose={() => setEvalApproval(null)}
          approval={evalApproval}
          tutor={tutor}
          onSuccess={loadData}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          tutor={tutor}
          students={students}
          onSuccess={loadData}
        />
      )}

      <ConfirmDialog
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        onConfirm={handleValidate}
        title="Confirm Tutor Validation"
        message={'Are you sure you want to validate tutor "' + tutor.fullName + '" (' + tutor.tutorId + ')? Upon confirmation, status will change to VALIDATED and the tutor will automatically move to Document Verification.'}
        confirmText="Confirm Validation"
        cancelText="Cancel"
      />

      {/* WhatsApp Composer Modal */}
      {showWhatsAppModal && (
        <WhatsAppComposerModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          recipients={[tutor]}
          defaultMessage={`Hello ${tutor.fullName},\n\nThis is Charithra Learning Hub.\n\nWe are contacting you regarding your tutor application.\n\nPlease let us know your availability.\n\nThank you.`}
          onSuccess={() => {
            setShowWhatsAppModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
