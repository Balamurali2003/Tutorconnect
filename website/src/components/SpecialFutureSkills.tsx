import React, { useState } from 'react';
import { 
  Bot, 
  Plane, 
  Gamepad2, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  BookOpen, 
  Atom, 
  Cog, 
  Code, 
  Car,
  Brain,
  ChevronRight
} from 'lucide-react';
import { FUTURE_SKILLS } from '../data/mockData';
import { playPop, playChime } from '../utils/audio';

interface SpecialFutureSkillsProps {
  onSelectTrack: (trackId: string) => void;
}

export const SpecialFutureSkills: React.FC<SpecialFutureSkillsProps> = ({ onSelectTrack }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getCardIcon = (id: string) => {
    switch (id) {
      case 'robotics':
        return <Bot className="w-10 h-10 text-amber-400 group-hover:rotate-12 transition-transform duration-500" />;
      case 'drones':
        return <Plane className="w-10 h-10 text-sky-400 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500" />;
      case 'remote-cars':
        return <Gamepad2 className="w-10 h-10 text-orange-400 group-hover:translate-x-2 transition-transform duration-500" />;
      case 'future-tech':
      default:
        return <Cpu className="w-10 h-10 text-purple-400 group-hover:scale-125 transition-transform duration-500" />;
    }
  };

  return (
    <section id="future-skills" className="py-24 lg:py-32 bg-[#090B10] text-white relative overflow-hidden">
      
      {/* Background Grids & Ambient Lights */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-charithra-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: From Curious Minds to Future Creators) */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charithra-gold/20 border border-charithra-gold/40 text-charithra-gold text-xs font-bold uppercase tracking-widest shadow-gold-glow">
            <Sparkles className="w-3.5 h-3.5 text-charithra-gold animate-sparkle" />
            <span>The STEM Bridge</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            From Curious Minds to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-charithra-gold to-yellow-400">
              Future Creators.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Watch how textbook principles naturally evolve into cutting-edge robotic rovers, autonomous drones, and tuned RC cars.
          </p>
        </div>

        {/* VISUAL PATHWAY: LEARN → THINK → BUILD → CREATE (Exact Prompt Progression) */}
        <div className="mb-20 p-6 sm:p-8 rounded-3xl bg-[#121624] border border-charithra-gold/30 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-6">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
              LEARN → THINK → BUILD → CREATE
            </span>
          </div>

          {/* Spectacular Visual Progression Flow: Books -> Math & Science -> Logic -> Electronics -> Robotics -> Drone -> Remote Car */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            
            {/* 1. Books */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-sky-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-sky-400 transition">
              <span className="text-[10px] font-mono text-sky-400 font-bold">01</span>
              <BookOpen className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Books</span>
            </div>

            {/* 2. Math & Science */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-blue-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-blue-400 transition">
              <span className="text-[10px] font-mono text-blue-400 font-bold">02</span>
              <Atom className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-bold text-white mt-1">Math & Science</span>
            </div>

            {/* 3. Logic */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-purple-400 transition">
              <span className="text-[10px] font-mono text-purple-400 font-bold">03</span>
              <Brain className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Logic</span>
            </div>

            {/* 4. Electronics */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-amber-400 transition">
              <span className="text-[10px] font-mono text-amber-400 font-bold">04</span>
              <Cpu className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Electronics</span>
            </div>

            {/* 5. Robotics */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-cyan-400 transition">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">05</span>
              <Bot className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Robotics</span>
            </div>

            {/* 6. Drone */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-sky-400/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-sky-300 transition">
              <span className="text-[10px] font-mono text-sky-300 font-bold">06</span>
              <Plane className="w-6 h-6 text-sky-300 group-hover:-translate-y-1 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Drone</span>
            </div>

            {/* 7. Remote Car */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/30 flex flex-col items-center justify-between min-h-[100px] group hover:border-orange-400 transition col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-orange-400 font-bold">07</span>
              <Car className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-bold text-white mt-1">Remote Car</span>
            </div>

          </div>

          {/* Animated Connecting Flow Track */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
            <span className="text-sky-400">Classroom Fundamentals</span>
            <span className="text-charithra-gold animate-pulse">──────▶  Hands-on Tech Lab  ──────▶</span>
            <span className="text-emerald-400">Future Creator</span>
          </div>

        </div>

        {/* 4 Interactive Future Skills Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FUTURE_SKILLS.map((skill) => (
            <div
              key={skill.id}
              onMouseEnter={() => {
                playPop();
                setHoveredCard(skill.id);
              }}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative rounded-3xl p-6 transition-all duration-500 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#141824] to-[#0A0C12] border border-slate-800 hover:border-charithra-gold shadow-2xl hover:shadow-gold-glow transform hover:-translate-y-2 cursor-pointer"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
                style={{ backgroundColor: skill.colorHex }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="font-mono text-2xl font-black"
                    style={{ color: skill.colorHex }}
                  >
                    {skill.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                    Workshop
                  </span>
                </div>

                <div className="my-2 flex items-center justify-center h-20 rounded-2xl bg-black/40 border border-white/5 group-hover:border-white/20 transition-all">
                  {getCardIcon(skill.id)}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-heading font-extrabold text-xl text-white group-hover:text-charithra-gold transition-colors">
                    {skill.title}
                  </h3>
                  <p 
                    className="font-heading font-bold text-xs"
                    style={{ color: skill.colorHex }}
                  >
                    {skill.tagline}
                  </p>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {skill.description}
                </p>

                <div className="mt-3 space-y-1 pt-3 border-t border-slate-800">
                  {skill.highlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: skill.colorHex }} />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playChime();
                    onSelectTrack(skill.id);
                  }}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/15 group-hover:border-charithra-gold/50 group-hover:text-charithra-gold transition flex items-center justify-center gap-1.5"
                >
                  <span>Explore {skill.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
