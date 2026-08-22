import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, CheckCircle, Clock, Flame, Zap, Shield, Sparkles } from 'lucide-react';
import { AnalyticsData } from '../services/types';
import { getAnalytics, generateInsight } from '../services/api';
import { ProductivityChart } from '../components/Analytics/ProductivityChart';
import { FocusChart } from '../components/Analytics/FocusChart';

import { CompanionProfileCard } from '../components/PetCustomization/CompanionProfileCard';

export const ProgressPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [data, ins] = await Promise.all([getAnalytics(), generateInsight()]);
        setAnalytics(data);
        setInsight(ins);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center p-20 text-cyan-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Productivity Score',
      value: Math.round(analytics.productivity_score),
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      suffix: '/100',
    },
    {
      label: 'Tasks Completed',
      value: analytics.tasks_completed,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      suffix: '',
    },
    {
      label: 'Focus Minutes',
      value: analytics.focus_minutes,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      suffix: 'm',
    },
    {
      label: 'Streak Consistency',
      value: `${analytics.streak_days}d`,
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      suffix: '',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Companion Personal Profile Overview */}
      <CompanionProfileCard
        userXP={analytics.xp_total}
        userLevel={analytics.level}
        xpForNextLevel={analytics.level * 100}
        streakDays={analytics.streak_days}
      />

      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Productivity Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            Real behavioral analysis evaluated by your autonomous pet engine
          </p>
        </div>
      </div>


      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-2xl glass-panel border ${c.border} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">{c.label}</span>
                <div className={`p-1.5 rounded-lg ${c.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl font-bold font-mono ${c.color}`}>{c.value}</span>
                <span className="text-xs text-slate-500 font-mono">{c.suffix}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Behavioral Insights Box */}
      {insight && (
        <div className="p-5 rounded-2xl glass-panel-glow border border-cyan-500/30">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Companion AI Assessment</span>
          </div>
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            "{insight.insight || insight.suggestion || "You're building steady momentum with consistent daily wins."}"
          </p>
          {insight.suggestion && (
            <div className="mt-2 text-xs text-cyan-300 font-mono">
              💡 Action Tip: {insight.suggestion}
            </div>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <div className="p-5 rounded-3xl glass-panel border border-white/5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Productivity Momentum
          </h3>
          <ProductivityChart data={analytics.daily_data} />
        </div>

        {/* Focus Minutes */}
        <div className="p-5 rounded-3xl glass-panel border border-white/5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Daily Deep Focus Time
          </h3>
          <FocusChart data={analytics.daily_data} />
        </div>
      </div>
    </div>
  );
};
