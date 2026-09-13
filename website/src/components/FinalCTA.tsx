import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  Star, 
  ArrowRight, 
  Rocket, 
  Plane, 
  BookOpen, 
  Cog,
  Users
} from 'lucide-react';
import { playChime, playPop } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FinalCTAProps {
  onJoinHub: () => void;
  onBookWorkshop: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onJoinHub, onBookWorkshop }) => {
  const handleAction = (type: 'join' | 'workshop') => {
    playChime();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.7 }
    });
    if (type === 'join') onJoinHub();
    else onBookWorkshop();
  };

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-[#080A10] via-[#121624] to-[#080A10] text-white overflow-hidden">
      
      {/* Ambient Radial Lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-charithra-gold/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Floating Elements Around the Scene (Prompt: Rocket, Stars, Books, Gear, Drone) */}
      <div className="absolute top-12 left-16 text-charithra-gold animate-float-slow hidden md:block">
        <Rocket className="w-8 h-8 text-amber-300" />
      </div>

      <div className="absolute top-20 right-20 text-sky-400 animate-float-reverse hidden md:block">
        <Plane className="w-8 h-8 text-sky-300" />
      </div>

      <div className="absolute bottom-16 left-24 text-emerald-400 animate-float-reverse hidden md:block">
        <BookOpen className="w-7 h-7 text-emerald-300" />
      </div>

      <div className="absolute bottom-20 right-28 text-purple-400 animate-float-slow hidden md:block">
        <Cog className="w-8 h-8 text-purple-300 animate-spin-slow" />
      </div>

      <div className="absolute top-1/4 right-1/6 text-yellow-300 animate-sparkle">
        <Star className="w-5 h-5 fill-yellow-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charithra-gold/20 border border-charithra-gold/40 text-charithra-gold-light text-xs font-bold uppercase tracking-wider shadow-gold-glow">
            <Sparkles className="w-4 h-4 text-charithra-gold animate-sparkle" />
            <span>Admissions & Weekend Workshop Batches Open</span>
          </div>

          {/* Heading (Prompt: Let's Start Their Learning Journey) */}
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Let's Start Their{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-charithra-gold to-yellow-400">
              Learning Journey.
            </span>
          </h2>

          <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Learn today. Explore tomorrow. Build the future.
          </p>

          {/* FINAL APPEARANCE OF MASCOTS: New Scene on Observation Deck Looking at Futuristic Learning City */}
          <div className="my-10 relative rounded-3xl overflow-hidden border-2 border-charithra-gold/40 shadow-2xl group">
            <img 
              src="/assets/scenes/final-cta-future.jpg" 
              alt="Charithra Girl holding tablet and Charithra Boy holding robot with school children on an observation deck looking toward a futuristic learning city" 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-charithra-gold" />
                <span className="font-semibold text-white">Charithra Mascots Inspiring the Class of Tomorrow</span>
              </div>
              <span className="text-amber-300 font-medium hidden sm:inline">
                Academic Excellence • Hands-On Inventions
              </span>
            </div>
          </div>

          {/* Primary Action Buttons (Join Classes, Book a Workshop, Talk to Us) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto pt-2">
            <button
              onClick={() => handleAction('join')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-sm sm:text-base text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <GraduationCap className="w-5 h-5 text-charithra-black" />
              <span>Join Classes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleAction('workshop')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 border border-charithra-gold/40 hover:border-charithra-gold transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-charithra-gold" />
              <span>Book a Workshop</span>
            </button>

            <a
              href={`https://wa.me/919876543210?text=Hello%20Charithra%20Learning%20Hub,%20I%20would%20like%20to%20talk%20to%20an%20academic%20mentor!`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playPop}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm sm:text-base text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Talk to Us</span>
            </a>
          </div>

          <p className="text-xs text-slate-400 pt-4">
            Limited seats per batch (Max 8 students) • Free diagnostic session included
          </p>

        </div>

      </div>
    </section>
  );
};
