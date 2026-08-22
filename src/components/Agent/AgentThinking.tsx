import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Bot, Sparkles } from 'lucide-react';

interface AgentThinkingProps {
  onComplete?: () => void;
}

export const AgentThinking: React.FC<AgentThinkingProps> = () => {
  const steps = [
    'Understanding your goal',
    "Checking today's workload",
    'Building your plan',
    'Choosing your next action',
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-xl mx-auto my-6 p-5 rounded-2xl glass-panel-glow border border-cyan-500/40 shadow-xl text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Bot className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-sm font-semibold tracking-wider font-mono text-cyan-300 uppercase">
          Agent Processing
        </span>
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
      </div>

      {/* Progress Steps */}
      <div className="space-y-2.5 max-w-md mx-auto text-left">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                  : isDone
                  ? 'text-slate-400'
                  : 'text-slate-400 opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span>{step}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
