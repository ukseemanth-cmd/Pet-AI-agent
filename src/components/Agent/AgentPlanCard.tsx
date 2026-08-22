import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Zap, Plus, Play, CheckCircle, Sparkles } from 'lucide-react';
import { AgentPlan } from '../../services/types';

interface AgentPlanCardProps {
  plan: AgentPlan;
  onAddTasks: () => void;
  onStartNow: () => void;
  isAdding?: boolean;
}

export const AgentPlanCard: React.FC<AgentPlanCardProps> = ({
  plan,
  onAddTasks,
  onStartNow,
  isAdding = false,
}) => {
  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const totalXP = plan.tasks.reduce((sum, t) => sum + (t.xp_reward || 10), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-2xl mx-auto my-6 rounded-3xl glass-panel-glow border border-cyan-500/40 p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generated Action Plan</span>
          </div>
          <h3 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            {plan.goal_title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              difficultyColors[plan.goal_difficulty || 'medium']
            }`}
          >
            {plan.goal_difficulty || 'Medium'}
          </span>
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            +{totalXP} XP
          </div>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      {plan.recommended_action && (
        <div className="my-4 px-4 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs md:text-sm text-cyan-200">
            <span className="font-semibold text-cyan-400">Recommended First Step:</span>
            <span>{plan.recommended_action}</span>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2.5 my-4">
        {plan.tasks.map((task, idx) => (
          <motion.div
            key={task.title}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 + 0.1 }}
            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/5 hover:border-cyan-500/20 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-cyan-400/80 w-6">
                {(idx + 1).toString().padStart(2, '0')}
              </span>
              <span className="text-sm font-medium text-slate-200 truncate">
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{task.estimated_minutes}m</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase border ${
                  difficultyColors[task.difficulty || 'medium']
                }`}
              >
                {task.difficulty}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                +{task.xp_reward} XP
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddTasks}
          disabled={isAdding}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>{isAdding ? 'Adding Tasks...' : 'Add All to Tasks'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartNow}
          disabled={isAdding}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start Now</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
