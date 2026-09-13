import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  MessageCircle, 
  Bot, 
  Plane, 
  Car, 
  CheckCircle, 
  Users, 
  Cpu
} from 'lucide-react';
import { playChime, playPop } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WorkshopCTAProps {
  onBookWorkshop: (trackId?: string) => void;
  onTalkToUs: () => void;
}

export const WorkshopCTA: React.FC<WorkshopCTAProps> = ({ onBookWorkshop, onTalkToUs }) => {
  const triggerConfetti = () => {
    playChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <section id="workshops" className="py-20 lg:py-28 relative overflow-hidden bg-[#101422] text-white">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-charithra-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: One Day Can Spark a Big Idea) */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charithra-gold/20 border border-charithra-gold/40 text-charithra-gold-light text-xs font-bold uppercase tracking-wider shadow-gold-glow">
            <Sparkles className="w-4 h-4 text-charithra-gold animate-sparkle" />
            <span>Multi-Discipline Future Skills Bootcamp</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            One Day Can Spark a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-charithra-gold to-yellow-300">
              Big Idea.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Give your child an experience they will remember. An immersive weekend workshop with real hardware, drone piloting, and robotics challenges.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <span className="px-3.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              🤖 Robotics
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold flex items-center gap-1.5">
              🚁 Drone
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold flex items-center gap-1.5">
              🏎️ Remote Cars
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold flex items-center gap-1.5">
              💡 Innovation
            </span>
          </div>
        </div>

        {/* Section 10 Scene: Wide-Angle Multi-Station Workshop */}
        <div className="mb-14 relative rounded-3xl overflow-hidden border-2 border-charithra-gold/40 shadow-2xl group">
          <img 
            src="/assets/scenes/tech-workshop.jpg" 
            alt="Multi-station technology workshop: Charithra girl guiding circuit assembly, Charithra boy demonstrating robot rover" 
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
          />

          {/* Overlay Stations Pill Grid */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-charithra-black/90 border border-charithra-gold/50 text-xs font-bold text-charithra-gold flex items-center gap-2 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Full-Day Future Technology Lab</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-white">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/80">Child 1: Electronics</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/80">Child 2: Robotics</span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/80">Child 3: Drone Cage</span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/80">Child 4: RC Track</span>
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 text-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-charithra-gold" />
              <span>Charithra Mascots Mentoring Active Stations</span>
            </div>
            <span className="text-amber-300 font-semibold">100% Hands-On Kit per Student</span>
          </div>
        </div>

        {/* Action Buttons & Badges */}
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                triggerConfetti();
                onBookWorkshop();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm sm:text-base text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-charithra-black" />
              <span>Book a Workshop</span>
            </button>

            <button
              onClick={() => {
                playPop();
                onTalkToUs();
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-charithra-gold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Talk to Us</span>
            </button>
          </div>

          {/* Inclusions */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Certificate Included</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Take-Home Project</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Safety Goggles Kit</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Parent Showcase</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
