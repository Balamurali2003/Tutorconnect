import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyCharithra } from './components/WhyCharithra';
import { AcademicTuition } from './components/AcademicTuition';
import { OnlineClasses } from './components/OnlineClasses';
import { OfflineClasses } from './components/OfflineClasses';
import { LogicSection } from './components/LogicSection';
import { SpecialFutureSkills } from './components/SpecialFutureSkills';
import { RoboticsSection } from './components/RoboticsSection';
import { DroneSection } from './components/DroneSection';
import { RemoteCarSection } from './components/RemoteCarSection';
import { WorkshopCTA } from './components/WorkshopCTA';
import { DayAtCharithra } from './components/DayAtCharithra';
import { ParentSection } from './components/ParentSection';
import { ChildSection } from './components/ChildSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { WorkshopModal } from './components/WorkshopModal';
import { EnquiryModal } from './components/EnquiryModal';
import { TutorApplyModal } from './components/TutorApplyModal';

export const App: React.FC = () => {
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [selectedWorkshopTrack, setSelectedWorkshopTrack] = useState<string | undefined>(undefined);

  const openWorkshopModal = (trackId?: string) => {
    setSelectedWorkshopTrack(trackId);
    setIsWorkshopModalOpen(true);
  };

  const openEnquiryModal = () => {
    setIsEnquiryModalOpen(true);
  };

  const scrollToAcademics = () => {
    const el = document.getElementById('academics');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const routeToSectionMap: Record<string, string> = {
      '/': 'hero',
      '/about': 'why-charithra',
      '/classes': 'academics',
      '/online-classes': 'online-classes',
      '/offline-classes': 'offline-classes',
      '/robotics': 'robotics',
      '/drone': 'drones',
      '/remote-cars': 'rc-cars',
      '/workshops': 'workshops',
      '/gallery': 'gallery',
      '/contact': 'contact',
      '/parents': 'parents',
    };

    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const sectionId = routeToSectionMap[path];
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-charithra-dark overflow-x-hidden font-sans">
      
      {/* 1. Header Navigation */}
      <Navbar 
        onOpenWorkshopModal={openWorkshopModal}
        onOpenEnquiryModal={openEnquiryModal}
        onOpenTutorModal={() => setIsTutorModalOpen(true)}
      />

      {/* 2. Spectacular Animated Hero Section */}
      <Hero 
        onOpenWorkshopModal={openWorkshopModal}
        onExploreClasses={scrollToAcademics}
      />

      {/* 3. Why Charithra Section (4 Core Pillars + Girl Mascot) */}
      <WhyCharithra 
        onLearnMore={scrollToAcademics}
      />

      {/* 4. Academic Tuition Section (8 Subjects with Animated Icons) */}
      <AcademicTuition 
        onEnquire={openEnquiryModal}
      />

      {/* 5. Online Classes Section (Laptop Mockup + Girl Mascot) */}
      <OnlineClasses 
        onBookDemo={openEnquiryModal}
      />

      {/* 6. Offline Classroom Learning (Blackboard + Hands-on Pods) */}
      <OfflineClasses 
        onScheduleVisit={openEnquiryModal}
      />

      {/* 7. Logic & Critical Thinking Lab (Think. Solve. Discover.) */}
      <LogicSection />

      {/* 8. Special Future Skills (Dark Futuristic Section: 4 Amazing Worlds) */}
      <SpecialFutureSkills 
        onSelectTrack={(trackId) => openWorkshopModal(trackId)}
      />

      {/* 8. Dedicated Robotics Lab (Boy Mascot Demonstrating Hardware) */}
      <RoboticsSection 
        onBookRobotics={() => openWorkshopModal('ws-robotics')}
      />

      {/* 9. Dedicated Drone Learning (Sky Theme + Hovering Drone) */}
      <DroneSection 
        onBookDrone={() => openWorkshopModal('ws-drones')}
      />

      {/* 10. Dedicated Remote Car Arena (Racetrack + Interactive Car Controller) */}
      <RemoteCarSection 
        onBookRC={() => openWorkshopModal('ws-rc')}
      />

      {/* 11. One-Day Workshop Highlight & Confetti CTA */}
      <WorkshopCTA 
        onBookWorkshop={openWorkshopModal}
        onTalkToUs={openEnquiryModal}
      />

      {/* 12. "A Day at Charithra" Step-by-Step Interactive Timeline */}
      <DayAtCharithra />

      {/* 13. Dedicated Parent Confidence Section (6 Trustworthy Pillars) */}
      <ParentSection 
        onSpeakToMentor={openEnquiryModal}
      />

      {/* 14. Dedicated Child Discovery Section ("What Will You Discover Today?") */}
      <ChildSection />

      {/* 15. Masonry Gallery with 6 Filterable Categories */}
      <GallerySection />

      {/* 16. Testimonials Carousel */}
      <TestimonialsSection />

      {/* 17. Final Full-Width Discovery Banner (Both Mascots) */}
      <FinalCTA 
        onJoinHub={openEnquiryModal}
        onBookWorkshop={openWorkshopModal}
      />

      {/* 18. Black & Gold Comprehensive Brand Footer */}
      <Footer onOpenTutorModal={() => setIsTutorModalOpen(true)} />

      {/* Interactive Booking & Enquiry Modals */}
      <WorkshopModal 
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        initialTrackId={selectedWorkshopTrack}
      />

      <EnquiryModal 
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />

      <TutorApplyModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
      />

    </div>
  );
};

export default App;
