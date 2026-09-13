import React, { useState } from 'react';
import { 
  Sparkles, 
  Smile, 
  BookOpen, 
  Monitor, 
  Brain, 
  Bot, 
  Plane, 
  Car, 
  Lightbulb, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { playPop, playChime } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DiscoverCard {
  id: string;
  emoji: string;
  title: string;
  category: string;
  tagline: string;
  fact: string;
  icon: any;
  color: string;
  borderHover: string;
}

export const ChildSection: React.FC = () => {
  const cards: DiscoverCard[] = [
    {
      id: 'tuition',
      emoji: '📚',
      title: 'Tuition',
      category: 'Academic Mastery',
      tagline: 'Never fear a test question again.',
      fact: 'Did you know? Concept visualization helps young brains remember formulas 4x faster than memorizing.',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10',
      borderHover: 'group-hover:border-blue-400'
    },
    {
      id: 'online',
      emoji: '💻',
      title: 'Online Learning',
      category: 'Anywhere Access',
      tagline: 'Interactive live whiteboard & quizzes.',
      fact: 'Two-way audio lets you raise your digital hand and ask questions immediately with zero wait.',
      icon: Monitor,
      color: 'text-sky-500 bg-sky-500/10',
      borderHover: 'group-hover:border-sky-400'
    },
    {
      id: 'logic',
      emoji: '🧠',
      title: 'Logic',
      category: 'Brain Power',
      tagline: 'Crack puzzles, patterns & mysteries.',
      fact: 'Solving pattern blocks exercises the exact same neural pathways that grandmasters use in chess.',
      icon: Brain,
      color: 'text-purple-500 bg-purple-500/10',
      borderHover: 'group-hover:border-purple-400'
    },
    {
      id: 'robotics',
      emoji: '🤖',
      title: 'Robotics',
      category: 'Hands-on Hardware',
      tagline: 'Wire real sensors, plug motors & code.',
      fact: 'Bats and autonomous robots both use ultrasonic sound wave reflection to avoid bumping into walls.',
      icon: Bot,
      color: 'text-amber-500 bg-amber-500/10',
      borderHover: 'group-hover:border-amber-400'
    },
    {
      id: 'drones',
      emoji: '🚁',
      title: 'Drones',
      category: 'Aerial Physics',
      tagline: 'Fly safely, navigate rings & balance props.',
      fact: 'Quadcopter propellers spin in opposing pairs to counteract rotational torque and stay rock steady.',
      icon: Plane,
      color: 'text-cyan-500 bg-cyan-500/10',
      borderHover: 'group-hover:border-cyan-400'
    },
    {
      id: 'cars',
      emoji: '🏎️',
      title: 'Remote Cars',
      category: 'Speed & Mechanics',
      tagline: 'Drift, steer and calibrate gear ratios.',
      fact: 'Our official Charithra RC buggy scales to 70 km/h with high-grip suspension and 2.4GHz RF signals.',
      icon: Car,
      color: 'text-orange-500 bg-orange-500/10',
      borderHover: 'group-hover:border-orange-400'
    },
    {
      id: 'workshops',
      emoji: '💡',
      title: 'Workshops',
      category: 'Future Creators',
      tagline: 'One day that sparks lifelong inventions.',
      fact: 'Every workshop includes take-home engineering projects and an official achievement certificate.',
      icon: Lightbulb,
      color: 'text-charithra-gold bg-amber-500/10',
      borderHover: 'group-hover:border-charithra-gold'
    }
  ];

  const [activeCard, setActiveCard] = useState<DiscoverCard>(cards[0]);

  const handleCardClick = (c: DiscoverCard) => {
    playPop();
    setActiveCard(c);
  };

  const triggerReward = () => {
    playChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <section id="kids-zone" className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: What Will You Discover Today?) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Smile className="w-4 h-4 text-charithra-gold" />
            <span>Interactive Subject Explorer</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-charithra-black tracking-tight leading-tight">
            What Will You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-amber-500 to-purple-500">
              Discover Today?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Explore our 7 unique learning tracks through animated interactive cards.
          </p>
        </div>

        {/* 7 ANIMATED ICON CARDS (Prompt specified: 📚 Tuition, 💻 Online Learning, 🧠 Logic, 🤖 Robotics, 🚁 Drones, 🏎️ Remote Cars, 💡 Workshops. No characters repeated!) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-10">
          {cards.map((card) => {
            const isSelected = activeCard.id === card.id;
            const IconComp = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`group p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-between min-h-[140px] transform active:scale-95 ${
                  isSelected 
                    ? 'bg-charithra-black text-white border-charithra-gold shadow-card-hover -translate-y-1.5 ring-2 ring-charithra-gold/50' 
                    : 'bg-white text-charithra-black border-slate-200 hover:-translate-y-1 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-white/10 text-charithra-gold' : card.color
                }`}>
                  <IconComp className="w-6 h-6" />
                </div>

                <div className="mt-2">
                  <span className="text-lg block">{card.emoji}</span>
                  <h4 className="font-heading font-bold text-xs sm:text-sm mt-1">
                    {card.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Card Interactive Spotlight Fact Box */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-hover space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeCard.emoji}</span>
              <div>
                <h3 className="font-heading font-bold text-xl text-charithra-black">
                  {activeCard.title} — {activeCard.category}
                </h3>
                <p className="text-xs text-slate-500">{activeCard.tagline}</p>
              </div>
            </div>

            <button
              onClick={triggerReward}
              className="px-4 py-2 rounded-xl bg-charithra-gold/20 hover:bg-charithra-gold/30 border border-charithra-gold/40 text-charithra-gold-dark font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-charithra-gold" />
              <span>Unlock Secret Fact</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Science & Tech Fact: </strong>{activeCard.fact}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
