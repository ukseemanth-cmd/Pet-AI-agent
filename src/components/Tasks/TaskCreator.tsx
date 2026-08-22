import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Zap, Target } from 'lucide-react';
import { TaskDifficulty } from '../../services/types';

interface TaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    estimated_minutes: number;
  }) => void;
  isLoading?: boolean;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  const xpPreview = {
    easy: 10,
    medium: 20,
    hard: 35,
  }[difficulty];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      estimated_minutes: estimatedMinutes,
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 shadow-2xl relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Create New Task</h3>
              <p className="text-xs text-slate-400">Add an actionable item to your productivity queue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare dataset for ML pipeline"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 focus:border-cyan-400 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add context or notes..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 focus:border-cyan-400 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
              />
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as TaskDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                      difficulty === d
                        ? d === 'easy'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : d === 'medium'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md shadow-rose-500/10'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <span>{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & XP Preview */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Est. Minutes
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 25)}
                    className="w-full bg-transparent text-slate-100 font-mono text-sm focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">min</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reward
                </label>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                  <span className="text-xs font-medium">XP Payout</span>
                  <span className="font-mono font-bold text-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />+{xpPreview} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
