import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sliders,
  EyeOff,
  Bot,
  Sparkles,
} from 'lucide-react';
import { PetRenderer } from '../PetAgent/PetRenderer';
import { FloatingPetBubble } from './FloatingPetBubble';
import { FloatingPetSettings } from './FloatingPetSettings';
import { FloatingPetNotification } from './FloatingPetNotification';
import {
  FloatingPetSize,
  FloatingPosition,
  FloatingNotification,
  FloatingPetProps,
} from './FloatingPet.types';
import { PetState } from '../../services/types';
import { eventBus } from '../../utils/events';
import { sound } from '../../utils/audio';

const STORAGE_KEY_POS = 'productivity_pet_position';
const STORAGE_KEY_VIS = 'productivity_pet_visible';
const STORAGE_KEY_SIZE = 'productivity_pet_size';

export const FloatingPet: React.FC<FloatingPetProps> = ({
  petState = 'idle',
  petMessage = "Hey! I'm right here with you.",
  isFocusMode = false,
  tasks = [],
  onRefreshData,
  onStartFocus,
}) => {
  // Visibility State
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VIS);
    return saved !== null ? saved === 'true' : true;
  });

  // Size State
  const [size, setSize] = useState<FloatingPetSize>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY_SIZE) as FloatingPetSize) || 'md';
    return ['sm', 'md', 'lg'].includes(saved) ? saved : 'md';
  });

  // Position State
  const [position, setPosition] = useState<FloatingPosition>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default: bottom-right offset
    return { x: 0, y: 0 };
  });

  // Popover State
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Local state overrides for immediate reaction bursts
  const [overrideState, setOverrideState] = useState<PetState | null>(null);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  // Notifications Queue
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  // Drag tracking to distinguish click vs drag
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Effective State
  const activeState: PetState =
    overrideState || (isFocusMode ? 'focused' : petState || 'idle');

  // Push a floating notification
  const pushNotification = useCallback(
    (type: 'xp' | 'message' | 'level' | 'achievement', content: string, xpAmount?: number) => {
      const newNotif: FloatingNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        content,
        xpAmount,
        createdAt: Date.now(),
      };
      setNotifications((prev) => [...prev.slice(-3), newNotif]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Listen to Global App Events
  useEffect(() => {
    const unsubTask = eventBus.on('TASK_COMPLETED', ({ taskTitle, xp, difficulty }) => {
      setOverrideState('celebrating');
      setOverrideMessage(
        difficulty === 'hard'
          ? `Hard task completed! Incredible work on "${taskTitle}".`
          : `Task done! "${taskTitle}". Keep up the momentum!`
      );
      pushNotification('xp', `+${xp} XP`, xp);

      setTimeout(() => {
        setOverrideState(null);
        setOverrideMessage(null);
      }, 4500);
    });

    const unsubLevel = eventBus.on('LEVEL_UP', ({ newLevel }) => {
      setOverrideState('celebrating');
      pushNotification('level', `LEVEL UP! REACHED LVL ${newLevel}`);
      sound.playLevelUp();
    });

    const unsubAchieve = eventBus.on('ACHIEVEMENT_UNLOCKED', ({ title }) => {
      setOverrideState('celebrating');
      pushNotification('achievement', `🏆 ${title}`);
      sound.playLevelUp();
    });

    const unsubFocusStart = eventBus.on('FOCUS_STARTED', () => {
      setOverrideState('focused');
      setOverrideMessage("Locked in with you. Let's make deep progress.");
    });

    const unsubFocusComp = eventBus.on('FOCUS_COMPLETED', ({ minutes, xp }) => {
      setOverrideState('happy');
      pushNotification('xp', `+${xp} XP`, xp);
      setOverrideMessage(`${minutes}m deep focus finished. Solid win!`);
      setTimeout(() => {
        setOverrideState(null);
        setOverrideMessage(null);
      }, 4000);
    });

    return () => {
      unsubTask();
      unsubLevel();
      unsubAchieve();
      unsubFocusStart();
      unsubFocusComp();
    };
  }, [pushNotification]);

  // Handle Dragging
  const handleDragStart = (_: any, info: any) => {
    dragStartPos.current = { x: info.point.x, y: info.point.y };
    hasDragged.current = false;
  };

  const handleDrag = (_: any, info: any) => {
    const dist = Math.hypot(
      info.point.x - dragStartPos.current.x,
      info.point.y - dragStartPos.current.y
    );
    if (dist > 6) {
      hasDragged.current = true;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPos);
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(newPos));
    } catch {
      // ignore
    }
  };

  // Toggle Visibility
  const toggleVisibility = (val: boolean) => {
    setIsVisible(val);
    localStorage.setItem(STORAGE_KEY_VIS, String(val));
    if (!val) {
      setIsBubbleOpen(false);
      setIsSettingsOpen(false);
    }
  };

  // Change Size
  const handleSizeChange = (newSize: FloatingPetSize) => {
    setSize(newSize);
    localStorage.setItem(STORAGE_KEY_SIZE, newSize);
  };

  // Reset Position
  const handleResetPosition = () => {
    setPosition({ x: 0, y: 0 });
    localStorage.removeItem(STORAGE_KEY_POS);
  };

  // Handle Click on Pet
  const handlePetClick = () => {
    if (hasDragged.current) return;
    sound.playThinkingStart();
    setIsBubbleOpen((prev) => !prev);
    setIsSettingsOpen(false);
  };

  // If Minimized / Hidden: Show compact restorer trigger badge in corner
  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleVisibility(true)}
        className="fixed bottom-5 right-5 z-50 p-3 rounded-2xl glass-panel-glow border border-cyan-500/40 text-cyan-300 shadow-2xl flex items-center gap-2 group cursor-pointer"
        title="Summon Productivity Companion"
      >
        <Bot className="w-5 h-5 text-cyan-400 group-hover:animate-bounce" />
        <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">
          SUMMON NOVA
        </span>
        <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ x: position.x, y: position.y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 select-none touch-none"
    >
      <div className="relative flex flex-col items-center">
        {/* Floating Notifications (XP Pops, Toasts) */}
        <FloatingPetNotification
          notifications={notifications}
          onDismiss={dismissNotification}
        />

        {/* Hover Mini Toolbar (Top of Pet) */}
        <AnimatePresence>
          {(isHovered || isBubbleOpen || isSettingsOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -top-9 px-2 py-1 rounded-xl glass-panel border border-white/10 flex items-center gap-1.5 shadow-lg backdrop-blur-md z-40"
            >
              <button
                onClick={() => {
                  setIsBubbleOpen((prev) => !prev);
                  setIsSettingsOpen(false);
                }}
                className={`p-1 rounded-lg transition-all ${
                  isBubbleOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Talk to Companion"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen((prev) => !prev);
                  setIsBubbleOpen(false);
                }}
                className={`p-1 rounded-lg transition-all ${
                  isSettingsOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Companion Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => toggleVisibility(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                title="Minimize Overlay"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Living Animated Pet */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePetClick}
          className="cursor-grab active:cursor-grabbing relative"
        >
          <PetRenderer state={activeState} size={size} />

          {/* Subdued Proactive Speech Indicator Dot if not in focus mode */}
          {!isFocusMode && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-ping pointer-events-none" />
          )}
        </motion.div>

        {/* Popover Bubble Menu */}
        <AnimatePresence>
          {isBubbleOpen && (
            <FloatingPetBubble
              onClose={() => setIsBubbleOpen(false)}
              onStartFocus={onStartFocus}
              onRefreshData={onRefreshData}
              onStateOverride={(st, msg) => {
                setOverrideState(st);
                setOverrideMessage(msg);
              }}
              tasks={tasks}
            />
          )}
        </AnimatePresence>

        {/* Popover Settings Menu */}
        <AnimatePresence>
          {isSettingsOpen && (
            <FloatingPetSettings
              onClose={() => setIsSettingsOpen(false)}
              size={size}
              onSizeChange={handleSizeChange}
              onResetPosition={handleResetPosition}
              onHidePet={() => toggleVisibility(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
