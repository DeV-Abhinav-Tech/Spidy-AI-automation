import json
import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.task import User, Task

class UserService:
    @staticmethod
    def get_or_create_user(db: Session, email: str, name: Optional[str] = None, credentials: Optional[str] = None) -> User:
        """Finds user by email or creates a new user profile."""
        email_clean = email.strip().lower()
        user = db.query(User).filter(User.email == email_clean).first()
        
        if not user:
            user_name = name or email_clean.split('@')[0].capitalize()
            initial_details = json.dumps({
                "llm_operations": 0,
                "subtasks_solved": 0,
                "activity_log": [f"Account registered at {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"]
            })
            user = User(
                email=email_clean,
                name=user_name,
                credentials=credentials.strip() if credentials else None,
                details=initial_details,
                created_at=datetime.datetime.utcnow(),
                last_active=datetime.datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.last_active = datetime.datetime.utcnow()
            if credentials and credentials.strip():
                user.credentials = credentials.strip()
            db.commit()
            db.refresh(user)
            
        return user

    @staticmethod
    def update_user_credentials(db: Session, email: str, credentials: str) -> User:
        """Updates user custom Gemini API credentials."""
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            user = UserService.get_or_create_user(db, email=email, credentials=credentials)
        else:
            user.credentials = credentials.strip()
            user.last_active = datetime.datetime.utcnow()
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def increment_llm_operations(db: Session, user_id: int, solved_subtask: bool = False):
        """Increments user LLM usage metrics in user.details JSON field."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return
            
        try:
            details_dict = json.loads(user.details) if user.details else {"llm_operations": 0, "subtasks_solved": 0, "activity_log": []}
        except Exception:
            details_dict = {"llm_operations": 0, "subtasks_solved": 0, "activity_log": []}
            
        details_dict["llm_operations"] = details_dict.get("llm_operations", 0) + 1
        if solved_subtask:
            details_dict["subtasks_solved"] = details_dict.get("subtasks_solved", 0) + 1
            
        user.details = json.dumps(details_dict)
        user.last_active = datetime.datetime.utcnow()
        db.commit()

    @staticmethod
    def get_user_analytics(db: Session, email: str) -> Dict[str, Any]:
        """Calculates user task stats, completion rates, and LLM operation metrics."""
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            user = UserService.get_or_create_user(db, email=email)

        tasks = db.query(Task).filter(Task.user_id == user.id).all()
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == 'completed'])
        pending_tasks = len([t for t in tasks if t.status == 'pending'])
        completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        try:
            details_dict = json.loads(user.details) if user.details else {}
        except Exception:
            details_dict = {}

        return {
            "email": user.email,
            "name": user.name,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "completion_rate_percentage": completion_rate,
            "total_llm_operations": details_dict.get("llm_operations", 0),
            "total_subtasks_solved": details_dict.get("subtasks_solved", 0),
            "has_custom_credentials": bool(user.credentials and len(user.credentials) > 5),
            "created_at": user.created_at,
            "last_active": user.last_active or user.created_at
        }
