import React, { useState } from 'react';
import { 
  Plane, 
  Wind, 
  ShieldCheck, 
  Eye, 
  Sliders, 
  Volume2, 
  Cloud
} from 'lucide-react';
import { playDroneSound, playPop } from '../utils/audio';

interface DroneSectionProps {
  onBookDrone: () => void;
}

export const DroneSection: React.FC<DroneSectionProps> = ({ onBookDrone }) => {
  const [isFlying, setIsFlying] = useState(false);

  const handleFlightTest = () => {
    playDroneSound();
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 2500);
  };

  const droneFeatures = [
    { title: 'Aerodynamics & Lift', desc: 'Understanding Bernoulli’s principle: how curved blades create low and high pressure.' },
    { title: 'Quadcopter Anatomy', desc: 'Brushless motors, Electronic Speed Controllers (ESCs), and gyroscope telemetry.' },
    { title: 'Safe Flight Field Training', desc: 'Flights guided on marked open turf with protective prop cages and certified pilots.' },
    { title: 'FPV Camera & Altitude', desc: 'Real-time telemetry measuring wind speed, battery voltage, and steady hovering.' }
  ];

  return (
    <section id="drones" className="py-24 lg:py-32 bg-gradient-to-b from-[#0B1528] via-[#0E203F] to-[#0A1020] text-white relative overflow-hidden">
      
      {/* Animated Clouds & Sky Atmosphere */}
      <div className="absolute top-10 left-10 text-white/5 animate-float-slow pointer-events-none">
        <Cloud className="w-48 h-48" />
      </div>
      <div className="absolute top-40 right-12 text-white/5 animate-float-reverse pointer-events-none">
        <Cloud className="w-64 h-64" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: Take Learning Higher) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/35 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Plane className="w-3.5 h-3.5 text-sky-400" />
            <span>Outdoor Aviation & Aerial Robotics</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Take Learning Higher
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Discover how drones work through a fun, safe and hands-on learning experience in open skies.
          </p>

          {/* 4 Flight Information Bubbles (Prompt specified) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {['FLIGHT', 'CONTROL', 'BALANCE', 'TECHNOLOGY'].map((bubble, i) => (
              <span 
                key={bubble}
                className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono border backdrop-blur-md shadow-sm ${
                  i === 0 ? 'bg-sky-500/20 border-sky-400 text-sky-300 animate-float-slow' :
                  i === 1 ? 'bg-blue-500/20 border-blue-400 text-blue-300 animate-float-reverse' :
                  i === 2 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-float-slow' :
                  'bg-amber-500/20 border-amber-400 text-amber-300 animate-float-reverse'
                }`}
              >
                ✦ {bubble}
              </span>
            ))}
          </div>
        </div>

        {/* Layout: Section 8 Outdoor Field Scene + Flight Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Section 8 Scene: Charithra Boy operating drone controller in green field with friends watching drone above */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-sky-400/40 shadow-2xl group">
              <img 
                src="/assets/scenes/boy-drone-field.jpg" 
                alt="Charithra Boy looking up while piloting a drone with transmitter controller on an open green field with two children watching" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Drone Altitude Indicator Overlay */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-charithra-black/90 border border-sky-400/50 text-xs font-bold text-sky-300 flex items-center gap-2 backdrop-blur-md">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>Altitude: 3.5m • Safe Hover Active</span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-sky-400" />
                  <span>Charithra Boy • Open-Sky Flight Arena</span>
                </div>
                <button
                  onClick={handleFlightTest}
                  className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 border border-sky-400/50 text-sky-300 flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isFlying ? 'Engines Whirring...' : 'Test Rotor Sound'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Drone Features & CTA */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-white">
              Hands-on Flight Physics & Safe Piloting
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Children hold the transmitter, understand pitch, roll, yaw, and throttle, and steer through precision hover drills while learning how air pressure and propellers generate lift.
            </p>

            <div className="space-y-3 pt-2">
              {droneFeatures.map((feat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/40 transition flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    {idx === 0 && <Wind className="w-4 h-4" />}
                    {idx === 1 && <Sliders className="w-4 h-4" />}
                    {idx === 2 && <ShieldCheck className="w-4 h-4" />}
                    {idx === 3 && <Eye className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  playPop();
                  onBookDrone();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-charithra-black bg-gradient-to-r from-sky-400 to-cyan-300 hover:shadow-blue-glow transition flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" />
                <span>Explore Drone Workshop</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
