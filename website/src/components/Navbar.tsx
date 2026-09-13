import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Phone, 
  MessageCircle, 
  Volume2, 
  VolumeX, 
  Calendar,
  GraduationCap,
  Bot,
  Plane,
  Car,
  ChevronDown,
  LogIn,
  Briefcase
} from 'lucide-react';
import { BRAND } from '../data/mockData';
import { playPop, setSoundEnabled } from '../utils/audio';

interface NavbarProps {
  onOpenWorkshopModal: (trackId?: string) => void;
  onOpenEnquiryModal: () => void;
  onOpenTutorModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWorkshopModal, onOpenEnquiryModal, onOpenTutorModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [futureSkillsOpen, setFutureSkillsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    if (newState) playPop();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, route?: string) => {
    playPop();
    if (route) {
      window.history.pushState({}, '', route);
    }
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', href: '#hero', route: '/' },
    { name: 'Why Us', href: '#why-charithra', route: '/about' },
    { name: 'Academics', href: '#academics', route: '/classes' },
    { name: 'Online Classes', href: '#online-classes', route: '/online-classes' },
    { name: 'Offline Classes', href: '#offline-classes', route: '/offline-classes' },
    { name: 'Logic Lab', href: '#logic-section', route: '/logic' },
    { 
      name: 'Future Skills', 
      href: '#future-skills',
      hasDropdown: true 
    },
    { name: 'Workshops', href: '#workshops', route: '/workshops' },
    { name: 'Gallery', href: '#gallery', route: '/gallery' },
    { name: 'Parents', href: '#parents', route: '/parents' },
    { name: 'Contact', href: '#contact', route: '/contact' },
  ];

