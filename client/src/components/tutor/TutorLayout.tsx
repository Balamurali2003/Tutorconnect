import React, { useState } from 'react';
import { TutorSidebar } from './TutorSidebar';
import { TutorNavbar } from './TutorNavbar';
import { TutorDailyUpdateModal } from './TutorDailyUpdateModal';
import { useApp } from '../../context/AppContext';

interface TutorLayoutProps {
  children: React.ReactNode;
}

export const TutorLayout: React.FC<TutorLayoutProps> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { triggerRefresh, addToast } = useApp();

  const handleUpdateSuccess = () => {
    triggerRefresh();
    addToast('success', 'Update Published', 'Your teaching update has been sent.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <TutorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TutorNavbar onOpenUpdateModal={() => setModalOpen(true)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <TutorDailyUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};
