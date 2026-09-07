import React from 'react';
import { TutorStatus, PriorityType } from '../../types';

interface BadgeProps {
  status?: TutorStatus | string;
  priority?: PriorityType;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, priority, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  if (priority) {
    if (priority === 'HIGH_PRIORITY') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          🔴 High Priority
        </span>
      );
    }
    if (priority === 'LOW_PRIORITY') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          🟡 Low Priority
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        ⚪ Not Assigned
      </span>
    );
  }

  const s = status ? status.toUpperCase() : '';

  // Green / Success: Validated, Approved, Selected, Active, Appointed, Passed
  if (['VALIDATED', 'DOCUMENT_APPROVED', 'INTERVIEW_SELECTED', 'DEMO_CLASS_PASSED', 'PARENT_APPROVED', 'TUTOR_APPOINTED', 'ACTIVE', 'VERIFIED', 'PASSED'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {children || s.replace(/_/g, ' ')}
      </span>
    );
  }

  // Red / Danger: Rejected, Failed
  if (['DOCUMENT_REJECTED', 'INTERVIEW_REJECTED', 'DEMO_CLASS_FAILED', 'PARENT_REJECTED', 'REJECTED', 'FAILED'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        {children || s.replace(/_/g, ' ')}
      </span>
    );
  }

  // Orange / Amber: Pending, Verification, Scheduled
  if (['DOCUMENT_VERIFICATION', 'INTERVIEW_SCHEDULED', 'DEMO_CLASS_SCHEDULED', 'PARENT_APPROVAL_PENDING', 'PENDING'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {children || s.replace(/_/g, ' ')}
      </span>
    );
  }

  // Blue / Info: New Application
  if (['NEW_APPLICATION', 'LOOKING_FOR_TUTOR'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        {children || s.replace(/_/g, ' ')}
      </span>
    );
  }

  // Default neutral badge
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {children || s.replace(/_/g, ' ')}
    </span>
  );
};
