import React from 'react';
import { 
  Bot, 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  Code, 
  Wrench, 
  Zap, 
  Layers, 
  Sliders
} from 'lucide-react';
import { playPop, playChime } from '../utils/audio';

interface RoboticsSectionProps {
  onBookRobotics: () => void;
}

export const RoboticsSection: React.FC<RoboticsSectionProps> = ({ onBookRobotics }) => {
  const roboticsCurriculum = [
    { title: 'Robotics Basics', desc: 'Understanding circuits, power supplies, switches and safe breadboard connections.', icon: Zap },
    { title: 'Electronic Components', desc: 'LED arrays, buzzers, micro-relays, and tactile push buttons.', icon: Layers },
    { title: 'Sensors in Action', desc: 'Ultrasonic distance eyes, infrared line sensors, and light-dependent resistors.', icon: Sliders },
    { title: 'Motors & Actuators', desc: 'DC gear motors, 180° servo arms for robotic claws, and wheel differential drives.', icon: Wrench },
    { title: 'Simple Block Programming', desc: 'Visual drag-and-drop Scratch & MakeCode logic — no complex syntax barrier.', icon: Code },
    { title: 'Building Challenges', desc: 'Assembling two-wheeled robotic rovers that avoid walls and follow black tracks.', icon: Bot }
  ];

  return (
    <section id="robotics" className="py-20 lg:py-28 bg-[#0F121C] text-white relative overflow-hidden">
      
      {/* Background Circuit Grid & Gold Accents */}
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-charithra-gold/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: Build. Program. Discover.) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Robotics Lab</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Build. Program.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Discover.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Children don't just learn technology. They <strong className="text-charithra-gold font-semibold">experience it</strong> through real circuits, robotic arms, and block programming.
          </p>
        </div>

        {/* Layout: Section 7 Scene (Charithra Boy with tablet at workbench) + Curriculum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Section 7 Scene: Charithra Boy operating robotic arm with tablet alongside collaborator */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl group">
              <img 
                src="/assets/scenes/boy-robotics-lab.jpg" 
                alt="Charithra Boy operating a robotic arm with a tablet at the robotics workbench with classmate" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Hardware Kit Badge & ROBOT ONLINE Status Screen */}
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-charithra-black/95 border border-emerald-400/60 text-xs font-mono font-bold text-emerald-300 flex items-center gap-2 backdrop-blur-md shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-extrabold tracking-wider">ROBOT ONLINE</span>
                <span className="text-white/20">|</span>
                <span className="text-slate-300 text-[10px] font-sans">Multi-Axis Servo Linked</span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Charithra Boy & Classmate • Robotics Lab</span>
                </div>
                <span className="text-amber-300 font-semibold">Sensors • Gears • Motors • Wires</span>
              </div>
            </div>
          </div>

          {/* Curriculum & Workshop CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-2xl text-white">
                Inside the Charithra Robotics Arena
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every child is assigned their own electronics workstation, safety kit, and individual rover chassis. They write drag-and-drop algorithms to control sensor responses in real time.
              </p>
            </div>

            {/* 6 Curriculum Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roboticsCurriculum.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-charithra-dark/80 border border-slate-800 hover:border-amber-400/40 transition flex items-start gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  playChime();
                  onBookRobotics();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-charithra-black bg-gradient-to-r from-amber-400 to-charithra-gold hover:shadow-gold-glow transition flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Explore Robotics Workshop</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
