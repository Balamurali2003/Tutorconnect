import React from 'react';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ArrowUp,
  Heart
} from 'lucide-react';
import { BRAND } from '../data/mockData';
import { playPop } from '../utils/audio';

interface FooterProps {
  onOpenTutorModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTutorModal }) => {
  const scrollToTop = () => {
    playPop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#why-Charithra' },
    { name: 'Classes', href: '#academics' },
    { name: 'Online Classes', href: '#online-classes' },
    { name: 'Offline Classes', href: '#offline-classes' },
    { name: 'Robotics', href: '#robotics' },
    { name: 'Drone', href: '#drones' },
    { name: 'Remote Cars', href: '#rc-cars' },
    { name: 'Workshops', href: '#workshops' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer id="contact" className="bg-[#0A0C10] text-white border-t border-charithra-gold/30 relative overflow-hidden">
      
      {/* Background Accent Grid */}
      <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-charithra-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charithra-gold-light via-charithra-gold to-charithra-gold-dark p-0.5 shadow-gold-glow bg-charithra-black flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/charithra-emblem-transparent.png" 
                  alt="Charithra Logo" 
                  className="w-10 h-10 object-contain drop-shadow" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">
                  CHARITHRA LEARNING HUB
                </h3>
                <p className="text-xs text-charithra-gold font-semibold tracking-wider uppercase">
                  {BRAND.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              A modern learning centre combining academic tuition, online/offline classes, concept clarity, and futuristic hands-on robotics, drones and RC car workshops for school children.
            </p>

            {/* Portal Login Direct Action */}
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-charithra-gold bg-charithra-gold/15 border border-charithra-gold/40 hover:bg-charithra-gold hover:text-charithra-black transition shadow-sm"
              >
                <span>🔑 CRM / Portal Login</span>
              </a>

              {onOpenTutorModal && (
                <button
                  onClick={() => {
                    playPop();
                    onOpenTutorModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
                >
                  <span>💼 Teach With Us</span>
                </button>
              )}
            </div>

            {/* Social Icons (Instagram, Facebook, YouTube, WhatsApp) */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-charithra-gold hover:text-charithra-gold flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-charithra-gold hover:text-charithra-gold flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-charithra-gold hover:text-charithra-gold flex items-center justify-center transition"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href={`https://wa.me/${BRAND.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm text-charithra-gold uppercase tracking-wider">
              Explore Charithra Hub
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={playPop}
                  className="text-slate-300 hover:text-charithra-gold transition py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-heading font-bold text-sm text-charithra-gold uppercase tracking-wider">
              Get in Touch & Visit
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-charithra-gold shrink-0 mt-0.5" />
                <span>{BRAND.address}, {BRAND.city}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-charithra-gold shrink-0" />
                <a href={`tel:${BRAND.phone}`} className="hover:text-charithra-gold transition">
                  {BRAND.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-charithra-gold shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-charithra-gold transition">
                  {BRAND.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-charithra-gold shrink-0" />
                <span className="text-xs text-slate-400">{BRAND.hours}</span>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-3 rounded-2xl bg-[#141824] border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">Instant Admissions Desk</span>
              </div>
              <a
                href={`https://wa.me/${BRAND.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat Live
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} <strong className="text-white font-semibold">Charithra Learning Hub</strong>. All rights reserved. Official Brand Mascots Protected.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Designed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Future Leaders
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-charithra-gold hover:border-charithra-gold transition flex items-center gap-1"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Top</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
