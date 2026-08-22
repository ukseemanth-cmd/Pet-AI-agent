"""Productivity Pet — FastAPI Application Entry Point."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Productivity Pet API",
    description="AI Agent + Productivity OS + Living Virtual Companion",
    version="1.0.0",
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routes import tasks, pet, agent, focus, goals, analytics, achievements, memory, companion  # noqa: E402

app.include_router(tasks.router)
app.include_router(pet.router)
app.include_router(agent.router)
app.include_router(focus.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(achievements.router)
app.include_router(memory.router)
app.include_router(companion.router)


@app.on_event("startup")
def startup():
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized.")

    # Run seeding if DB is empty
    from app.seed import seed_if_empty
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

    logger.info("AI provider configured: %s", "YES" if settings.ai_available else "NO (using fallbacks)")
    logger.info("Productivity Pet API ready ")


@app.get("/")
def root():
    return {
        "app": "Productivity Pet",
        "version": "1.0.0",
        "status": "running",
        "ai_available": settings.ai_available,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
