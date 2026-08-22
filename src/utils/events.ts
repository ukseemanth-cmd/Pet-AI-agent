// Lightweight custom event bus for cross-component reactions without heavy state libraries

export type AppEventType =
  | 'TASK_COMPLETED'
  | 'XP_EARNED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'FOCUS_STARTED'
  | 'FOCUS_COMPLETED'
  | 'PET_STATE_CHANGED'
  | 'PROACTIVE_MESSAGE';

export interface AppEventPayload {
  TASK_COMPLETED: { taskTitle: string; xp: number; difficulty: string };
  XP_EARNED: { amount: number; reason?: string };
  LEVEL_UP: { newLevel: number };
  ACHIEVEMENT_UNLOCKED: { title: string };
  FOCUS_STARTED: { duration: number; taskTitle?: string };
  FOCUS_COMPLETED: { minutes: number; xp: number };
  PET_STATE_CHANGED: { state: string; message?: string };
  PROACTIVE_MESSAGE: { message: string; state?: string };
}

class EventBus {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  on<T extends AppEventType>(event: T, callback: (data: AppEventPayload[T]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off<T extends AppEventType>(event: T, callback: (data: AppEventPayload[T]) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit<T extends AppEventType>(event: T, data: AppEventPayload[T]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
