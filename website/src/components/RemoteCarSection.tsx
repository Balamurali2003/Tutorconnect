import React, { useRef } from 'react';
import { 
  Gamepad2, 
  Flag, 
  Trophy, 
  Gauge, 
  Wrench, 
  Flame, 
  Play, 
  Eye, 
  Brain, 
  Compass, 
  Cpu, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { playPop, playCarRev } from '../utils/audio';
import { RCCarGame } from './RCCarGame';
import { ErrorBoundary } from './ErrorBoundary';

interface RemoteCarSectionProps {
  onBookRC: () => void;
  onExploreRobotics?: () => void;
}

export const RemoteCarSection: React.FC<RemoteCarSectionProps> = ({ onBookRC, onExploreRobotics }) => {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToGame = () => {
    playCarRev();
    const gameElem = document.getElementById('rc-game-screen');
    if (gameElem) {
      gameElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const educationalLearnings = [
    {
      title: 'Hand-Eye Coordination',
      desc: 'Synchronizing dual-stick inputs with rapid top-speed track motion.',
      icon: Eye,
      color: 'text-amber-400 bg-amber-500/15'
    },
    {
      title: 'Basic Control & Physics',
      desc: 'Understanding throttle curves, braking friction, and turning radiuses.',
      icon: Gauge,
      color: 'text-orange-400 bg-orange-500/15'
    },
    {
      title: 'Spatial Awareness',
      desc: 'Judging distances, chicane apexes, and multi-directional obstacle clearance.',
      icon: Compass,
      color: 'text-sky-400 bg-sky-500/15'
    },
    {
      title: 'Problem Solving',
      desc: 'Adapting to unexpected track hazards and finding optimal racing lines.',
      icon: Brain,
      color: 'text-purple-400 bg-purple-500/15'
    },
    {
      title: 'Decision Making',
      desc: 'Balancing battery conservation vs. turbo overtaking in split seconds.',
      icon: Trophy,
      color: 'text-emerald-400 bg-emerald-500/15'
    },
    {
      title: 'Technology Curiosity',
      desc: 'Asking how servos, radio frequency signals, and DC motors actually work.',
      icon: Cpu,
      color: 'text-rose-400 bg-rose-500/15'
    }
  ];

  return (
    <section id="rc-cars" className="py-24 lg:py-32 bg-[#0C0E17] text-white relative overflow-hidden">
      
      {/* Background Tech Grids & Orange/Gold Ambient Glows */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-charithra-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 12. HERO: Ready. Set. Drive! */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <Flag className="w-3.5 h-3.5 text-orange-400" />
            <span>Interactive Remote Car Experience</span>
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Ready. Set.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
              Drive!
            </span>
          </h2>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Learn the basics of control, movement and technology — then test your skills.
          </p>

          {/* START GAME Button in Hero */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={scrollToGame}
              className="px-8 py-4 rounded-2xl font-heading font-black text-base sm:text-lg text-charithra-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 hover:shadow-gold-glow transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START GAME</span>
            </button>
          </div>
        </div>

        {/* Charithra Boy with Controller Scene + Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/40 shadow-2xl group">
              <img 
                src="/assets/scenes/boy-rc-racing.jpg" 
                alt="Charithra Boy kneeling on the track holding RC controller with the RC car beside him as children cheer" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-charithra-black/90 border border-orange-500/50 text-xs font-bold text-orange-300 flex items-center gap-2 backdrop-blur-md">
                <Flag className="w-4 h-4 text-orange-400" />
                <span>Indoor Racing Arena & Chassis Lab</span>
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <span className="text-slate-300">Charithra Boy demonstrating proportional steering throttle</span>
                <span className="text-amber-300 font-bold">2.4GHz Radio Link</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              From Remote Control to Real Engineering.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Before taking the wheel on our physical racetrack, children grasp how radio waves transmit microsecond throttle commands to steering servos and high-torque motors.
            </p>

            <div className="space-y-3">
              {[
                { title: 'Chassis & Weight Dynamics', desc: 'Low center-of-gravity balancing for drift stability.' },
                { title: 'Differential Gear Transmission', desc: 'How pinion gears translate motor RPM to track acceleration.' },
                { title: 'Suspension & Tire Friction', desc: 'Coil springs and compound rubber grip on track curves.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 13. PLAYABLE BROWSER REMOTE CAR GAME (Guarded by ErrorBoundary) */}
        <div ref={gameContainerRef} className="mb-20">
          <ErrorBoundary fallbackTitle="RC Car Simulator Temporarily Unavailable">
            <RCCarGame onExploreRobotics={onExploreRobotics} />
          </ErrorBoundary>
        </div>

        {/* 16. EDUCATIONAL PURPOSE OF THE GAME (Parent-Focused) */}
        <div className="mb-20 p-8 sm:p-12 rounded-3xl bg-[#121522] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What Are Children Learning?</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white">
              It's More Than a Game.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                It's Learning Through Play.
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300">
              When children control the RC car, their brain simultaneously processes spatial coordinates, timing, and physics feedback:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {educationalLearnings.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-orange-500/40 transition duration-300 flex items-start gap-3.5"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 17. REMOTE CAR WORKSHOP (Hands-on Bridge) */}
        <div className="rounded-3xl bg-gradient-to-r from-orange-500/15 via-charithra-gold/15 to-purple-500/15 border-2 border-orange-500/40 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block">
              Step Into the Real Garage
            </span>

            <h3 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white">
              Want to Try a Real RC Car?
            </h3>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Our hands-on one-day workshop lets children move from screen-based play to real-world technology.
            </p>

            {/* Visual Pathway: Virtual Game -> Real RC Car -> Understanding Controls -> Hands-on Experiment -> Future Technology */}
            <div className="py-6 overflow-x-auto">
              <div className="flex items-center justify-center min-w-max gap-2 sm:gap-3 text-xs font-bold">
                <span className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-slate-200">
                  🎮 Virtual Game
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="px-3.5 py-2 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-300">
                  🏎️ Real RC Car
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  🕹️ Understanding Controls
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="px-3.5 py-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                  🔧 Hands-on Experiment
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
                  🚀 Future Technology
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  playPop();
                  onBookRC();
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-black text-sm sm:text-base text-charithra-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 hover:shadow-gold-glow transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                <span>Book the RC Car Workshop</span>
              </button>

              <button
                onClick={scrollToGame}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Play Game Again</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
