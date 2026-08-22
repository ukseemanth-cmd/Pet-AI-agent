"""
Agent Service — Orchestrates the full agent pipeline.
User Input → Intent → Context → AI → Plan → Pet State → DB Update.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import (
    User, Pet, Goal, Task, AgentSession, AgentMessage,
    ProductivityEvent, EventType, TaskStatus, Difficulty, DailyStat
)
from app.services import ai_provider, memory_service, behavior_engine
from app.config import settings

logger = logging.getLogger(__name__)


def _get_user_context(db: Session, user_id: int) -> dict:
    """Build full context for AI from user's data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    # Active goals
    goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.status == "active"
    ).all()
    goals_data = [{"title": g.title, "difficulty": g.difficulty.value if g.difficulty else "medium", "progress": g.progress} for g in goals]

    # Current tasks
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.status.in_([TaskStatus.todo, TaskStatus.in_progress])
    ).order_by(Task.order_index).all()
    tasks_data = [
        {"title": t.title, "status": t.status.value, "difficulty": t.difficulty.value if t.difficulty else "medium", "estimated_minutes": t.estimated_minutes}
        for t in tasks
    ]

    # Stats
    stats = {
        "xp": user.xp,
        "level": user.level,
        "streak": user.streak_days,
        "total_tasks_completed": user.total_tasks_completed,
        "total_focus_minutes": user.total_focus_minutes,
    }

    # Today's stats
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily = db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.date == today
    ).first()
    if daily:
        stats["tasks_completed_today"] = daily.tasks_completed
        stats["focus_minutes_today"] = daily.focus_minutes

    return {
        "goals": goals_data,
        "tasks": tasks_data,
        "stats": stats,
    }


async def process_chat(db: Session, user_id: int, message: str) -> dict:
    """
    Full agent pipeline:
    1. Build context
    2. Retrieve memories
    3. Call AI (or fallback)
    4. Process response
    5. Update pet state
    6. Store memory
    """
    # 1. Build context
    context = _get_user_context(db, user_id)

    # 2. Retrieve relevant memories
    memories = memory_service.get_relevant_memories(db, user_id, message)
    context["memories"] = memories

    # 3. Create agent session
    session = AgentSession(user_id=user_id)
    db.add(session)
    db.flush()

    # Store user message
    user_msg = AgentMessage(
        session_id=session.id,
        role="user",
        content=message,
    )
    db.add(user_msg)

    # 4. Call AI or fallback
    result = None
    if settings.ai_available:
        try:
            result = await ai_provider.generate_agent_response(message, context)
        except Exception as e:
            logger.error("AI provider error: %s", str(e))

    if not result:
        # Fallback: detect intent and generate response
        result = _fallback_response(message, context)

    # 5. Store assistant message
    assistant_msg = AgentMessage(
        session_id=session.id,
        role="assistant",
        content=result.get("message", ""),
        intent=result.get("intent"),
        structured_data=result,
    )
    db.add(assistant_msg)

    # 6. Update pet state
    pet_state = result.get("pet_state", "encouraging")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if pet:
        from app.models.models import PetStateEnum
        try:
            pet.state = PetStateEnum(pet_state)
        except ValueError:
            pet.state = PetStateEnum.encouraging
        pet.current_message = result.get("message", "")
        pet.updated_at = datetime.now(timezone.utc)

    # 7. Store memory of this interaction
    memory_service.auto_create_memory(
        db, user_id,
        event_type="agent_chat",
        details=f"User asked: {message[:100]}. Agent intent: {result.get('intent', 'general')}",
    )

    db.commit()
    return result


