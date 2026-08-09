from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.task import TaskResponse

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None

class ToolExecutionResult(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    success: bool
    error: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    tool_executed: Optional[ToolExecutionResult] = None

class BreakdownRequest(BaseModel):
    goal: str = Field(..., min_length=3)
    category: Optional[str] = "general"
    parent_task_id: Optional[int] = None

class SubtaskSuggestion(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_priority: str = "medium"

class BreakdownResponse(BaseModel):
    goal: str
    subtasks: List[SubtaskSuggestion]

class AcceptBreakdownRequest(BaseModel):
    goal: str
    category: str = "general"
    parent_task_id: Optional[int] = None
    subtasks: List[SubtaskSuggestion]

class TaskPriorityItem(BaseModel):
    task_id: int
    title: str
    suggested_priority: str
    score: float
    rationale: str

class PrioritizationResponse(BaseModel):
    priorities: List[TaskPriorityItem]
    summary: str

class AutoSolveRequest(BaseModel):
    goal: str = Field(..., min_length=3)
    category: Optional[str] = "Project"

class SubtaskSolutionResult(BaseModel):
    subtask_id: int
    title: str
    solution_output: str
    status: str = "completed"

class AutoSolveResponse(BaseModel):
    parent_task_id: int
    goal: str
    total_subtasks: int
    completed_subtasks: int
    solutions: List[SubtaskSolutionResult]
    summary: str
