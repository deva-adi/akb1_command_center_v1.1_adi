from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/risks", tags=["risks"])

@router.post("/", response_model=schemas.RiskResponse)
def create_risk(risk: schemas.RiskCreate, db: Session = Depends(get_db)):
    """Create a new risk."""
    project = crud.get_project(db, risk.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_risk(db, risk)

@router.get("/{risk_id}", response_model=schemas.RiskResponse)
def get_risk(risk_id: int, db: Session = Depends(get_db)):
    """Get a risk by ID."""
    db_risk = crud.get_risk(db, risk_id)
    if not db_risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return db_risk

@router.get("/", response_model=List[schemas.RiskResponse])
def get_risks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all risks with pagination."""
    return crud.get_risks(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.RiskResponse])
def get_risks_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all risks for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_risks_by_project(db, project_id)

@router.put("/{risk_id}", response_model=schemas.RiskResponse)
def update_risk(risk_id: int, risk: schemas.RiskUpdate, db: Session = Depends(get_db)):
    """Update a risk."""
    db_risk = crud.get_risk(db, risk_id)
    if not db_risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return crud.update_risk(db, risk_id, risk)

@router.delete("/{risk_id}")
def delete_risk(risk_id: int, db: Session = Depends(get_db)):
    """Delete a risk."""
    db_risk = crud.get_risk(db, risk_id)
    if not db_risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return crud.delete_risk(db, risk_id)

@router.get("/dashboard/heatmap", response_model=dict)
def risk_heatmap(db: Session = Depends(get_db)):
    """Get risk matrix heatmap data."""
    risks = db.query(models.Risk).all()

    # Create 5x5 matrix (probability 1-5, impact 1-5)
    matrix = [[[] for _ in range(5)] for _ in range(5)]

    for risk in risks:
        prob_idx = risk.probability - 1
        impact_idx = risk.impact - 1
        if 0 <= prob_idx < 5 and 0 <= impact_idx < 5:
            matrix[prob_idx][impact_idx].append({
                "id": risk.id,
                "title": risk.title,
                "score": risk.risk_score,
                "status": risk.status.value
            })

    # Risk status summary
    open_risks = len([r for r in risks if r.status == models.RiskStatus.OPEN])
    in_progress = len([r for r in risks if r.status == models.RiskStatus.IN_PROGRESS])
    resolved = len([r for r in risks if r.status == models.RiskStatus.RESOLVED])
    blocked = len([r for r in risks if r.status == models.RiskStatus.BLOCKED])

    # High-risk count (risk_score > 15)
    high_risk = len([r for r in risks if r.risk_score > 15])
    medium_risk = len([r for r in risks if 9 <= r.risk_score <= 15])
    low_risk = len([r for r in risks if r.risk_score < 9])

    return {
        "matrix": matrix,
        "total_risks": len(risks),
        "status_summary": {
            "open": open_risks,
            "in_progress": in_progress,
            "resolved": resolved,
            "blocked": blocked
        },
        "severity_summary": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        }
    }
