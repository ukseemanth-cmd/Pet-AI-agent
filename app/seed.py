"""Seed database with realistic demo data."""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, Pet, Goal, Task, DailyStat, Achievement, UserAchievement,
    FocusSession, ProductivityEvent, XPTransaction, Memory,
    TaskStatus, Difficulty, PetStateEnum, EventType
)
from app.services.behavior_engine import ACHIEVEMENT_DEFINITIONS


def seed_if_empty(db: Session):
    """Seed data only if the database is empty."""
    user_count = db.query(User).count()
    if user_count > 0:
        return

    print(" Seeding demo data...")
    _seed_demo_data(db)
    print(" Demo data seeded successfully!")


def _seed_demo_data(db: Session):
    now = datetime.now(timezone.utc)

    # ── Create User ──
    user = User(
        username="demo_user",
        display_name="Explorer",
        xp=680,
        level=7,
        streak_days=5,
        last_active_date=now.strftime("%Y-%m-%d"),
        total_focus_minutes=185,
        total_tasks_completed=12,
    )
    db.add(user)
    db.flush()

    # ── Create Pet ──
    pet = Pet(
        user_id=user.id,
        name="Nova",
        state=PetStateEnum.idle,
        energy=72.0,
        happiness=78.0,
        focus_score=65.0,
        confidence=70.0,
        productivity_score=68.0,
        current_message="Hey! I'm ready when you are. What are we working on?",
    )
    db.add(pet)

    # ── Create Achievements ──
    for defn in ACHIEVEMENT_DEFINITIONS:
        achievement = Achievement(
            key=defn["key"],
            title=defn["title"],
            description=defn["description"],
            icon=defn["icon"],
            target_value=defn["target_value"],
            category=defn["category"],
        )
        db.add(achievement)
    db.flush()

    # ── Create some user achievements ──
    achievements = db.query(Achievement).all()
    for a in achievements:
        progress = 0
        unlocked = False
        unlocked_at = None

        if a.key == "first_step":
            progress = 1
            unlocked = True
            unlocked_at = now - timedelta(days=6)
        elif a.key == "on_fire":
            progress = 5
            unlocked = True
            unlocked_at = now - timedelta(days=1)
        elif a.key == "deep_worker":
            progress = 85  # not yet unlocked
        elif a.key == "hard_mode":
            progress = 3

        ua = UserAchievement(
            user_id=user.id,
            achievement_id=a.id,
            progress=progress,
            unlocked=unlocked,
            unlocked_at=unlocked_at,
        )
        db.add(ua)

    # ── Daily Stats (last 7 days) ──
    daily_data = [
        {"offset": 6, "tasks": 3, "focus": 45, "xp": 80, "score": 62},
        {"offset": 5, "tasks": 2, "focus": 25, "xp": 50, "score": 55},
        {"offset": 4, "tasks": 4, "focus": 50, "xp": 110, "score": 72},
        {"offset": 3, "tasks": 1, "focus": 25, "xp": 35, "score": 48},
        {"offset": 2, "tasks": 3, "focus": 40, "xp": 90, "score": 68},
        {"offset": 1, "tasks": 2, "focus": 30, "xp": 55, "score": 58},
        {"offset": 0, "tasks": 0, "focus": 0, "xp": 0, "score": 40},  # Today — empty so far
    ]

    for d in daily_data:
        date = (now - timedelta(days=d["offset"])).strftime("%Y-%m-%d")
        stat = DailyStat(
            user_id=user.id,
            date=date,
            tasks_completed=d["tasks"],
            focus_minutes=d["focus"],
            xp_earned=d["xp"],
            productivity_score=d["score"],
        )
        db.add(stat)

    # ── Memories ──
    memories = [
        ("User prefers working in short focused bursts", "preference", 0.7),
        ("User started ML project goal 3 days ago", "context", 0.6),
        ("User responds well to encouragement after completing hard tasks", "preference", 0.8),
        ("User's most productive time is afternoon", "pattern", 0.6),
    ]
    for content, mtype, importance in memories:
        mem = Memory(
            user_id=user.id,
            content=content,
            memory_type=mtype,
            importance=importance,
        )
        db.add(mem)

    db.commit()
