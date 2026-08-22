"""Memory API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MemoryCreate, MemoryResponse
from app.services import memory_service

router = APIRouter(prefix="/api/memory", tags=["memory"])
USER_ID = 1


@router.post("", response_model=MemoryResponse)
def store_memory(data: MemoryCreate, db: Session = Depends(get_db)):
    memory = memory_service.store_memory(
        db=db,
        user_id=USER_ID,
        content=data.content,
        memory_type=data.memory_type,
        importance=data.importance,
    )
    return memory


@router.get("/search")
def search_memories(q: str = "", memory_type: str | None = None, db: Session = Depends(get_db)):
    if q:
        memories = memory_service.search_memory(db, USER_ID, q, memory_type=memory_type)
    else:
        from app.models.models import Memory
        memories = db.query(Memory).filter(
            Memory.user_id == USER_ID
        ).order_by(Memory.created_at.desc()).limit(20).all()

    return [
        {
            "id": m.id,
            "content": m.content,
            "memory_type": m.memory_type,
            "importance": m.importance,
            "created_at": m.created_at.isoformat() if m.created_at else "",
        }
        for m in memories
    ]
