import React, { useState } from 'react';
import {
  X,
  Briefcase,
  GraduationCap,
  CheckCircle,
  User,
  Phone,
  Mail,
  BookOpen,
  MapPin,
  Clock,
  Sparkles,
  MessageCircle,
  Send
} from 'lucide-react';
import { BRAND } from '../data/mockData';
import { playPop, playChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { submitTutorApplication } from '../services/api';

interface TutorApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science / Coding',
  'Robotics & Electronics',
  'English & Communication',
  'Social Science',
  'Primary Classes (1-5)'
];

export const TutorApplyModal: React.FC<TutorApplyModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('B.Sc / M.Sc');
  const [experience, setExperience] = useState('2-3 Years');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [preferredMode, setPreferredMode] = useState('Centre Offline + Online');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTutorId, setSubmittedTutorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSubject = (subj: string) => {
    playPop();
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await submitTutorApplication({
        fullName,
        phone,
        email,
        qualification,
        experience,
        subjects: selectedSubjects,
        preferredLocation: preferredMode,
        message
      });

      if (res.success) {
        playChime();
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 }
        });
        setSubmittedTutorId(res.tutor?.tutorId || 'TUT-NEW');
      } else {
        setErrorMsg(res.error || 'Unable to submit application. Please verify details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server. Please message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Charithra Learning Hub HR! I have applied as a Tutor/Teacher:\n\n• Name: ${fullName}\n• Phone: ${phone}\n• Qualification: ${qualification}\n• Experience: ${experience}\n• Subjects: ${selectedSubjects.join(', ')}\n• Reference: ${submittedTutorId || 'Website Candidate'}\n\nLooking forward to hearing from you!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#121520] border-2 border-charithra-gold/50 shadow-2xl p-6 sm:p-10 text-white">
        
        {/* Close Button */}
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

        {!submittedTutorId ? (
          <div>
            <div className="space-y-2 mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers at Charithra Hub</span>
              </div>

              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Join Our Teaching Faculty
              </h3>

              <p className="text-xs sm:text-sm text-slate-300">
                Teach inspired students in academic tuition or innovative robotics & future skills workshops. Flexible timings and competitive compensation.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mobile / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Highest Qualification *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171B26] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                    >
                      <option value="B.Sc / M.Sc">B.Sc / M.Sc (Science/Maths)</option>
                      <option value="B.Tech / B.E">B.Tech / B.E (Engineering)</option>
                      <option value="B.Ed / M.Ed">B.Ed / M.Ed (Education)</option>
                      <option value="B.A / M.A">B.A / M.A (Languages/Arts)</option>
                      <option value="Ph.D / Doctorate">Ph.D / Doctorate</option>
                      <option value="Diploma / Other">Diploma / Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Experience & Preferred Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Teaching Experience *
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171B26] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                  >
                    <option value="Fresher">Fresher (Passionate to teach)</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years (Senior Educator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Preferred Teaching Mode
                  </label>
                  <select
                    value={preferredMode}
                    onChange={(e) => setPreferredMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171B26] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                  >
                    <option value="Centre Offline + Online">Centre Offline + Online</option>
                    <option value="Centre Offline Only">Centre Classroom Only</option>
                    <option value="Live Online Only">Live Online Only</option>
                    <option value="Home Tuition Specialist">Home Tuition Specialist</option>
                  </select>
                </div>
              </div>

              {/* Subjects Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Subjects You Can Teach (Select all that apply):
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map((s) => {
                    const isSel = selectedSubjects.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSubject(s)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                          isSel
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                            : 'bg-white/5 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {s} {isSel && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Brief Note or Teaching Philosophy
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your teaching experience, achievements, or availability..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-charithra-gold focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Teacher Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Submission Success State */
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Application Received, {fullName}!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your application has been registered in the Charithra Hub faculty recruitment pipeline.
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-charithra-gold/20 border border-charithra-gold text-charithra-gold font-mono text-xs font-bold mt-2">
                Candidate Reference ID: {submittedTutorId}
              </div>
            </div>

            {/* Instant WhatsApp HR Connect */}
            <div className="p-4 rounded-2xl bg-[#181D2D] border border-charithra-gold/30 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-charithra-gold uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Fast-Track HR Interview</span>
              </div>
              <p className="text-xs text-slate-300">
                Share your resume or chat directly with our Academic Recruitment Team on WhatsApp for prompt interview scheduling:
              </p>
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Connect with HR on WhatsApp</span>
              </a>
            </div>

            <button
              onClick={() => {
                setSubmittedTutorId(null);
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
