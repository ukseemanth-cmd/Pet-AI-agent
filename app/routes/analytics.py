"""Analytics API routes."""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Task, FocusSession, DailyStat, TaskStatus, Difficulty
from app.schemas import AnalyticsResponse
from app.services import behavior_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])
USER_ID = 1


@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == USER_ID).first()
    if not user:
        return AnalyticsResponse(
            productivity_score=0, tasks_completed=0, total_tasks=0,
            completion_rate=0, focus_minutes=0, streak_days=0,
            xp_total=0, level=1, hard_tasks_completed=0, consistency_score=0,
        )

    total_tasks = db.query(Task).filter(Task.user_id == USER_ID).count()
    completed_tasks = db.query(Task).filter(
        Task.user_id == USER_ID,
        Task.status == TaskStatus.completed
    ).count()
    hard_completed = db.query(Task).filter(
        Task.user_id == USER_ID,
        Task.status == TaskStatus.completed,
        Task.difficulty == Difficulty.hard
    ).count()

    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    productivity = behavior_engine.calculate_productivity_score(db, USER_ID)

    # Consistency: active days / 7
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    active_days = db.query(DailyStat).filter(
        DailyStat.user_id == USER_ID,
        DailyStat.date >= week_ago.strftime("%Y-%m-%d"),
    ).count()
    consistency = round((active_days / 7) * 100, 1)

    # Daily data (last 14 days)
    daily_stats = db.query(DailyStat).filter(
        DailyStat.user_id == USER_ID
    ).order_by(DailyStat.date.desc()).limit(14).all()

    daily_data = [
        {
            "date": d.date,
            "tasks_completed": d.tasks_completed,
            "focus_minutes": d.focus_minutes,
            "xp_earned": d.xp_earned,
            "productivity_score": d.productivity_score,
        }
        for d in reversed(daily_stats)
    ]

    return AnalyticsResponse(
        productivity_score=productivity,
        tasks_completed=completed_tasks,
        total_tasks=total_tasks,
        completion_rate=round(completion_rate, 1),
        focus_minutes=user.total_focus_minutes,
        streak_days=user.streak_days,
        xp_total=user.xp,
        level=user.level,
        hard_tasks_completed=hard_completed,
        consistency_score=consistency,
        daily_data=daily_data,
    )


@router.get("/daily")
def get_daily_analytics(db: Session = Depends(get_db)):
    stats = db.query(DailyStat).filter(
        DailyStat.user_id == USER_ID
    ).order_by(DailyStat.date.desc()).limit(7).all()

    return [
        {
            "date": s.date,
            "tasks_completed": s.tasks_completed,
            "focus_minutes": s.focus_minutes,
            "xp_earned": s.xp_earned,
            "productivity_score": s.productivity_score,
        }
        for s in reversed(stats)
    ]


@router.get("/weekly")
def get_weekly_analytics(db: Session = Depends(get_db)):
    stats = db.query(DailyStat).filter(
        DailyStat.user_id == USER_ID
    ).order_by(DailyStat.date.desc()).limit(14).all()

    return [
        {
            "date": s.date,
            "tasks_completed": s.tasks_completed,
            "focus_minutes": s.focus_minutes,
            "xp_earned": s.xp_earned,
        }
        for s in reversed(stats)
    ]
