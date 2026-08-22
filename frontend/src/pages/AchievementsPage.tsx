import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { Achievement } from '../services/types';
import { getAchievements } from '../services/api';
import { AchievementCard } from '../components/Gamification/AchievementCard';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAchievements();
        setAchievements(data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Achievements & Milestones
          </h2>
          <p className="text-xs text-slate-400">
            Earn badges and level up your companion through consistent deep work
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
          {unlockedCount} / {achievements.length} Unlocked
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-cyan-400">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      )}
    </div>
  );
};
