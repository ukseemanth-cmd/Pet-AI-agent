import {
  Task,
  Goal,
  PetFullData,
  FocusSession,
  Achievement,
  AgentResponse,
  TaskCompleteResult,
  FocusCompleteResult,
  AnalyticsData,
  MemoryItem,
  TaskDifficulty,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (err: any) {
    console.error(`Request failed: ${url}`, err);
    throw err;
  }
}

// ── Pet API ──

export async function getPet(): Promise<PetFullData> {
  return fetchJson<PetFullData>('/api/pet');
}

export async function recalculatePet(): Promise<any> {
  return fetchJson('/api/pet/recalculate', { method: 'POST' });
}

export async function getPetHistory(): Promise<any[]> {
  return fetchJson('/api/pet/history');
}

// ── Task API ──

export async function getTasks(status?: string, goalId?: number): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (goalId) params.append('goal_id', goalId.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchJson<Task[]>(`/api/tasks${query}`);
}

export async function createTask(data: {
  title: string;
  description?: string;
  difficulty?: TaskDifficulty;
  goal_id?: number | null;
  estimated_minutes?: number;
}): Promise<Task> {
  return fetchJson<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function completeTask(taskId: number): Promise<TaskCompleteResult> {
  return fetchJson<TaskCompleteResult>(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
  });
}

export async function updateTask(
  taskId: number,
  data: Partial<Pick<Task, 'title' | 'description' | 'difficulty' | 'status' | 'estimated_minutes'>>
): Promise<Task> {
  return fetchJson<Task>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(taskId: number): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// ── Goal API ──

export async function getGoals(status?: string): Promise<Goal[]> {
  const query = status ? `?status=${status}` : '';
  return fetchJson<Goal[]>(`/api/goals${query}`);
}

export async function createGoal(data: {
  title: string;
  description?: string;
  difficulty?: TaskDifficulty;
}): Promise<Goal> {
  return fetchJson<Goal>('/api/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createGoalFromPlan(plan: any): Promise<{
  goal_id: number;
  title: string;
  tasks_created: number;
}> {
  return fetchJson('/api/goals/from-plan', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
}

// ── Agent API ──

export async function sendAgentMessage(message: string): Promise<AgentResponse> {
  return fetchJson<AgentResponse>('/api/agent/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function breakdownGoal(message: string): Promise<AgentResponse> {
  return fetchJson<AgentResponse>('/api/agent/breakdown-goal', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function getNextAction(): Promise<{ next_action: string; pet_state: string }> {
  return fetchJson('/api/agent/next-action', { method: 'POST' });
}

export async function generateMotivation(): Promise<{ motivation: string; pet_state: string }> {
  return fetchJson('/api/agent/motivation', { method: 'POST' });
}

export async function generateInsight(): Promise<any> {
  return fetchJson('/api/agent/insight', { method: 'POST' });
}

// ── Focus API ──

export async function startFocusSession(data: {
  task_id?: number | null;
  duration_minutes?: number;
}): Promise<FocusSession> {
  return fetchJson<FocusSession>('/api/focus/start', {
    method: 'POST',
    body: JSON.stringify({
      task_id: data.task_id || null,
      duration_minutes: data.duration_minutes || 25,
    }),
  });
}

export async function completeFocusSession(
  sessionId: number,
  elapsedMinutes: number = 25
): Promise<FocusCompleteResult> {
  return fetchJson<FocusCompleteResult>(
    `/api/focus/${sessionId}/complete?elapsed_minutes=${elapsedMinutes}`,
    {
      method: 'POST',
    }
  );
}

export async function pauseFocusSession(sessionId: number): Promise<{ status: string }> {
  return fetchJson(`/api/focus/${sessionId}/pause`, { method: 'POST' });
}

// ── Analytics & Achievements ──

export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchJson<AnalyticsData>('/api/analytics');
}

export async function getAchievements(): Promise<Achievement[]> {
  return fetchJson<Achievement[]>('/api/achievements');
}

// ── Memory API ──

export async function getMemories(query?: string): Promise<MemoryItem[]> {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  return fetchJson<MemoryItem[]>(`/api/memory/search${q}`);
}

export async function storeMemory(content: string, memoryType = 'general', importance = 0.5): Promise<MemoryItem> {
  return fetchJson<MemoryItem>('/api/memory', {
    method: 'POST',
    body: JSON.stringify({ content, memory_type: memoryType, importance }),
  });
}
