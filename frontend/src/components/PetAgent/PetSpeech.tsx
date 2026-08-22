import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';
import { PetState } from '../../services/types';

interface PetSpeechProps {
  message: string;
  petState: PetState;
  petName?: string;
}

export const PetSpeech: React.FC<PetSpeechProps> = ({
  message,
  petState,
  petName = 'Nova',
}) => {
  return (
    <div className="relative max-w-lg mx-auto mb-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative px-5 py-3.5 rounded-2xl glass-panel-glow border border-cyan-500/30 text-center shadow-lg"
        >
          {/* Top Pet Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/40 text-[10px] uppercase font-mono tracking-widest text-cyan-300 flex items-center gap-1">
            <Bot className="w-3 h-3 text-cyan-400" />
            <span>{petName}</span>
            <span className="text-cyan-500/60">•</span>
            <span className="text-slate-400 capitalize">{petState}</span>
          </div>

          <p className="text-slate-100 text-sm md:text-base font-medium leading-relaxed mt-1">
            "{message}"
          </p>

          {/* Bottom Speech Pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0e111a] border-r border-b border-cyan-500/30 transform rotate-45" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
