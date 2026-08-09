from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.ai_service import AIService
from app.services.task_service import TaskService
from app.schemas.ai import (
    ChatRequest, ChatResponse, BreakdownRequest, BreakdownResponse, 
    AcceptBreakdownRequest, PrioritizationResponse
)
from app.schemas.task import TaskCreate, TaskResponse

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])
ai_service = AIService()

@router.post("/chat", response_model=ChatResponse)
@router.post("/parse-task", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    """Process natural language request using tool calling engine."""
    try:
        result = ai_service.chat_with_tools(db, user_message=request.message)
        conv_id = request.conversation_id or 1
        return ChatResponse(
            response=result["response"],
            conversation_id=conv_id,
            tool_executed=result.get("tool_executed")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Error: {str(e)}")

@router.post("/task-breakdown", response_model=BreakdownResponse)
@router.post("/generate-subtasks", response_model=BreakdownResponse)
def generate_task_breakdown(request: BreakdownRequest):
    """Generates structured subtask recommendations for a high-level goal."""
    try:
        suggestions = ai_service.generate_task_breakdown(goal=request.goal, category=request.category)
        return BreakdownResponse(goal=request.goal, subtasks=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task breakdown generation failed: {str(e)}")

@router.post("/accept-breakdown", response_model=List[TaskResponse])
def accept_task_breakdown(request: AcceptBreakdownRequest, db: Session = Depends(get_db)):
    """Persists accepted AI-generated breakdown as actual task and subtasks in DB."""
    try:
        # Create parent task if not provided
        parent_id = request.parent_task_id
        if not parent_id:
            parent_task_data = TaskCreate(
                title=request.goal,
                description=f"High-level goal broken down into {len(request.subtasks)} subtasks",
                category=request.category,
                priority="high"
            )
            parent = TaskService.create_task(db, parent_task_data)
            parent_id = parent.id

        subtasks_data = [s.model_dump() for s in request.subtasks]
        created_subtasks = TaskService.create_subtasks(db, parent_id, subtasks_data)
        return created_subtasks

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save task breakdown: {str(e)}")

@router.post("/prioritize", response_model=PrioritizationResponse)
def prioritize_user_tasks(db: Session = Depends(get_db)):
    """Evaluates all pending tasks and returns multi-factor priority recommendations with rationale."""
    try:
        pending_tasks = TaskService.get_tasks(db, status="pending")
        task_dicts = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "category": t.category,
                "due_date": t.due_date,
                "subtasks": [st.id for st in t.subtasks]
            }
            for t in pending_tasks
        ]
        return ai_service.prioritize_tasks(task_dicts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Priority recommendation failed: {str(e)}")

@router.post("/solve-subtasks/{parent_task_id}")
def solve_parent_subtasks(parent_task_id: int, user_email: Optional[str] = Header(None, alias="X-User-Email"), db: Session = Depends(get_db)):
    """AI Agent retrieves subtasks under parent_task_id, generates solutions using LLM, and tracks progress."""
    from app.services.user_service import UserService
    parent = TaskService.get_task_by_id(db, parent_task_id)
    if not parent:
        raise HTTPException(status_code=404, detail=f"Parent task with ID {parent_task_id} not found")

    user_api_key = None
    user = None
    if user_email:
        user = UserService.get_or_create_user(db, user_email)
        user_api_key = user.credentials

    solutions = []
    for st in parent.subtasks:
        st.status = "in_progress"
        db.commit()

        # Solve subtask with LLM
        solution_text = ai_service.solve_subtask(title=st.title, description=st.description, goal_context=parent.title, user_api_key=user_api_key)
        st.solution_output = solution_text
        st.status = "completed"
        db.commit()

        if user:
            UserService.increment_llm_operations(db, user.id, solved_subtask=True)

        solutions.append({
            "subtask_id": st.id,
            "title": st.title,
            "solution_output": solution_text,
            "status": "completed"
        })

    return {
        "parent_task_id": parent.id,
        "goal": parent.title,
        "total_subtasks": len(parent.subtasks),
        "completed_subtasks": len(solutions),
        "solutions": solutions,
        "summary": f"Successfully solved and completed all {len(solutions)} subtasks under '{parent.title}'."
    }

@router.post("/auto-execute-goal")
def auto_execute_goal(request: Dict[str, Any], user_email: Optional[str] = Header(None, alias="X-User-Email"), db: Session = Depends(get_db)):
    """AI Agent breaks down a goal, creates subtasks, solves each subtask with LLM, and tracks completion."""
    from app.services.user_service import UserService
    goal = request.get("goal")
    category = request.get("category", "Project")
    email = request.get("email") or user_email or "default@example.com"
    
    if not goal:
        raise HTTPException(status_code=400, detail="Missing required field 'goal'")

    user = UserService.get_or_create_user(db, email=email)
    user_api_key = user.credentials

    # 1. Create Parent Goal Task
    parent_data = TaskCreate(
        title=goal,
        description=f"Autonomous AI Agent goal decomposition & execution for '{goal}'",
        category=category,
        priority="high"
    )
    parent = TaskService.create_task(db, parent_data, user_id=user.id)

    # 2. Generate subtasks breakdown
    suggestions = ai_service.generate_task_breakdown(goal=goal, category=category)
    subtask_dicts = [s.model_dump() for s in suggestions]
    created_subtasks = TaskService.create_subtasks(db, parent.id, subtask_dicts)

    # 3. Solve each subtask autonomously
    solutions = []
    for st in created_subtasks:
        st.status = "in_progress"
        db.commit()

        sol_text = ai_service.solve_subtask(title=st.title, description=st.description, goal_context=goal, user_api_key=user_api_key)
        st.solution_output = sol_text
        st.status = "completed"
        db.commit()

        UserService.increment_llm_operations(db, user.id, solved_subtask=True)

        solutions.append({
            "subtask_id": st.id,
            "title": st.title,
            "solution_output": sol_text,
            "status": "completed"
        })

    # Mark parent task completed when all subtasks solved
    parent.status = "completed"
    db.commit()

    return {
        "parent_task_id": parent.id,
        "goal": parent.title,
        "total_subtasks": len(solutions),
        "completed_subtasks": len(solutions),
        "solutions": solutions,
        "summary": f"Autonomous AI Agent broke down '{goal}' into {len(solutions)} subtasks, solved each with LLM, and marked goal complete for {user.email}."
    }
