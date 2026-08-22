"""Achievement API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Achievement, UserAchievement, User
from app.schemas import AchievementResponse
from app.services.behavior_engine import ACHIEVEMENT_DEFINITIONS, evaluate_achievements

router = APIRouter(prefix="/api/achievements", tags=["achievements"])
USER_ID = 1


@router.get("", response_model=list[AchievementResponse])
def list_achievements(db: Session = Depends(get_db)):
    # Ensure all achievements exist
    user = db.query(User).filter(User.id == USER_ID).first()
    if user:
        evaluate_achievements(db, user)

    achievements = db.query(Achievement).all()
    result = []
    for a in achievements:
        ua = db.query(UserAchievement).filter(
            UserAchievement.user_id == USER_ID,
            UserAchievement.achievement_id == a.id
        ).first()

        result.append(AchievementResponse(
            id=a.id,
            key=a.key,
            title=a.title,
            description=a.description,
            icon=a.icon,
            target_value=a.target_value,
            category=a.category,
            progress=ua.progress if ua else 0,
            unlocked=ua.unlocked if ua else False,
            unlocked_at=ua.unlocked_at if ua else None,
        ))

    return result
