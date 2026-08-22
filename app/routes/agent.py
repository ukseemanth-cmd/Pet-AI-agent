"""Agent API routes — chat, goal breakdown, next action, motivation, insight."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AgentChatRequest
from app.services import agent_service

router = APIRouter(prefix="/api/agent", tags=["agent"])
USER_ID = 1


@router.post("/chat")
async def agent_chat(data: AgentChatRequest, db: Session = Depends(get_db)):
    result = await agent_service.process_chat(db, USER_ID, data.message)
    return result


@router.post("/breakdown-goal")
async def breakdown_goal(data: AgentChatRequest, db: Session = Depends(get_db)):
    result = await agent_service.breakdown_goal(db, USER_ID, data.message)
    return result


@router.post("/next-action")
async def next_action(db: Session = Depends(get_db)):
    result = await agent_service.get_next_action(db, USER_ID)
    return result


@router.post("/motivation")
async def motivation(db: Session = Depends(get_db)):
    result = await agent_service.get_motivation(db, USER_ID)
    return result


@router.post("/insight")
async def insight(db: Session = Depends(get_db)):
    result = await agent_service.get_insight(db, USER_ID)
    return result
