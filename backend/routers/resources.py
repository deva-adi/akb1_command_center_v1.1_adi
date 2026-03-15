from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.post("/", response_model=schemas.ResourceResponse)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    """Create a new resource."""
    project = crud.get_project(db, resource.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.create_resource(db, resource)

@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get a resource by ID."""
    db_resource = crud.get_resource(db, resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db_resource

@router.get("/", response_model=List[schemas.ResourceResponse])
def get_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all resources with pagination."""
    return crud.get_resources(db, skip=skip, limit=limit)

@router.get("/project/{project_id}", response_model=List[schemas.ResourceResponse])
def get_resources_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all resources for a project."""
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.get_resources_by_project(db, project_id)

@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(resource_id: int, resource: schemas.ResourceUpdate, db: Session = Depends(get_db)):
    """Update a resource."""
    db_resource = crud.get_resource(db, resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud.update_resource(db, resource_id, resource)

@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    """Delete a resource."""
    db_resource = crud.get_resource(db, resource_id)
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return crud.delete_resource(db, resource_id)

@router.get("/dashboard/heatmap", response_model=dict)
def utilization_heatmap(db: Session = Depends(get_db)):
    """Get resource utilization heatmap data by team and role."""
    resources = db.query(models.Resource).all()

    # Group by team and role
    team_utilization = {}
    for resource in resources:
        key = f"{resource.team}:{resource.role}"
        if key not in team_utilization:
            team_utilization[key] = {
                "team": resource.team,
                "role": resource.role,
                "resources": [],
                "avg_utilization": 0.0
            }
        team_utilization[key]["resources"].append({
            "id": resource.id,
            "name": resource.name,
            "utilization": resource.utilization,
            "allocation_percent": resource.allocation_percent
        })

    # Calculate average utilization per team:role
    for key in team_utilization:
        utilizations = [r["utilization"] for r in team_utilization[key]["resources"]]
        team_utilization[key]["avg_utilization"] = round(sum(utilizations) / len(utilizations), 2) if utilizations else 0.0

    # Overall statistics
    total_resources = len(resources)
    avg_utilization = round(sum([r.utilization for r in resources]) / total_resources, 2) if total_resources > 0 else 0.0
    over_allocated = len([r for r in resources if r.utilization > 100])
    under_allocated = len([r for r in resources if r.utilization < 50])

    return {
        "total_resources": total_resources,
        "average_utilization": avg_utilization,
        "over_allocated_count": over_allocated,
        "under_allocated_count": under_allocated,
        "team_utilization": list(team_utilization.values())
    }
