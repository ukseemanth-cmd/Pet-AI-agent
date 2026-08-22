import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 shadow-sm"
    >
      <Shield className="w-3.5 h-3.5 text-purple-400 fill-purple-400/30" />
      <span className="text-xs font-mono font-bold tracking-wider">
        LVL <span className="text-white font-extrabold">{level}</span>
      </span>
    </motion.div>
  );
};
