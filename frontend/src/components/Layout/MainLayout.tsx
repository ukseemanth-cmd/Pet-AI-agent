import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar, TabType } from './Sidebar';
import { PetFullData } from '../../services/types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  petData?: PetFullData | null;
  tasksCount?: number;
  onRefresh?: () => void;
  onOpenDesktopPet?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  petData,
  tasksCount = 0,
  onRefresh,
  onOpenDesktopPet,
}) => {
  return (
    <div className="min-h-screen bg-[#08090f] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Ambient Cyber Glow Blobs */}
      <div className="fixed top-[-100px] left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/10 filter blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 filter blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <TopBar petData={petData} onRefresh={onRefresh} onOpenDesktopPet={onOpenDesktopPet} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden relative z-10">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} tasksCount={tasksCount} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
