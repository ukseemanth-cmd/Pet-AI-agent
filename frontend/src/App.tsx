import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { TabType } from './components/Layout/Sidebar';
import { AgentPage } from './pages/AgentPage';
import { TasksPage } from './pages/TasksPage';
import { FocusPage } from './pages/FocusPage';
import { ProgressPage } from './pages/ProgressPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { DesktopPetApp } from './pages/DesktopPetApp';
import { DesktopLauncherModal } from './components/DesktopPet/DesktopLauncherModal';
import { FocusTimer } from './components/Focus/FocusTimer';
import { FloatingPet } from './components/FloatingPet/FloatingPet';
import { OnboardingFlow } from './components/PetCustomization/OnboardingFlow';
import { PetFullData, Task } from './services/types';
import { getPet, getTasks, getGoals, startFocusSession, completeFocusSession } from './services/api';
import { eventBus } from './utils/events';
import { CompanionProvider, useCompanion } from './context/CompanionContext';
import { AnimatePresence } from 'framer-motion';

// ── Inner App — wrapped by CompanionProvider ────────────────
function InnerApp() {
  // Check if running in dedicated Standalone Desktop Pet Mode
  const isDesktopMode =
    typeof window !== 'undefined' &&
    (window.location.search.includes('mode=desktop') ||
      (window as any).__IS_DESKTOP_PET__ === true);

  if (isDesktopMode) {
    return <DesktopPetApp />;
  }

  const { needsOnboarding, isLoading: companionLoading } = useCompanion();

  const [activeTab, setActiveTab] = useState<TabType>('agent');
  const [petData, setPetData] = useState<PetFullData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [focusDuration, setFocusDuration] = useState(25);
  const [activeFocusSessionId, setActiveFocusSessionId] = useState<number | null>(null);

  // Load all app data from backend
  const loadData = useCallback(async () => {
    try {
      const [petRes, tasksRes, goalsRes] = await Promise.all([
        getPet(),
        getTasks(),
        getGoals(),
      ]);
      setPetData(petRes);
      setTasks(tasksRes);
      setGoals(goalsRes);
    } catch (err) {
      console.error('Failed to load app data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Launch Focus Room
  const handleStartFocus = async (task?: Task | null, duration: number = 25) => {
    setFocusTask(task || null);
    setFocusDuration(duration);
    try {
      const session = await startFocusSession({
        task_id: task?.id || null,
        duration_minutes: duration,
      });
      setActiveFocusSessionId(session.id);
      setIsFocusMode(true);
      eventBus.emit('FOCUS_STARTED', { duration, taskTitle: task?.title });
    } catch (err) {
      console.error('Failed to start focus session:', err);
      setIsFocusMode(true);
      eventBus.emit('FOCUS_STARTED', { duration, taskTitle: task?.title });
    }
  };

  // Finish Focus Room & Claim XP
  const handleCompleteFocus = async (elapsedMinutes: number) => {
    if (activeFocusSessionId) {
      try {
        const res = await completeFocusSession(activeFocusSessionId, elapsedMinutes);
        eventBus.emit('FOCUS_COMPLETED', { minutes: elapsedMinutes, xp: res.xp_earned });
        eventBus.emit('XP_EARNED', { amount: res.xp_earned, reason: 'Deep Focus' });
      } catch (err) {
        console.error('Failed to complete focus session:', err);
      }
    }
    setIsFocusMode(false);
    setActiveFocusSessionId(null);
    setFocusTask(null);
    loadData();
  };

  // Exit Focus Room without completion
  const handleExitFocus = () => {
    setIsFocusMode(false);
    setActiveFocusSessionId(null);
    setFocusTask(null);
    loadData();
  };

  // Show onboarding if needed (after loading complete)
  const showOnboarding = !companionLoading && needsOnboarding && !onboardingComplete;

  return (
    <>
      {/* Onboarding Gate */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
        )}
      </AnimatePresence>

      {/* Main App (rendered under onboarding, no interference) */}
      <MainLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        petData={petData}
        tasksCount={tasks.filter((t) => t.status !== 'completed').length}
        onRefresh={loadData}
        onOpenDesktopPet={() => setIsDesktopModalOpen(true)}
      >
        {activeTab === 'agent' && (
          <AgentPage
            petData={petData}
            tasks={tasks}
            onRefreshData={loadData}
            onStartFocus={handleStartFocus}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            goals={goals}
            onRefreshData={loadData}
            onStartFocus={handleStartFocus}
          />
        )}
        {activeTab === 'focus' && (
          <FocusPage tasks={tasks} onStartFocus={handleStartFocus} />
        )}
        {activeTab === 'progress' && <ProgressPage />}
        {activeTab === 'achievements' && <AchievementsPage />}
      </MainLayout>

      {/* Floating In-App AI Companion Overlay */}
      <FloatingPet
        petState={petData?.pet.state}
        petMessage={petData?.pet.current_message}
        currentXP={petData?.user_xp}
        level={petData?.user_level}
        streakDays={petData?.streak_days}
        isFocusMode={isFocusMode}
        tasks={tasks}
        onRefreshData={loadData}
        onStartFocus={handleStartFocus}
      />

      {/* Desktop Pet Launcher Modal */}
      <DesktopLauncherModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Immersive Focus Mode Fullscreen Overlay */}
      {isFocusMode && (
        <FocusTimer
          task={focusTask}
          defaultDuration={focusDuration}
          onComplete={handleCompleteFocus}
          onExit={handleExitFocus}
        />
      )}
    </>
  );
}

// ── Root App — provides companion context ────────────────────
export function App() {
  return (
    <CompanionProvider>
      <InnerApp />
    </CompanionProvider>
  );
}

export default App;
