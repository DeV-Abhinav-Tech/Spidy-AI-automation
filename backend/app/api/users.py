from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.task import User
from app.schemas.user import (
    UserRegisterRequest, 
    UserLoginRequest, 
    ChangePasswordRequest, 
    UserCredentialsRequest, 
    UserProfileResponse, 
    UserAnalyticsResponse
)
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user account with password and optional Gemini credentials."""
    user, token = UserService.register_user(
        db,
        name=request.name,
        email=request.email,
        password=request.password,
        credentials=request.credentials
    )
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_custom_credentials=bool(user.credentials and len(user.credentials) > 5),
        token=token,
        created_at=user.created_at,
        last_active=user.last_active
    )

@router.post("/login", response_model=UserProfileResponse)
def login_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Logs in an existing user with email and password, returning profile and session token."""
    user, token = UserService.authenticate_user(
        db, 
        email=request.email, 
        password=request.password,
        name=request.name, 
        credentials=request.credentials
    )
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_custom_credentials=bool(user.credentials and len(user.credentials) > 5),
        token=token,
        created_at=user.created_at,
        last_active=user.last_active
    )

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    user_email: Optional[str] = Header(None, alias="X-User-Email"),
    db: Session = Depends(get_db)
):
    """Retrieves authenticated user profile based on X-User-Email header."""
    if not user_email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing user identity header.")
    
    user = db.query(User).filter(User.email == user_email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_custom_credentials=bool(user.credentials and len(user.credentials) > 5),
        created_at=user.created_at,
        last_active=user.last_active
    )

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db)):
    """Updates user password after verifying current credentials."""
    success = UserService.change_password(
        db,
        email=request.email,
        old_password=request.old_password,
        new_password=request.new_password
    )
    return {"status": "success", "message": "Password updated successfully."}

@router.put("/credentials", response_model=UserProfileResponse)
def update_credentials(request: UserCredentialsRequest, db: Session = Depends(get_db)):
    """Updates user's custom Gemini API Key or credentials string."""
    user = UserService.update_user_credentials(db, email=request.email, credentials=request.credentials)
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_custom_credentials=bool(user.credentials and len(user.credentials) > 5),
        created_at=user.created_at,
        last_active=user.last_active
    )

@router.get("/analytics", response_model=UserAnalyticsResponse)
def get_user_analytics(email: str = Query(..., min_length=3), db: Session = Depends(get_db)):
    """Calculates task completion analytics, Gemini LLM operations, and user records."""
    data = UserService.get_user_analytics(db, email=email)
    return UserAnalyticsResponse(**data)
