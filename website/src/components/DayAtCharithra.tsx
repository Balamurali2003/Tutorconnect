import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Wrench, 
  Rocket, 
  Sparkles, 
  Clock, 
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { TIMELINE_STEPS } from '../data/mockData';
import { playPop } from '../utils/audio';

export const DayAtCharithra: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const iconComponents: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-6 h-6" />,
    Brain: <Brain className="w-6 h-6" />,
    Wrench: <Wrench className="w-6 h-6" />,
    Rocket: <Rocket className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />
  };

  return (
    <section id="day-at-charithra" className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-800 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Student Learning Journey</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
            A Day at Charithra.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            From morning conceptual breakthroughs to afternoon robotics experiments — see how every minute is designed for joyful growth.
          </p>
        </div>

        {/* Desktop Horizontal Timeline Navigation */}
        <div className="hidden lg:block mb-12">
          <div className="relative flex items-center justify-between">
            
            {/* Connecting Track Line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 -z-0" />
            
            {/* Active Progress Highlight */}
            <div 
              className="absolute top-1/2 left-8 h-1.5 bg-gradient-to-r from-sky-400 via-charithra-gold to-emerald-400 -translate-y-1/2 -z-0 transition-all duration-500"
              style={{ width: `${(activeStepIndex / (TIMELINE_STEPS.length - 1)) * 86}%` }}
            />

            {TIMELINE_STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isPassed = idx < activeStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    playPop();
                    setActiveStepIndex(idx);
                  }}
                  className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isActive 
                        ? 'ring-4 ring-charithra-gold/40 scale-110 shadow-xl' 
                        : isPassed 
                          ? 'bg-charithra-dark text-white' 
                          : 'bg-white text-slate-400 group-hover:border-slate-400'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? step.color : undefined,
                      color: isActive ? '#fff' : undefined
                    }}
                  >
                    {iconComponents[step.icon]}
                  </div>

                  <span className={`mt-3 font-heading text-sm font-bold transition-colors ${
                    isActive ? 'text-charithra-black' : 'text-slate-500 group-hover:text-charithra-black'
                  }`}>
                    {step.title}
                  </span>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {step.timeSlot.split('•')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Spotlight Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-card-hover p-6 sm:p-10 relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: Dynamic Scene Representation for this Step */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2 group"
                   style={{ borderColor: `${TIMELINE_STEPS[activeStepIndex].color}60` }}>
                <img 
                  src={[
                    '/assets/scenes/tuition-group-study.jpg',
                    '/assets/scenes/logic-puzzle.jpg',
                    '/assets/scenes/tech-workshop.jpg',
                    '/assets/scenes/boy-robotics-lab.jpg',
                    '/assets/scenes/final-cta-future.jpg'
                  ][activeStepIndex]}
                  alt={`Stage ${activeStepIndex + 1}: ${TIMELINE_STEPS[activeStepIndex].title}`}
                  className="w-full h-52 sm:h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                <div 
                  className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white shadow-md backdrop-blur-sm"
                  style={{ backgroundColor: `${TIMELINE_STEPS[activeStepIndex].color}E6` }}
                >
                  Step 0{activeStepIndex + 1} of 05
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-[11px] font-medium flex items-center justify-between">
                  <span>{TIMELINE_STEPS[activeStepIndex].subtitle}</span>
                </div>
              </div>
            </div>

            {/* Right: Step Detailed Breakdown */}
            <div className="md:col-span-7 space-y-4 text-left">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock className="w-4 h-4 text-charithra-gold" />
                <span>{TIMELINE_STEPS[activeStepIndex].timeSlot}</span>
              </div>

              <h3 className="font-heading font-black text-3xl sm:text-4xl text-charithra-black">
                {TIMELINE_STEPS[activeStepIndex].title}: <span style={{ color: TIMELINE_STEPS[activeStepIndex].color }}>{TIMELINE_STEPS[activeStepIndex].subtitle}</span>
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {TIMELINE_STEPS[activeStepIndex].description}
              </p>

              {/* Step Key Outcome Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Focus & Outcome</span>
                  <span className="text-xs sm:text-sm font-semibold text-charithra-black">
                    {activeStepIndex === 0 && "Curriculum mastery & crystal-clear formulas"}
                    {activeStepIndex === 1 && "Critical inquiry, logic reasoning & team brainstorming"}
                    {activeStepIndex === 2 && "Physical circuit assembling & model construction"}
                    {activeStepIndex === 3 && "Robotics block coding, drone simulation & RC racing"}
                    {activeStepIndex === 4 && "Public articulation, peer celebration & confidence reward"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStepIndex === 0}
                    onClick={() => {
                      playPop();
                      setActiveStepIndex(prev => Math.max(0, prev - 1));
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    disabled={activeStepIndex === TIMELINE_STEPS.length - 1}
                    onClick={() => {
                      playPop();
                      setActiveStepIndex(prev => Math.min(TIMELINE_STEPS.length - 1, prev + 1));
                    }}
                    className="p-2 rounded-xl bg-charithra-black text-white hover:bg-charithra-dark disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Mobile Vertical Flow Indicator */}
        <div className="lg:hidden mt-8 flex flex-col gap-3">
          {TIMELINE_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                playPop();
                setActiveStepIndex(idx);
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                idx === activeStepIndex 
                  ? 'bg-white border-charithra-gold shadow-md' 
                  : 'bg-white/60 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {iconComponents[step.icon]}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-charithra-black">
                    {idx + 1}. {step.title}
                  </h4>
                  <p className="text-xs text-slate-500">{step.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
