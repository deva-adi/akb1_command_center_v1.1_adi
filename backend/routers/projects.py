from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    db_project = db.query(models.Project).filter(models.Project.name == project.name).first()
    if db_project:
        raise HTTPException(status_code=400, detail="Project with this name already exists")
    return crud.create_project(db, project)

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a project by ID."""
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all projects with pagination."""
    return crud.get_projects(db, skip=skip, limit=limit)

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project."""
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.update_project(db, project_id, project)

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project."""
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.delete_project(db, project_id)

@router.get("/dashboard/summary", response_model=dict)
def portfolio_dashboard(db: Session = Depends(get_db)):
    """Get portfolio dashboard aggregation data."""
    projects = db.query(models.Project).all()

    total = len(projects)
    green = len([p for p in projects if p.status == models.ProjectStatus.GREEN])
    amber = len([p for p in projects if p.status == models.ProjectStatus.AMBER])
    red = len([p for p in projects if p.status == models.ProjectStatus.RED])

    avg_health = sum([p.health_score for p in projects]) / total if total > 0 else 0
    total_budget_planned = sum([p.budget_planned for p in projects])
    total_budget_actual = sum([p.budget_actual for p in projects])

    return {
        "total_projects": total,
        "green": green,
        "amber": amber,
        "red": red,
        "average_health_score": round(avg_health, 2),
        "total_budget_planned": total_budget_planned,
        "total_budget_actual": total_budget_actual,
        "budget_variance": total_budget_planned - total_budget_actual
    }
