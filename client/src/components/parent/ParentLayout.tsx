import React from 'react';
import { ParentSidebar } from './ParentSidebar';
import { ParentNavbar } from './ParentNavbar';

interface ParentLayoutProps {
  children: React.ReactNode;
}

export const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ParentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ParentNavbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
