import React, { useState, useEffect } from 'react';
import { Tutor, TutorDocument } from '../types';
import { fetchTutors, fetchTutorDetail, moveToInterview } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { DocReviewModal } from '../components/recruitment/RecruitmentModals';
import { useApp } from '../context/AppContext';
import { FileCheck2, ArrowRight, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DocumentVerificationPageProps {
  onSelectTutor: (tutor: Tutor) => void;
}

export const DocumentVerificationPage: React.FC<DocumentVerificationPageProps> = ({ onSelectTutor }) => {
  const { addToast, refreshTrigger } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [activeTutorId, setActiveTutorId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<TutorDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<TutorDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await fetchTutors();
      const verificationList = (res.tutors || []).filter(t => 
        ['DOCUMENT_VERIFICATION', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'VALIDATED'].includes(t.status) ||
        t.currentStage === 'DOCUMENT_VERIFICATION' ||
        t.current_stage === 'DOCUMENT_VERIFICATION' ||
        t.isValidated === true ||
        t.is_validated === true
      );
      setTutors(verificationList);
      if (verificationList.length > 0 && !activeTutorId) {
        setActiveTutorId(verificationList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTutorDocs = async (id: string) => {
    try {
      const res = await fetchTutorDetail(id);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTutors();
  }, [refreshTrigger]);

  useEffect(() => {
    if (activeTutorId) loadActiveTutorDocs(activeTutorId);
  }, [activeTutorId]);

  const activeTutor = tutors.find(t => t.id === activeTutorId);
  const allVerified = documents.length > 0 && documents.every(d => d.status === 'Verified');
  const anyRejected = documents.some(d => d.status === 'Rejected');

  const handleMoveToInterview = async () => {
    if (!activeTutorId) return;
    try {
      await moveToInterview(activeTutorId);
      addToast('success', 'Interview Scheduled', 'Tutor has been advanced to the Interview round!');
      loadTutors();
      loadActiveTutorDocs(activeTutorId);
    } catch (err: any) {
      addToast('error', 'Action Blocked', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">Document Verification Centre</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review credentials, degrees, experience certificates, and address proof for validated tutors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidates Queue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Candidate Queue</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              {tutors.length} in Verification
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {tutors.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTutorId(t.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeTutorId === t.id
                    ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-200'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.fullName}</p>
                  <p className="text-[10px] text-slate-500">{t.tutorId} &bull; {t.qualification}</p>
                </div>
                <StatusBadge status={t.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Document Checklist & Action */}
        <div className="lg:col-span-2 space-y-4">
          {activeTutor ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              {/* Tutor Header Details */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeTutor.photo}
                    alt={activeTutor.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{activeTutor.fullName}</h3>
                    <p className="text-xs text-slate-500">
                      {activeTutor.qualification} &bull; {activeTutor.experienceYears} Years Exp &bull; {activeTutor.preferredLocation}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={activeTutor.status} size="md" />
                  <button
                    onClick={() => onSelectTutor(activeTutor)}
                    className="text-xs text-indigo-600 font-bold block mt-1 hover:underline"
                  >
                    View Full Profile &rarr;
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Required Document Progress</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {documents.filter(d => d.status === 'Verified').length} of {documents.length} documents verified
                  </p>
                </div>

                {allVerified ? (
                  <button
                    onClick={handleMoveToInterview}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <span>[ MOVE TO INTERVIEW ]</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : anyRejected ? (
                  <span className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    DOCUMENT REJECTED
                  </span>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Verification Incomplete
                  </span>
                )}
              </div>

              {/* Document Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{doc.docType}</span>
                        <StatusBadge status={doc.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono truncate">{doc.fileName}</p>
                      {doc.remarks && (
                        <div className="mt-2 text-xs bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                          <span className="font-bold text-[10px] uppercase text-slate-400 block">Remarks:</span>
                          {doc.remarks}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-end">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Verify / Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
              Select a tutor from the left queue to review documents.
            </div>
          )}
        </div>
      </div>

      {selectedDoc && activeTutor && (
        <DocReviewModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          tutorId={activeTutor.id}
          onSuccess={() => {
            loadTutors();
            loadActiveTutorDocs(activeTutor.id);
          }}
        />
      )}
    </div>
  );
};
