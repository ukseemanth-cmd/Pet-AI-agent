"""
Memory Service — Persistent memory with DB fallback.
Stores and retrieves productivity context for personalized AI responses.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import Memory

logger = logging.getLogger(__name__)


def store_memory(
    db: Session,
    user_id: int,
    content: str,
    memory_type: str = "general",
    importance: float = 0.5,
    metadata: Optional[dict] = None,
) -> Memory:
    """Store a new memory."""
    memory = Memory(
        user_id=user_id,
        content=content,
        memory_type=memory_type,
        importance=importance,
        metadata_=metadata or {},
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def search_memory(
    db: Session,
    user_id: int,
    query: str,
    memory_type: Optional[str] = None,
    limit: int = 10,
) -> list[Memory]:
    """Search memories by content (simple keyword matching for DB fallback)."""
    q = db.query(Memory).filter(Memory.user_id == user_id)

    if memory_type:
        q = q.filter(Memory.memory_type == memory_type)

    # Simple keyword search for SQLite fallback
    keywords = query.lower().split()
    memories = q.order_by(Memory.importance.desc(), Memory.created_at.desc()).all()

    # Filter by keyword relevance
    scored = []
    for m in memories:
        content_lower = m.content.lower()
        score = sum(1 for kw in keywords if kw in content_lower)
        if score > 0:
            scored.append((score, m))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scored[:limit]]


def get_relevant_memories(
    db: Session,
    user_id: int,
    context: str,
    limit: int = 5,
) -> list[dict]:
    """Get memories relevant to the current context."""
    memories = search_memory(db, user_id, context, limit=limit)

    if not memories:
        # Fall back to recent important memories
        memories = (
            db.query(Memory)
            .filter(Memory.user_id == user_id)
            .order_by(Memory.importance.desc(), Memory.created_at.desc())
            .limit(limit)
            .all()
        )

    result = []
    for m in memories:
        m.last_accessed = datetime.now(timezone.utc)
        result.append({
            "content": m.content,
            "type": m.memory_type,
            "importance": m.importance,
            "created_at": m.created_at.isoformat() if m.created_at else "",
        })

    db.commit()
    return result


def update_memory(
    db: Session,
    memory_id: int,
    content: Optional[str] = None,
    importance: Optional[float] = None,
) -> Optional[Memory]:
    """Update an existing memory."""
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        return None

    if content is not None:
        memory.content = content
    if importance is not None:
        memory.importance = importance

    db.commit()
    db.refresh(memory)
    return memory


def summarize_session(
    db: Session,
    user_id: int,
    session_summary: str,
) -> Memory:
    """Store a session summary as a high-importance memory."""
    return store_memory(
        db=db,
        user_id=user_id,
        content=session_summary,
        memory_type="session_summary",
        importance=0.8,
    )


def auto_create_memory(
    db: Session,
    user_id: int,
    event_type: str,
    details: str,
) -> Memory:
    """Automatically create a memory from productivity events."""
    type_importance = {
        "goal_created": 0.7,
        "goal_completed": 0.9,
        "task_completed": 0.3,
        "focus_completed": 0.4,
        "achievement_unlocked": 0.8,
        "plan_created": 0.6,
    }

    return store_memory(
        db=db,
        user_id=user_id,
        content=details,
        memory_type=event_type,
        importance=type_importance.get(event_type, 0.5),
    )
