from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.post("/", response_model=schemas.SettingResponse)
def create_setting(setting: schemas.SettingCreate, db: Session = Depends(get_db)):
    """Create a new setting."""
    existing = crud.get_setting_by_key(db, setting.key)
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    return crud.create_setting(db, setting)

@router.get("/{setting_id}", response_model=schemas.SettingResponse)
def get_setting(setting_id: int, db: Session = Depends(get_db)):
    """Get a setting by ID."""
    db_setting = crud.get_setting(db, setting_id)
    if not db_setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return db_setting

@router.get("/key/{key}", response_model=schemas.SettingResponse)
def get_setting_by_key(key: str, db: Session = Depends(get_db)):
    """Get a setting by key."""
    db_setting = crud.get_setting_by_key(db, key)
    if not db_setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return db_setting

@router.get("/", response_model=List[schemas.SettingResponse])
def get_settings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all settings with pagination."""
    return crud.get_settings(db, skip=skip, limit=limit)

@router.get("/category/{category}", response_model=List[schemas.SettingResponse])
def get_settings_by_category(category: str, db: Session = Depends(get_db)):
    """Get settings by category."""
    try:
        category_enum = models.SettingCategory[category.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    return crud.get_settings_by_category(db, category_enum)

@router.put("/{setting_id}", response_model=schemas.SettingResponse)
def update_setting(setting_id: int, setting: schemas.SettingUpdate, db: Session = Depends(get_db)):
    """Update a setting."""
    db_setting = crud.get_setting(db, setting_id)
    if not db_setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return crud.update_setting(db, setting_id, setting)

@router.delete("/{setting_id}")
def delete_setting(setting_id: int, db: Session = Depends(get_db)):
    """Delete a setting."""
    db_setting = crud.get_setting(db, setting_id)
    if not db_setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return crud.delete_setting(db, setting_id)

@router.post("/bulk-update", response_model=dict)
def bulk_update_settings(updates: List[dict], db: Session = Depends(get_db)):
    """Bulk update multiple settings."""
    results = []
    for update in updates:
        key = update.get("key")
        value = update.get("value")
        description = update.get("description")

        if not key or not value:
            continue

        db_setting = crud.get_setting_by_key(db, key)
        if db_setting:
            schema_update = schemas.SettingUpdate(
                value=value,
                description=description
            )
            updated = crud.update_setting(db, db_setting.id, schema_update)
            results.append({"key": key, "status": "updated"})
        else:
            category = update.get("category", "GENERAL")
            try:
                category_enum = models.SettingCategory[category.upper()]
            except KeyError:
                category_enum = models.SettingCategory.GENERAL

            setting = schemas.SettingCreate(
                key=key,
                value=value,
                category=category_enum,
                description=description
            )
            crud.create_setting(db, setting)
            results.append({"key": key, "status": "created"})

    return {"results": results, "total": len(results)}
