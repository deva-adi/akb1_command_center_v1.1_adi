from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/kpis", tags=["kpis"])

@router.post("/", response_model=schemas.KPIResponse)
def create_kpi(kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    """Create a new KPI."""
    db_kpi = db.query(models.KPI).filter(models.KPI.name == kpi.name).first()
    if db_kpi:
        raise HTTPException(status_code=400, detail="KPI with this name already exists")
    return crud.create_kpi(db, kpi)

@router.get("/{kpi_id}", response_model=schemas.KPIResponse)
def get_kpi(kpi_id: int, db: Session = Depends(get_db)):
    """Get a KPI by ID."""
    db_kpi = crud.get_kpi(db, kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return db_kpi

@router.get("/", response_model=List[schemas.KPIResponse])
def get_kpis(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all active KPIs with pagination."""
    return crud.get_kpis(db, skip=skip, limit=limit)

@router.put("/{kpi_id}", response_model=schemas.KPIResponse)
def update_kpi(kpi_id: int, kpi: schemas.KPIUpdate, db: Session = Depends(get_db)):
    """Update a KPI."""
    db_kpi = crud.get_kpi(db, kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return crud.update_kpi(db, kpi_id, kpi)

@router.delete("/{kpi_id}")
def delete_kpi(kpi_id: int, db: Session = Depends(get_db)):
    """Delete a KPI."""
    db_kpi = crud.get_kpi(db, kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return crud.delete_kpi(db, kpi_id)

@router.get("/dashboard/summary", response_model=dict)
def kpi_dashboard_summary(db: Session = Depends(get_db)):
    """Get KPI dashboard summary with status indicators."""
    kpis = db.query(models.KPI).filter(models.KPI.is_active == True).all()

    kpi_summaries = []
    for kpi in kpis:
        if kpi.value >= kpi.threshold_green:
            status = "GREEN"
        elif kpi.value >= kpi.threshold_red:
            status = "AMBER"
        else:
            status = "RED"

        kpi_summaries.append({
            "id": kpi.id,
            "name": kpi.name,
            "value": kpi.value,
            "target": kpi.target,
            "unit": kpi.unit,
            "status": status,
            "variance": round(kpi.value - kpi.target, 2)
        })

    total_kpis = len(kpi_summaries)
    green_count = len([k for k in kpi_summaries if k["status"] == "GREEN"])
    amber_count = len([k for k in kpi_summaries if k["status"] == "AMBER"])
    red_count = len([k for k in kpi_summaries if k["status"] == "RED"])

    return {
        "total_kpis": total_kpis,
        "green_count": green_count,
        "amber_count": amber_count,
        "red_count": red_count,
        "kpis": kpi_summaries
    }
