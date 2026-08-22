import { PetState, Task } from '../../services/types';

export type FloatingPetSize = 'sm' | 'md' | 'lg';

export interface FloatingPosition {
  x: number;
  y: number;
}

export interface FloatingNotification {
  id: string;
  type: 'xp' | 'message' | 'level' | 'achievement';
  content: string;
  subContent?: string;
  xpAmount?: number;
  createdAt: number;
}

export interface FloatingPetProps {
  petState?: PetState;
  petMessage?: string;
  currentXP?: number;
  level?: number;
  streakDays?: number;
  isFocusMode?: boolean;
  tasks?: Task[];
  onRefreshData?: () => void;
  onStartFocus?: (task?: Task | null, duration?: number) => void;
}
