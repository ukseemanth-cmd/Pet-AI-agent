import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CornerDownLeft, Zap, Calendar, Target, Flame } from 'lucide-react';
import { sound } from '../../utils/audio';

interface AgentInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const AgentInput: React.FC<AgentInputProps> = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState('');

  // Shortcut key listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inputEl = document.getElementById('agent-command-input');
        inputEl?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    sound.playThinkingStart();
    onSubmit(value.trim());
    setValue('');
  };

  const samplePrompts = [
    { label: 'Finish ML project', icon: Target, text: 'I need to finish my ML project.' },
    { label: 'Plan today', icon: Calendar, text: 'Help me plan today.' },
    { label: 'Procrastinating', icon: Flame, text: "I've been procrastinating today." },
    { label: 'Next action', icon: Zap, text: 'What should I work on next?' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-5">
      {/* Main Command Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center rounded-2xl glass-panel-glow border border-cyan-500/30 overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="pl-4 pr-2 text-cyan-400">
            <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin text-cyan-300' : ''}`} />
          </div>

          <input
            id="agent-command-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask your productivity pet... (e.g. 'I need to finish my ML project')"
            className="w-full py-4 pr-12 bg-transparent text-slate-100 placeholder-slate-400 text-sm md:text-base focus:outline-none disabled:opacity-50"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded-md">
              ⌘K
            </kbd>

            <button
              type="submit"
              disabled={!value.trim() || isLoading}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-slate-950 font-semibold transition-all shadow-md shadow-cyan-500/20"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        {samplePrompts.map((chip) => {
          const Icon = chip.icon;
          return (
            <motion.button
              key={chip.label}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sound.playThinkingStart();
                onSubmit(chip.text);
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{chip.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
