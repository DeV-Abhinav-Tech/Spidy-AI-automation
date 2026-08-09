import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tasks.db")

# For SQLite, connect_args={"check_same_thread": False} is required
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_db_schema():
    """Adds missing columns (e.g. solution_output, credentials, details) to SQLite tables if needed."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE tasks ADD COLUMN solution_output TEXT",
            "ALTER TABLE users ADD COLUMN credentials TEXT",
            "ALTER TABLE users ADD COLUMN details TEXT",
            "ALTER TABLE users ADD COLUMN last_active DATETIME"
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
                print(f"[Database Migration] Executed: {stmt}")
            except Exception:
                pass # Column already exists

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
