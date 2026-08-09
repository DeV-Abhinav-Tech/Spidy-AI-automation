import os
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
    Base.metadata.create_all(bind=engine)
    ensure_db_schema()
    
    print("[FastAPI Startup] Initializing background reminder scheduler...")
    scheduler = start_reminder_scheduler(interval_seconds=30)
    
    yield
    
    # Shutdown logic
    if scheduler:
        print("[FastAPI Shutdown] Shutting down scheduler...")
        scheduler.shutdown()

app = FastAPI(
    title="Spidy Task Automation Assistant API",
    description="Backend API for task management, natural language tool-calling, AI task breakdown, autonomous subtask solver, and prioritization.",
    version="1.0.0",
    lifespan=lifespan
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
