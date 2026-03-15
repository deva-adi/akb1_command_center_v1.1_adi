from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/estimations", tags=["estimations"])

@router.post("/", response_model=schemas.EstimationResponse)
def create_estimation(estimation: schemas.EstimationCreate, db: Session = Depends(get_db)):
    """Create a new estimation."""
    project = crud.get_project(db, estimation.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_estimation(db, estimation)

@router.get("/{estimation_id}", response_model=schemas.EstimationResponse)
def get_estimation(estimation_id: int, db: Session = Depends(get_db)):
    """Get an estimation by ID."""
    db_estimation = crud.get_estimation(db, estimation_id)
    if not db_estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return db_estimation

@router.get("/", response_model=List[schemas.EstimationResponse])
def get_estimations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all estimations with pagination."""
    return crud.get_estimations(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.EstimationResponse])
def get_estimations_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all estimations for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_estimations_by_project(db, project_id)

@router.put("/{estimation_id}", response_model=schemas.EstimationResponse)
def update_estimation(estimation_id: int, estimation: schemas.EstimationUpdate, db: Session = Depends(get_db)):
    """Update an estimation."""
    db_estimation = crud.get_estimation(db, estimation_id)
    if not db_estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return crud.update_estimation(db, estimation_id, estimation)

@router.delete("/{estimation_id}")
def delete_estimation(estimation_id: int, db: Session = Depends(get_db)):
    """Delete an estimation."""
    db_estimation = crud.get_estimation(db, estimation_id)
    if not db_estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return crud.delete_estimation(db, estimation_id)
