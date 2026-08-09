from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="pending")
    priority: str = Field(default="medium")
    category: str = Field(default="general")
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    reminder_time: Optional[str] = None
    solution_output: Optional[str] = None
    parent_task_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    reminder_time: Optional[str] = None
    solution_output: Optional[str] = None
    parent_task_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    reminder_sent: bool
    solution_output: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    subtasks: List['TaskResponse'] = []

    model_config = ConfigDict(from_attributes=True)

# Re-build model to resolve recursive subtasks schema reference
TaskResponse.model_rebuild()
