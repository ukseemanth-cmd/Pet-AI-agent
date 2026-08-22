import React, { useState } from 'react';
import { Bot, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { PetFullData } from '../../services/types';
import { XPBar } from '../Gamification/XPBar';
import { LevelBadge } from '../Gamification/LevelBadge';
import { StreakDisplay } from '../Gamification/StreakDisplay';
import { sound } from '../../utils/audio';

import { Monitor } from 'lucide-react';

interface TopBarProps {
  petData?: PetFullData | null;
  onRefresh?: () => void;
  onOpenDesktopPet?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ petData, onRefresh, onOpenDesktopPet }) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const xp = petData?.user_xp || 0;
  const level = petData?.user_level || 1;
  const nextLevelXP = petData?.xp_for_next_level || 100;
  const streak = petData?.streak_days || 0;

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 glass-panel border-b border-white/5 flex items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
            <span>PRODUCTIVITY PET</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              AI AGENT
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Living Autonomous Productivity Companion
          </p>
        </div>
      </div>

      {/* Right: Gamification HUD (XP, Level, Streak, Controls) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Open Desktop Pet Button */}
        {onOpenDesktopPet && (
          <button
            onClick={onOpenDesktopPet}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Open Standalone Desktop Pet"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Desktop Pet</span>
          </button>
        )}

        {/* XP Bar */}
        <div className="hidden md:block">
          <XPBar currentXP={xp} level={level} xpForNextLevel={nextLevelXP} />
        </div>

        {/* Level Badge */}
        <LevelBadge level={level} />

        {/* Streak Counter */}
        <StreakDisplay streakDays={streak} />

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Recalculate & Sync Pet State"
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute UI Audio' : 'Mute UI Audio'}
          className={`p-2 rounded-xl border transition-all ${
            isMuted
              ? 'text-slate-500 border-white/5 bg-slate-900/40'
              : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
