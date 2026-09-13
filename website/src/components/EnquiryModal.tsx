import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  CheckCircle, 
  User, 
  Phone, 
  BookOpen, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { BRAND, SUBJECTS } from '../data/mockData';
import { playPop, playChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { submitEnquiry } from '../services/api';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose }) => {
  const [learningMode, setLearningMode] = useState<'both' | 'offline' | 'online'>('both');
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('Grade 8');
  const [board, setBoard] = useState('CBSE');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Science']);
  const [parentPhone, setParentPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadRefId, setLeadRefId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSubject = (name: string) => {
    playPop();
    if (selectedSubjects.includes(name)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== name));
    } else {
      setSelectedSubjects([...selectedSubjects, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitEnquiry({
        studentName,
        grade,
        board,
        learningMode,
        selectedSubjects,
        parentPhone
      });
      playChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setLeadRefId(res.lead?.id || null);
      setSubmitted(true);
    } catch (err) {
      // Graceful fallback
      playChime();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Charithra Learning Hub! I would like to enquire about Academic Tuition:\n\n• Student: ${studentName || 'Student'}\n• Grade: ${grade} (${board})\n• Mode: ${learningMode.toUpperCase()}\n• Subjects: ${selectedSubjects.join(', ')}\n• Parent Phone: ${parentPhone || 'Provided'}\n\nPlease share batch timings and trial class slots!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#131622] border-2 border-charithra-gold/40 shadow-2xl p-6 sm:p-10 text-white">
        
        <button
          onClick={() => {
            playPop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic Admissions & Enrolment</span>
              </div>

              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Tuition Enrolment & Free Diagnostic Session
              </h3>

              <p className="text-xs sm:text-sm text-slate-300">
                Online & Offline batches with 1:8 teacher ratio for Classes 1 to 12.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Preferred Learning Mode:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: 'Online + Offline' },
                    { id: 'offline', label: 'Offline Classroom' },
                    { id: 'online', label: 'Live Online Only' }
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        playPop();
                        setLearningMode(m.id as any);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        learningMode === m.id
                          ? 'bg-charithra-gold text-charithra-black border-charithra-gold'
                          : 'bg-white/5 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Name & Board */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Diya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181C2B] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                    <option value="State Board">State Board</option>
                    <option value="Cambridge/IGCSE">Cambridge / IGCSE</option>
                  </select>
                </div>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Grade / Class
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181C2B] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={`Grade ${i + 1}`}>
                      Class {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subjects of Interest */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Subjects:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Mathematics', 'Science', 'English', 'Social Science', 'Languages', 'Homework Support'].map((subj) => {
                    const isSel = selectedSubjects.includes(subj);
                    return (
                      <button
                        type="button"
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                          isSel
                            ? 'bg-blue-500/30 border-blue-400 text-blue-200 font-bold'
                            : 'bg-white/5 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {subj} {isSel && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Parent Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Enquiry to Charithra Hub...' : 'Book Free 1-on-1 Trial Class'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Request Received for {studentName}!
              </h3>
              <p className="text-sm text-slate-300">
                Our academic coordinator will reach out shortly to schedule your free diagnostic assessment.
              </p>
              {leadRefId && (
                <div className="inline-block px-3 py-1 rounded-full bg-charithra-gold/20 border border-charithra-gold text-charithra-gold font-mono text-[11px] font-bold">
                  Enquiry ID: {leadRefId}
                </div>
              )}
            </div>

            <a
              href={`https://wa.me/${BRAND.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playPop}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp for Immediate Schedule</span>
            </a>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
