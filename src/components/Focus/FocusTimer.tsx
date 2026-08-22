import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, CheckCircle, Flame, Zap, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetRenderer } from '../PetAgent/PetRenderer';
import { Task } from '../../services/types';
import { sound } from '../../utils/audio';

interface FocusTimerProps {
  task?: Task | null;
  onComplete: (elapsedMinutes: number) => void;
  onExit: () => void;
  defaultDuration?: number; // minutes
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  task,
  onComplete,
  onExit,
  defaultDuration = 25,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(defaultDuration * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    sound.playFocusStart();
    setIsActive(true);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isActive) {
      setIsActive(false);
      setIsDone(true);
      sound.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    return () => clearInterval(interval);
  }, [isActive, remainingSeconds]);

  const togglePlay = () => {
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    const elapsedSeconds = totalSeconds - remainingSeconds;
    const elapsedMinutes = Math.max(Math.round(elapsedSeconds / 60), 1);
    onComplete(elapsedMinutes);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const xpReward = Math.max(Math.round((totalSeconds / 60) * 0.8), 5);

  return (
    <div className="fixed inset-0 z-50 bg-[#08090f]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Ambient Pulsing Aura */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 filter blur-[120px] pointer-events-none"
        animate={{ scale: isActive ? [1, 1.25, 1] : 1, opacity: isActive ? [0.3, 0.7, 0.3] : 0.2 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top Bar: Back & Task Banner */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl glass-panel border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Deep Focus Protocol</span>
        </div>
      </div>

      {/* Center: Pet Companion + Big Timer */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-10 max-w-md w-full">
        {/* Enlarged Living Pet in 'focused' or 'celebrating' mode */}
        <div className="mb-2">
          <PetRenderer
            state={isDone ? 'celebrating' : isActive ? 'focused' : 'idle'}
            size="xl"
          />
        </div>

        {/* Task Title */}
        {task ? (
          <div className="mb-4">
            <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold">
              Current Target
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5 truncate max-w-sm">
              {task.title}
            </h2>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-200">Independent Focus Session</h2>
          </div>
        )}

        {/* Big Futuristic Countdown Timer */}
        <div className="my-2">
          <span className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-gradient-cyan drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
            {timeFormatted}
          </span>
        </div>

        {/* Circular / Linear Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full mt-4 mb-6 border border-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Session Status Banner */}
        <p className="text-xs text-slate-400 font-medium mb-6">
          {isDone
            ? '🎉 Focus interval complete! Great work.'
            : isActive
            ? 'Companion is focused alongside you. Eliminate distractions.'
            : 'Timer paused. Ready to resume whenever you are.'}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isDone ? (
            <>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="w-14 h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all"
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-slate-950 pl-0.5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="px-5 py-3 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Finish & Claim XP</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Complete Session (+{xpReward} XP)</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom XP preview */}
      <div className="text-center text-xs text-slate-500 font-mono z-10">
        Earn <span className="text-cyan-400 font-bold">+{xpReward} XP</span> upon completion of this session
      </div>
    </div>
  );
};
