export type PetState =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'excited'
  | 'sleepy'
  | 'tired'
  | 'concerned'
  | 'celebrating'
  | 'encouraging'
  | 'working'
  | 'focused';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'skipped';

export interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  xp_reward: number;
  estimated_minutes: number;
  goal_id?: number | null;
  order_index: number;
  created_at: string;
  completed_at?: string | null;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_at: string;
  completed_at?: string | null;
  tasks?: Task[];
}

export interface PetProfile {
  id: number;
  name: string;
  state: PetState;
  energy: number;
  happiness: number;
  focus_score: number;
  confidence: number;
  productivity_score: number;
  current_message: string;
  pet_type?: string;
  personality?: string;
  theme?: string;
  accessories?: string[];
  onboarding_done?: boolean;
}


export interface PetFullData {
  pet: PetProfile;
  user_xp: number;
  user_level: number;
  xp_for_next_level: number;
  streak_days: number;
  total_focus_minutes: number;
  total_tasks_completed: number;
}

export interface FocusSession {
  id: number;
  task_id?: number | null;
  duration_minutes: number;
  elapsed_minutes: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  started_at: string;
  completed_at?: string | null;
}

export interface Achievement {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  target_value: number;
  category: string;
  progress: number;
  unlocked: boolean;
  unlocked_at?: string | null;
}

export interface PlanTask {
  title: string;
  difficulty: TaskDifficulty;
  estimated_minutes: number;
  xp_reward: number;
}

export interface AgentPlan {
  goal_title: string;
  goal_difficulty: TaskDifficulty;
  tasks: PlanTask[];
  total_estimated_minutes: number;
  recommended_action: string;
}

export interface AgentResponse {
  intent: string;
  message: string;
  pet_state: PetState;
  plan?: AgentPlan | null;
  motivation?: string | null;
  insight?: string | null;
  next_action?: string | null;
}

export interface TaskCompleteResult {
  task: Task;
  xp_earned: number;
  new_total_xp: number;
  new_level: number;
  level_up: boolean;
  pet_state: PetState;
  pet_message: string;
  achievements_unlocked: string[];
}

export interface FocusCompleteResult {
  session: FocusSession;
  xp_earned: number;
  new_total_xp: number;
  pet_state: PetState;
  pet_message: string;
}

export interface DailyStatPoint {
  date: string;
  tasks_completed: number;
  focus_minutes: number;
  xp_earned: number;
  productivity_score?: number;
}

export interface AnalyticsData {
  productivity_score: number;
  tasks_completed: number;
  total_tasks: number;
  completion_rate: number;
  focus_minutes: number;
  streak_days: number;
  xp_total: number;
  level: number;
  hard_tasks_completed: number;
  consistency_score: number;
  daily_data: DailyStatPoint[];
}

export interface MemoryItem {
  id: number;
  content: string;
  memory_type: string;
  importance: number;
  created_at: string;
}
