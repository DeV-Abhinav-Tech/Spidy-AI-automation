from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.task import Task, User
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    def get_or_create_default_user(db: Session) -> User:
        from app.database.session import Base
        try:
            user = db.query(User).filter(User.id == 1).first()
        except Exception:
            db.rollback()
            bind = db.get_bind()
            if bind:
                Base.metadata.create_all(bind=bind)
            user = db.query(User).filter(User.id == 1).first()

        if not user:
            user = User(id=1, name="Default User", email="student@example.com")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def create_task(db: Session, task_data: TaskCreate, user_id: int = 1) -> Task:
        TaskService.get_or_create_default_user(db)
        db_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status or "pending",
            priority=task_data.priority or "medium",
            category=task_data.category or "general",
            due_date=task_data.due_date,
            due_time=task_data.due_time,
            reminder_time=task_data.reminder_time,
            parent_task_id=task_data.parent_task_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_tasks(
        db: Session,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        parent_only: bool = False
    ) -> List[Task]:
        query = db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if category:
            query = query.filter(Task.category == category)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(or_(Task.title.ilike(search_pattern), Task.description.ilike(search_pattern)))
        if parent_only:
            query = query.filter(Task.parent_task_id == None)

        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def update_task(db: Session, task_id: int, update_data: TaskUpdate) -> Optional[Task]:
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task_id: int) -> bool:
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return False
        db.delete(task)
        db.commit()
        return True

    @staticmethod
    def complete_task(db: Session, task_id: int) -> Optional[Task]:
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return None
        task.status = "completed"
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def create_subtasks(db: Session, parent_task_id: int, subtasks: List[dict], user_id: int = 1) -> List[Task]:
        parent = TaskService.get_task_by_id(db, parent_task_id)
        if not parent:
            raise ValueError(f"Parent task with ID {parent_task_id} not found.")

        created_list = []
        for st in subtasks:
            title = st.get("title")
            if not title:
                continue
            subtask_obj = Task(
                user_id=user_id,
                title=title,
                description=st.get("description"),
                status="pending",
                priority=st.get("estimated_priority") or st.get("priority") or parent.priority,
                category=parent.category,
                parent_task_id=parent_task_id
            )
            db.add(subtask_obj)
            created_list.append(subtask_obj)
        
        db.commit()
        for t in created_list:
            db.refresh(t)
        return created_list
