import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  level: number;
  xpForNextLevel: number;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, level, xpForNextLevel }) => {
  // Approximate XP progress inside current level band
  const percent = Math.min(Math.round((currentXP / Math.max(xpForNextLevel, 1)) * 100), 100);

  return (
    <div className="flex flex-col min-w-[140px] sm:min-w-[180px]">
      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
          <span>XP</span>
        </span>
        <span className="text-cyan-300 font-bold">
          {currentXP} <span className="text-slate-500 font-normal">/ {xpForNextLevel}</span>
        </span>
      </div>

      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
