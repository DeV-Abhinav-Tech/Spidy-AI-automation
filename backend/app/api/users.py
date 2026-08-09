from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserLoginRequest, UserCredentialsRequest, UserProfileResponse, UserAnalyticsResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/login", response_model=UserProfileResponse)
def login_or_register_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Logs in or registers user by Email ID, saving optional Gemini credentials."""
    user = UserService.get_or_create_user(
        db, 
        email=request.email, 
        name=request.name, 
        credentials=request.credentials
    )
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        has_custom_credentials=bool(user.credentials and len(user.credentials) > 5),
        created_at=user.created_at,
        last_active=user.last_active
    )

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
