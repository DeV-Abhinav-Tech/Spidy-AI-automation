import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# On Vercel / serverless platforms, default SQLite to /tmp which is writable
if os.getenv("VERCEL"):
    default_db = "sqlite:////tmp/tasks.db"
else:
    default_db = "sqlite:///./tasks.db"

DATABASE_URL = os.getenv("DATABASE_URL", default_db)

# For SQLite, connect_args={"check_same_thread": False} is required
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_db_schema():
    """Adds missing columns (e.g. solution_output, credentials, details, password_hash) to SQLite tables if needed and seeds demo accounts."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE tasks ADD COLUMN solution_output TEXT",
            "ALTER TABLE users ADD COLUMN credentials TEXT",
            "ALTER TABLE users ADD COLUMN details TEXT",
            "ALTER TABLE users ADD COLUMN last_active DATETIME",
            "ALTER TABLE users ADD COLUMN password_hash TEXT"
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass # Column already exists
    
    # Pre-seed demo users if users table is empty or missing demo users
    try:
        from app.models.task import User
        from app.services.auth_utils import hash_password
        import datetime
        db = SessionLocal()
        demo_accounts = [
            {"email": "demo@spidy.ai", "name": "Demo User", "password": "demo123"},
            {"email": "student@example.com", "name": "Student Account", "password": "student123"}
        ]
        for acc in demo_accounts:
            existing = db.query(User).filter(User.email == acc["email"]).first()
            if not existing:
                new_user = User(
                    email=acc["email"],
                    name=acc["name"],
                    password_hash=hash_password(acc["password"]),
                    created_at=datetime.datetime.utcnow(),
                    last_active=datetime.datetime.utcnow()
                )
                db.add(new_user)
            elif not existing.password_hash:
                existing.password_hash = hash_password(acc["password"])
        db.commit()
        db.close()
    except Exception as e:
        print(f"[Seed Demo Users Notice]: {e}")

_db_initialized = False

def init_db_if_needed():
    global _db_initialized
    if not _db_initialized:
        try:
            Base.metadata.create_all(bind=engine)
            ensure_db_schema()
            _db_initialized = True
        except Exception as e:
            print(f"[DB Init Notice]: {e}")

def get_db():
    init_db_if_needed()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

