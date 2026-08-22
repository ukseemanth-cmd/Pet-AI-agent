import React from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, EyeOff, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { FloatingPetSize } from './FloatingPet.types';
import { sound } from '../../utils/audio';

interface FloatingPetSettingsProps {
  onClose: () => void;
  size: FloatingPetSize;
  onSizeChange: (size: FloatingPetSize) => void;
  onResetPosition: () => void;
  onHidePet: () => void;
}

export const FloatingPetSettings: React.FC<FloatingPetSettingsProps> = ({
  onClose,
  size,
  onSizeChange,
  onResetPosition,
  onHidePet,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full right-0 mb-3 w-64 rounded-3xl glass-panel-glow border border-cyan-500/40 p-4 shadow-2xl z-50 text-slate-100 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Companion Settings</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Size Selection */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
            Pet Scale
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['sm', 'md', 'lg'] as FloatingPetSize[]).map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange(s)}
                className={`py-1.5 rounded-lg font-mono font-bold uppercase transition-all ${
                  size === s
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {s === 'sm' ? 'Compact' : s === 'md' ? 'Normal' : 'Large'}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-slate-300">Audio Feedback</span>
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg border transition-all ${
              isMuted
                ? 'bg-slate-900 text-slate-500 border-white/5'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Reset Position */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-slate-300">Reset Position</span>
          <button
            onClick={onResetPosition}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5"
            title="Snap back to default bottom-right"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Hide Pet */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={onHidePet}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Minimize Overlay</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
