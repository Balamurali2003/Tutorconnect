import React, { useState } from 'react';
import { 
  Calculator, 
  Atom, 
  BookType, 
  Globe, 
  Languages, 
  PencilLine, 
  Award, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { SUBJECTS } from '../data/mockData';
import { SubjectItem } from '../types';
import { playPop, playChime } from '../utils/audio';

interface AcademicTuitionProps {
  onEnquire: () => void;
}

export const AcademicTuition: React.FC<AcademicTuitionProps> = ({ onEnquire }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'core' | 'support'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(SUBJECTS[0]);

  const filteredSubjects = SUBJECTS.filter(s => {
    if (activeFilter === 'all') return true;
    return s.category === activeFilter;
  });

  // Animated icon helper matching prompt instructions
  const renderAnimatedIcon = (type: SubjectItem['animationType'], color: string) => {
    switch (type) {
      case 'math':
        return (
          <div className="relative flex items-center justify-center">
            <Calculator className="w-8 h-8" style={{ color }} />
            <span className="absolute -top-3 -right-2 text-xs font-mono font-bold animate-bounce text-blue-500">
              ∑
            </span>
            <span className="absolute -bottom-2 -left-2 text-xs font-mono font-bold animate-pulse text-indigo-500">
              √x
            </span>
          </div>
        );
      case 'atom':
        return (
          <div className="relative flex items-center justify-center">
            <Atom className="w-8 h-8 animate-spin-slow" style={{ color }} />
            <span className="absolute -top-2 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        );
      case 'letters':
        return (
          <div className="relative flex items-center justify-center">
            <BookType className="w-8 h-8" style={{ color }} />
            <span className="absolute -top-2.5 -right-2.5 text-xs font-bold font-serif text-pink-500 animate-bounce">
              Aa
            </span>
          </div>
        );
      case 'globe':
        return (
          <div className="relative flex items-center justify-center">
            <Globe className="w-8 h-8 animate-pulse" style={{ color }} />
          </div>
        );
      case 'pencil':
        return (
          <div className="relative flex items-center justify-center">
            <PencilLine className="w-8 h-8 group-hover:rotate-12 transition-transform" style={{ color }} />
          </div>
        );
      case 'sparkle':
      default:
        return (
          <div className="relative flex items-center justify-center">
            <Award className="w-8 h-8 animate-pulse" style={{ color }} />
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-amber-400 animate-sparkle" />
          </div>
        );
    }
  };

  return (
    <section id="academics" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -z-10" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Grades 1 to 12 • All Boards</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
              Strong Academics.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Strong Foundations.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-normal">
              We conduct both <strong className="text-charithra-black font-semibold">Online and Offline Tuition Classes</strong> for School Students with structured concept mastery and stress-free mentor support.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl self-start md:self-auto">
            <button
              onClick={() => {
                playPop();
                setActiveFilter('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeFilter === 'all' 
                  ? 'bg-charithra-black text-white shadow-md' 
                  : 'text-slate-600 hover:text-charithra-black'
              }`}
            >
              All Subjects (8)
            </button>
            <button
              onClick={() => {
                playPop();
                setActiveFilter('core');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeFilter === 'core' 
                  ? 'bg-charithra-black text-white shadow-md' 
                  : 'text-slate-600 hover:text-charithra-black'
              }`}
            >
              Core Subjects
            </button>
            <button
              onClick={() => {
                playPop();
                setActiveFilter('support');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeFilter === 'support' 
                  ? 'bg-charithra-black text-white shadow-md' 
                  : 'text-slate-600 hover:text-charithra-black'
              }`}
            >
              Support & Revision
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSubjects.map((subject) => {
            const isSelected = selectedSubject?.id === subject.id;
            return (
              <div
                key={subject.id}
                onClick={() => {
                  playPop();
                  setSelectedSubject(subject);
                }}
                className={`group relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-gradient-to-b from-white to-slate-50 border-charithra-gold shadow-card-hover ring-2 ring-charithra-gold/30 -translate-y-1' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-card-soft hover:shadow-card-hover hover:-translate-y-1'
                }`}
              >
                {/* Subject Category Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                    subject.category === 'core' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {subject.category === 'core' ? 'Core Curriculum' : 'Academic Booster'}
                  </span>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-charithra-gold-dark">
                      <Sparkles className="w-3 h-3 text-charithra-gold" /> Selected
                    </span>
                  )}
                </div>

                {/* Animated Icon Box */}
                <div className="my-2">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {renderAnimatedIcon(subject.animationType, subject.accentColor)}
                  </div>
                </div>

                {/* Subject Name & Description */}
                <div className="mt-3 space-y-2">
                  <h3 className="font-heading font-bold text-xl text-charithra-black group-hover:text-blue-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                {/* Micro highlights bullets */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  {subject.highlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA bar */}
                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-charithra-black transition-colors">
                  <span>View Breakdown</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Subject Spotlight Drawer / Banner */}
        {selectedSubject && (
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-charithra-dark via-[#181D29] to-charithra-black border border-charithra-gold/30 shadow-2xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charithra-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Subject Spotlight: {selectedSubject.name}</span>
                </div>

                <h4 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                  Mastering {selectedSubject.name} with Intuitive Learning
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {selectedSubject.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {selectedSubject.highlights.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-charithra-gold shrink-0" />
                      <span className="text-xs text-slate-200 font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <button
                  onClick={() => {
                    playChime();
                    onEnquire();
                  }}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light to-charithra-gold hover:shadow-gold-glow transition flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Enquire for {selectedSubject.name}</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Available in both Online and Offline batches
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
