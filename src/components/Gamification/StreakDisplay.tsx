import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Check, AlertCircle } from 'lucide-react';

interface StreakDisplayProps {
  streakDays: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streakDays }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Active indicators based on streakDays (up to 7 for current week preview)
  const activeCount = Math.min(Math.max(streakDays, 0), 7);

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-panel border border-amber-500/20">
      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
        <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
        <span>{streakDays}</span>
        <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">DAYS</span>
      </div>

      {/* 7-day mini check dots */}
      <div className="flex items-center gap-1">
        {days.map((day, idx) => {
          const isActive = idx < activeCount;
          return (
            <div
              key={idx}
              className={`w-4 h-4 rounded-md text-[9px] font-mono flex items-center justify-center font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-500 border border-white/5'
              }`}
            >
              {isActive ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
