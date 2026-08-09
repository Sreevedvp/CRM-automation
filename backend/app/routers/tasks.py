from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task
from app.schemas import TaskResponse, TaskCreate

router = APIRouter(prefix="/api/tasks", tags=["Sales Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(status: Optional[str] = None, assigned_to: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    return query.order_by(Task.due_date.asc()).all()

@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        lead_id=payload.lead_id,
        type=payload.type,
        title=payload.title,
        due_date=payload.due_date,
        assigned_to=payload.assigned_to,
        notes=payload.notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task
