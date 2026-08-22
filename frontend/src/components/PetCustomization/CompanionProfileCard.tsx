import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Sparkles, Flame } from 'lucide-react';
import { PetRenderer } from '../PetAgent/PetRenderer';
import { useCompanion } from '../../context/CompanionContext';
import { getPetSpecies, PERSONALITY_OPTIONS } from '../../config/petConfig';
import { CompanionSettings } from './CompanionSettings';

interface CompanionProfileCardProps {
  userXP?: number;
  userLevel?: number;
  xpForNextLevel?: number;
  streakDays?: number;
}

export const CompanionProfileCard: React.FC<CompanionProfileCardProps> = ({
  userXP = 0,
  userLevel = 1,
  xpForNextLevel = 100,
  streakDays = 0,
}) => {
  const { profile } = useCompanion();
  const [showSettings, setShowSettings] = useState(false);

  if (!profile) return null;

  const species = getPetSpecies(profile.pet_type as any);
  const personalityOpt = PERSONALITY_OPTIONS.find((p) => p.value === profile.personality);
  const xpPercent = Math.round(Math.min((userXP / Math.max(xpForNextLevel, 1)) * 100, 100));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-6 flex flex-col items-center gap-4 text-center relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full filter blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: species.accentColor }}
        />

        {/* Pet Avatar Stage */}
        <div className="w-28 h-28 relative">
          <PetRenderer
            petType={profile.pet_type}
            theme={profile.theme}
            accessories={profile.accessories}
            state="idle"
            size="sm"
          />
        </div>

        {/* Identity & Personality */}
        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Companion Profile</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-100 flex items-center justify-center gap-1.5">
            <span>{species.emoji}</span>
            <span>{profile.pet_name}</span>
          </h3>
          <div className="text-xs text-slate-400 mt-0.5">
            {species.label} · {personalityOpt?.label} Style
          </div>
        </div>

        {/* Level & XP Progression */}
        <div className="w-full space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Level {userLevel} Companion</span>
            <span className="font-mono text-cyan-400">{userXP} / {xpForNextLevel} XP</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {streakDays > 0 && (
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-amber-400 pt-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{streakDays} day streak active</span>
            </div>
          )}
        </div>

        {/* Customize Companion Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/8 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          Customize Companion
        </button>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <CompanionSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
