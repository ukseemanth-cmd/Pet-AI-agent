"""Comprehensive unit tests for the Behavior Engine & Scoring Logic."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.models import User, Pet, Task, Difficulty, TaskStatus, PetStateEnum
from app.services.behavior_engine import (
    calculate_task_xp,
    level_from_xp,
    xp_for_next_level,
    calculate_focus_xp,
    determine_pet_state,
    calculate_productivity_score,
    calculate_energy,
    calculate_happiness,
    evaluate_achievements,
)


@pytest.fixture
def db_session():
    """In-memory SQLite session for isolated testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_task_xp_rewards():
    """Verify XP rewards scale with difficulty."""
    assert calculate_task_xp(Difficulty.easy) == 10
    assert calculate_task_xp(Difficulty.medium) == 20
    assert calculate_task_xp(Difficulty.hard) == 35


def test_level_progression():
    """Verify level calculation from cumulative XP."""
    assert level_from_xp(0) == 1
    assert level_from_xp(50) == 1
    assert level_from_xp(100) == 2
    assert level_from_xp(250) == 3

    # Next level XP threshold
    assert xp_for_next_level(50) == 100
    assert xp_for_next_level(150) == 250


def test_focus_xp_calculation():
    """Verify focus session XP rewards."""
    assert calculate_focus_xp(25) == 20
    assert calculate_focus_xp(50) == 40
    assert calculate_focus_xp(5) == 5  # minimum floor


def test_pet_state_determination():
    """Verify pet state transitions based on behavioral signals."""
    # Active focus session
    state = determine_pet_state(
        productivity=50, energy=70, happiness=70, focus=70, streak=2,
        is_focusing=True
    )
    assert state == PetStateEnum.focused

    # Agent processing
    state = determine_pet_state(
        productivity=50, energy=70, happiness=70, focus=70, streak=2,
        is_processing=True
    )
    assert state == PetStateEnum.thinking

    # High productivity celebrating
    state = determine_pet_state(
        productivity=85, energy=80, happiness=80, focus=80, streak=5,
        just_completed_task=True
    )
    assert state == PetStateEnum.celebrating

    # Low energy tired
    state = determine_pet_state(
        productivity=40, energy=20, happiness=50, focus=40, streak=0
    )
    assert state == PetStateEnum.tired

    # Long inactivity concerned
    state = determine_pet_state(
        productivity=30, energy=60, happiness=40, focus=30, streak=0,
        days_inactive=4
    )
    assert state == PetStateEnum.concerned


def test_achievement_evaluation(db_session):
    """Verify achievement unlocks based on user actions."""
    user = User(
        username="test_hero",
        xp=200,
        level=2,
        streak_days=5,
        total_tasks_completed=1,
        total_focus_minutes=120,
    )
    db_session.add(user)
    db_session.commit()

    unlocked = evaluate_achievements(db_session, user)
    # User has 1 task (First Step), 5-day streak (On Fire), 120 focus min (Deep Worker)
    assert "First Step" in unlocked
    assert "On Fire" in unlocked
    assert "Deep Worker" in unlocked
