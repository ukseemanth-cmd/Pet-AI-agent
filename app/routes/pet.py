"""Pet API routes — state, profile, and recalculation."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Pet
from app.schemas import PetResponse, PetFullResponse
from app.services import behavior_engine

router = APIRouter(prefix="/api/pet", tags=["pet"])
USER_ID = 1


@router.get("", response_model=PetFullResponse)
def get_pet(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == USER_ID).first()
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()

    if not user or not pet:
        return PetFullResponse(
            pet=PetResponse(
                id=0, name="Nova", state="idle", energy=50, happiness=50,
                focus_score=40, confidence=50, productivity_score=35,
                current_message="Hey! I'm ready when you are."
            ),
            user_xp=0, user_level=1,
            xp_for_next_level=100,
            streak_days=0, total_focus_minutes=0, total_tasks_completed=0,
        )

    return PetFullResponse(
        pet=PetResponse(
            id=pet.id,
            name=pet.name,
            state=pet.state.value if pet.state else "idle",
            energy=pet.energy,
            happiness=pet.happiness,
            focus_score=pet.focus_score,
            confidence=pet.confidence,
            productivity_score=pet.productivity_score,
            current_message=pet.current_message,
            pet_type=pet.pet_type or "nova",
            personality=pet.personality or "balanced",
            theme=pet.theme or "default",
            accessories=pet.accessories or [],
            onboarding_done=bool(pet.onboarding_done),
        ),
        user_xp=user.xp,
        user_level=user.level,
        xp_for_next_level=behavior_engine.xp_for_next_level(user.xp),
        streak_days=user.streak_days,
        total_focus_minutes=user.total_focus_minutes,
        total_tasks_completed=user.total_tasks_completed,
    )



@router.get("/state")
def get_pet_state(db: Session = Depends(get_db)):
    state_data = behavior_engine.recalculate_pet_state(db, USER_ID)
    return state_data


@router.post("/recalculate")
def recalculate_pet(db: Session = Depends(get_db)):
    state_data = behavior_engine.recalculate_pet_state(db, USER_ID)
    return state_data


@router.get("/history")
def get_pet_history(db: Session = Depends(get_db)):
    from app.models.models import ProductivityEvent
    events = db.query(ProductivityEvent).filter(
        ProductivityEvent.user_id == USER_ID
    ).order_by(ProductivityEvent.created_at.desc()).limit(20).all()

    return [
        {
            "event_type": e.event_type.value,
            "data": e.data,
            "created_at": e.created_at.isoformat() if e.created_at else "",
        }
        for e in events
    ]
