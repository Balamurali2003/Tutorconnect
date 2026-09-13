import React from 'react';
import { 
  Wifi, 
  Video, 
  MonitorPlay, 
  MessageCircleQuestion, 
  CheckCircle2, 
  History, 
  Smartphone,
  Headphones,
  Sparkles
} from 'lucide-react';
import { ONLINE_FEATURES } from '../data/mockData';
import { playPop } from '../utils/audio';

interface OnlineClassesProps {
  onBookDemo: () => void;
}

export const OnlineClasses: React.FC<OnlineClassesProps> = ({ onBookDemo }) => {
  return (
    <section id="online-classes" className="py-20 lg:py-28 bg-[#0E1119] text-white relative overflow-hidden">
      
      {/* Background Tech Grids & Ambient Blue Lighting */}
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-charithra-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Virtual Classroom</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Learn From Anywhere
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Interactive online classes that bring learning closer to every child.
          </p>

          {/* Floating Pill: LIVE • ASK • LEARN • GROW (Prompt specified) */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 sm:gap-6 px-5 py-2 rounded-2xl bg-charithra-dark/95 border border-blue-400/40 text-xs sm:text-sm font-bold text-sky-300 shadow-blue-glow/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE
              </span>
              <span className="text-white/30">•</span>
              <span className="text-amber-300">ASK</span>
              <span className="text-white/30">•</span>
              <span>LEARN</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-300">GROW</span>
            </div>
          </div>
        </div>

        {/* Layout: Study Desk Scene + Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Section 3 Scene: Charithra Girl at study desk with laptop, headphones, plant, notebook */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-2xl group">
              <img 
                src="/assets/scenes/girl-online-class.jpg" 
                alt="Charithra Girl attending active online live class from her home study desk" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Notification & Chat Bubble Animations */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-xl bg-charithra-black/90 border border-sky-400/50 text-[11px] font-bold text-sky-300 shadow-lg flex items-center gap-1.5 animate-bounce backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>💬 "Great question, Charithra!"</span>
              </div>

              {/* Live Classroom Overlay Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-charithra-black/90 border border-emerald-400/50 text-xs font-bold text-emerald-400 flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Interactive Batch (1:8 Ratio)</span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charithra-black/95 via-charithra-black/70 to-transparent p-4 sm:p-5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-white">Charithra Girl • Dedicated Study Desk</span>
                </div>
                <span className="text-sky-300">Two-way audio & video doubt clearing</span>
              </div>
            </div>
          </div>

          {/* Key Online Features */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-white">
              Why Parents & Students Love Our Virtual Classes:
            </h3>

            <div className="space-y-3 pt-2">
              {ONLINE_FEATURES.slice(0, 4).map((feat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-charithra-dark/80 border border-slate-800 hover:border-sky-400/40 transition duration-300 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    {idx === 0 && <Video className="w-5 h-5" />}
                    {idx === 1 && <MonitorPlay className="w-5 h-5" />}
                    {idx === 2 && <MessageCircleQuestion className="w-5 h-5" />}
                    {idx === 3 && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  playPop();
                  onBookDemo();
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-charithra-black bg-gradient-to-r from-sky-400 to-cyan-300 hover:shadow-blue-glow transition flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Book a Free Live Demo Class</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
