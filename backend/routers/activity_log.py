from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/activity-log", tags=["activity_log"])

@router.get("/", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all activity logs with pagination."""
    return crud.get_activity_logs(db, skip=skip, limit=limit)

@router.get("/entity/{entity_type}", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs_by_entity(entity_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get activity logs filtered by entity type."""
    return crud.get_activity_logs_by_entity(db, entity_type, skip=skip, limit=limit)

@router.get("/action/{action}", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs_by_action(action: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get activity logs filtered by action type."""
    try:
        action_enum = models.ActivityAction[action.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")

    return crud.get_activity_logs_by_action(db, action_enum, skip=skip, limit=limit)

@router.get("/summary", response_model=dict)
def activity_summary(db: Session = Depends(get_db)):
    """Get activity summary statistics."""
    all_logs = db.query(models.ActivityLog).all()

    action_counts = {}
    entity_counts = {}

    for log in all_logs:
        action_counts[log.action.value] = action_counts.get(log.action.value, 0) + 1
        entity_counts[log.entity_type] = entity_counts.get(log.entity_type, 0) + 1

    return {
        "total_activities": len(all_logs),
        "actions": action_counts,
        "entities": entity_counts,
        "recent_activities": [
            {
                "id": log.id,
                "action": log.action.value,
                "entity_type": log.entity_type,
                "entity_name": log.entity_name,
                "timestamp": log.timestamp
            }
            for log in sorted(all_logs, key=lambda x: x.timestamp, reverse=True)[:10]
        ]
    }
