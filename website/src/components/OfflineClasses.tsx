import React from 'react';
import { 
  School, 
  Boxes, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { OFFLINE_FEATURES } from '../data/mockData';
import { playPop } from '../utils/audio';

interface OfflineClassesProps {
  onScheduleVisit: () => void;
}

export const OfflineClasses: React.FC<OfflineClassesProps> = ({ onScheduleVisit }) => {
  return (
    <section id="offline-classes" className="py-20 lg:py-28 bg-[#FCFAF6] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <School className="w-3.5 h-3.5 text-emerald-600" />
            <span>Discussion + Interaction + Understanding</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
            Learn Together.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
              Grow Together.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Our offline classes create an engaging classroom where students interact naturally — one raises a hand, one writes, two discuss ideas, and our dedicated teachers guide every step toward deep understanding.
          </p>
        </div>

        {/* Section 4 Scene: Real Classroom with Teacher at blackboard, Charithra girl as student, active kids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-xl group">
              <img 
                src="/assets/scenes/offline-classroom.jpg" 
                alt="Teacher explaining science diagram on blackboard with Charithra girl, Charithra boy and students discussing" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Classroom Overlay Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-white/95 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-md">
                <School className="w-4 h-4 text-emerald-600" />
                <span>Modern Classroom & Science Hub</span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Discussion + Interaction + Understanding</span>
                </div>
                <span className="text-amber-300 font-semibold">Active Participation</span>
              </div>
            </div>
          </div>

          {/* Classroom Features */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-charithra-black">
              An Energetic, Safe Space for Every Question
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In our offline batches, Charithra students sit in small pods of 8 where shy children feel completely comfortable raising their hands, writing on whiteboards, and learning from peers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {OFFLINE_FEATURES.map((feat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    {idx === 0 && <School className="w-4 h-4" />}
                    {idx === 1 && <Boxes className="w-4 h-4" />}
                    {idx === 2 && <Users className="w-4 h-4" />}
                    {idx === 3 && <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-charithra-black">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  playPop();
                  onScheduleVisit();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Schedule a Campus Walkthrough</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
