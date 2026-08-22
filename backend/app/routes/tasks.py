"""Task API routes — CRUD + completion with XP/pet reactions."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Task, User, Pet, Goal, ProductivityEvent, DailyStat,
    TaskStatus, Difficulty, EventType, PetStateEnum, XPTransaction
)
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskCompleteResponse
from app.services import behavior_engine, memory_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

USER_ID = 1  # Demo single-user


def _ensure_daily_stat(db: Session, user_id: int) -> DailyStat:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    stat = db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.date == today
    ).first()
    if not stat:
        stat = DailyStat(user_id=user_id, date=today)
        db.add(stat)
        db.flush()
    return stat


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: str | None = None,
    goal_id: int | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Task).filter(Task.user_id == USER_ID)
    if status:
        q = q.filter(Task.status == status)
    if goal_id:
        q = q.filter(Task.goal_id == goal_id)
    return q.order_by(Task.order_index, Task.created_at.desc()).all()


@router.post("", response_model=TaskResponse)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    # Calculate XP reward based on difficulty
    diff = Difficulty(data.difficulty) if data.difficulty in [d.value for d in Difficulty] else Difficulty.medium
    xp = behavior_engine.calculate_task_xp(diff)

    task = Task(
        user_id=USER_ID,
        title=data.title,
        description=data.description,
        difficulty=diff,
        goal_id=data.goal_id,
        xp_reward=xp,
        estimated_minutes=data.estimated_minutes,
    )
    db.add(task)

    # Log event
    event = ProductivityEvent(user_id=USER_ID, event_type=EventType.task_created, data={"title": data.title})
    db.add(event)

    stat = _ensure_daily_stat(db, USER_ID)
    stat.tasks_created += 1

    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == USER_ID).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == USER_ID).first()
    if not task:
        raise HTTPException(404, "Task not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "difficulty" and value:
            setattr(task, key, Difficulty(value))
        elif key == "status" and value:
            setattr(task, key, TaskStatus(value))
        else:
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == USER_ID).first()
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.post("/{task_id}/complete", response_model=TaskCompleteResponse)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Complete a task — the core reward loop:
    1. Mark complete
    2. Award XP
    3. Update stats
    4. Recalculate pet state
    5. Check achievements
    6. Generate pet message
    """
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == USER_ID).first()
    if not task:
        raise HTTPException(404, "Task not found")

    if task.status == TaskStatus.completed:
        raise HTTPException(400, "Task already completed")

    user = db.query(User).filter(User.id == USER_ID).first()
    if not user:
        raise HTTPException(404, "User not found")

    now = datetime.now(timezone.utc)

    # 1. Mark complete
    task.status = TaskStatus.completed
    task.completed_at = now

    # 2. Award XP
    xp_earned = task.xp_reward or behavior_engine.calculate_task_xp(task.difficulty)
    old_level = user.level
    user.xp += xp_earned
    new_level = behavior_engine.level_from_xp(user.xp)
    user.level = new_level
    user.total_tasks_completed += 1
    user.last_active_date = now.strftime("%Y-%m-%d")

    # XP transaction
    xp_tx = XPTransaction(
        user_id=USER_ID,
        amount=xp_earned,
        reason=f"Completed: {task.title}",
        source_type="task",
        source_id=task.id,
    )
    db.add(xp_tx)

    # 3. Update daily stats
    stat = _ensure_daily_stat(db, USER_ID)
    stat.tasks_completed += 1
    stat.xp_earned += xp_earned
    if task.difficulty == Difficulty.hard:
        stat.hard_tasks_completed += 1

    # Log event
    event = ProductivityEvent(
        user_id=USER_ID,
        event_type=EventType.task_completed,
        data={"title": task.title, "difficulty": task.difficulty.value, "xp": xp_earned}
    )
    db.add(event)

    # Level up event
    level_up = new_level > old_level
    if level_up:
        level_event = ProductivityEvent(
            user_id=USER_ID,
            event_type=EventType.level_up,
            data={"new_level": new_level, "old_level": old_level}
        )
        db.add(level_event)

    db.flush()

    # 4. Update goal progress
    if task.goal_id:
        goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
        if goal:
            total_tasks = db.query(Task).filter(Task.goal_id == goal.id).count()
            done_tasks = db.query(Task).filter(
                Task.goal_id == goal.id,
                Task.status == TaskStatus.completed
            ).count()
            goal.progress = round((done_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
            if goal.progress >= 100:
                goal.status = "completed"
                goal.completed_at = now

    # 5. Recalculate pet state
    state_data = behavior_engine.recalculate_pet_state(
        db, USER_ID,
        just_completed_task=True
    )

    # 6. Check achievements
    achievements_unlocked = behavior_engine.evaluate_achievements(db, user)

    # 7. Generate pet message
    difficulty_msg = {
        Difficulty.easy: "Quick win! Keep the momentum going.",
        Difficulty.medium: "Solid progress. You're building momentum.",
        Difficulty.hard: "That was a tough one. Impressive work.",
    }
    pet_message = difficulty_msg.get(task.difficulty, "Task done!")
    if level_up:
        pet_message = f"Level {new_level}! {pet_message}"
    if achievements_unlocked:
        pet_message = f"🏆 {achievements_unlocked[0]} unlocked! {pet_message}"

    # Update pet message
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    if pet:
        pet.current_message = pet_message

    # Store memory
    memory_service.auto_create_memory(
        db, USER_ID,
        event_type="task_completed",
        details=f"Completed '{task.title}' ({task.difficulty.value}), earned {xp_earned} XP",
    )

    db.commit()
    db.refresh(task)

    return TaskCompleteResponse(
        task=task,
        xp_earned=xp_earned,
        new_total_xp=user.xp,
        new_level=new_level,
        level_up=level_up,
        pet_state=state_data.get("state", "happy"),
        pet_message=pet_message,
        achievements_unlocked=achievements_unlocked,
    )
