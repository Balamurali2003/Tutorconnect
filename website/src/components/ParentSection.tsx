import React from 'react';
import { 
  Compass, 
  UserCheck, 
  Sparkles, 
  Zap, 
  Cpu, 
  Award, 
  ShieldCheck, 
  HeartHandshake, 
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { BRAND } from '../data/mockData';
import { playPop } from '../utils/audio';

interface ParentSectionProps {
  onSpeakToMentor: () => void;
}

export const ParentSection: React.FC<ParentSectionProps> = ({ onSpeakToMentor }) => {
  // 6 Trust Pillars specifically requested by prompt:
  // Concept Clarity, Confidence, Problem Solving, Creativity, Communication, Future Skills
  const parentTrustPillars = [
    {
      title: 'Concept Clarity',
      desc: 'Understanding the fundamental "why" behind formulas and theories instead of rote memorization.',
      stat: '100% Conceptual',
      icon: Compass,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      title: 'Confidence',
      desc: 'Empowering children to ask questions in small groups of 8 without fear of judgment or hesitation.',
      stat: '1:8 Mentor Ratio',
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      title: 'Problem Solving',
      desc: 'Teaching structured analytical thinking to break down unfamiliar school problems with logical clarity.',
      stat: 'Critical Reasoning',
      icon: Zap,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      title: 'Creativity',
      desc: 'Fostering inventive thinking where children sketch ideas, connect circuits, and test prototypes.',
      stat: 'Hands-on Maker',
      icon: Lightbulb,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Technology Exposure',
      desc: 'Demystifying real sensors, microcontrollers, and modern digital tools through guided experiments.',
      stat: 'Hands-on Tech',
      icon: Cpu,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      title: 'Future Skills',
      desc: 'Introducing robotics, drone aerodynamics, and computing concepts vital for the automated world ahead.',
      stat: 'Future-Proof STEM',
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <section id="parents" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: More Than Marks) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built for Parent Peace of Mind</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
            More Than{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-charithra-gold-dark to-yellow-600">
              Marks.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
            We want children to understand, question, experiment and become confident learners.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Scores follow naturally when a child feels capable, curious, and supported by world-class mentors.
          </p>
        </div>

        {/* 6 Trust Pillars Grid (Clean, Professional, No Cartoon Characters) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {parentTrustPillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={idx}
                onMouseEnter={playPop}
                className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-charithra-gold hover:bg-white shadow-card-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 ${pillar.color}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                      {pillar.stat}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-charithra-black group-hover:text-charithra-gold-dark transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Charithra Standard Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Parent Reassurance Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#171B26] via-[#1C2233] to-[#121520] border border-charithra-gold/30 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-charithra-gold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Our Academic Guarantee to Parents</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white leading-snug">
              "When children understand concepts, homework battles stop and genuine curiosity begins."
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We provide weekly WhatsApp milestone updates, dedicated doubt-clearing counters, and personalized guidance tailored to your child’s school curriculum (CBSE, ICSE, Cambridge & State Board).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  playPop();
                  onSpeakToMentor();
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light to-charithra-gold hover:shadow-gold-glow transition flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Schedule Free 1-on-1 Parent Consultation</span>
              </button>
              <span className="text-xs text-slate-400">
                Direct conversation with Senior Academic Director
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
