from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/sprints", tags=["sprints"])

@router.post("/", response_model=schemas.SprintResponse)
def create_sprint(sprint: schemas.SprintCreate, db: Session = Depends(get_db)):
    """Create a new sprint."""
    project = crud.get_project(db, sprint.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_sprint(db, sprint)

@router.get("/{sprint_id}", response_model=schemas.SprintResponse)
def get_sprint(sprint_id: int, db: Session = Depends(get_db)):
    """Get a sprint by ID."""
    db_sprint = crud.get_sprint(db, sprint_id)
    if not db_sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return db_sprint

@router.get("/", response_model=List[schemas.SprintResponse])
def get_sprints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all sprints with pagination."""
    return crud.get_sprints(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.SprintResponse])
def get_sprints_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all sprints for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_sprints_by_project(db, project_id)

@router.put("/{sprint_id}", response_model=schemas.SprintResponse)
def update_sprint(sprint_id: int, sprint: schemas.SprintUpdate, db: Session = Depends(get_db)):
    """Update a sprint."""
    db_sprint = crud.get_sprint(db, sprint_id)
    if not db_sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return crud.update_sprint(db, sprint_id, sprint)

@router.delete("/{sprint_id}")
def delete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    """Delete a sprint."""
    db_sprint = crud.get_sprint(db, sprint_id)
    if not db_sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return crud.delete_sprint(db, sprint_id)
