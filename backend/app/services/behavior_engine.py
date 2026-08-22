"""
Behavior Engine — Deterministic productivity scoring from real signals.
This is the source of truth for pet state, energy, happiness, focus, and productivity.
The frontend NEVER independently calculates these values.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, Pet, Task, FocusSession, ProductivityEvent, DailyStat,
    TaskStatus, Difficulty, PetStateEnum, EventType
)


# ── XP Configuration ──────────────────────────────────

XP_REWARDS = {
    Difficulty.easy: 10,
    Difficulty.medium: 20,
    Difficulty.hard: 35,
}

FOCUS_XP_PER_MINUTE = 0.8  # 20 XP for 25 minutes

LEVEL_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
]


def xp_for_level(level: int) -> int:
    """Get total XP required for a given level."""
    if level <= 0:
        return 0
    if level <= len(LEVEL_THRESHOLDS):
        return LEVEL_THRESHOLDS[level - 1]
    # Beyond defined thresholds, scale quadratically
    return LEVEL_THRESHOLDS[-1] + (level - len(LEVEL_THRESHOLDS)) ** 2 * 1000


def level_from_xp(xp: int) -> int:
    """Determine level from total XP."""
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
        else:
            break
    return level


def xp_for_next_level(current_xp: int) -> int:
    """Get the XP needed for the next level."""
    current_level = level_from_xp(current_xp)
    next_threshold = xp_for_level(current_level + 1)
    return next_threshold


# ── Productivity Score ─────────────────────────────────

def calculate_productivity_score(db: Session, user_id: int) -> float:
    """
    Calculate productivity score (0-100) from real signals.
    Factors: completion rate, focus time, consistency, difficulty, recency.
    """
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    # Recent tasks
    recent_tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.created_at >= seven_days_ago
    ).all()

    if not recent_tasks:
        return 35.0  # Base score for new/inactive users

    completed = [t for t in recent_tasks if t.status == TaskStatus.completed]
    total = len(recent_tasks)
    completion_rate = len(completed) / total if total > 0 else 0

    # Difficulty bonus
    hard_completed = sum(1 for t in completed if t.difficulty == Difficulty.hard)
    medium_completed = sum(1 for t in completed if t.difficulty == Difficulty.medium)
    difficulty_bonus = (hard_completed * 3 + medium_completed * 1.5) / max(total, 1)

    # Focus time (last 7 days)
    recent_sessions = db.query(FocusSession).filter(
        FocusSession.user_id == user_id,
        FocusSession.status == "completed",
        FocusSession.started_at >= seven_days_ago
    ).all()
    total_focus = sum(s.elapsed_minutes for s in recent_sessions)
    focus_factor = min(total_focus / 200, 1.0)  # Cap at 200 min / week

    # Consistency — how many of last 7 days had activity
    active_dates = set()
    for t in completed:
        if t.completed_at:
            active_dates.add(t.completed_at.strftime("%Y-%m-%d"))
    for s in recent_sessions:
        if s.completed_at:
            active_dates.add(s.completed_at.strftime("%Y-%m-%d"))
    consistency = len(active_dates) / 7

    # Recency — boost if active today
    today = now.strftime("%Y-%m-%d")
    recency_boost = 1.15 if today in active_dates else 0.9

    # Combined score
    raw = (
        completion_rate * 35 +
        difficulty_bonus * 15 +
        focus_factor * 25 +
        consistency * 25
    )
    score = min(raw * recency_boost, 100.0)
    return round(max(score, 5.0), 1)


# ── Energy ─────────────────────────────────────────────

def calculate_energy(db: Session, user_id: int) -> float:
    """
    Energy based on recent activity intensity and rest.
    High activity = energy might dip. Moderate consistent = high energy.
    """
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    # Today's activity
    today_tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.status == TaskStatus.completed,
    ).all()
    today_completed = sum(
        1 for t in today_tasks
        if t.completed_at and t.completed_at.strftime("%Y-%m-%d") == today
    )

    today_focus = db.query(FocusSession).filter(
        FocusSession.user_id == user_id,
        FocusSession.status == "completed",
    ).all()
    today_focus_min = sum(
        s.elapsed_minutes for s in today_focus
        if s.completed_at and s.completed_at.strftime("%Y-%m-%d") == today
    )

    # Base energy
    energy = 70.0

    # Activity boosts
    if today_completed > 0:
        energy += min(today_completed * 5, 20)
    if today_focus_min > 0:
        energy += min(today_focus_min * 0.3, 15)

    # Overwork penalty (diminishing returns after heavy work)
    if today_focus_min > 120:
        energy -= (today_focus_min - 120) * 0.2
    if today_completed > 8:
        energy -= (today_completed - 8) * 3

    return round(max(min(energy, 100.0), 15.0), 1)


# ── Happiness ──────────────────────────────────────────

def calculate_happiness(db: Session, user_id: int) -> float:
    """
    Happiness based on streaks, completions, and recovery.
    Driven by positive momentum rather than absolute output.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return 50.0

    happiness = 55.0  # Base

    # Streak bonus
    streak = user.streak_days
    if streak >= 7:
        happiness += 20
    elif streak >= 3:
        happiness += 12
    elif streak >= 1:
        happiness += 5

    # Recent completions
    now = datetime.now(timezone.utc)
    recent = db.query(Task).filter(
        Task.user_id == user_id,
        Task.status == TaskStatus.completed,
        Task.completed_at >= now - timedelta(days=3)
    ).count()

    happiness += min(recent * 3, 20)

    # Inactivity penalty (gentle)
    if user.last_active_date:
        try:
            last_active = datetime.strptime(user.last_active_date, "%Y-%m-%d")
            days_inactive = (now - last_active.replace(tzinfo=timezone.utc)).days
            if days_inactive > 3:
                happiness -= min(days_inactive * 2, 25)
        except ValueError:
            pass

    return round(max(min(happiness, 100.0), 20.0), 1)


