import React, { useState, useEffect } from 'react';
import { Tutor } from '../types';
import { fetchTutors, createTutor, updateTutor } from '../services/api';
import { TutorTable } from '../components/tutors/TutorTable';
import { TutorFilterBar } from '../components/tutors/TutorFilterBar';
import { TutorFormModal } from '../components/tutors/TutorFormModal';
import { useApp } from '../context/AppContext';
import { UserPlus, Download, MessageCircle } from 'lucide-react';
import { WhatsAppComposerModal } from '../components/whatsapp/WhatsAppComposerModal';

interface AllTutorsPageProps {
  onSelectTutor: (tutor: Tutor) => void;
  presetPriority?: 'HIGH_PRIORITY' | 'LOW_PRIORITY';
  presetStatus?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const AllTutorsPage: React.FC<AllTutorsPageProps> = ({
  onSelectTutor,
  presetPriority,
  presetStatus,
  pageTitle = 'All Registered Tutors',
  pageSubtitle = 'Complete directory of tutor applications and registered educators'
}) => {
  const { globalSearch, addToast, refreshTrigger } = useApp();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(globalSearch || '');
  const [qualification, setQualification] = useState('ALL');
  const [experience, setExperience] = useState('ALL');
  const [subject, setSubject] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [priority, setPriority] = useState<string>(presetPriority || 'ALL');
  const [status, setStatus] = useState<string>(presetStatus || 'ALL');
  const [platform, setPlatform] = useState('ALL');
  const [homeTuition, setHomeTuition] = useState('ALL');

  // Modal & Selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [isWhatsAppComposerOpen, setIsWhatsAppComposerOpen] = useState(false);
  const [sort, setSort] = useState<string>('DEFAULT');

  const loadTutors = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (qualification !== 'ALL') params.qualification = qualification;
      if (experience !== 'ALL') params.minExp = experience;
      if (subject !== 'ALL') params.subject = subject;
      if (location !== 'ALL') params.location = location;
      if (priority !== 'ALL') params.priority = priority;
      if (status !== 'ALL') params.status = status;
      if (platform !== 'ALL') params.platform = platform;
      if (homeTuition !== 'ALL') params.homeTuition = homeTuition;
      if (sort !== 'DEFAULT') params.sort = sort;

      const res = await fetchTutors(params);
      setTutors(res.tutors || []);
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (presetPriority !== undefined) {
      setPriority(presetPriority);
    }
  }, [presetPriority]);

  useEffect(() => {
    if (presetStatus !== undefined) {
      setStatus(presetStatus);
    }
  }, [presetStatus]);

  useEffect(() => {
    loadTutors();
  }, [search, qualification, experience, subject, location, priority, status, platform, homeTuition, sort, refreshTrigger]);

  const handleResetFilters = () => {
    setSearch('');
    setQualification('ALL');
    setExperience('ALL');
    setSubject('ALL');
    setLocation('ALL');
    setPriority(presetPriority || 'ALL');
    setStatus(presetStatus || 'ALL');
    setPlatform('ALL');
    setHomeTuition('ALL');
  };

  const handleSaveTutor = async (data: Partial<Tutor>) => {
    if (editingTutor) {
      await updateTutor(editingTutor.id, data);
      addToast('success', 'Profile Updated', `${data.fullName || 'Tutor'} details saved.`);
    } else {
      await createTutor(data);
      addToast('success', 'Tutor Registered', `${data.fullName || 'New tutor'} application created.`);
    }
    loadTutors();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{pageTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedTutorIds.length === 0) {
                setSelectedTutorIds(tutors.map((t) => t.id));
              }
              setIsWhatsAppComposerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-xs transition-all active:scale-95"
            title="Send bulk WhatsApp message to tutors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>💬 WhatsApp Tutors</span>
            {selectedTutorIds.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-mono">
                {selectedTutorIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingTutor(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Tutor</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <TutorFilterBar
        search={search}
        onSearchChange={setSearch}
        qualification={qualification}
        onQualificationChange={setQualification}
        experience={experience}
        onExperienceChange={setExperience}
        subject={subject}
        onSubjectChange={setSubject}
        location={location}
        onLocationChange={setLocation}
        priority={priority}
        onPriorityChange={setPriority}
        status={status}
        onStatusChange={setStatus}
        platform={platform}
        onPlatformChange={setPlatform}
        homeTuition={homeTuition}
        onHomeTuitionChange={setHomeTuition}
        onReset={handleResetFilters}
      />

      {/* Recipient Quick Selection & Bulk Actions Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Select Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 mr-1 text-[11px] uppercase tracking-wider">Quick Select:</span>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            ☑ Select All Tutors ({tutors.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => (t.priorityLevel || t.priority) === 'HIGH_PRIORITY').map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 transition-colors"
          >
            🔴 High Priority ({tutors.filter((t) => (t.priorityLevel || t.priority) === 'HIGH_PRIORITY').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => (t.priorityLevel || t.priority) === 'MEDIUM_PRIORITY').map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 transition-colors"
          >
            🟠 Medium Priority ({tutors.filter((t) => (t.priorityLevel || t.priority) === 'MEDIUM_PRIORITY').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => (t.priorityLevel || t.priority) === 'LOW_PRIORITY').map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-colors"
          >
            🟡 Low Priority ({tutors.filter((t) => (t.priorityLevel || t.priority) === 'LOW_PRIORITY').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => t.status === 'NEW_APPLICATION').map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors"
          >
            New Applications ({tutors.filter((t) => t.status === 'NEW_APPLICATION').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => (t.status || '').includes('INTERVIEW')).map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 transition-colors"
          >
            Interview Tutors
          </button>
          <button
            type="button"
            onClick={() => setSelectedTutorIds(tutors.filter((t) => (t.status || '').includes('DEMO')).map((t) => t.id))}
            className="px-2.5 py-1 rounded-lg font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60 transition-colors"
          >
            Demo Class Tutors
          </button>
          {selectedTutorIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTutorIds([])}
              className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Right: Pre-Send Recipient Statistics, Sort & Bulk WhatsApp Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort By Priority Score */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">Default</option>
              <option value="priority_desc">Priority: Highest → Lowest</option>
              <option value="priority_asc">Priority: Lowest → Highest</option>
            </select>
          </div>

          {selectedTutorIds.length > 0 && (
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <span>Selected Tutors: <strong className="text-slate-900">{selectedTutorIds.length}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">
                Valid WhatsApp: {tutors.filter((t) => selectedTutorIds.includes(t.id) && (t.whatsappPhoneNumber || t.mobile || t.phone || '').replace(/[^\d]/g, '').length >= 10).length}
              </span>
              <span>•</span>
              <span className="text-slate-500">
                Invalid: {tutors.filter((t) => selectedTutorIds.includes(t.id) && (t.whatsappPhoneNumber || t.mobile || t.phone || '').replace(/[^\d]/g, '').length < 10).length}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (selectedTutorIds.length === 0) {
                setSelectedTutorIds(tutors.map((t) => t.id));
              }
              setIsWhatsAppComposerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {selectedTutorIds.length > 0
                ? `💬 WhatsApp All Selected Tutors (${selectedTutorIds.length})`
                : `💬 WhatsApp Bulk Message (All ${tutors.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Tutors Table with Row-level [ VALIDATE ] action & WhatsApp */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading tutors list...</p>
        </div>
      ) : (
        <TutorTable
          tutors={tutors}
          onSelectTutor={onSelectTutor}
          onEditTutor={(t) => {
            setEditingTutor(t);
            setIsModalOpen(true);
          }}
          onRefresh={loadTutors}
          selectedTutorIds={selectedTutorIds}
          onToggleSelect={(id) =>
            setSelectedTutorIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            )
          }
          onSelectAll={() => {
            if (selectedTutorIds.length === tutors.length) {
              setSelectedTutorIds([]);
            } else {
              setSelectedTutorIds(tutors.map((t) => t.id));
            }
          }}
        />
      )}

      {/* Floating Selection Bar for Bulk WhatsApp Broadcast */}
      {selectedTutorIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold font-mono text-emerald-300">
              {selectedTutorIds.length} tutors selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <button
            onClick={() => setIsWhatsAppComposerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>SEND WHATSAPP MESSAGE</span>
          </button>

          <button
            onClick={() => setSelectedTutorIds([])}
            className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Tutor Modal */}
      <TutorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTutor}
        initialData={editingTutor}
      />

      {/* Bulk / Selected WhatsApp Composer Modal */}
      {isWhatsAppComposerOpen && (
        <WhatsAppComposerModal
          isOpen={isWhatsAppComposerOpen}
          onClose={() => setIsWhatsAppComposerOpen(false)}
          recipients={tutors.filter((t) => selectedTutorIds.includes(t.id))}
          onSuccess={() => {
            setSelectedTutorIds([]);
            loadTutors();
          }}
        />
      )}
    </div>
  );
};
