import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  GraduationCap, 
  Lightbulb, 
  Puzzle, 
  Users, 
  Bot,
  Plane,
  Car,
  Cog,
  BookOpen
} from 'lucide-react';
import { playPop, playChime } from '../utils/audio';

interface HeroProps {
  onOpenWorkshopModal: () => void;
  onExploreClasses: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenWorkshopModal, onExploreClasses }) => {
  const mathSymbols = ['π', '√x', '∑', '×', '÷', '='];
  const [activeMath, setActiveMath] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMath((prev) => (prev + 1) % mathSymbols.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      id="hero" 
      className="relative min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-charithra-black via-[#0F121C] to-charithra-cream flex items-center select-none"
    >
      {/* Background Subtle Tech & Radial Glows */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-8 w-96 h-96 bg-charithra-gold/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-8 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Heading & Narrative */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charithra-gold/15 border border-charithra-gold/35 shadow-gold-glow/50 text-charithra-gold-light text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-charithra-gold animate-sparkle" />
              <span>CHARITHRA LEARNING HUB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-charithra-gold animate-ping" />
            </div>

            {/* Main Heading (Prompt: More Than Tuition) */}
            <div className="space-y-2">
              <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-tight tracking-tight">
                More Than <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-charithra-gold to-yellow-400">Tuition</span>
              </h1>
              <p className="font-heading text-lg sm:text-xl xl:text-2xl font-bold text-sky-300 tracking-tight">
                A Brighter Tomorrow for Every Curious Mind
              </p>
            </div>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              From school subjects to robotics, drones and remote-control technology, Charithra Learning Hub helps children learn, explore, create and grow with confidence.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => {
                  playPop();
                  onExploreClasses();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <GraduationCap className="w-5 h-5 text-charithra-black group-hover:rotate-12 transition-transform" />
                <span>Explore Classes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  playChime();
                  onOpenWorkshopModal();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 border border-charithra-gold/40 hover:border-charithra-gold shadow-lg backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-5 h-5 text-charithra-gold group-hover:scale-110 transition-transform" />
                <span>Book a Workshop</span>
                <Sparkles className="w-4 h-4 text-charithra-gold-light opacity-80" />
              </button>
            </div>

            {/* Collaborative Learning Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-3 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="font-heading font-black text-xl text-charithra-gold block">1:8</span>
                <span className="text-[11px] text-slate-400">Mentor Ratio</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="font-heading font-black text-xl text-sky-400 block">100%</span>
                <span className="text-[11px] text-slate-400">Concept Clarity</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="font-heading font-black text-xl text-emerald-400 block">CBSE/ICSE</span>
                <span className="text-[11px] text-slate-400">All School Boards</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Warm Collaborative Learning Scene with Both Mascots & 3-4 Friends */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            
            {/* Soft Ambient Halo behind the scene */}
            <div className="absolute inset-0 bg-gradient-to-tr from-charithra-gold/20 via-sky-500/15 to-purple-500/10 rounded-3xl blur-2xl pointer-events-none" />

            {/* FLOATING EDUCATIONAL OBJECTS IN THE EMPTY SPACE (NEVER OVERLAPPING FACES) */}
            
            {/* 1. Mathematics Symbol in Upper-Left Empty Space */}
            <div className="absolute -top-5 left-4 z-20 px-3 py-1.5 rounded-xl bg-charithra-dark/95 border border-sky-400/40 shadow-blue-glow flex items-center gap-2 text-sky-300 font-mono text-sm font-bold animate-float-slow">
              <span className="text-lg text-sky-400">{mathSymbols[activeMath]}</span>
              <span className="text-[11px] font-sans text-slate-300">Math</span>
            </div>

            {/* 2. Puzzle Piece in Upper Center Space */}
            <div className="absolute -top-7 left-1/3 z-20 px-2.5 py-1 rounded-full bg-charithra-black/90 border border-purple-400/40 text-[11px] font-bold text-purple-300 shadow-md flex items-center gap-1.5 animate-float-reverse">
              <Puzzle className="w-3.5 h-3.5 text-purple-400" />
              <span>Logic</span>
            </div>

            {/* 3. Light Bulb in Upper-Right Space */}
            <div className="absolute -top-6 right-8 z-20 p-2.5 rounded-2xl bg-charithra-dark/95 border border-amber-400/50 shadow-gold-glow animate-float-slow">
              <Lightbulb className="w-5 h-5 text-amber-300 fill-amber-300/30" />
            </div>

            {/* 4. Gear in Far-Right Empty Space */}
            <div className="absolute top-1/4 -right-3 z-20 p-2 rounded-xl bg-charithra-dark/90 border border-amber-400/30 text-amber-400 shadow-md animate-spin-slow">
              <Cog className="w-5 h-5" />
            </div>

            {/* 5. Flying Drone in Top-Right Sky Space */}
            <div className="absolute -top-2 right-1/4 z-20 px-2.5 py-1 rounded-xl bg-sky-950/90 border border-sky-400/40 text-sky-300 text-[10px] font-bold flex items-center gap-1.5 shadow-md animate-float-slow">
              <Plane className="w-3.5 h-3.5 text-sky-400" />
              <span>Drone</span>
            </div>

            {/* 6. Small Robot in Lower-Right Space */}
            <div className="absolute -bottom-4 right-8 z-20 px-3 py-1.5 rounded-2xl bg-charithra-dark/95 border border-cyan-400/40 shadow-lg flex items-center gap-2 text-cyan-300 text-xs font-semibold animate-float-reverse">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Robotics</span>
            </div>

            {/* 7. RC Car in Lower-Left Space */}
            <div className="absolute -bottom-5 left-8 z-20 px-3 py-1.5 rounded-2xl bg-charithra-dark/95 border border-orange-400/40 shadow-lg flex items-center gap-2 text-orange-300 text-xs font-semibold animate-float-slow">
              <Car className="w-4 h-4 text-orange-400" />
              <span>RC Car</span>
            </div>

            {/* Scene Container with Rounded Corners & Soft Shadow */}
            <div className="relative z-10 w-full rounded-3xl overflow-hidden border-2 border-charithra-gold/40 shadow-2xl group">
              <img 
                src="/assets/scenes/hero-group-study.jpg" 
                alt="Charithra Girl and Boy with school friends collaborating on a laptop project" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-105"
                loading="eager"
              />

              {/* Bottom Scene Caption Ribbon */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charithra-black/95 via-charithra-black/70 to-transparent p-4 sm:p-5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-charithra-gold" />
                  <span className="font-semibold text-white">Charithra Mascots & Peer Learning Group</span>
                </div>
                <span className="hidden sm:inline text-charithra-gold font-medium">
                  Discussing • Explaining • Solving Together
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#FAF8F5] to-transparent pointer-events-none" />
    </section>
  );
};
