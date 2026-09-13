import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Handle DATABASE_URL with validation against empty or unparseable strings
db_url_env = os.getenv("DATABASE_URL", "").strip()
if os.getenv("VERCEL"):
    # On Vercel serverless environment, paths like ./tasks.db are strictly read-only.
    # We must use /tmp/tasks.db for SQLite unless an external cloud database (e.g. postgresql://) is provided.
    if not db_url_env or "sqlite" in db_url_env.lower() or db_url_env.startswith("[") or len(db_url_env) < 5:
        DATABASE_URL = "sqlite:////tmp/tasks.db"
    else:
        DATABASE_URL = db_url_env
else:
    if not db_url_env or db_url_env.startswith("[") or len(db_url_env) < 5:
        DATABASE_URL = "sqlite:///./tasks.db"
    else:
        DATABASE_URL = db_url_env

if os.getenv("VERCEL") and DATABASE_URL == "sqlite:////tmp/tasks.db":
    import shutil
    try:
        if not os.path.exists("/tmp/tasks.db"):
            for candidate in ["./tasks.db", "./backend/tasks.db", "/var/task/tasks.db", "/var/task/backend/tasks.db"]:
                if os.path.exists(candidate):
                    shutil.copy2(candidate, "/tmp/tasks.db")
                    print(f"[DB Bootstrap] Copied {candidate} to /tmp/tasks.db")
                    break
    except Exception as copy_err:
        print(f"[DB Bootstrap Notice]: {copy_err}")

try:
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
except Exception as e:
    print(f"[Session Warning] Failed to parse engine for {DATABASE_URL}: {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:////tmp/tasks.db" if os.getenv("VERCEL") else "sqlite:///./tasks.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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
        # Pre-seed previous tasks from earlier session
        try:
            try:
                from app.database.seed_data import seed_previous_data
            except ImportError:
                from backend.app.database.seed_data import seed_previous_data
            seed_previous_data(db)
        except Exception as seed_err:
            print(f"[Seed Previous Data Notice]: {seed_err}")

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