def _fallback_response(message: str, context: dict) -> dict:
    """Deterministic fallback when AI is unavailable."""
    msg_lower = message.lower()

    # Intent detection via keywords
    if any(kw in msg_lower for kw in ["finish", "complete", "build", "create", "project", "goal", "need to", "want to", "have to"]):
        # Goal breakdown
        goal_title = message.strip().rstrip(".")
        if goal_title.lower().startswith(("i need to ", "i want to ", "i have to ", "help me ")):
            goal_title = goal_title.split(" ", 3)[-1] if len(goal_title.split(" ", 3)) > 3 else goal_title
        return ai_provider.fallback_goal_breakdown(goal_title.title())

    elif any(kw in msg_lower for kw in ["what should", "next", "suggest", "recommend"]):
        tasks = context.get("tasks", [])
        action = ai_provider.fallback_next_action(tasks)
        return {
            "intent": "next_action",
            "message": action,
            "pet_state": "encouraging",
            "next_action": action,
        }

    elif any(kw in msg_lower for kw in ["motivat", "procrastinat", "stuck", "behind", "can't", "struggling"]):
        stats = context.get("stats", {})
        motivation = ai_provider.fallback_motivation(stats)
        return {
            "intent": "motivation",
            "message": motivation,
            "pet_state": "encouraging",
            "motivation": motivation,
        }

    elif any(kw in msg_lower for kw in ["plan", "today", "schedule"]):
        tasks = context.get("tasks", [])
        if tasks:
            task_list = ", ".join(t["title"] for t in tasks[:3])
            return {
                "intent": "daily_planning",
                "message": f"Here's what's on your plate: {task_list}. Let's start with the first one.",
                "pet_state": "encouraging",
                "next_action": f"Start with: {tasks[0]['title']}",
            }
        return {
            "intent": "daily_planning",
            "message": "Your slate is clean! Tell me what you want to accomplish today.",
            "pet_state": "happy",
        }

    elif any(kw in msg_lower for kw in ["focus", "concentrate", "pomodoro", "timer"]):
        return {
            "intent": "focus_recommendation",
            "message": "Let's do a 25-minute focus session. Pick a task and let's lock in.",
            "pet_state": "focused",
        }

    else:
        return {
            "intent": "general",
            "message": "I'm here to help! Tell me about a goal you want to accomplish, or ask me to plan your day.",
            "pet_state": "idle",
        }


async def breakdown_goal(db: Session, user_id: int, goal_title: str) -> dict:
    """Dedicated goal breakdown endpoint."""
    context = _get_user_context(db, user_id)

    result = None
    if settings.ai_available:
        try:
            result = await ai_provider.break_down_goal(goal_title, context)
        except Exception as e:
            logger.error("AI goal breakdown error: %s", str(e))

    if not result:
        result = ai_provider.fallback_goal_breakdown(goal_title)

    # Update pet state
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if pet:
        from app.models.models import PetStateEnum
        pet.state = PetStateEnum.encouraging
        pet.current_message = result.get("message", "Let's break this down.")

    # Store memory
    memory_service.auto_create_memory(
        db, user_id,
        event_type="plan_created",
        details=f"Created plan for: {goal_title}",
    )

    db.commit()
    return result


async def get_next_action(db: Session, user_id: int) -> dict:
    """Get the recommended next action."""
    context = _get_user_context(db, user_id)

    action = None
    if settings.ai_available:
        try:
            action = await ai_provider.generate_next_action(context)
        except Exception as e:
            logger.error("AI next action error: %s", str(e))

    if not action:
        tasks = context.get("tasks", [])
        action = ai_provider.fallback_next_action(tasks)

    return {"next_action": action, "pet_state": "encouraging"}


async def get_motivation(db: Session, user_id: int) -> dict:
    """Get a contextual motivation message."""
    context = _get_user_context(db, user_id)

    motivation = None
    if settings.ai_available:
        try:
            motivation = await ai_provider.generate_motivation(context)
        except Exception as e:
            logger.error("AI motivation error: %s", str(e))

    if not motivation:
        motivation = ai_provider.fallback_motivation(context.get("stats", {}))

    return {"motivation": motivation, "pet_state": "encouraging"}


async def get_insight(db: Session, user_id: int) -> dict:
    """Get a productivity insight."""
    context = _get_user_context(db, user_id)

    # Add daily data
    daily_stats = db.query(DailyStat).filter(
        DailyStat.user_id == user_id
    ).order_by(DailyStat.date.desc()).limit(14).all()
    context["daily_data"] = [
        {"date": d.date, "tasks": d.tasks_completed, "focus": d.focus_minutes, "score": d.productivity_score}
        for d in daily_stats
    ]

    result = None
    if settings.ai_available:
        try:
            result = await ai_provider.generate_insight(context)
        except Exception as e:
            logger.error("AI insight error: %s", str(e))

    if not result:
        result = {
            "insight": "Keep building momentum with consistent daily sessions.",
            "trend": "stable",
            "strength": "You're showing up.",
            "suggestion": "Try a 25-minute focus session to boost your productivity score.",
            "pet_state": "encouraging",
        }

    return result
