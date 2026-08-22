import React, { useState } from 'react';
import { Task, Goal } from '../services/types';
import { TaskList } from '../components/Tasks/TaskList';
import { TaskCreator } from '../components/Tasks/TaskCreator';
import { createTask, completeTask, deleteTask } from '../services/api';
import { sound } from '../utils/audio';
import { eventBus } from '../utils/events';

interface TasksPageProps {
  tasks: Task[];
  goals: Goal[];
  onRefreshData: () => void;
  onStartFocus: (task?: Task | null) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  goals,
  onRefreshData,
  onStartFocus,
}) => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCompletingId, setIsCompletingId] = useState<number | null>(null);

  const handleCompleteTask = async (taskId: number) => {
    setIsCompletingId(taskId);
    try {
      const res = await completeTask(taskId);
      setIsCompletingId(null);
      sound.playTaskComplete();

      eventBus.emit('TASK_COMPLETED', {
        taskTitle: res.task.title,
        xp: res.xp_earned,
        difficulty: res.task.difficulty,
      });
      eventBus.emit('XP_EARNED', { amount: res.xp_earned, reason: res.task.title });

      if (res.level_up) {
        sound.playLevelUp();
        eventBus.emit('LEVEL_UP', { newLevel: res.new_level });
      }

      if (res.achievements_unlocked && res.achievements_unlocked.length > 0) {
        res.achievements_unlocked.forEach((title) => {
          eventBus.emit('ACHIEVEMENT_UNLOCKED', { title });
        });
      }

      onRefreshData();
    } catch (err) {
      console.error('Failed to complete task:', err);
      setIsCompletingId(null);
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      sound.playTaskComplete();
      onRefreshData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Task Management</h2>
          <p className="text-xs text-slate-400">Organize and execute your productivity backlog</p>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        onCompleteTask={handleCompleteTask}
        onDeleteTask={handleDeleteTask}
        onStartFocus={onStartFocus}
        onCreateNew={() => setIsCreatorOpen(true)}
        isCompletingId={isCompletingId}
      />

      <TaskCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