  const futureSkillLinks = [
    { name: 'Robotics Lab', href: '#robotics', route: '/robotics', icon: Bot, color: 'text-amber-400' },
    { name: 'Drone Learning', href: '#drones', route: '/drone', icon: Plane, color: 'text-sky-400' },
    { name: 'RC Car Arena', href: '#rc-cars', route: '/remote-cars', icon: Car, color: 'text-orange-400' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-nav shadow-lg py-2.5' : 'bg-charithra-black/90 backdrop-blur-md py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <a 
            href="#hero" 
            onClick={playPop}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-charithra-gold-light via-charithra-gold to-charithra-gold-dark p-0.5 shadow-gold-glow transform transition group-hover:scale-105 flex items-center justify-center overflow-hidden bg-charithra-black">
              <img 
                src="/assets/charithra-emblem-transparent.png" 
                alt="Charithra Logo" 
                className="w-9 h-9 object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-charithra-gold rounded-full border-2 border-charithra-black animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg sm:text-xl text-white tracking-wide">
                  CHARITHRA
                </span>
                <span className="font-heading font-semibold text-xs sm:text-sm px-1.5 py-0.5 rounded bg-charithra-gold/20 text-charithra-gold border border-charithra-gold/40">
                  HUB
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-wider">
                Learn Today <span className="text-charithra-gold">•</span> Lead Tomorrow
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div 
                  key={link.name} 
                  className="relative group"
                  onMouseEnter={() => setFutureSkillsOpen(true)}
                  onMouseLeave={() => setFutureSkillsOpen(false)}
                >
                  <a
                    href={link.href}
                    onClick={playPop}
                    className="flex items-center gap-1 text-xs lg:text-sm font-medium px-3 py-2 rounded-lg text-slate-200 hover:text-charithra-gold hover:bg-white/5 transition"
                  >
                    {link.name}
                    <ChevronDown className="w-3.5 h-3.5 transition group-hover:rotate-180" />
                  </a>

                  {/* Dropdown Menu */}
                  {futureSkillsOpen && (
                    <div className="absolute top-full left-0 w-52 py-2 bg-charithra-dark/95 border border-charithra-gold/30 rounded-xl shadow-2xl backdrop-blur-xl animate-fadeIn">
                      <a
                        href="#future-skills"
                        onClick={playPop}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-charithra-gold uppercase tracking-wider border-b border-white/10 hover:bg-white/5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> All 4 Worlds
                      </a>
                      {futureSkillLinks.map((skill) => (
                        <a
                          key={skill.name}
                          href={skill.href}
                          onClick={(e) => {
                            handleNavClick(e, skill.href, skill.route);
                            setFutureSkillsOpen(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-charithra-gold/10 transition"
                        >
                          <skill.icon className={`w-4 h-4 ${skill.color}`} />
                          <span>{skill.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.route)}
                  className="text-xs lg:text-sm font-medium px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-charithra-gold hover:bg-white/5 transition"
                >
                  {link.name}
                </a>
              )
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? "Mute pleasant sounds" : "Enable pleasant sounds"}
              className="p-2 rounded-full text-slate-300 hover:text-charithra-gold hover:bg-white/5 transition border border-white/10"
              aria-label="Toggle Sound"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-charithra-gold" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Teach With Us Career Button */}
            <button
              onClick={() => {
                playPop();
                onOpenTutorModal();
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-charithra-gold bg-white/5 border border-white/10 hover:border-charithra-gold/40 transition"
              title="Join as a Tutor or Teacher"
            >
              <Briefcase className="w-3.5 h-3.5 text-charithra-gold" />
              <span>Teach With Us</span>
            </button>

            {/* Portal Login Direct Link */}
            <a
              href="http://localhost:3000/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playPop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 transition"
              title="Login to CRM / Tutor / Parent Portal"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </a>

            {/* WhatsApp Quick Link */}
            <a
              href={`https://wa.me/${BRAND.whatsapp}?text=Hello%20Charithra%20Learning%20Hub,%20I%20would%20like%20to%20know%20more%20about%20your%20classes%20and%20workshops!`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playPop}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
              <span>WhatsApp</span>
            </a>

            {/* Book Workshop Primary CTA */}
            <button
              onClick={() => {
                playPop();
                onOpenWorkshopModal();
              }}
              className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-charithra-black bg-gradient-to-r from-charithra-gold-light via-charithra-gold to-charithra-gold-dark shadow-gold-glow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Book Workshop</span>
              </span>
              <div className="absolute inset-0 bg-white/25 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={toggleSound}
              className="p-2 text-slate-300 hover:text-charithra-gold"
              aria-label="Toggle sound"
            >
              {soundOn ? <Volume2 className="w-5 h-5 text-charithra-gold" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                playPop();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded-lg text-slate-200 hover:text-charithra-gold hover:bg-white/5 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-charithra-black/98 border-b border-charithra-gold/30 px-5 pt-3 pb-6 animate-fadeIn space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, link.href, link.route);
                }}
                className="text-sm font-medium py-2 px-3 rounded-lg text-slate-200 hover:text-charithra-gold hover:bg-white/5 transition"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                playPop();
                setMobileMenuOpen(false);
                onOpenWorkshopModal();
              }}
              className="w-full py-3 rounded-xl text-center font-bold text-sm text-charithra-black bg-gradient-to-r from-charithra-gold-light to-charithra-gold shadow-gold-glow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book a One-Day Workshop
            </button>

            <button
              onClick={() => {
                playPop();
                setMobileMenuOpen(false);
                onOpenEnquiryModal();
              }}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-charithra-gold" /> Enquire for Tuition Classes
            </button>

            <button
              onClick={() => {
                playPop();
                setMobileMenuOpen(false);
                onOpenTutorModal();
              }}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-sm text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Teach With Us (Apply as Tutor)
            </button>

            <a
              href="http://localhost:3000/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playPop();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-center font-bold text-sm text-charithra-black bg-charithra-gold hover:bg-charithra-gold-light flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Portal Login (Admin / Tutor / Parent)
            </a>

            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-300">
              <a href={`tel:${BRAND.phone}`} className="flex items-center gap-1 hover:text-charithra-gold">
                <Phone className="w-3.5 h-3.5 text-charithra-gold" /> {BRAND.phone}
              </a>
              <span className="text-white/20">•</span>
              <a 
                href={`https://wa.me/${BRAND.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Direct
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
