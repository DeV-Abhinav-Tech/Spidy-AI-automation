from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, description="User Email ID")
    name: Optional[str] = None
    credentials: Optional[str] = Field(None, description="Optional custom Gemini API key")

class UserCredentialsRequest(BaseModel):
    email: str = Field(..., min_length=3)
    credentials: str = Field(..., min_length=1, description="Gemini API Key or credentials string")

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    has_custom_credentials: bool
    created_at: datetime
    last_active: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserAnalyticsResponse(BaseModel):
    email: str
    name: str
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_rate_percentage: float
    total_llm_operations: int
    total_subtasks_solved: int
    has_custom_credentials: bool
    created_at: datetime
    last_active: Optional[datetime] = None
