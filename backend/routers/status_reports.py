from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/status-reports", tags=["status_reports"])

@router.post("/", response_model=schemas.StatusReportResponse)
def create_status_report(report: schemas.StatusReportCreate, db: Session = Depends(get_db)):
    """Create a new status report."""
    project = crud.get_project(db, report.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_status_report(db, report)

@router.get("/{report_id}", response_model=schemas.StatusReportResponse)
def get_status_report(report_id: int, db: Session = Depends(get_db)):
    """Get a status report by ID."""
    db_report = crud.get_status_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Status report not found")
    return db_report

@router.get("/", response_model=List[schemas.StatusReportResponse])
def get_status_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all status reports with pagination."""
    return crud.get_status_reports(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.StatusReportResponse])
def get_status_reports_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all status reports for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_status_reports_by_project(db, project_id)

@router.put("/{report_id}", response_model=schemas.StatusReportResponse)
def update_status_report(report_id: int, report: schemas.StatusReportUpdate, db: Session = Depends(get_db)):
    """Update a status report."""
    db_report = crud.get_status_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Status report not found")
    return crud.update_status_report(db, report_id, report)

@router.delete("/{report_id}")
def delete_status_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a status report."""
    db_report = crud.get_status_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Status report not found")
    return crud.delete_status_report(db, report_id)
