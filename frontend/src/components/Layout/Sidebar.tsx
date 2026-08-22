import React from 'react';
import { Bot, CheckSquare, Target, Flame, BarChart3, Trophy } from 'lucide-react';

export type TabType = 'agent' | 'tasks' | 'focus' | 'progress' | 'achievements';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  tasksCount = 0,
}) => {
  const navItems = [
    { id: 'agent' as TabType, label: 'Agent', icon: Bot, badge: null },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare, badge: tasksCount > 0 ? tasksCount : null },
    { id: 'focus' as TabType, label: 'Focus', icon: Flame, badge: null },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3, badge: null },
    { id: 'achievements' as TabType, label: 'Achieve', icon: Trophy, badge: null },
  ];

  return (
    <aside className="w-full md:w-56 shrink-0 md:h-[calc(100vh-65px)] glass-panel border-r border-white/5 p-3 flex md:flex-col justify-around md:justify-start gap-1.5 z-30">
      <div className="hidden md:block px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
        Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{item.label}</span>
            </div>

            {item.badge !== null && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
};
