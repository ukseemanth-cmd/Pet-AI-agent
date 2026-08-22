"""SQLAlchemy database engine and session management."""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings


# Create engine with appropriate settings
connect_args = {}
if settings.is_sqlite:
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.db_url,
    connect_args=connect_args,
    echo=False,
)

# Enable WAL mode for SQLite
if settings.is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency for FastAPI route injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and run non-destructive schema migrations."""
    from app.models import models  # noqa: F401 — import to register models
    Base.metadata.create_all(bind=engine)

    # Automatic non-destructive SQLite column additions for existing DBs
    if settings.is_sqlite:
        with engine.connect() as conn:
            # Check pets table columns
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(pets)")
            existing_cols = {row[1] for row in cursor.fetchall()}
            
            column_defs = [
                ("pet_type", "VARCHAR(50) DEFAULT 'nova'"),
                ("personality", "VARCHAR(50) DEFAULT 'balanced'"),
                ("theme", "VARCHAR(50) DEFAULT 'default'"),
                ("accessories", "TEXT DEFAULT '[]'"),
                ("onboarding_done", "BOOLEAN DEFAULT 0"),
            ]
            for col_name, col_type in column_defs:
                if col_name not in existing_cols:
                    try:
                        cursor.execute(f"ALTER TABLE pets ADD COLUMN {col_name} {col_type}")
                    except Exception:
                        pass
            cursor.close()
            conn.commit()

