"""Focus session API routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    FocusSession, User, Pet, Task, ProductivityEvent, DailyStat,
    EventType, PetStateEnum, XPTransaction, TaskStatus
)
from app.schemas import FocusStartRequest, FocusSessionResponse, FocusCompleteResponse
from app.services import behavior_engine, memory_service

router = APIRouter(prefix="/api/focus", tags=["focus"])
USER_ID = 1


def _ensure_daily_stat(db, user_id):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    stat = db.query(DailyStat).filter(DailyStat.user_id == user_id, DailyStat.date == today).first()
    if not stat:
        stat = DailyStat(user_id=user_id, date=today)
        db.add(stat)
        db.flush()
    return stat


@router.post("/start", response_model=FocusSessionResponse)
def start_focus(data: FocusStartRequest, db: Session = Depends(get_db)):
    session = FocusSession(
        user_id=USER_ID,
        task_id=data.task_id,
        duration_minutes=data.duration_minutes,
    )
    db.add(session)

    # Update pet state to focused
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    if pet:
        pet.state = PetStateEnum.focused
        pet.current_message = "Let's lock in. I'm focused with you."

    # Log event
    event = ProductivityEvent(
        user_id=USER_ID,
        event_type=EventType.focus_started,
        data={"duration": data.duration_minutes, "task_id": data.task_id}
    )
    db.add(event)

    # Update task status
    if data.task_id:
        task = db.query(Task).filter(Task.id == data.task_id).first()
        if task and task.status == TaskStatus.todo:
            task.status = TaskStatus.in_progress

    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/complete", response_model=FocusCompleteResponse)
def complete_focus(session_id: int, elapsed_minutes: int = 25, db: Session = Depends(get_db)):
    session = db.query(FocusSession).filter(
        FocusSession.id == session_id,
        FocusSession.user_id == USER_ID
    ).first()
    if not session:
        raise HTTPException(404, "Focus session not found")

    if session.status == "completed":
        raise HTTPException(400, "Session already completed")

    now = datetime.now(timezone.utc)
    session.status = "completed"
    session.elapsed_minutes = elapsed_minutes
    session.completed_at = now

    # Award XP
    xp_earned = behavior_engine.calculate_focus_xp(elapsed_minutes)
    user = db.query(User).filter(User.id == USER_ID).first()
    if user:
        user.xp += xp_earned
        user.level = behavior_engine.level_from_xp(user.xp)
        user.total_focus_minutes += elapsed_minutes
        user.last_active_date = now.strftime("%Y-%m-%d")

    # XP transaction
    xp_tx = XPTransaction(
        user_id=USER_ID,
        amount=xp_earned,
        reason=f"Focus session: {elapsed_minutes}min",
        source_type="focus",
        source_id=session.id,
    )
    db.add(xp_tx)

    # Update daily stats
    stat = _ensure_daily_stat(db, USER_ID)
    stat.focus_minutes += elapsed_minutes
    stat.xp_earned += xp_earned

    # Log event
    event = ProductivityEvent(
        user_id=USER_ID,
        event_type=EventType.focus_completed,
        data={"minutes": elapsed_minutes, "xp": xp_earned}
    )
    db.add(event)

    # Recalculate pet state
    state_data = behavior_engine.recalculate_pet_state(db, USER_ID)

    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    pet_message = f"Great focus session! {elapsed_minutes} minutes of deep work."
    if pet:
        pet.current_message = pet_message

    # Memory
    memory_service.auto_create_memory(
        db, USER_ID,
        event_type="focus_completed",
        details=f"Completed {elapsed_minutes}min focus session, earned {xp_earned} XP",
    )

    db.commit()
    db.refresh(session)

    return FocusCompleteResponse(
        session=session,
        xp_earned=xp_earned,
        new_total_xp=user.xp if user else 0,
        pet_state=state_data.get("state", "happy"),
        pet_message=pet_message,
    )


@router.post("/{session_id}/pause")
def pause_focus(session_id: int, db: Session = Depends(get_db)):
    session = db.query(FocusSession).filter(
        FocusSession.id == session_id,
        FocusSession.user_id == USER_ID
    ).first()
    if not session:
        raise HTTPException(404, "Focus session not found")

    session.status = "paused"
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    if pet:
        pet.state = PetStateEnum.idle
        pet.current_message = "Taking a break. I'll be here when you're ready."

    db.commit()
    return {"status": "paused"}
