import json
import datetime
from typing import Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.task import User, Task
from app.services.auth_utils import hash_password, verify_password, generate_session_token

class UserService:
    @staticmethod
    def register_user(db: Session, name: str, email: str, password: str, credentials: Optional[str] = None) -> Tuple[User, str]:
        """Registers a brand new user with secure password hashing."""
        email_clean = email.strip().lower()
        existing = db.query(User).filter(User.email == email_clean).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please sign in instead."
            )

        hashed = hash_password(password.strip())
        initial_details = json.dumps({
            "llm_operations": 0,
            "subtasks_solved": 0,
            "activity_log": [f"Account registered at {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"]
        })

        user = User(
            email=email_clean,
            name=name.strip(),
            password_hash=hashed,
            credentials=credentials.strip() if credentials else None,
            details=initial_details,
            created_at=datetime.datetime.utcnow(),
            last_active=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = generate_session_token()
        return user, token

    @staticmethod
    def authenticate_user(db: Session, email: str, password: Optional[str] = None, name: Optional[str] = None, credentials: Optional[str] = None) -> Tuple[User, str]:
        """Authenticates an existing user or creates a profile with optional password."""
        email_clean = email.strip().lower()
        user = db.query(User).filter(User.email == email_clean).first()

        if not user:
            # If account does not exist and password is provided, auto-register
            if password and password.strip():
                return UserService.register_user(db, name or email_clean.split('@')[0].capitalize(), email_clean, password, credentials)
            # Legacy fallback creation without password
            user = UserService.get_or_create_user(db, email=email_clean, name=name, credentials=credentials)
            token = generate_session_token()
            return user, token

        # If user has password protection configured
        if user.password_hash:
            if not password:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Password required to access this account."
                )
            if not verify_password(password.strip(), user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials. Please verify your password and try again."
                )
        else:
            # If legacy user has no password yet and provides one now, set it for future protection
            if password and password.strip():
                user.password_hash = hash_password(password.strip())

        user.last_active = datetime.datetime.utcnow()
        if credentials and credentials.strip():
            user.credentials = credentials.strip()
        db.commit()
        db.refresh(user)

        token = generate_session_token()
        return user, token

    @staticmethod
    def change_password(db: Session, email: str, old_password: str, new_password: str) -> bool:
        """Securely changes a user password after verifying current password."""
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        if user.password_hash and not verify_password(old_password.strip(), user.password_hash):
            raise HTTPException(status_code=400, detail="Current password does not match.")

        user.password_hash = hash_password(new_password.strip())
        user.last_active = datetime.datetime.utcnow()
        db.commit()
        return True

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
