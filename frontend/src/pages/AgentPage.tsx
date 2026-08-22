import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetRenderer } from '../components/PetAgent/PetRenderer';
import { PetSpeech } from '../components/PetAgent/PetSpeech';
import { PetHUD } from '../components/PetAgent/PetHUD';
import { AgentInput } from '../components/Agent/AgentInput';
import { AgentThinking } from '../components/Agent/AgentThinking';
import { AgentPlanCard } from '../components/Agent/AgentPlanCard';
import { TaskList } from '../components/Tasks/TaskList';
import { TaskCreator } from '../components/Tasks/TaskCreator';
import {
  PetFullData,
  Task,
  AgentResponse,
  AgentPlan,
  PetState,
} from '../services/types';
import {
  sendAgentMessage,
  createGoalFromPlan,
  createTask,
  completeTask,
  deleteTask,
} from '../services/api';
import { sound } from '../utils/audio';

import { eventBus } from '../utils/events';

interface AgentPageProps {
  petData: PetFullData | null;
  tasks: Task[];
  onRefreshData: () => void;
  onStartFocus: (task?: Task | null) => void;
}

export const AgentPage: React.FC<AgentPageProps> = ({
  petData,
  tasks,
  onRefreshData,
  onStartFocus,
}) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCompletingId, setIsCompletingId] = useState<number | null>(null);

  // Local override for pet state/message during immediate interactions
  const [overrideState, setOverrideState] = useState<PetState | null>(null);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  const pet = petData?.pet;
  const currentPetState = overrideState || (isThinking ? 'thinking' : pet?.state || 'idle');
  const currentPetMessage =
    overrideMessage ||
    (isThinking
      ? 'Analyzing your request...'
      : pet?.current_message || "Hey! I'm ready when you are. What are we working on?");

  // Handle Command Bar Submit
  const handleCommandSubmit = async (prompt: string) => {
    setIsThinking(true);
    setOverrideState('thinking');
    setActivePlan(null);

    try {
      const res: AgentResponse = await sendAgentMessage(prompt);
      sound.playResponseArrival();

      setIsThinking(false);
      setOverrideState(res.pet_state || 'encouraging');
      setOverrideMessage(res.message);

      if (res.plan && res.plan.tasks && res.plan.tasks.length > 0) {
        setActivePlan(res.plan);
      }

      onRefreshData();
    } catch (err) {
      console.error('Agent chat error:', err);
      setIsThinking(false);
      setOverrideState('concerned');
      setOverrideMessage("Connection blip. Don't worry, let's keep working!");
    }
  };

  // Convert AI Plan into Real Database Tasks
  const handleAddPlanTasks = async () => {
    if (!activePlan) return;
    setIsAddingPlan(true);
    try {
      await createGoalFromPlan(activePlan);
      sound.playTaskComplete();
      setIsAddingPlan(false);
      setActivePlan(null);
      setOverrideState('happy');
      setOverrideMessage(`Awesome! Added ${activePlan.tasks.length} tasks to your active queue.`);
      onRefreshData();
    } catch (err) {
      console.error('Failed to add tasks from plan:', err);
      setIsAddingPlan(false);
    }
  };

  // Start Focus session immediately with first plan task
  const handleStartPlanNow = async () => {
    if (!activePlan) return;
    await handleAddPlanTasks();
    onStartFocus(null);
  };

  // Task Completion Flow
  const handleCompleteTask = async (taskId: number) => {
    setIsCompletingId(taskId);
    try {
      const res = await completeTask(taskId);
      setIsCompletingId(null);
      setOverrideState(res.pet_state || 'happy');
      setOverrideMessage(res.pet_message || 'Task complete! +XP awarded.');

      // Emit global events for floating companion and other reactive components
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

  // Task Creation Flow
  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      sound.playTaskComplete();
      onRefreshData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Task Deletion Flow
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
      {/* ── LIVING PET HERO STAGE ── */}
      <section className="flex flex-col items-center justify-center pt-2">
        {/* Animated Pet Companion */}
        <div className="relative">
          <PetRenderer
            state={currentPetState}
            size="lg"
            onClick={() => {
              setOverrideState('happy');
              setOverrideMessage("I'm right here with you! Let's get things done.");
              sound.playResponseArrival();
            }}
          />
        </div>

        {/* Dynamic Holographic Speech Bubble */}
        <PetSpeech
          message={currentPetMessage}
          petState={currentPetState}
          petName={pet?.name || 'Nova'}
        />

        {/* Live Productivity Signals HUD */}
        {pet && <PetHUD pet={pet} />}
      </section>

      {/* ── AGENT COMMAND INTERFACE ── */}
      <section>
        <AgentInput onSubmit={handleCommandSubmit} isLoading={isThinking} />

        {/* Thinking Indicator */}
        <AnimatePresence>{isThinking && <AgentThinking />}</AnimatePresence>

        {/* Active AI Plan Card */}
        <AnimatePresence>
          {activePlan && !isThinking && (
            <AgentPlanCard
              plan={activePlan}
              onAddTasks={handleAddPlanTasks}
              onStartNow={handleStartPlanNow}
              isAdding={isAddingPlan}
            />
          )}
        </AnimatePresence>
      </section>

      {/* ── TODAY'S TASK QUEUE ── */}
      <section className="pt-4">
        <TaskList
          tasks={tasks}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onStartFocus={onStartFocus}
          onCreateNew={() => setIsCreatorOpen(true)}
          isCompletingId={isCompletingId}
        />
      </section>

      {/* Task Creator Modal */}
      <TaskCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
