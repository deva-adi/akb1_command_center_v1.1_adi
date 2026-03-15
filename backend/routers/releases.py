from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/releases", tags=["releases"])

@router.post("/", response_model=schemas.ReleaseResponse)
def create_release(release: schemas.ReleaseCreate, db: Session = Depends(get_db)):
    """Create a new release."""
    project = crud.get_project(db, release.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_release(db, release)

@router.get("/{release_id}", response_model=schemas.ReleaseResponse)
def get_release(release_id: int, db: Session = Depends(get_db)):
    """Get a release by ID."""
    db_release = crud.get_release(db, release_id)
    if not db_release:
        raise HTTPException(status_code=404, detail="Release not found")
    return db_release

@router.get("/", response_model=List[schemas.ReleaseResponse])
def get_releases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all releases with pagination."""
    return crud.get_releases(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.ReleaseResponse])
def get_releases_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all releases for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_releases_by_project(db, project_id)

@router.put("/{release_id}", response_model=schemas.ReleaseResponse)
def update_release(release_id: int, release: schemas.ReleaseUpdate, db: Session = Depends(get_db)):
    """Update a release."""
    db_release = crud.get_release(db, release_id)
    if not db_release:
        raise HTTPException(status_code=404, detail="Release not found")
    return crud.update_release(db, release_id, release)

@router.delete("/{release_id}")
def delete_release(release_id: int, db: Session = Depends(get_db)):
    """Delete a release."""
    db_release = crud.get_release(db, release_id)
    if not db_release:
        raise HTTPException(status_code=404, detail="Release not found")
    return crud.delete_release(db, release_id)
