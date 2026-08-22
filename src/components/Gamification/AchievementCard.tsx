import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Brain, RotateCcw, Zap, CheckCircle, Target, Footprints, Lock } from 'lucide-react';
import { Achievement } from '../../services/types';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const iconMap: Record<string, any> = {
    footprints: Footprints,
    flame: Flame,
    brain: Brain,
    'rotate-ccw': RotateCcw,
    zap: Zap,
    'check-circle': CheckCircle,
    target: Target,
    trophy: Trophy,
  };

  const IconComponent = iconMap[achievement.icon] || Trophy;
  const isUnlocked = achievement.unlocked;
  const percent = Math.min(Math.round((achievement.progress / Math.max(achievement.target_value, 1)) * 100), 100);

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
        isUnlocked
          ? 'glass-panel-glow border-cyan-500/30'
          : 'glass-panel border-white/5 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl border shrink-0 ${
            isUnlocked
              ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {isUnlocked ? (
            <IconComponent className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-100 truncate">
              {achievement.title}
            </h4>
            {isUnlocked && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                Unlocked
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>Progress</span>
          <span className={isUnlocked ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
            {achievement.progress} / {achievement.target_value} ({percent}%)
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className={`h-full rounded-full ${
              isUnlocked
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                : 'bg-slate-700'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
