"""
AI Provider — Clean abstraction over the AI service.
Implements specialized functions for different agent capabilities.
Falls back to deterministic responses when AI is unavailable.
"""
import json
import logging
from typing import Optional
from app.integrations import memcode_client
from app.services.prompts import (
    GOAL_BREAKDOWN_PROMPT,
    MOTIVATION_PROMPT,
    INSIGHT_PROMPT,
    NEXT_ACTION_PROMPT,
    DAILY_PLANNING_PROMPT,
    AGENT_CHAT_PROMPT,
)

logger = logging.getLogger(__name__)


async def generate_agent_response(
    user_message: str,
    context: dict,
) -> Optional[dict]:
    """
    Generate a full agent response to a user message.
    Returns structured JSON with intent, plan, message, pet_state.
    """
    system_prompt = AGENT_CHAT_PROMPT.format(
        goals=json.dumps(context.get("goals", []), default=str),
        tasks=json.dumps(context.get("tasks", []), default=str),
        stats=json.dumps(context.get("stats", {}), default=str),
        memories=json.dumps(context.get("memories", []), default=str),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    result = await memcode_client.generate_structured(messages, temperature=0.7)
    if result:
        return result
    return None


async def break_down_goal(
    goal_title: str,
    context: dict,
) -> Optional[dict]:
    """Break down a goal into actionable tasks."""
    system_prompt = GOAL_BREAKDOWN_PROMPT.format(
        current_tasks=json.dumps(context.get("tasks", []), default=str),
        stats=json.dumps(context.get("stats", {}), default=str),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Break down this goal: {goal_title}"},
    ]

    result = await memcode_client.generate_structured(messages, temperature=0.6)
    if result:
        return result
    return None


async def generate_motivation(
    context: dict,
) -> Optional[str]:
    """Generate a contextual motivation message."""
    system_prompt = MOTIVATION_PROMPT.format(
        stats=json.dumps(context.get("stats", {}), default=str),
        recent_activity=json.dumps(context.get("recent_activity", []), default=str),
        streak=context.get("streak", 0),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Give me motivation based on my current state."},
    ]

    response = await memcode_client.chat(messages, temperature=0.8, max_tokens=200)
    return response


async def generate_insight(
    context: dict,
) -> Optional[dict]:
    """Generate a productivity insight."""
    system_prompt = INSIGHT_PROMPT.format(
        stats=json.dumps(context.get("stats", {}), default=str),
        daily_data=json.dumps(context.get("daily_data", []), default=str),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Analyze my productivity patterns."},
    ]

    result = await memcode_client.generate_structured(messages, temperature=0.5)
    if result:
        return result
    return None


async def analyze_productivity(context: dict) -> Optional[dict]:
    """Analyze productivity trends and provide recommendations."""
    return await generate_insight(context)


async def generate_next_action(
    context: dict,
) -> Optional[str]:
    """Suggest the next best action."""
    system_prompt = NEXT_ACTION_PROMPT.format(
        tasks=json.dumps(context.get("tasks", []), default=str),
        stats=json.dumps(context.get("stats", {}), default=str),
        time_of_day=context.get("time_of_day", "afternoon"),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "What should I work on next?"},
    ]

    response = await memcode_client.chat(messages, temperature=0.6, max_tokens=200)
    return response


# ── Fallback Responses ─────────────────────────────────

