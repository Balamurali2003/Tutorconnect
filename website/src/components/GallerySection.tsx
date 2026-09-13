import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  ZoomIn, 
  Bot, 
  Plane, 
  Car, 
  BookOpen, 
  Award,
  Layers
} from 'lucide-react';
import { GALLERY_ITEMS, BRAND } from '../data/mockData';
import { GalleryItem } from '../types';
import { playPop } from '../utils/audio';

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'tuition', label: 'Tuition' },
    { id: 'online', label: 'Online Classes' },
    { id: 'offline', label: 'Offline Classes' },
    { id: 'robotics', label: 'Robotics' },
    { id: 'drone', label: 'Drone' },
    { id: 'cars', label: 'Remote Cars' },
    { id: 'workshops', label: 'Workshops' }
  ];

  const filteredItems = GALLERY_ITEMS.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'robotics': return <Bot className="w-4 h-4 text-amber-500" />;
      case 'drone': return <Plane className="w-4 h-4 text-sky-500" />;
      case 'cars': return <Car className="w-4 h-4 text-orange-500" />;
      case 'tuition': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'online': return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'offline': return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'workshops': return <Award className="w-4 h-4 text-purple-500" />;
      default: return <Sparkles className="w-4 h-4 text-charithra-gold" />;
    }
  };

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5 text-charithra-gold" />
            <span>Campus Moments & Highlights</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charithra-black tracking-tight leading-tight">
            Learning in Action.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-charithra-gold to-yellow-500">
              Moments that Inspire.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Take a look into our technology workshops, classrooms, racing arenas, and celebration ceremonies.
          </p>
        </div>

        {/* Category Filter Pills (Prompt specified categories) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playPop();
                setActiveCategory(cat.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-charithra-black text-white shadow-md scale-105'
                  : 'bg-slate-100 text-slate-600 hover:text-charithra-black hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry-Style Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                playPop();
                setSelectedPhoto(item);
              }}
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-card-soft hover:shadow-card-hover transition-all duration-500 transform hover:-translate-y-1.5 cursor-pointer min-h-[280px] flex flex-col justify-end p-6 text-white"
            >
              {/* Dynamic Styled Background Art matching category */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#121624] via-[#1A2133] to-[#0A0D15] transition-transform duration-700 group-hover:scale-105"
              />

              {/* Decorative Tech Grid Overlay */}
              <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

              {/* Ambient Accent Light */}
              <div 
                className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: item.accentColor }}
              />

              {/* Center Decorative Category Icon Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500">
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center gap-1"
                  >
                    {getCategoryIcon(item.category)}
                    {item.categoryLabel}
                  </span>

                  <span className="w-7 h-7 rounded-full bg-charithra-gold text-charithra-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-white group-hover:text-charithra-gold transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {item.description}
                </p>

                <div className="pt-2 text-[11px] font-medium text-slate-400 flex items-center justify-between border-t border-white/10">
                  <span>Photo Ready • {item.badge}</span>
                  <span className="text-charithra-gold">Tap to view</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox Popup for Photo Inspection */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-2xl rounded-3xl bg-[#141824] border border-charithra-gold/50 shadow-2xl p-6 sm:p-8 text-white">
              
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charithra-gold">
                  {getCategoryIcon(selectedPhoto.category)}
                  <span>{selectedPhoto.categoryLabel} • {selectedPhoto.badge}</span>
                </div>

                <h3 className="font-heading font-black text-2xl text-white">
                  {selectedPhoto.title}
                </h3>

                {/* Preview Box */}
                <div className="h-64 rounded-2xl bg-gradient-to-br from-[#1C2336] to-[#0A0D15] border border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-3 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-charithra-gold/20 border border-charithra-gold/40 flex items-center justify-center text-charithra-gold">
                    {getCategoryIcon(selectedPhoto.category)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">High-Resolution Photo Gallery Slot</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Ready for direct photo upload from live camera rolls and official workshop photography.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedPhoto.description}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="px-6 py-2.5 rounded-xl bg-charithra-gold text-charithra-black font-bold text-xs hover:bg-charithra-gold-light"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
