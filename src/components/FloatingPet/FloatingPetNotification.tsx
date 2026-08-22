import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Shield, Sparkles } from 'lucide-react';
import { FloatingNotification } from './FloatingPet.types';

interface FloatingPetNotificationProps {
  notifications: FloatingNotification[];
  onDismiss: (id: string) => void;
}

export const FloatingPetNotification: React.FC<FloatingPetNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-50 min-w-[200px]">
      <AnimatePresence>
        {notifications.map((n) => {
          if (n.type === 'xp') {
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 15, scale: 0.6 }}
                animate={{ opacity: 1, y: -25, scale: 1.15 }}
                exit={{ opacity: 0, y: -45, scale: 0.8 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                onAnimationComplete={() => onDismiss(n.id)}
                className="px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-mono font-black text-sm shadow-lg shadow-cyan-500/40 flex items-center gap-1 border border-white/40"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>+{n.xpAmount} XP</span>
                <Sparkles className="w-3 h-3 text-cyan-900 animate-spin" />
              </motion.div>
            );
          }

          if (n.type === 'level') {
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                exit={{ opacity: 0, scale: 0.7, y: -25 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                onAnimationComplete={() => onDismiss(n.id)}
                className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-extrabold text-xs shadow-xl shadow-purple-500/40 flex items-center gap-1.5 border border-purple-400/40"
              >
                <Shield className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{n.content}</span>
              </motion.div>
            );
          }

          if (n.type === 'achievement') {
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                exit={{ opacity: 0, scale: 0.7, y: -25 }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                onAnimationComplete={() => onDismiss(n.id)}
                className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/40 flex items-center gap-1.5 border border-amber-300/50"
              >
                <Trophy className="w-4 h-4 fill-slate-950" />
                <span>{n.content}</span>
              </motion.div>
            );
          }

          // General quick toast message
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="px-3.5 py-1.5 rounded-xl glass-panel-glow border border-cyan-500/30 text-xs font-medium text-slate-100 shadow-md text-center max-w-xs"
            >
              {n.content}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
