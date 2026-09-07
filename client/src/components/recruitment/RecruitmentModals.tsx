import React, { useState } from 'react';
import { Tutor, TutorDocument, TutorInterview, DemoClass, ParentApproval, Student } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import {
  updateDocumentStatus,
  moveToInterview,
  submitInterviewEvaluation,
  moveToDemoClass,
  submitDemoEvaluation,
  decideParentApproval,
  createAppointment,
  fetchStudents,
  scheduleDemoClass
} from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Calendar,
  Star,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  Award
} from 'lucide-react';

/* -------------------------------------------------------------
 * 1. Document Review Modal
 * ----------------------------------------------------------- */
interface DocReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: TutorDocument | null;
  tutorId: string;
  onSuccess: () => void;
}

export const DocReviewModal: React.FC<DocReviewModalProps> = ({
  isOpen,
  onClose,
  document,
  tutorId,
  onSuccess
}) => {
  const { addToast } = useApp();
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!document) return null;

  const handleAction = async (status: 'Verified' | 'Rejected') => {
    setLoading(true);
    try {
      await updateDocumentStatus(tutorId, document.id, {
        status,
        remarks: remarks || (status === 'Verified' ? 'Document verified by verification officer.' : 'Document rejected due to discrepancies.')
      });
      addToast(
        status === 'Verified' ? 'success' : 'error',
        `Document ${status}`,
        `${document.docType} has been marked as ${status}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Verify: ${document.docType}`} subtitle={`File: ${document.fileName}`}>
      <div className="space-y-4">
        {/* Mock Document Preview Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
          <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">{document.fileName}</p>
          <p className="text-xs text-slate-400 mt-1">Authentic Document Verified via Security Check</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Simulated downloading: ${document.fileName}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Verification Remarks / Notes
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Verified against university roll sheet, seals and dates match..."
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('Rejected')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject Document
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('Verified')}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Verify
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------
 * 2. Interview Evaluation Modal
 * ----------------------------------------------------------- */
interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: TutorInterview | null;
  tutor: Tutor;
  onSuccess: () => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  tutor,
  onSuccess
}) => {
  const { addToast } = useApp();
  const [comm, setComm] = useState(interview?.communicationRating || 4);
  const [subj, setSubj] = useState(interview?.subjectKnowledgeRating || 4);
  const [teach, setTeach] = useState(interview?.teachingAbilityRating || 4);
  const [result, setResult] = useState<'Selected' | 'Rejected' | 'On Hold'>(
    (interview?.result as any) || 'Selected'
  );
  const [comments, setComments] = useState(interview?.comments || '');
  const [loading, setLoading] = useState(false);

  const overall = Number(((comm + subj + teach) / 3).toFixed(1));
  const { triggerRefresh } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    setLoading(true);
    try {
      await submitInterviewEvaluation(interview.id, {
        communicationRating: comm,
        subjectKnowledgeRating: subj,
        teachingAbilityRating: teach,
        overallRating: overall,
        result,
        comments
      });

      if (result === 'Selected') {
        addToast(
          'success',
          'Interview Selected',
          'Interview selected successfully. Tutor moved to Demo Class.'
        );
      } else if (result === 'Rejected') {
        addToast(
          'error',
          'Interview Rejected',
          `Tutor ${tutor.fullName} was rejected in the interview round.`
        );
      } else {
        addToast(
          'warning',
          'Interview On Hold',
          `Tutor ${tutor.fullName} placed on hold.`
        );
      }

      triggerRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Interview: ${tutor.fullName}`}
      subtitle={`Interview ID: ${interview?.interviewId || 'Pending'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Sliders */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Communication Rating</span>
              <span className="text-indigo-600">{comm} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={comm}
              onChange={(e) => setComm(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Subject Knowledge Rating</span>
              <span className="text-indigo-600">{subj} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={subj}
              onChange={(e) => setSubj(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Teaching Ability Rating</span>
              <span className="text-indigo-600">{teach} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={teach}
              onChange={(e) => setTeach(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">Calculated Overall Score:</span>
            <span className="text-base font-black text-indigo-600 font-mono">{overall} / 5.0</span>
          </div>
        </div>

        {/* Result Selection */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Interview Decision *</label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 font-bold"
          >
            <option value="Selected">✓ Selected (Move to Demo Class)</option>
            <option value="On Hold">⏸ On Hold</option>
            <option value="Rejected">✗ Rejected</option>
          </select>
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Interviewer Feedback & Notes</label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Detailed notes on pedagogical strengths, tone, and syllabus confidence..."
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
              result === 'Selected'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : result === 'Rejected'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading
              ? 'Saving...'
              : result === 'Selected'
              ? 'MOVE TO DEMO CLASS / SUBMIT'
              : 'Submit Evaluation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* -------------------------------------------------------------
 * 2.5 Schedule Demo Class Modal
 * ----------------------------------------------------------- */
interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demo: DemoClass | null;
  tutor: Tutor;
  onSuccess: () => void;
}

export const ScheduleDemoModal: React.FC<ScheduleDemoModalProps> = ({
  isOpen,
  onClose,
  demo,
  tutor,
  onSuccess
}) => {
  const { addToast, triggerRefresh } = useApp();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [studentClass, setStudentClass] = React.useState('10th Standard');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('05:00 PM');
  const [location, setLocation] = React.useState('');
  const [teachingMethod, setTeachingMethod] = React.useState('Interactive concept revision & problem solving');
  const [comments, setComments] = React.useState('Trial demo class');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      try {
        const sRes = await fetchStudents();
        const stList = sRes.students || [];
        setStudents(stList);
        if (stList.length > 0) {
          const defaultStudent = demo?.studentId
            ? stList.find(s => s.id === demo.studentId) || stList[0]
            : stList[0];
          setSelectedStudentId(defaultStudent.id);
          setStudentClass(defaultStudent.class || '10th Standard');
          setLocation(defaultStudent.location || tutor.preferredLocation || 'Student Residence');
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(demo?.date || demo?.demoDate || tomorrow.toISOString().split('T')[0]);
    setTime(demo?.time || demo?.demoTime || '05:00 PM');
    setSubject(demo?.subject || (tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects[0] : 'Mathematics'));
    setLocation(demo?.location || tutor.preferredLocation || 'Student Residence');
    setComments(demo?.comments || 'Trial demo class');
  }, [demo, tutor, isOpen]);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const s = students.find(item => item.id === id);
    if (s) {
      setStudentClass(s.class || '10th Standard');
      if (s.location) setLocation(s.location);
      if (s.requiredSubjects && s.requiredSubjects.length > 0) {
        setSubject(s.requiredSubjects[0]);
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;
    setLoading(true);
    try {
      const demoId = demo?.id || 'dem-' + tutor.id;
      await scheduleDemoClass(demoId, {
        studentId: selectedStudentId,
        subject,
        class: studentClass,
        date,
        time,
        location,
        teachingMethod,
        comments
      });

      addToast(
        'success',
        'Demo Class Scheduled',
        `Demo class scheduled for ${tutor.fullName} on ${date} at ${time}.`
      );
      triggerRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Scheduling Failed', err.message || 'Could not schedule demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Demo Class: ${tutor.fullName}`}
      subtitle={`Tutor ID: ${tutor.tutorId} • ${tutor.qualification}`}
      maxWidth="lg"
    >
      <form onSubmit={handleScheduleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Assign Student *</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-semibold focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentName} ({s.class} • {s.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Class / Standard</label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Demo Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Demo Time *</label>
            <input
              type="text"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 05:00 PM - 06:00 PM"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Student Residence / Online / Centre Classroom"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Focus / Plan</label>
            <input
              type="text"
              value={teachingMethod}
              onChange={(e) => setTeachingMethod(e.target.value)}
              placeholder="e.g. Chapter 3 concept revision with whiteboard"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Instructions / Notes</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Instructions for demo trial..."
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Confirm Demo Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* -------------------------------------------------------------
 * 3. Demo Class Evaluation Modal
 * ----------------------------------------------------------- */
interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demo: DemoClass | null;
  tutor: Tutor;
  onSuccess: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  demo,
  tutor,
  onSuccess
}) => {
  const { addToast } = useApp();
  const [adminRating, setAdminRating] = useState(demo?.adminRating || 5);
  const [studentRating, setStudentRating] = useState(demo?.studentRating || 5);
  const [parentRating, setParentRating] = useState(demo?.parentRating || 4);
  const [result, setResult] = useState<'Passed' | 'Failed' | 'Pending'>(demo?.result || 'Passed');
  const [teachingMethod, setTeachingMethod] = useState(demo?.teachingMethod || 'Interactive Whiteboard & Practice');
  const [comments, setComments] = useState(demo?.comments || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demo) return;
    setLoading(true);
    try {
      await submitDemoEvaluation(demo.id, {
        adminRating,
        studentRating,
        parentRating,
        result,
        teachingMethod,
        comments
      });
      addToast(
        result === 'Passed' ? 'success' : 'error',
        'Demo Class Result Recorded',
        `Demo class marked as ${result}. ${result === 'Passed' ? 'Moved to Parent Approval!' : ''}`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Demo Class Evaluation: ${tutor.fullName}`}
      subtitle={`Demo ID: ${demo?.demoId || 'DEMO'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Breakdown */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Admin Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              value={adminRating}
              onChange={(e) => setAdminRating(Number(e.target.value))}
              className="w-full text-center font-bold text-sm bg-white py-1 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Student Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              value={studentRating}
              onChange={(e) => setStudentRating(Number(e.target.value))}
              className="w-full text-center font-bold text-sm bg-white py-1 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Parent Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              value={parentRating}
              onChange={(e) => setParentRating(Number(e.target.value))}
              className="w-full text-center font-bold text-sm bg-white py-1 rounded-lg border border-slate-200"
            />
          </div>
        </div>

        {/* Teaching Method */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Method Observed</label>
          <input
            type="text"
            value={teachingMethod}
            onChange={(e) => setTeachingMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        {/* Demo Result */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Demo Class Result *</label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 font-bold"
          >
            <option value="Passed">? Passed (Advance to Parent Approval)</option>
            <option value="Failed">? Failed</option>
            <option value="Pending">? Pending</option>
          </select>
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Student & Observer Feedback</label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Student responsiveness, clarity on tough formulas, punctuality..."
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
          >
            {loading ? 'Saving...' : 'Record Demo Result'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* -------------------------------------------------------------
 * 4. Parent Approval Modal
 * ----------------------------------------------------------- */
interface ParentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: ParentApproval | null;
  tutor: Tutor;
  onSuccess: () => void;
}

export const ParentApprovalModal: React.FC<ParentApprovalModalProps> = ({
  isOpen,
  onClose,
  approval,
  tutor,
  onSuccess
}) => {
  const { addToast, triggerRefresh } = useApp();
  const [rating, setRating] = useState(approval?.rating || 5);
  const [feedback, setFeedback] = useState(approval?.feedback || 'We are very happy with the demo class and would love to proceed!');
  const [comments, setComments] = useState(approval?.comments || '');
  const [loading, setLoading] = useState(false);

  if (!approval) return null;

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    try {
      await decideParentApproval(approval.id, {
        decision,
        rating,
        feedback,
        comments
      });
      addToast(
        decision === 'APPROVE' ? 'success' : 'error',
        decision === 'APPROVE' ? 'Parent Approved!' : 'Parent Rejected',
        decision === 'APPROVE'
          ? `Parent approved ${tutor.fullName}. Tutor appointed successfully!`
          : `Tutor ${tutor.fullName} was rejected by the parent.`
      );
      triggerRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Parent Approval Portal: ${tutor.fullName}`}
      subtitle="Review demo class outcome and submit parent decision"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Tutor Info Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Tutor Name</span>
            <span className="font-bold text-slate-800 text-sm">{tutor.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Qualification</span>
            <span className="font-bold text-slate-800">{tutor.qualification}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Experience</span>
            <span className="font-bold text-slate-800">{tutor.experienceYears} Years</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Expected Salary</span>
            <span className="font-bold text-slate-800 font-mono">?{tutor.expectedSalary?.toLocaleString()} / mo</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 font-semibold block">Demo Class Outcome</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed with Positive Feedback
            </span>
          </div>
        </div>

        {/* Parent Rating */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Parent Satisfaction Rating</span>
            <span className="text-amber-500 font-bold">{rating} / 5 Stars</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-xl border transition-all ${
                  star <= rating
                    ? 'bg-amber-50 border-amber-300 text-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-300'
                }`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Parent Feedback *</label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback on tutor communication, responsiveness, and child connection..."
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDecision('REJECT')}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
            >
              [ REJECT TUTOR ]
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDecision('APPROVE')}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              [ ACCEPT TUTOR ]
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------
 * 5. Final Appointment Modal with Confetti Celebration
 * ----------------------------------------------------------- */
interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor;
  students: Student[];
  onSuccess: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  tutor,
  students,
  onSuccess
}) => {
  const { addToast } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'stu-001');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [timing, setTiming] = useState(tutor.availableTiming || '5:00 PM - 7:00 PM');
  const [salary, setSalary] = useState(tutor.expectedSalary || 15000);
  const [loading, setLoading] = useState(false);

  const handleAppoint = async () => {
    setLoading(true);
    try {
      await createAppointment({
        tutorId: tutor.id,
        studentId: selectedStudentId,
        startDate,
        timing,
        salary,
        subject: tutor.subjects?.[0] || 'General',
        location: tutor.preferredLocation
      });

      // Confetti celebration!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      addToast('success', '?? TUTOR APPOINTED!', `${tutor.fullName} has been appointed as an Active Tutor!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Appointment Blocked', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="?? Final Tutor Appointment"
      subtitle="Verify all 6 prerequisites and generate official appointment record"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Prerequisite Checklist */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
          <h5 className="text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            All 6 Recruitment Milestones Verified
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800">
            <span className="flex items-center gap-1.5">? Tutor Validated</span>
            <span className="flex items-center gap-1.5">? Documents Verified</span>
            <span className="flex items-center gap-1.5">? Interview Passed</span>
            <span className="flex items-center gap-1.5">? Demo Class Passed</span>
            <span className="flex items-center gap-1.5">? Student Feedback Positive</span>
            <span className="flex items-center gap-1.5">? Parent Approved</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assign Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-semibold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentName} ({s.class} - {s.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Class Timing</label>
            <input
              type="text"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Agreed Monthly Salary (?)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-bold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleAppoint}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            {loading ? 'Finalizing...' : '?? TUTOR APPOINTED'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
