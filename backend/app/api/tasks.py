from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    return TaskService.create_task(db, task_in)

@router.get("", response_model=List[TaskResponse])
@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status ('pending', 'completed')"),
    priority: Optional[str] = Query(None, description="Filter by priority ('low', 'medium', 'high')"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term for title or description"),
    parent_only: bool = Query(False, description="Return top-level tasks only"),
    db: Session = Depends(get_db)
):
    """Retrieve list of tasks matching filters."""
    return TaskService.get_tasks(db, status=status, priority=priority, category=category, search=search, parent_only=parent_only)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific task."""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return task

@router.patch("/{task_id}", response_model=TaskResponse)
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    """Update task properties."""
    updated = TaskService.update_task(db, task_id, task_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return updated

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Permanently delete a task."""
    success = TaskService.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return {"message": f"Task ID {task_id} deleted successfully."}

@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """Mark a task as completed."""
    completed = TaskService.complete_task(db, task_id)
    if not completed:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return completed

@router.post("/{task_id}/subtasks", response_model=List[TaskResponse])
def add_subtasks(task_id: int, subtasks: List[dict], db: Session = Depends(get_db)):
    """Add subtasks to a parent task."""
    try:
        return TaskService.create_subtasks(db, task_id, subtasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
