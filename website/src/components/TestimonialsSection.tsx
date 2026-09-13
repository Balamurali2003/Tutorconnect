import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquareHeart, 
  Award,
  Sparkles
} from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';
import { playPop } from '../utils/audio';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    playPop();
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    playPop();
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <MessageSquareHeart className="w-3.5 h-3.5 text-charithra-gold" />
            <span>Parent & Student Voices</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
            Real Stories of Confidence & Discovery.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Hear how our concept-based tuition and hands-on robotics workshops transform school performance.
          </p>
        </div>

        {/* Clean Modern Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-white border border-slate-200 shadow-card-hover p-8 sm:p-12 relative overflow-hidden">
            
            {/* Top Quote Icon */}
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-charithra-gold flex items-center justify-center mb-6">
              <Quote className="w-6 h-6 fill-charithra-gold/20" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 text-charithra-gold mb-4">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-charithra-gold" />
              ))}
            </div>

            {/* Quote Text */}
            <p className="text-lg sm:text-2xl font-medium text-slate-800 leading-relaxed italic">
              {current.quote}
            </p>

            {/* Student & Parent Info Block */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-heading font-extrabold text-lg text-charithra-black">
                  {current.parentName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Parent of {current.studentName} • <strong className="text-slate-700">{current.studentGrade}</strong>
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                <Award className="w-3.5 h-3.5" />
                <span>{current.highlight}</span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex items-center justify-between">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playPop();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-charithra-gold' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-charithra-black transition"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-charithra-black text-white hover:bg-charithra-dark transition"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
