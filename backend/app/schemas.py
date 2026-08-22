"""Pydantic schemas for API request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Task Schemas ──────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    difficulty: str = "medium"
    goal_id: Optional[int] = None
    xp_reward: int = 10
    estimated_minutes: int = 25


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None
    estimated_minutes: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    status: str
    xp_reward: int
    estimated_minutes: int
    goal_id: Optional[int]
    order_index: int
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class TaskCompleteResponse(BaseModel):
    task: TaskResponse
    xp_earned: int
    new_total_xp: int
    new_level: int
    level_up: bool
    pet_state: str
    pet_message: str
    achievements_unlocked: List[str] = []


# ── Goal Schemas ──────────────────────────────────────

class GoalCreate(BaseModel):
    title: str
    description: str = ""
    difficulty: str = "medium"


class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    status: str
    progress: float
    created_at: datetime
    completed_at: Optional[datetime]
    tasks: List[TaskResponse] = []

    class Config:
        from_attributes = True


# ── Pet Schemas ───────────────────────────────────────

class PetResponse(BaseModel):
    id: int
    name: str
    state: str
    energy: float
    happiness: float
    focus_score: float
    confidence: float
    productivity_score: float
    current_message: str

    class Config:
        from_attributes = True


class PetFullResponse(BaseModel):
    pet: PetResponse
    user_xp: int
    user_level: int
    xp_for_next_level: int
    streak_days: int
    total_focus_minutes: int
    total_tasks_completed: int


# ── Focus Schemas ─────────────────────────────────────

class FocusStartRequest(BaseModel):
    task_id: Optional[int] = None
    duration_minutes: int = 25


class FocusSessionResponse(BaseModel):
    id: int
    task_id: Optional[int]
    duration_minutes: int
    elapsed_minutes: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class FocusCompleteResponse(BaseModel):
    session: FocusSessionResponse
    xp_earned: int
    new_total_xp: int
    pet_state: str
    pet_message: str


# ── Agent Schemas ─────────────────────────────────────

class AgentChatRequest(BaseModel):
    message: str


class PlanTask(BaseModel):
    title: str
    difficulty: str = "medium"
    estimated_minutes: int = 25
    xp_reward: int = 10


class AgentPlan(BaseModel):
    goal_title: str
    goal_difficulty: str = "medium"
    tasks: List[PlanTask] = []
    total_estimated_minutes: int = 0
    recommended_action: str = ""


class AgentResponse(BaseModel):
    intent: str
    message: str
    pet_state: str = "encouraging"
    plan: Optional[AgentPlan] = None
    motivation: Optional[str] = None
    insight: Optional[str] = None
    next_action: Optional[str] = None


# ── Analytics Schemas ─────────────────────────────────

class AnalyticsResponse(BaseModel):
    productivity_score: float
    tasks_completed: int
    total_tasks: int
    completion_rate: float
    focus_minutes: int
    streak_days: int
    xp_total: int
    level: int
    hard_tasks_completed: int
    consistency_score: float
    daily_data: List[dict] = []


class DailyAnalytics(BaseModel):
    date: str
    tasks_completed: int
    focus_minutes: int
    xp_earned: int
    productivity_score: float


# ── Achievement Schemas ───────────────────────────────

class AchievementResponse(BaseModel):
    id: int
    key: str
    title: str
    description: str
    icon: str
    target_value: int
    category: str
    progress: int = 0
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None


# ── Memory Schemas ────────────────────────────────────

class MemoryCreate(BaseModel):
    content: str
    memory_type: str = "general"
    importance: float = 0.5


class MemoryResponse(BaseModel):
    id: int
    content: str
    memory_type: str
    importance: float
    created_at: datetime

    class Config:
        from_attributes = True
