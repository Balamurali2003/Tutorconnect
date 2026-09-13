import React from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users
} from 'lucide-react';
import { WHY_Charithra_CARDS } from '../data/mockData';
import { playPop } from '../utils/audio';

interface WhyCharithraProps {
  onLearnMore: () => void;
}

export const WhyCharithra: React.FC<WhyCharithraProps> = ({ onLearnMore }) => {
  const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-6 h-6 text-sky-500" />,
    Lightbulb: <Lightbulb className="w-6 h-6 text-amber-500" />,
    Sparkles: <Sparkles className="w-6 h-6 text-purple-500" />,
    TrendingUp: <TrendingUp className="w-6 h-6 text-emerald-500" />
  };

  return (
    <section id="why-charithra" className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: More Than Tuition) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-charithra-gold fill-charithra-gold" />
            <span>Understand. Don't Just Memorise.</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-dark tracking-tight leading-tight">
            More Than{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-charithra-gold-dark to-yellow-600">
              Tuition.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
            Learning Becomes Powerful When Children Understand Why.
          </p>

          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            From notebooks to whiteboards, equations aren't rules to memorize — they are puzzles to unlock with confidence.
          </p>
        </div>

        {/* Layout: Completely Different Group Table Scene + 4 Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* SECTION 2 SCENE: Charithra Girl with 3 children around table solving math */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl group">
              
              {/* Floating Animated Equation Badge + Lightbulb Solved */}
              <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-2xl bg-charithra-black/90 border border-charithra-gold/50 text-xs font-mono font-bold text-amber-300 shadow-lg flex items-center gap-2 animate-float-slow backdrop-blur-md">
                <span className="text-sky-400">a² + b² = c²</span>
                <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Answer Solved!
                </span>
              </div>

              {/* Scene Photo */}
              <img 
                src="/assets/scenes/tuition-group-study.jpg" 
                alt="Charithra Girl sitting with 3 children around a table discussing a mathematics problem"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-charithra-gold" />
                  <span className="font-semibold">Charithra Girl & Peer Study Table</span>
                </div>
                <span className="text-amber-300 font-medium">
                  Understand. Don't Just Memorise.
                </span>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_Charithra_CARDS.map((card, index) => (
              <div 
                key={card.id}
                onMouseEnter={playPop}
                className="group relative bg-white rounded-3xl p-6 shadow-card-soft hover:shadow-card-hover border border-slate-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div 
                  className="absolute top-0 left-6 right-6 h-1 rounded-b-full transition-all duration-300 group-hover:h-1.5"
                  style={{ backgroundColor: card.color }}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300 ${card.bg}`}
                    >
                      {iconMap[card.icon]}
                    </div>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${card.color}15`,
                        color: card.color 
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-charithra-black group-hover:text-charithra-gold-dark transition-colors">
                      {card.title}
                    </h3>
                    <p className="font-medium text-xs text-charithra-dark/80 mt-0.5 font-sans">
                      {card.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Pillar 0{index + 1}
                  </span>
                  <span className="text-charithra-gold-dark font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
