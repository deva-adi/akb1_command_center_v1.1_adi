from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/change-requests", tags=["change_requests"])

@router.post("/", response_model=schemas.ChangeRequestResponse)
def create_change_request(cr: schemas.ChangeRequestCreate, db: Session = Depends(get_db)):
    """Create a new change request."""
    project = crud.get_project(db, cr.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_change_request(db, cr)

@router.get("/{cr_id}", response_model=schemas.ChangeRequestResponse)
def get_change_request(cr_id: int, db: Session = Depends(get_db)):
    """Get a change request by ID."""
    db_cr = crud.get_change_request(db, cr_id)
    if not db_cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    return db_cr

@router.get("/", response_model=List[schemas.ChangeRequestResponse])
def get_change_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all change requests with pagination."""
    return crud.get_change_requests(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.ChangeRequestResponse])
def get_change_requests_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all change requests for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_change_requests_by_project(db, project_id)

@router.put("/{cr_id}", response_model=schemas.ChangeRequestResponse)
def update_change_request(cr_id: int, cr: schemas.ChangeRequestUpdate, db: Session = Depends(get_db)):
    """Update a change request."""
    db_cr = crud.get_change_request(db, cr_id)
    if not db_cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    return crud.update_change_request(db, cr_id, cr)

@router.delete("/{cr_id}")
def delete_change_request(cr_id: int, db: Session = Depends(get_db)):
    """Delete a change request."""
    db_cr = crud.get_change_request(db, cr_id)
    if not db_cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    return crud.delete_change_request(db, cr_id)
