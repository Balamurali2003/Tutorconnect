import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  User, 
  Phone, 
  GraduationCap, 
  Bot, 
  Plane, 
  Car, 
  Award,
  MessageCircle
} from 'lucide-react';
import { WORKSHOP_OPTIONS, BRAND } from '../data/mockData';
import { playPop, playChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { submitWorkshopBooking } from '../services/api';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackId?: string;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTrackId 
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>(initialTrackId || 'ws-all');
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('Grade 6');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('Next Saturday (10:00 AM)');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadRefId, setLeadRefId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTrackId) {
      setSelectedTrack(initialTrackId);
    }
  }, [initialTrackId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitWorkshopBooking({
        childName,
        childGrade,
        selectedTrack,
        selectedTrackTitle: selectedWorkshopObj.title,
        selectedDate,
        parentPhone
      });
      playChime();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setLeadRefId(res.lead?.id || null);
      setSubmitted(true);
    } catch (err) {
      playChime();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWorkshopObj = WORKSHOP_OPTIONS.find(w => w.id === selectedTrack) || WORKSHOP_OPTIONS[0];

  const whatsappMessage = encodeURIComponent(
    `Hello Charithra Learning Hub! I would like to book a One-Day Workshop for my child:\n\n• Child Name: ${childName || 'Student'}\n• Class/Grade: ${childGrade}\n• Workshop: ${selectedWorkshopObj.title}\n• Preferred Date: ${selectedDate}\n• Parent Contact: ${parentPhone || 'Provided'}\n\nPlease confirm availability and details!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
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

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="space-y-2 mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charithra-gold/20 border border-charithra-gold/40 text-charithra-gold-light text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-charithra-gold" />
                <span>Future Skills One-Day Pass</span>
              </div>

              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Book a One-Day Technology Workshop
              </h3>

              <p className="text-xs sm:text-sm text-slate-300">
                Individual hardware kits, hands-on experiments & official certification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Select Workshop Track */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Workshop Track:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WORKSHOP_OPTIONS.map((ws) => {
                    const isSelected = selectedTrack === ws.id;
                    return (
                      <div
                        key={ws.id}
                        onClick={() => {
                          playPop();
                          setSelectedTrack(ws.id);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-charithra-gold/15 border-charithra-gold ring-1 ring-charithra-gold text-white'
                            : 'bg-white/5 border-slate-700 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-heading font-bold text-xs sm:text-sm">
                            {ws.title}
                          </span>
                          {ws.popular && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-charithra-gold text-charithra-black shrink-0">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-2">
                          {ws.duration} • {ws.ageGroup}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Name & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Child's Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Current Grade / Class *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={childGrade}
                      onChange={(e) => setChildGrade(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171B26] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={`Grade ${i + 1}`}>
                          Class {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Select Upcoming Slot *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171B26] border border-slate-700 text-white text-sm focus:border-charithra-gold focus:outline-none"
                    >
                      <option value="Next Saturday (10:00 AM - 1:30 PM)">Next Saturday (10:00 AM - 1:30 PM)</option>
                      <option value="Next Sunday (10:00 AM - 1:30 PM)">Next Sunday (10:00 AM - 1:30 PM)</option>
                      <option value="Next Sunday Full-Day Bootcamp (10:00 AM - 4:30 PM)">Next Sunday Full-Day Bootcamp (10:00 AM - 4:30 PM)</option>
                      <option value="Upcoming Holiday Special">Upcoming Holiday Special</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Parent Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-charithra-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Reserving Seat with Charithra Hub...' : 'Reserve Workshop Seat'}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                🔒 No advance payment required online. Pay after attending the orientation.
              </p>
            </form>
          </div>
        ) : (
          /* Submission Success State with WhatsApp Link */
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Seat Pre-Reserved for {childName}!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                We have recorded your interest for <strong>{selectedWorkshopObj.title}</strong> on <strong>{selectedDate}</strong>.
              </p>
              {leadRefId && (
                <div className="inline-block px-3 py-1 rounded-full bg-charithra-gold/20 border border-charithra-gold text-charithra-gold font-mono text-[11px] font-bold">
                  Reservation Lead ID: {leadRefId}
                </div>
              )}
            </div>

            {/* Instant WhatsApp Confirmation Button */}
            <div className="p-4 rounded-2xl bg-[#181D2D] border border-charithra-gold/30 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-charithra-gold uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant WhatsApp Confirmation</span>
              </div>
              <p className="text-xs text-slate-300">
                Send your booking details directly to our admissions counselor via WhatsApp for immediate seat allotment:
              </p>
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp Now</span>
              </a>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white underline pt-2"
            >
              Back to Website
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
