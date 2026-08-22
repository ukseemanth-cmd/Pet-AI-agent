"""SQLAlchemy models for Productivity Pet — all 13 tables."""
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


# ── Enums ──────────────────────────────────────────────

class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"
    skipped = "skipped"


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class PetStateEnum(str, enum.Enum):
    idle = "idle"
    thinking = "thinking"
    happy = "happy"
    excited = "excited"
    sleepy = "sleepy"
    tired = "tired"
    concerned = "concerned"
    celebrating = "celebrating"
    encouraging = "encouraging"
    working = "working"
    focused = "focused"


class EventType(str, enum.Enum):
    task_created = "task_created"
    task_started = "task_started"
    task_completed = "task_completed"
    task_skipped = "task_skipped"
    focus_started = "focus_started"
    focus_completed = "focus_completed"
    goal_created = "goal_created"
    goal_completed = "goal_completed"
    login = "login"
    inactive_period = "inactive_period"
    achievement_unlocked = "achievement_unlocked"
    level_up = "level_up"


# ── Users ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, default="demo_user")
    display_name = Column(String(200), default="Explorer")
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_active_date = Column(String(10), default="")  # YYYY-MM-DD
    total_focus_minutes = Column(Integer, default=0)
    total_tasks_completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    pet = relationship("Pet", back_populates="user", uselist=False)
    goals = relationship("Goal", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    focus_sessions = relationship("FocusSession", back_populates="user")
    events = relationship("ProductivityEvent", back_populates="user")
    daily_stats = relationship("DailyStat", back_populates="user")
    xp_transactions = relationship("XPTransaction", back_populates="user")
    user_achievements = relationship("UserAchievement", back_populates="user")
    memories = relationship("Memory", back_populates="user")


# ── Pets ──────────────────────────────────────────────

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(100), default="Nova")
    state = Column(SAEnum(PetStateEnum), default=PetStateEnum.idle)
    energy = Column(Float, default=70.0)
    happiness = Column(Float, default=70.0)
    focus_score = Column(Float, default=50.0)
    confidence = Column(Float, default=60.0)
    productivity_score = Column(Float, default=50.0)
    current_message = Column(Text, default="Hey! I'm ready when you are.")
    last_state_change = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # ── Companion Personalization ─────────────────────────────
    pet_type = Column(String(50), default="nova")       # nova, cat, dog, fox, panda, bunny, dragon
    personality = Column(String(50), default="balanced")  # gentle, balanced, strict
    theme = Column(String(50), default="default")       # default, midnight, sunset, ocean, forest, neon
    accessories = Column(JSON, default=list)            # list of accessory strings
    onboarding_done = Column(Boolean, default=False)    # whether onboarding has been completed

    user = relationship("User", back_populates="pet")



# ── Goals ──────────────────────────────────────────────

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, default="")
    difficulty = Column(SAEnum(Difficulty), default=Difficulty.medium)
    status = Column(String(20), default="active")  # active, completed, archived
    progress = Column(Float, default=0.0)  # 0-100
    created_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")


# ── Tasks ──────────────────────────────────────────────

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, default="")
    difficulty = Column(SAEnum(Difficulty), default=Difficulty.medium)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.todo)
    xp_reward = Column(Integer, default=10)
    estimated_minutes = Column(Integer, default=25)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")


# ── Focus Sessions ──────────────────────────────────────

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    duration_minutes = Column(Integer, default=25)
    elapsed_minutes = Column(Integer, default=0)
    status = Column(String(20), default="active")  # active, paused, completed, cancelled
    started_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="focus_sessions")
    task = relationship("Task")


# ── Productivity Events ────────────────────────────────

class ProductivityEvent(Base):
    __tablename__ = "productivity_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(SAEnum(EventType), nullable=False)
    data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="events")


# ── Daily Stats ────────────────────────────────────────

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    tasks_completed = Column(Integer, default=0)
    tasks_created = Column(Integer, default=0)
    focus_minutes = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    productivity_score = Column(Float, default=0.0)
    hard_tasks_completed = Column(Integer, default=0)

    user = relationship("User", back_populates="daily_stats")


# ── XP Transactions ───────────────────────────────────

class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    reason = Column(String(200), nullable=False)
    source_type = Column(String(50), default="")  # task, focus, achievement, bonus
    source_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="xp_transactions")


# ── Achievements ───────────────────────────────────────

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    icon = Column(String(50), default="trophy")
    target_value = Column(Integer, default=1)
    category = Column(String(50), default="general")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    progress = Column(Integer, default=0)
    unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement")


# ── Memories ───────────────────────────────────────────

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    memory_type = Column(String(50), default="general")  # goal, pattern, preference, context
    importance = Column(Float, default=0.5)  # 0-1
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    last_accessed = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="memories")


# ── Agent Sessions ─────────────────────────────────────

class AgentSession(Base):
    __tablename__ = "agent_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=utcnow)
    ended_at = Column(DateTime, nullable=True)
    summary = Column(Text, default="")

    messages = relationship("AgentMessage", back_populates="session")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("agent_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    intent = Column(String(50), nullable=True)
    structured_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    session = relationship("AgentSession", back_populates="messages")
