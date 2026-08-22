import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sliders,
  Power,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { PetRenderer } from '../components/PetAgent/PetRenderer';
import { FloatingPetBubble } from '../components/FloatingPet/FloatingPetBubble';
import { FloatingPetNotification } from '../components/FloatingPet/FloatingPetNotification';
import { FloatingPetSize, FloatingNotification } from '../components/FloatingPet/FloatingPet.types';
import { PetFullData, PetState, Task } from '../services/types';
import { getPet, getTasks, startFocusSession } from '../services/api';
import { sound } from '../utils/audio';
import { useCompanion } from '../context/CompanionContext';

export const DesktopPetApp: React.FC = () => {
  const { profile } = useCompanion();
  const [petData, setPetData] = useState<PetFullData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [size, setSize] = useState<FloatingPetSize>('md');
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);


  // Local state override for immediate AI/XP reactions
  const [overrideState, setOverrideState] = useState<PetState | null>(null);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const lastXPRef = React.useRef<number | null>(null);

  // Load pet state & tasks from backend
  const loadData = useCallback(async () => {
    try {
      const [petRes, tasksRes] = await Promise.all([getPet(), getTasks()]);
      
      // Detect XP changes from web actions
      if (lastXPRef.current !== null && petRes.user_xp > lastXPRef.current) {
        const diff = petRes.user_xp - lastXPRef.current;
        pushNotification('xp', `+${diff} XP`, diff);
        setOverrideState('celebrating');
        setTimeout(() => setOverrideState(null), 3500);
      }
      lastXPRef.current = petRes.user_xp;

      setPetData(petRes);
      setTasks(tasksRes);
    } catch (err) {
      console.error('Desktop pet sync error:', err);
    }
  }, []);

  // Proactive background polling every 6 seconds to stay synchronized with backend
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [loadData]);

  const pushNotification = (
    type: 'xp' | 'message' | 'level' | 'achievement',
    content: string,
    xpAmount?: number
  ) => {
    const newNotif: FloatingNotification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      xpAmount,
      createdAt: Date.now(),
    };
    setNotifications((prev) => [...prev.slice(-3), newNotif]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleStartFocus = async (task?: Task | null, duration: number = 25) => {
    try {
      await startFocusSession({
        task_id: task?.id || null,
        duration_minutes: duration,
      });
      setOverrideState('focused');
      setOverrideMessage(`Focused with you for ${duration} minutes.`);
      sound.playFocusStart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuit = async () => {
    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('quit_app');
      } else {
        window.close();
      }
    } catch {
      window.close();
    }
  };

  const handleOpenWebApp = () => {
    const url = import.meta.env.PROD ? window.location.origin : 'http://localhost:5173';
    window.open(url, '_blank');
  };

  const currentPetState = overrideState || petData?.pet.state || 'idle';
  const isMuted = sound.getMuted();

  return (
    <div className="w-screen h-screen bg-transparent select-none overflow-hidden flex flex-col items-center justify-center p-3 relative font-sans">
      {/* Floating Notifications (Ascending +XP & Milestones) */}
      <FloatingPetNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Main Draggable Companion Container with Tauri Drag Region */}
      <div
        data-tauri-drag-region
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        {/* Floating Mini Action Toolbar on Hover */}
        <AnimatePresence>
          {(isHovered || isBubbleOpen || isSettingsOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -top-10 px-2.5 py-1 rounded-xl glass-panel border border-white/10 flex items-center gap-2 shadow-2xl backdrop-blur-xl z-40"
            >
              <button
                onClick={() => {
                  setIsBubbleOpen((prev) => !prev);
                  setIsSettingsOpen(false);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  isBubbleOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Talk to ${profile?.pet_name || 'Companion'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen((prev) => !prev);
                  setIsBubbleOpen(false);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  isSettingsOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Companion Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleOpenWebApp}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-all"
                title="Open Web Workspace"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleQuit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                title="Close Companion"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Animated Pet Mascot */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sound.playThinkingStart();
            setIsBubbleOpen((prev) => !prev);
            setIsSettingsOpen(false);
          }}
          className="relative"
        >
          <PetRenderer
            petType={profile?.pet_type}
            theme={profile?.theme}
            accessories={profile?.accessories}
            state={currentPetState}
            size={size}
          />


          {/* Glowing pulse dot */}
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-ping pointer-events-none" />
        </motion.div>

        {/* Interactive AI Chat & Plan Bubble */}
        <AnimatePresence>
          {isBubbleOpen && (
            <FloatingPetBubble
              onClose={() => setIsBubbleOpen(false)}
              onStartFocus={handleStartFocus}
              onRefreshData={loadData}
              onStateOverride={(st, msg) => {
                setOverrideState(st);
                setOverrideMessage(msg);
              }}
              tasks={tasks}
            />
          )}
        </AnimatePresence>

        {/* Desktop Settings Popover */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="absolute bottom-full mb-3 w-64 rounded-3xl glass-panel-glow border border-cyan-500/40 p-4 shadow-2xl z-50 text-slate-100 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Desktop Companion</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Scale */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                    Pet Size
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['sm', 'md', 'lg'] as FloatingPetSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`py-1.5 rounded-lg font-mono font-bold uppercase transition-all ${
                          size === s
                            ? 'bg-cyan-500 text-slate-950 shadow-md'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {s === 'sm' ? 'Small' : s === 'md' ? 'Normal' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio feedback */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Audio Chimes</span>
                  <button
                    onClick={() => sound.toggleMute()}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isMuted
                        ? 'bg-slate-900 text-slate-500 border-white/5'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Open Full Dashboard */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={handleOpenWebApp}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Web Dashboard</span>
                  </button>
                </div>

                {/* Quit App */}
                <div className="pt-1">
                  <button
                    onClick={handleQuit}
                    className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Quit Desktop Pet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
