import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ArrowRight,
  Zap,
  Calendar,
  Flame,
  Target,
  Play,
  Plus,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { AgentResponse, AgentPlan, Task } from '../../services/types';
import {
  sendAgentMessage,
  getNextAction,
  generateMotivation,
  createGoalFromPlan,
} from '../../services/api';
import { sound } from '../../utils/audio';

interface FloatingPetBubbleProps {
  onClose: () => void;
  onStartFocus?: (task?: Task | null, duration?: number) => void;
  onRefreshData?: () => void;
  onStateOverride: (state: any, message: string) => void;
  tasks?: Task[];
}

export const FloatingPetBubble: React.FC<FloatingPetBubbleProps> = ({
  onClose,
  onStartFocus,
  onRefreshData,
  onStateOverride,
  tasks = [],
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [isAddingTasks, setIsAddingTasks] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setResponse(null);
    setActivePlan(null);
    onStateOverride('thinking', 'Analyzing your request...');
    sound.playThinkingStart();

    try {
      const res = await sendAgentMessage(text.trim());
      sound.playResponseArrival();
      setResponse(res);
      setIsLoading(false);
      onStateOverride(res.pet_state || 'encouraging', res.message);

      if (res.plan && res.plan.tasks && res.plan.tasks.length > 0) {
        setActivePlan(res.plan);
      }
      onRefreshData?.();
    } catch (err) {
      console.error('Floating chat error:', err);
      setIsLoading(false);
      onStateOverride('concerned', "Connection blip. Let's try again in a moment!");
    }
  };

  const handleNextAction = async () => {
    setIsLoading(true);
    onStateOverride('thinking', 'Checking your workload...');
    sound.playThinkingStart();

    try {
      const res = await getNextAction();
      sound.playResponseArrival();
      setIsLoading(false);
      setResponse({
        intent: 'next_action',
        message: res.next_action,
        pet_state: (res.pet_state as any) || 'encouraging',
        next_action: res.next_action,
      });
      onStateOverride((res.pet_state as any) || 'encouraging', res.next_action);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleMotivation = async () => {
    setIsLoading(true);
    onStateOverride('thinking', 'Gathering inspiration...');
    sound.playThinkingStart();

    try {
      const res = await generateMotivation();
      sound.playResponseArrival();
      setIsLoading(false);
      setResponse({
        intent: 'motivation',
        message: res.motivation,
        pet_state: (res.pet_state as any) || 'encouraging',
        motivation: res.motivation,
      });
      onStateOverride((res.pet_state as any) || 'encouraging', res.motivation);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleAddPlanTasks = async () => {
    if (!activePlan) return;
    setIsAddingTasks(true);
    try {
      await createGoalFromPlan(activePlan);
      sound.playTaskComplete();
      setIsAddingTasks(false);
      setActivePlan(null);
      onStateOverride('happy', `Added ${activePlan.tasks.length} tasks! Ready to build momentum.`);
      onRefreshData?.();
    } catch (err) {
      setIsAddingTasks(false);
      console.error(err);
    }
  };

  const handleStartPlanFocus = async () => {
    if (!activePlan) return;
    await handleAddPlanTasks();
    onStartFocus?.(null, 25);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-full right-0 mb-3 w-80 sm:w-96 rounded-3xl glass-panel-glow border border-cyan-500/40 p-4 shadow-2xl z-50 text-slate-100 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            AI Companion
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close companion menu"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Command Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(inputVal);
          setInputVal('');
        }}
        className="relative mb-3"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isLoading}
          placeholder="Ask Nova... (e.g. 'Plan my ML project')"
          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isLoading}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-all"
        >
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {/* Quick Action Chips */}
      {!response && !isLoading && (
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            onClick={() => handleSubmit('Help me plan today.')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-[11px] font-medium text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all text-left"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Plan My Day</span>
          </button>

          <button
            onClick={() => onStartFocus?.(null, 25)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-[11px] font-medium text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all text-left"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Start 25m Focus</span>
          </button>

          <button
            onClick={handleNextAction}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-[11px] font-medium text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all text-left"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">What's Next?</span>
          </button>

          <button
            onClick={handleMotivation}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-[11px] font-medium text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all text-left"
          >
            <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">Motivation</span>
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-4 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Thinking & organizing next steps...</span>
        </div>
      )}

      {/* Mini Response Area */}
      {response && !isLoading && (
        <div className="space-y-2 mt-2">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed">
            "{response.message}"
          </div>

          {/* Mini Plan Breakdown */}
          {activePlan && (
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
                <span className="truncate">{activePlan.goal_title}</span>
                <span>+{activePlan.tasks.reduce((sum, t) => sum + (t.xp_reward || 10), 0)} XP</span>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {activePlan.tasks.map((task, i) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-slate-900/60 text-slate-300"
                  >
                    <span className="truncate flex items-center gap-1">
                      <span className="text-cyan-400 font-mono">0{i + 1}</span>
                      {task.title}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold shrink-0">
                      +{task.xp_reward}XP
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={handleAddPlanTasks}
                  disabled={isAddingTasks}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span>{isAddingTasks ? 'Adding...' : 'Add Tasks'}</span>
                </button>
                <button
                  onClick={handleStartPlanFocus}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[10px] font-bold text-slate-950 flex items-center gap-1 shadow-md"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Start Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
