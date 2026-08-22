"""Application configuration from environment variables."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


class Settings(BaseSettings):
    # AI Provider — NEVER exposed to frontend
    memcode_api_key: str = ""
    memcode_base_url: str = "https://api.memcode.ai/v1"
    memcode_model: str = "gpt-4o-mini"

    # Database
    database_url: str = ""

    # Server
    cors_origins: str = "http://localhost:5173"
    secret_key: str = "change-me"

    # Demo mode
    demo_mode: bool = False

    @property
    def db_url(self) -> str:
        """Return database URL, defaulting to SQLite for local dev."""
        if self.database_url:
            # SQLAlchemy 1.4+ requires postgresql:// instead of postgres://
            return self.database_url.replace("postgres://", "postgresql://", 1)
        db_path = Path(__file__).resolve().parent.parent / "productivity_pet.db"
        return f"sqlite:///{db_path}"

    @property
    def is_sqlite(self) -> bool:
        return self.db_url.startswith("sqlite")

    @property
    def ai_available(self) -> bool:
        return bool(self.memcode_api_key)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
