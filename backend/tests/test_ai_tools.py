import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ai.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_ai_chat_create_task_tool():
    request_data = {"message": "Remind me to submit my internship application tomorrow at 6 PM"}
    response = client.post("/api/ai/chat", json=request_data)
    assert response.status_code == 200
    res_data = response.json()
    assert "response" in res_data
    assert res_data["tool_executed"] is not None
    assert res_data["tool_executed"]["tool_name"] == "create_task"

def test_ai_task_breakdown():
    request_data = {"goal": "Build my machine learning portfolio", "category": "Project"}
    response = client.post("/api/ai/task-breakdown", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["goal"] == "Build my machine learning portfolio"
    assert len(data["subtasks"]) > 0
    assert "title" in data["subtasks"][0]

def test_ai_accept_breakdown():
    accept_payload = {
        "goal": "Build Portfolio Website",
        "category": "Web Dev",
        "subtasks": [
            {"title": "Design UI Wireframes", "estimated_priority": "high"},
            {"title": "Implement Frontend Components", "estimated_priority": "medium"}
        ]
    }
    response = client.post("/api/ai/accept-breakdown", json=accept_payload)
    assert response.status_code == 200
    subtasks = response.json()
    assert len(subtasks) == 2

def test_ai_prioritization():
    # Seed tasks
    client.post("/api/tasks", json={"title": "Task A", "priority": "high", "due_date": "2026-08-10"})
    client.post("/api/tasks", json={"title": "Task B", "priority": "low"})

    response = client.post("/api/ai/prioritize")
    assert response.status_code == 200
    data = response.json()
    assert "priorities" in data
    assert len(data["priorities"]) >= 2
    assert "summary" in data
