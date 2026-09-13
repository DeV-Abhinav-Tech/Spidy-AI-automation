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
from app.models.task import User, Task, Conversation, Message

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
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

def test_register_and_login_flow():
    # 1. Register new account
    reg_payload = {
        "name": "Alice Tester",
        "email": "alice@example.com",
        "password": "SecurePassword123!",
        "credentials": "test_gemini_key_12345"
    }
    resp = client.post("/api/users/register", json=reg_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice Tester"
    assert data["has_custom_credentials"] is True
    assert "token" in data and len(data["token"]) > 10

    # 2. Duplicate registration fails
    dup_resp = client.post("/api/users/register", json=reg_payload)
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"].lower()

    # 3. Login with correct password
    login_payload = {
        "email": "alice@example.com",
        "password": "SecurePassword123!"
    }
    login_resp = client.post("/api/users/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["email"] == "alice@example.com"
    assert "token" in login_data

    # 4. Login with wrong password fails
    wrong_login = {
        "email": "alice@example.com",
        "password": "WrongPassword!"
    }
    wrong_resp = client.post("/api/users/login", json=wrong_login)
    assert wrong_resp.status_code == 401
    assert "invalid" in wrong_resp.json()["detail"].lower()

    # 5. Change password
    change_payload = {
        "email": "alice@example.com",
        "old_password": "SecurePassword123!",
        "new_password": "BrandNewPassword2026!"
    }
    change_resp = client.post("/api/users/change-password", json=change_payload)
    assert change_resp.status_code == 200
    assert change_resp.json()["status"] == "success"

    # 6. Login with new password succeeds
    new_login = {
        "email": "alice@example.com",
        "password": "BrandNewPassword2026!"
    }
    new_login_resp = client.post("/api/users/login", json=new_login)
    assert new_login_resp.status_code == 200
