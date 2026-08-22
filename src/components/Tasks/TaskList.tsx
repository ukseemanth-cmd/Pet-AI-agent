import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ListTodo, Plus, Sparkles, Filter } from 'lucide-react';
import { Task, TaskStatus } from '../../services/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
  onStartFocus?: (task: Task) => void;
  onCreateNew?: () => void;
  title?: string;
  isCompletingId?: number | null;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onCompleteTask,
  onDeleteTask,
  onStartFocus,
  onCreateNew,
  title = "Today's Tasks",
  isCompletingId = null,
}) => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'todo') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cyan-400" />
            {title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>
              {completedCount} of {tasks.length} completed
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-cyan-400 font-semibold">{progressPercent}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'todo'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {onCreateNew && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateNew}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 rounded-2xl glass-panel border border-white/5 text-center my-4">
          <CheckCircle2 className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No tasks in this view</p>
          <p className="text-xs text-slate-400 mt-1">
            Ask your pet companion above to create a plan or add a task manually.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
                onStartFocus={onStartFocus}
                isCompleting={isCompletingId === task.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