def fallback_goal_breakdown(goal_title: str) -> dict:
    """Deterministic fallback when AI is unavailable."""
    words = goal_title.lower().split()
    is_study = any(w in words for w in ["study", "exam", "learn", "course", "class"])
    is_project = any(w in words for w in ["project", "build", "create", "develop", "app"])
    is_write = any(w in words for w in ["write", "paper", "essay", "report", "article"])

    if is_project:
        tasks = [
            {"title": "Research and gather requirements", "difficulty": "easy", "estimated_minutes": 30, "xp_reward": 10},
            {"title": "Set up project structure", "difficulty": "easy", "estimated_minutes": 20, "xp_reward": 10},
            {"title": "Implement core functionality", "difficulty": "hard", "estimated_minutes": 60, "xp_reward": 35},
            {"title": "Add features and polish", "difficulty": "medium", "estimated_minutes": 45, "xp_reward": 20},
            {"title": "Test and review", "difficulty": "medium", "estimated_minutes": 30, "xp_reward": 20},
            {"title": "Prepare documentation/demo", "difficulty": "easy", "estimated_minutes": 25, "xp_reward": 10},
        ]
    elif is_study:
        tasks = [
            {"title": "Review key concepts", "difficulty": "easy", "estimated_minutes": 25, "xp_reward": 10},
            {"title": "Take notes on important topics", "difficulty": "medium", "estimated_minutes": 30, "xp_reward": 20},
            {"title": "Practice problems", "difficulty": "hard", "estimated_minutes": 45, "xp_reward": 35},
            {"title": "Review weak areas", "difficulty": "medium", "estimated_minutes": 30, "xp_reward": 20},
            {"title": "Final review and self-test", "difficulty": "medium", "estimated_minutes": 25, "xp_reward": 20},
        ]
    elif is_write:
        tasks = [
            {"title": "Outline structure", "difficulty": "easy", "estimated_minutes": 20, "xp_reward": 10},
            {"title": "Research and gather sources", "difficulty": "medium", "estimated_minutes": 35, "xp_reward": 20},
            {"title": "Write first draft", "difficulty": "hard", "estimated_minutes": 60, "xp_reward": 35},
            {"title": "Revise and edit", "difficulty": "medium", "estimated_minutes": 30, "xp_reward": 20},
            {"title": "Final review", "difficulty": "easy", "estimated_minutes": 15, "xp_reward": 10},
        ]
    else:
        tasks = [
            {"title": f"Plan approach for: {goal_title}", "difficulty": "easy", "estimated_minutes": 15, "xp_reward": 10},
            {"title": "Gather resources and materials", "difficulty": "easy", "estimated_minutes": 20, "xp_reward": 10},
            {"title": "Work on main deliverable", "difficulty": "hard", "estimated_minutes": 45, "xp_reward": 35},
            {"title": "Review and refine", "difficulty": "medium", "estimated_minutes": 25, "xp_reward": 20},
            {"title": "Finalize and wrap up", "difficulty": "easy", "estimated_minutes": 15, "xp_reward": 10},
        ]

    total_min = sum(t["estimated_minutes"] for t in tasks)
    return {
        "intent": "goal_breakdown",
        "message": f"I've broken down '{goal_title}' into manageable steps. Let's tackle them one at a time.",
        "pet_state": "encouraging",
        "plan": {
            "goal_title": goal_title,
            "goal_difficulty": "medium",
            "tasks": tasks,
            "total_estimated_minutes": total_min,
            "recommended_action": f"Start with: {tasks[0]['title']}",
        }
    }


def fallback_motivation(stats: dict) -> str:
    """Deterministic fallback motivation."""
    streak = stats.get("streak", 0)
    tasks_done = stats.get("tasks_completed_today", 0)

    if streak >= 5:
        return f"You're on a {streak}-day streak! Keep that momentum going."
    if tasks_done >= 3:
        return "Solid progress today. Every completed task builds your confidence."
    if tasks_done > 0:
        return "You've started strong. Let's keep the momentum going."
    return "Ready to make today count? Even one small win matters."


def fallback_next_action(tasks: list) -> str:
    """Deterministic next action from task list."""
    todo = [t for t in tasks if t.get("status") == "todo"]
    in_progress = [t for t in tasks if t.get("status") == "in_progress"]

    if in_progress:
        return f"Continue working on: {in_progress[0].get('title', 'your current task')}"
    if todo:
        return f"Start with: {todo[0].get('title', 'your next task')}"
    return "All caught up! Set a new goal or take a well-deserved break."
