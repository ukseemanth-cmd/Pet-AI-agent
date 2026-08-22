import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Monitor, AppWindow, ExternalLink, Terminal, Check } from 'lucide-react';
import { PetRenderer } from '../PetAgent/PetRenderer';

interface DesktopLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopLauncherModal: React.FC<DesktopLauncherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleLaunchPopout = () => {
    const width = 320;
    const height = 440;
    const left = window.screen.width - width - 40;
    const top = window.screen.height - height - 80;

    window.open(
      '/?mode=desktop',
      'ProductivityPetDesktopCompanion',
      `width=${width},height=${height},top=${top},left=${left},frame=no,menubar=no,toolbar=no,location=no,status=no,resizable=no`
    );
    onClose();
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm run tauri:dev');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative text-slate-100"
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Pet Mascot */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <PetRenderer state="happy" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tauri Desktop Companion</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5">
                True Desktop Floating Pet
              </h3>
              <p className="text-xs text-slate-400">
                Escapes the browser and stays always-on-top while you code & work
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Always-On-Top</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hovers over VS Code, Chrome, and desktop apps without blocking your cursor.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <AppWindow className="w-4 h-4 text-purple-400" />
                <span>Zero Browser Chrome</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Frameless transparent floating companion that smoothly moves anywhere.
              </p>
            </div>
          </div>

          {/* Direct Launch Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleLaunchPopout}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              <span>Launch Floating Companion Window</span>
            </button>

            {/* Terminal Command for Native Tauri App */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300 truncate">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-500 select-none">$</span>
                <span className="truncate text-cyan-200">npm run tauri:dev</span>
              </div>
              <button
                onClick={handleCopyCommand}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 shrink-0 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
