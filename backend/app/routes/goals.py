"""Goal API routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Goal, Task, User, ProductivityEvent, EventType, Difficulty, TaskStatus
from app.schemas import GoalCreate, GoalResponse

router = APIRouter(prefix="/api/goals", tags=["goals"])
USER_ID = 1


@router.get("", response_model=list[GoalResponse])
def list_goals(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Goal).filter(Goal.user_id == USER_ID)
    if status:
        q = q.filter(Goal.status == status)
    goals = q.order_by(Goal.created_at.desc()).all()

    # Attach tasks
    result = []
    for g in goals:
        tasks = db.query(Task).filter(Task.goal_id == g.id).order_by(Task.order_index).all()
        goal_dict = GoalResponse(
            id=g.id,
            title=g.title,
            description=g.description,
            difficulty=g.difficulty.value if g.difficulty else "medium",
            status=g.status,
            progress=g.progress,
            created_at=g.created_at,
            completed_at=g.completed_at,
            tasks=[],
        )
        goal_dict.tasks = tasks
        result.append(goal_dict)
    return result


@router.post("", response_model=GoalResponse)
def create_goal(data: GoalCreate, db: Session = Depends(get_db)):
    diff = Difficulty(data.difficulty) if data.difficulty in [d.value for d in Difficulty] else Difficulty.medium
    goal = Goal(
        user_id=USER_ID,
        title=data.title,
        description=data.description,
        difficulty=diff,
    )
    db.add(goal)

    event = ProductivityEvent(user_id=USER_ID, event_type=EventType.goal_created, data={"title": data.title})
    db.add(event)

    db.commit()
    db.refresh(goal)
    return goal


@router.post("/from-plan")
def create_goal_from_plan(plan: dict, db: Session = Depends(get_db)):
    """Create a goal and its tasks from an AI-generated plan."""
    goal_title = plan.get("goal_title", "New Goal")
    goal_difficulty = plan.get("goal_difficulty", "medium")
    tasks_data = plan.get("tasks", [])

    diff = Difficulty(goal_difficulty) if goal_difficulty in [d.value for d in Difficulty] else Difficulty.medium
    goal = Goal(
        user_id=USER_ID,
        title=goal_title,
        difficulty=diff,
    )
    db.add(goal)
    db.flush()

    created_tasks = []
    for i, t in enumerate(tasks_data):
        task_diff = Difficulty(t.get("difficulty", "medium")) if t.get("difficulty") in [d.value for d in Difficulty] else Difficulty.medium
        task = Task(
            user_id=USER_ID,
            goal_id=goal.id,
            title=t.get("title", "Task"),
            difficulty=task_diff,
            xp_reward=t.get("xp_reward", 10),
            estimated_minutes=t.get("estimated_minutes", 25),
            order_index=i,
        )
        db.add(task)
        created_tasks.append(task)

    event = ProductivityEvent(
        user_id=USER_ID,
        event_type=EventType.goal_created,
        data={"title": goal_title, "tasks_count": len(tasks_data)}
    )
    db.add(event)

    db.commit()
    db.refresh(goal)

    return {
        "goal_id": goal.id,
        "title": goal.title,
        "tasks_created": len(created_tasks),
    }
