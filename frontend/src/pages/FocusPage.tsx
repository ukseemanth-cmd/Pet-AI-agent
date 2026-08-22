import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Play, Zap, CheckCircle } from 'lucide-react';
import { Task } from '../services/types';
import { PetRenderer } from '../components/PetAgent/PetRenderer';

interface FocusPageProps {
  tasks: Task[];
  onStartFocus: (task?: Task | null, duration?: number) => void;
}

export const FocusPage: React.FC<FocusPageProps> = ({ tasks, onStartFocus }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [duration, setDuration] = useState(25);

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const presetTimes = [15, 25, 45, 60];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Focus Chamber
          </h2>
          <p className="text-xs text-slate-400">
            Deep work zone where your pet companion concentrates alongside you
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Launcher Card */}
        <div className="md:col-span-2 p-6 rounded-3xl glass-panel-glow border border-cyan-500/30 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Choose Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presetTimes.map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex flex-col items-center gap-0.5 ${
                    duration === m
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-base">{m}</span>
                  <span className="text-[10px] font-normal">MIN</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Attach an Active Task (Optional)
            </label>
            {activeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active tasks in your backlog</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(selectedTask?.id === t.id ? null : t)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-3 ${
                      selectedTask?.id === t.id
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/40 border-white/5 text-slate-300 hover:border-white/15'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="font-mono text-cyan-400 font-bold shrink-0">
                      +{t.xp_reward} XP
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Estimated Reward:{' '}
              <span className="text-cyan-400 font-bold">
                +{Math.max(Math.round(duration * 0.8), 5)} XP
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStartFocus(selectedTask, duration)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Enter Focus Mode</span>
            </motion.button>
          </div>
        </div>

        {/* Right 1 Col: Pet Preview & Tips */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <PetRenderer state="focused" size="md" />
          <div>
            <h4 className="text-sm font-bold text-slate-200">Companion Sync</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When entering focus mode, Nova enters a calm, uninterrupted concentration state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
