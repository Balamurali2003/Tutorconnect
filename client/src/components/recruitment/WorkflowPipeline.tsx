import React from 'react';
import { TutorStatus } from '../../types';
import { Check, Circle, AlertCircle, Clock } from 'lucide-react';

interface WorkflowPipelineProps {
  currentStatus: TutorStatus;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({ currentStatus }) => {
  const steps = [
    { id: 'NEW_APPLICATION', label: 'Application Submitted', sub: 'Received' },
    { id: 'PRIORITY_ASSIGNED', label: 'Priority Assigned', sub: 'High / Low' },
    { id: 'VALIDATED', label: 'Validated', sub: 'Admin Verified' },
    { id: 'DOCUMENT_VERIFICATION', label: 'Document Verification', sub: '6 Certificates' },
    { id: 'INTERVIEW', label: 'Interview Process', sub: 'Panel & Scores' },
    { id: 'DEMO_CLASS', label: 'Demo Class', sub: 'Classroom Test' },
    { id: 'PARENT_APPROVAL', label: 'Parent Approval', sub: 'Feedback & Consent' },
    { id: 'APPOINTED', label: 'Tutor Appointed', sub: 'Active Tutor' }
  ];

  const getStepIndex = (status: TutorStatus) => {
    switch (status) {
      case 'NEW_APPLICATION': return 0;
      case 'HIGH_PRIORITY':
      case 'LOW_PRIORITY': return 1;
      case 'VALIDATED': return 2;
      case 'DOCUMENT_VERIFICATION':
      case 'DOCUMENT_REJECTED': return 3;
      case 'DOCUMENT_APPROVED':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_SELECTED':
      case 'INTERVIEW_REJECTED': return 4;
      case 'DEMO_CLASS_SCHEDULED':
      case 'DEMO_CLASS_PASSED':
      case 'DEMO_CLASS_FAILED': return 5;
      case 'PARENT_APPROVAL_PENDING':
      case 'PARENT_APPROVED':
      case 'PARENT_REJECTED': return 6;
      case 'TUTOR_APPOINTED':
      case 'ACTIVE': return 7;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus.includes('REJECT') || currentStatus.includes('FAILED');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between min-w-[760px]">
        {steps.map((step, idx) => {
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          let circleBg = 'bg-slate-100 text-slate-400 border-slate-200';
          let lineBg = 'bg-slate-200';

          if (isPast) {
            circleBg = 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20';
            lineBg = 'bg-emerald-500';
          } else if (isCurrent) {
            if (isRejected) {
              circleBg = 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20';
            } else {
              circleBg = 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-4 ring-indigo-100';
            }
          }

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${circleBg}`}>
                  {isPast ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    isRejected ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-spin-slow" />
                  ) : (
                    <Circle className="w-3 h-3 fill-current opacity-40" />
                  )}
                </div>
                <div className="mt-2.5">
                  <p className={`text-xs font-bold ${isCurrent ? (isRejected ? 'text-rose-600' : 'text-indigo-600') : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.sub}</p>
                </div>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative -top-3">
                  <div className={`h-full transition-all ${idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
