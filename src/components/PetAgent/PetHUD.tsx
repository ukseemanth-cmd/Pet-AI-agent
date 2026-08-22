import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Target, Activity } from 'lucide-react';
import { PetProfile } from '../../services/types';

interface PetHUDProps {
  pet: PetProfile;
}

export const PetHUD: React.FC<PetHUDProps> = ({ pet }) => {
  const metrics = [
    {
      label: 'Productivity',
      value: Math.round(pet.productivity_score),
      icon: Activity,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      suffix: '',
    },
    {
      label: 'Energy',
      value: Math.round(pet.energy),
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      suffix: '%',
    },
    {
      label: 'Happiness',
      value: Math.round(pet.happiness),
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      borderColor: 'border-rose-500/30',
      suffix: '%',
    },
    {
      label: 'Focus',
      value: Math.round(pet.focus_score),
      icon: Target,
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl mx-auto mt-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            whileHover={{ y: -2, scale: 1.02 }}
            className="px-3.5 py-2.5 rounded-xl glass-panel border border-white/5 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top Row: Icon & Label */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium tracking-wide">{m.label}</span>
              <div className={`p-1 rounded-md ${m.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${m.textColor}`} />
              </div>
            </div>

            {/* Middle: Big Value */}
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl font-bold font-mono ${m.textColor}`}>
                {m.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">{m.suffix}</span>
            </div>

            {/* Bottom: Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-2 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(m.value, 4), 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