# ── Focus Score ────────────────────────────────────────

def calculate_focus_score(db: Session, user_id: int) -> float:
    """Focus score based on recent focus session quality."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    sessions = db.query(FocusSession).filter(
        FocusSession.user_id == user_id,
        FocusSession.started_at >= week_ago
    ).all()

    if not sessions:
        return 40.0

    completed = [s for s in sessions if s.status == "completed"]
    total_planned = sum(s.duration_minutes for s in sessions)
    total_actual = sum(s.elapsed_minutes for s in completed)

    if total_planned == 0:
        return 40.0

    completion_ratio = total_actual / total_planned
    session_count_factor = min(len(completed) / 5, 1.0)  # Up to 5 sessions/week

    score = (completion_ratio * 60 + session_count_factor * 40)
    return round(max(min(score, 100.0), 10.0), 1)


# ── Pet State ──────────────────────────────────────────

def determine_pet_state(
    productivity: float,
    energy: float,
    happiness: float,
    focus: float,
    streak: int,
    is_focusing: bool = False,
    just_completed_task: bool = False,
    is_processing: bool = False,
    days_inactive: int = 0
) -> PetStateEnum:
    """
    Determine pet state from behavioral signals.
    Priority-based: immediate states > emotional states > ambient states.
    """
    # Immediate states
    if is_processing:
        return PetStateEnum.thinking
    if is_focusing:
        return PetStateEnum.focused
    if just_completed_task:
        if productivity >= 80:
            return PetStateEnum.celebrating
        return PetStateEnum.excited

    # Recovery
    if days_inactive >= 3:
        return PetStateEnum.concerned

    # Energy-based
    if energy < 25:
        return PetStateEnum.tired
    if energy < 40:
        return PetStateEnum.sleepy

    # Positive states
    avg_score = (productivity + happiness + focus) / 3
    if avg_score >= 85:
        return PetStateEnum.excited
    if avg_score >= 70:
        return PetStateEnum.happy
    if streak >= 3 and productivity >= 60:
        return PetStateEnum.encouraging

    # Default
    if productivity >= 50:
        return PetStateEnum.idle
    return PetStateEnum.sleepy


# ── XP Calculation ─────────────────────────────────────

def calculate_task_xp(difficulty: Difficulty) -> int:
    """Calculate XP reward for completing a task."""
    return XP_REWARDS.get(difficulty, 10)


def calculate_focus_xp(minutes: int) -> int:
    """Calculate XP for a focus session."""
    return max(int(minutes * FOCUS_XP_PER_MINUTE), 5)


# ── Streak Calculation ─────────────────────────────────

def calculate_streak(db: Session, user_id: int) -> int:
    """Calculate current streak from daily stats."""
    now = datetime.now(timezone.utc)
    streak = 0
    check_date = now.date()

    # Check today first — if no activity today, start from yesterday
    today_str = check_date.strftime("%Y-%m-%d")
    today_stat = db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.date == today_str
    ).first()

    if not today_stat or (today_stat.tasks_completed == 0 and today_stat.focus_minutes == 0):
        check_date -= timedelta(days=1)

    for i in range(365):  # Max lookback
        date_str = check_date.strftime("%Y-%m-%d")
        stat = db.query(DailyStat).filter(
            DailyStat.user_id == user_id,
            DailyStat.date == date_str
        ).first()

        if stat and (stat.tasks_completed > 0 or stat.focus_minutes > 0):
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return streak


# ── Achievement Evaluation ─────────────────────────────

ACHIEVEMENT_DEFINITIONS = [
    {
        "key": "first_step",
        "title": "First Step",
        "description": "Complete your first task",
        "icon": "footprints",
        "target_value": 1,
        "category": "tasks",
        "check": lambda u, db: u.total_tasks_completed >= 1,
        "progress": lambda u, db: min(u.total_tasks_completed, 1),
    },
    {
        "key": "on_fire",
        "title": "On Fire",
        "description": "Achieve a 5-day streak",
        "icon": "flame",
        "target_value": 5,
        "category": "streaks",
        "check": lambda u, db: u.streak_days >= 5,
        "progress": lambda u, db: min(u.streak_days, 5),
    },
    {
        "key": "deep_worker",
        "title": "Deep Worker",
        "description": "Complete 100 focus minutes",
        "icon": "brain",
        "target_value": 100,
        "category": "focus",
        "check": lambda u, db: u.total_focus_minutes >= 100,
        "progress": lambda u, db: min(u.total_focus_minutes, 100),
    },
    {
        "key": "comeback",
        "title": "Comeback",
        "description": "Return and complete a task after 3+ days away",
        "icon": "rotate-ccw",
        "target_value": 1,
        "category": "recovery",
        "check": lambda u, db: _check_comeback(u, db),
        "progress": lambda u, db: 1 if _check_comeback(u, db) else 0,
    },
    {
        "key": "hard_mode",
        "title": "Hard Mode",
        "description": "Complete 5 hard tasks",
        "icon": "zap",
        "target_value": 5,
        "category": "tasks",
        "check": lambda u, db: _count_hard_tasks(u, db) >= 5,
        "progress": lambda u, db: min(_count_hard_tasks(u, db), 5),
    },
    {
        "key": "task_master",
        "title": "Task Master",
        "description": "Complete 25 tasks",
        "icon": "check-circle",
        "target_value": 25,
        "category": "tasks",
        "check": lambda u, db: u.total_tasks_completed >= 25,
        "progress": lambda u, db: min(u.total_tasks_completed, 25),
    },
    {
        "key": "focused_mind",
        "title": "Focused Mind",
        "description": "Complete 10 focus sessions",
        "icon": "target",
        "target_value": 10,
        "category": "focus",
        "check": lambda u, db: _count_focus_sessions(u, db) >= 10,
        "progress": lambda u, db: min(_count_focus_sessions(u, db), 10),
    },
    {
        "key": "goal_crusher",
        "title": "Goal Crusher",
        "description": "Complete your first goal",
        "icon": "trophy",
        "target_value": 1,
        "category": "goals",
        "check": lambda u, db: _count_completed_goals(u, db) >= 1,
        "progress": lambda u, db: min(_count_completed_goals(u, db), 1),
    },
]


def _check_comeback(user, db):
    """Check if user returned after 3+ days of inactivity."""
    events = db.query(ProductivityEvent).filter(
        ProductivityEvent.user_id == user.id,
        ProductivityEvent.event_type == EventType.inactive_period
    ).all()
    return len(events) > 0


def _count_hard_tasks(user, db):
    return db.query(Task).filter(
        Task.user_id == user.id,
        Task.status == TaskStatus.completed,
        Task.difficulty == Difficulty.hard
    ).count()


def _count_focus_sessions(user, db):
    return db.query(FocusSession).filter(
        FocusSession.user_id == user.id,
        FocusSession.status == "completed"
    ).count()


def _count_completed_goals(user, db):
    from app.models.models import Goal
    return db.query(Goal).filter(
        Goal.user_id == user.id,
        Goal.status == "completed"
    ).count()


def evaluate_achievements(db: Session, user: User) -> list[str]:
    """
    Evaluate all achievements and return newly unlocked ones.
    """
    from app.models.models import Achievement, UserAchievement

    newly_unlocked = []

    for defn in ACHIEVEMENT_DEFINITIONS:
        # Find or create achievement record
        achievement = db.query(Achievement).filter(
            Achievement.key == defn["key"]
        ).first()

        if not achievement:
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

        # Find or create user achievement
        ua = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id,
            UserAchievement.achievement_id == achievement.id
        ).first()

        if not ua:
            ua = UserAchievement(
                user_id=user.id,
                achievement_id=achievement.id,
                progress=0,
                unlocked=False
            )
            db.add(ua)
            db.flush()

        if ua.unlocked:
            continue

        # Update progress
        ua.progress = defn["progress"](user, db)

        # Check if newly unlocked
        if defn["check"](user, db):
            ua.unlocked = True
            ua.unlocked_at = datetime.now(timezone.utc)
            newly_unlocked.append(defn["title"])

            # Log event
            event = ProductivityEvent(
                user_id=user.id,
                event_type=EventType.achievement_unlocked,
                data={"achievement": defn["key"], "title": defn["title"]}
            )
            db.add(event)

    db.commit()
    return newly_unlocked


# ── Full Recalculation ─────────────────────────────────

def recalculate_pet_state(db: Session, user_id: int, **overrides) -> dict:
    """
    Full pet state recalculation from all behavioral signals.
    Returns the complete pet state dictionary.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {
            "state": "idle",
            "energy": 50.0,
            "happiness": 50.0,
            "focus_score": 40.0,
            "confidence": 50.0,
            "productivity_score": 35.0,
            "reason": "No user data"
        }

    productivity = calculate_productivity_score(db, user_id)
    energy = calculate_energy(db, user_id)
    happiness = calculate_happiness(db, user_id)
    focus = calculate_focus_score(db, user_id)
    streak = calculate_streak(db, user_id)

    # Confidence = blend of productivity and consistency
    confidence = round((productivity * 0.6 + happiness * 0.4), 1)

    # Days inactive
    days_inactive = 0
    if user.last_active_date:
        try:
            last = datetime.strptime(user.last_active_date, "%Y-%m-%d")
            days_inactive = (datetime.now(timezone.utc) - last.replace(tzinfo=timezone.utc)).days
        except ValueError:
            pass

    state = determine_pet_state(
        productivity=productivity,
        energy=energy,
        happiness=happiness,
        focus=focus,
        streak=streak,
        days_inactive=days_inactive,
        **overrides
    )

    # Build reason
    reasons = []
    if productivity >= 75:
        reasons.append("Strong task completion")
    if focus >= 70:
        reasons.append("consistent focus sessions")
    if streak >= 3:
        reasons.append(f"{streak}-day streak")
    if energy < 40:
        reasons.append("energy is low")
    if days_inactive >= 3:
        reasons.append(f"inactive for {days_inactive} days")
    reason = " and ".join(reasons) if reasons else "Starting fresh"

    # Update pet record
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if pet:
        pet.state = state
        pet.energy = energy
        pet.happiness = happiness
        pet.focus_score = focus
        pet.confidence = confidence
        pet.productivity_score = productivity
        db.commit()

    # Update user streak
    user.streak_days = streak
    db.commit()

    return {
        "state": state.value,
        "energy": energy,
        "happiness": happiness,
        "focus_score": focus,
        "confidence": confidence,
        "productivity_score": productivity,
        "streak": streak,
        "reason": reason,
    }
