import sys
import os

# Add backend and root directories to sys.path so 'app.*' imports work from any working directory
current_file_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_file_dir)
root_dir = os.path.dirname(backend_dir)

for path_dir in [backend_dir, root_dir]:
    if path_dir not in sys.path:
        sys.path.insert(0, path_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database.session import engine, Base, ensure_db_schema
from app.api import health, tasks, ai, users
from app.services.reminder_service import start_reminder_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("[FastAPI Startup] Creating database tables if needed...")
    try:
        Base.metadata.create_all(bind=engine)
        ensure_db_schema()
    except Exception as e:
        print(f"[FastAPI Startup DB Notice]: {e}")
    
    scheduler = None
    # Skip persistent background scheduler thread in serverless environments
    if not os.getenv("VERCEL"):
        try:
            print("[FastAPI Startup] Initializing background reminder scheduler...")
            scheduler = start_reminder_scheduler(interval_seconds=30)
        except Exception as e:
            print(f"[FastAPI Scheduler Notice]: {e}")
    
    yield
    
    # Shutdown logic
    if scheduler:
        try:
            print("[FastAPI Shutdown] Shutting down scheduler...")
            scheduler.shutdown()
        except Exception:
            pass

app_lifespan = None if os.getenv("VERCEL") else lifespan

app = FastAPI(
    title="Spidy Task Automation Assistant API",
    description="Backend API for task management, natural language tool-calling, AI task breakdown, autonomous subtask solver, and prioritization.",
    version="1.0.0",
    lifespan=app_lifespan
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(users.router)

@app.get("/api/reminders")
@app.get("/api/reminders/")
def get_reminders():
    return []

# Serve React Vite static build if available
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

possible_dist_dirs = [
    os.path.join(root_dir, "frontend", "dist"),
    os.path.join(backend_dir, "frontend", "dist"),
    os.path.join(current_file_dir, "dist"),
]
dist_dir = None
for candidate in possible_dist_dirs:
    if os.path.isdir(candidate) and os.path.isfile(os.path.join(candidate, "index.html")):
        dist_dir = candidate
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        target = os.path.join(dist_dir, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
