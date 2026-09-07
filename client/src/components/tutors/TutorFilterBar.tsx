import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface TutorFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  qualification: string;
  onQualificationChange: (val: string) => void;
  experience: string;
  onExperienceChange: (val: string) => void;
  subject: string;
  onSubjectChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  platform?: string;
  onPlatformChange?: (val: string) => void;
  homeTuition?: string;
  onHomeTuitionChange?: (val: string) => void;
  onReset: () => void;
}

export const TutorFilterBar: React.FC<TutorFilterBarProps> = ({
  search,
  onSearchChange,
  qualification,
  onQualificationChange,
  experience,
  onExperienceChange,
  subject,
  onSubjectChange,
  location,
  onLocationChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  platform = 'ALL',
  onPlatformChange,
  homeTuition = 'ALL',
  onHomeTuitionChange,
  onReset
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, ID, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Select Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
        {/* Subject */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Accountancy">Accountancy</option>
            <option value="Economics">Economics</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="French">French</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">All Locations</option>
            <option value="Tiruchirappalli">Tiruchirappalli</option>
            <option value="Chennai">Chennai</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Madurai">Madurai</option>
            <option value="Salem">Salem</option>
            <option value="Bangalore">Bangalore</option>
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Experience</label>
          <select
            value={experience}
            onChange={(e) => onExperienceChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">Any Experience</option>
            <option value="1">1+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years</option>
            <option value="10">10+ Years</option>
          </select>
        </div>

        {/* Qualification */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Qualification</label>
          <select
            value={qualification}
            onChange={(e) => onQualificationChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="ALL">All Qualifications</option>
            <option value="M.Sc">M.Sc</option>
            <option value="B.Sc">B.Sc</option>
            <option value="B.Tech">B.Tech / B.E</option>
            <option value="Ph.D">Ph.D</option>
            <option value="M.A">M.A</option>
            <option value="M.Com">M.Com</option>
            <option value="B.Ed">B.Ed Holder</option>
          </select>
        </div>

        {/* Platform */}
        {onPlatformChange && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none font-medium"
            >
              <option value="ALL">All Platforms</option>
              <option value="fb">Facebook (fb)</option>
              <option value="ig">Instagram (ig)</option>
            </select>
          </div>
        )}

        {/* Home Tuition */}
        {onHomeTuitionChange && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Home Tuition</label>
            <select
              value={homeTuition}
              onChange={(e) => onHomeTuitionChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none font-medium"
            >
              <option value="ALL">Any Availability</option>
              <option value="yes">Yes (Available)</option>
              <option value="no">No</option>
            </select>
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="NOT_ASSIGNED">⚪ Not Assigned</option>
            <option value="HIGH_PRIORITY">🔴 High Priority</option>
            <option value="LOW_PRIORITY">🟡 Low Priority</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW_APPLICATION">New Application</option>
            <option value="HIGH_PRIORITY">High Priority</option>
            <option value="LOW_PRIORITY">Low Priority</option>
            <option value="VALIDATED">Validated</option>
            <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
            <option value="DOCUMENT_APPROVED">Doc Approved</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_SELECTED">Interview Selected</option>
            <option value="DEMO_CLASS_SCHEDULED">Demo Scheduled</option>
            <option value="PARENT_APPROVAL_PENDING">Parent Approval Pending</option>
            <option value="PARENT_APPROVED">Parent Approved</option>
            <option value="TUTOR_APPOINTED">Tutor Appointed</option>
            <option value="ACTIVE">Active</option>
          </select>
        </div>
      </div>
    </div>
  );
};
