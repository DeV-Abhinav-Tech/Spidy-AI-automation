import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_tasks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.pop(get_db, None)

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_and_get_task():
    # Test Create Task
    task_payload = {
        "title": "Study Python Unit Testing",
        "description": "Write pytest tests for API endpoints",
        "priority": "high",
        "category": "Academic",
        "due_date": "2026-08-10"
    }
    response = client.post("/api/tasks", json=task_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Study Python Unit Testing"
    assert data["priority"] == "high"
    task_id = data["id"]

    # Test Get Task by ID
    get_resp = client.get(f"/api/tasks/{task_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == task_id

def test_update_and_complete_task():
    # Create initial task
    create_resp = client.post("/api/tasks", json={"title": "Temporary Task"})
    task_id = create_resp.json()["id"]

    # Update Task
    update_resp = client.patch(f"/api/tasks/{task_id}", json={"priority": "high", "category": "Work"})
    assert update_resp.status_code == 200
    assert update_resp.json()["priority"] == "high"

    # Complete Task
    comp_resp = client.post(f"/api/tasks/{task_id}/complete")
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "completed"

def test_delete_task():
    create_resp = client.post("/api/tasks", json={"title": "To be deleted"})
    task_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/tasks/{task_id}")
    assert del_resp.status_code == 200

    # Verify 404 on get
    get_resp = client.get(f"/api/tasks/{task_id}")
    assert get_resp.status_code == 404

def test_invalid_task_id():
    response = client.get("/api/tasks/999999")
    assert response.status_code == 404
