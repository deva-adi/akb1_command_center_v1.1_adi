from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/dependencies", tags=["dependencies"])

@router.post("/", response_model=schemas.DependencyResponse)
def create_dependency(dependency: schemas.DependencyCreate, db: Session = Depends(get_db)):
    """Create a new dependency."""
    project = crud.get_project(db, dependency.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_dependency(db, dependency)

@router.get("/{dependency_id}", response_model=schemas.DependencyResponse)
def get_dependency(dependency_id: int, db: Session = Depends(get_db)):
    """Get a dependency by ID."""
    db_dependency = crud.get_dependency(db, dependency_id)
    if not db_dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return db_dependency

@router.get("/", response_model=List[schemas.DependencyResponse])
def get_dependencies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all dependencies with pagination."""
    return crud.get_dependencies(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.DependencyResponse])
def get_dependencies_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all dependencies for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_dependencies_by_project(db, project_id)

@router.put("/{dependency_id}", response_model=schemas.DependencyResponse)
def update_dependency(dependency_id: int, dependency: schemas.DependencyUpdate, db: Session = Depends(get_db)):
    """Update a dependency."""
    db_dependency = crud.get_dependency(db, dependency_id)
    if not db_dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return crud.update_dependency(db, dependency_id, dependency)

@router.delete("/{dependency_id}")
def delete_dependency(dependency_id: int, db: Session = Depends(get_db)):
    """Delete a dependency."""
    db_dependency = crud.get_dependency(db, dependency_id)
    if not db_dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return crud.delete_dependency(db, dependency_id)
