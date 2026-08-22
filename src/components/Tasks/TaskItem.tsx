import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Trash2, Zap, Play } from 'lucide-react';
import { Task } from '../../services/types';
import { sound } from '../../utils/audio';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onStartFocus?: (task: Task) => void;
  isCompleting?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onDelete,
  onStartFocus,
  isCompleting = false,
}) => {
  const isDone = task.status === 'completed';

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const handleCheck = () => {
    if (isDone || isCompleting) return;
    sound.playTaskComplete();
    onComplete(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
        isDone
          ? 'bg-slate-950/40 border-white/5 opacity-60'
          : 'glass-panel border-white/5 hover:border-cyan-500/30'
      }`}
    >
      {/* Left: Checkmark + Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          onClick={handleCheck}
          disabled={isDone || isCompleting}
          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
            isDone
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'border-slate-600 hover:border-cyan-400 bg-slate-900/60 text-transparent hover:text-cyan-300'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="min-w-0">
          <p
            className={`text-sm font-medium leading-snug truncate ${
              isDone ? 'line-through text-slate-400' : 'text-slate-100'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
          )}
        </div>
      </div>

      {/* Right: Meta & Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{task.estimated_minutes}m</span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase border ${
            difficultyColors[task.difficulty || 'medium']
          }`}
        >
          {task.difficulty}
        </span>

        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" />+{task.xp_reward} XP
        </span>

        {!isDone && onStartFocus && (
          <button
            onClick={() => onStartFocus(task)}
            title="Start Focus Mode for this task"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
