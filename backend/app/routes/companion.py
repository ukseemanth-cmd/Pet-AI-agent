"""Companion profile API — GET/PUT /api/companion/profile"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Pet

router = APIRouter(prefix="/api/companion", tags=["companion"])
USER_ID = 1


class CompanionProfileUpdate(BaseModel):
    pet_type: Optional[str] = None
    pet_name: Optional[str] = Field(None, max_length=20)
    personality: Optional[str] = None
    theme: Optional[str] = None
    accessories: Optional[List[str]] = None
    onboarding_done: Optional[bool] = None


@router.get("/profile")
def get_companion_profile(db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    if not pet:
        return {
            "pet_type": "nova",
            "pet_name": "Nova",
            "personality": "balanced",
            "theme": "default",
            "accessories": [],
            "onboarding_done": False,
        }
    return {
        "pet_type": pet.pet_type or "nova",
        "pet_name": pet.name,
        "personality": pet.personality or "balanced",
        "theme": pet.theme or "default",
        "accessories": pet.accessories or [],
        "onboarding_done": bool(pet.onboarding_done),
    }


@router.put("/profile")
def update_companion_profile(data: CompanionProfileUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.user_id == USER_ID).first()
    if not pet:
        return {"error": "Pet not found"}

    if data.pet_type is not None:
        pet.pet_type = data.pet_type
    if data.pet_name is not None:
        pet.name = data.pet_name.strip() or pet.name
    if data.personality is not None:
        pet.personality = data.personality
    if data.theme is not None:
        pet.theme = data.theme
    if data.accessories is not None:
        pet.accessories = data.accessories
    if data.onboarding_done is not None:
        pet.onboarding_done = data.onboarding_done

    db.commit()
    db.refresh(pet)

    return {
        "pet_type": pet.pet_type or "nova",
        "pet_name": pet.name,
        "personality": pet.personality or "balanced",
        "theme": pet.theme or "default",
        "accessories": pet.accessories or [],
        "onboarding_done": bool(pet.onboarding_done),
    }
