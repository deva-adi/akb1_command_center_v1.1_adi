from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List
import models
import schemas

# ==================== ACTIVITY LOG HELPER ====================

def create_activity_log(
    db: Session,
    action: models.ActivityAction,
    entity_type: str,
    entity_id: int,
    entity_name: str,
    details: dict = None,
    user_ip: str = "127.0.0.1"
):
    """Create an activity log entry."""
    if details is None:
        details = {}

    log = models.ActivityLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        details=details,
        user_ip=user_ip,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

# ==================== PROJECT CRUD ====================

def create_project(db: Session, project: schemas.ProjectCreate, user_ip: str = "127.0.0.1"):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Project", db_project.id,
        db_project.name, {"status": db_project.status.value}, user_ip
    )
    return db_project

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate, user_ip: str = "127.0.0.1"):
    db_project = get_project(db, project_id)
    if not db_project:
        return None

    update_data = project.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Project", db_project.id,
        db_project.name, update_data, user_ip
    )
    return db_project

def delete_project(db: Session, project_id: int, user_ip: str = "127.0.0.1"):
    db_project = get_project(db, project_id)
    if not db_project:
        return None

    name = db_project.name
    db.delete(db_project)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Project", project_id, name, {}, user_ip
    )
    return db_project

# ==================== KPI CRUD ====================

def create_kpi(db: Session, kpi: schemas.KPICreate, user_ip: str = "127.0.0.1"):
    db_kpi = models.KPI(**kpi.dict())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    create_activity_log(
        db, models.ActivityAction.CREATE, "KPI", db_kpi.id,
        db_kpi.name, {"category": db_kpi.category}, user_ip
    )
    return db_kpi

def get_kpi(db: Session, kpi_id: int):
    return db.query(models.KPI).filter(models.KPI.id == kpi_id).first()

def get_kpis(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.KPI).filter(models.KPI.is_active == True).order_by(models.KPI.sort_order).offset(skip).limit(limit).all()

def update_kpi(db: Session, kpi_id: int, kpi: schemas.KPIUpdate, user_ip: str = "127.0.0.1"):
    db_kpi = get_kpi(db, kpi_id)
    if not db_kpi:
        return None

    update_data = kpi.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_kpi, key, value)

    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "KPI", db_kpi.id,
        db_kpi.name, update_data, user_ip
    )
    return db_kpi

def delete_kpi(db: Session, kpi_id: int, user_ip: str = "127.0.0.1"):
    db_kpi = get_kpi(db, kpi_id)
    if not db_kpi:
        return None

    name = db_kpi.name
    db.delete(db_kpi)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "KPI", kpi_id, name, {}, user_ip
    )
    return db_kpi

# ==================== RISK CRUD ====================

def create_risk(db: Session, risk: schemas.RiskCreate, user_ip: str = "127.0.0.1"):
    risk_score = risk.probability * risk.impact
    db_risk = models.Risk(**risk.dict(), risk_score=risk_score)
    db.add(db_risk)
    db.commit()
    db.refresh(db_risk)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Risk", db_risk.id,
        db_risk.title, {"risk_score": db_risk.risk_score, "project_id": db_risk.project_id}, user_ip
    )
    return db_risk

def get_risk(db: Session, risk_id: int):
    return db.query(models.Risk).filter(models.Risk.id == risk_id).first()

def get_risks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Risk).offset(skip).limit(limit).all()

def get_risks_by_project(db: Session, project_id: int):
    return db.query(models.Risk).filter(models.Risk.project_id == project_id).all()

def update_risk(db: Session, risk_id: int, risk: schemas.RiskUpdate, user_ip: str = "127.0.0.1"):
    db_risk = get_risk(db, risk_id)
    if not db_risk:
        return None

    update_data = risk.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_risk, key, value)

    if 'probability' in update_data or 'impact' in update_data:
        db_risk.risk_score = db_risk.probability * db_risk.impact

    db.add(db_risk)
    db.commit()
    db.refresh(db_risk)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Risk", db_risk.id,
        db_risk.title, update_data, user_ip
    )
    return db_risk

def delete_risk(db: Session, risk_id: int, user_ip: str = "127.0.0.1"):
    db_risk = get_risk(db, risk_id)
    if not db_risk:
        return None

    title = db_risk.title
    db.delete(db_risk)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Risk", risk_id, title, {}, user_ip
    )
    return db_risk

# ==================== SPRINT CRUD ====================

def create_sprint(db: Session, sprint: schemas.SprintCreate, user_ip: str = "127.0.0.1"):
    db_sprint = models.Sprint(**sprint.dict())
    db.add(db_sprint)
    db.commit()
    db.refresh(db_sprint)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Sprint", db_sprint.id,
        db_sprint.name, {"project_id": db_sprint.project_id}, user_ip
    )
    return db_sprint

def get_sprint(db: Session, sprint_id: int):
    return db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()

def get_sprints(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sprint).offset(skip).limit(limit).all()

def get_sprints_by_project(db: Session, project_id: int):
    return db.query(models.Sprint).filter(models.Sprint.project_id == project_id).all()

def update_sprint(db: Session, sprint_id: int, sprint: schemas.SprintUpdate, user_ip: str = "127.0.0.1"):
    db_sprint = get_sprint(db, sprint_id)
    if not db_sprint:
        return None

    update_data = sprint.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sprint, key, value)

    db.add(db_sprint)
    db.commit()
    db.refresh(db_sprint)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Sprint", db_sprint.id,
        db_sprint.name, update_data, user_ip
    )
    return db_sprint

def delete_sprint(db: Session, sprint_id: int, user_ip: str = "127.0.0.1"):
    db_sprint = get_sprint(db, sprint_id)
    if not db_sprint:
        return None

    name = db_sprint.name
    db.delete(db_sprint)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Sprint", sprint_id, name, {}, user_ip
    )
    return db_sprint

# ==================== RESOURCE CRUD ====================

def create_resource(db: Session, resource: schemas.ResourceCreate, user_ip: str = "127.0.0.1"):
    db_resource = models.Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Resource", db_resource.id,
        db_resource.name, {"project_id": db_resource.project_id}, user_ip
    )
    return db_resource

def get_resource(db: Session, resource_id: int):
    return db.query(models.Resource).filter(models.Resource.id == resource_id).first()

def get_resources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Resource).offset(skip).limit(limit).all()

def get_resources_by_project(db: Session, project_id: int):
    return db.query(models.Resource).filter(models.Resource.project_id == project_id).all()

def update_resource(db: Session, resource_id: int, resource: schemas.ResourceUpdate, user_ip: str = "127.0.0.1"):
    db_resource = get_resource(db, resource_id)
    if not db_resource:
        return None

    update_data = resource.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_resource, key, value)

    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Resource", db_resource.id,
        db_resource.name, update_data, user_ip
    )
    return db_resource

def delete_resource(db: Session, resource_id: int, user_ip: str = "127.0.0.1"):
    db_resource = get_resource(db, resource_id)
    if not db_resource:
        return None

    name = db_resource.name
    db.delete(db_resource)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Resource", resource_id, name, {}, user_ip
    )
    return db_resource

# ==================== DEPENDENCY CRUD ====================

def create_dependency(db: Session, dependency: schemas.DependencyCreate, user_ip: str = "127.0.0.1"):
    db_dependency = models.Dependency(**dependency.dict())
    db.add(db_dependency)
    db.commit()
    db.refresh(db_dependency)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Dependency", db_dependency.id,
        db_dependency.title, {"project_id": db_dependency.project_id}, user_ip
    )
    return db_dependency

def get_dependency(db: Session, dependency_id: int):
    return db.query(models.Dependency).filter(models.Dependency.id == dependency_id).first()

def get_dependencies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Dependency).offset(skip).limit(limit).all()

def get_dependencies_by_project(db: Session, project_id: int):
    return db.query(models.Dependency).filter(models.Dependency.project_id == project_id).all()

def update_dependency(db: Session, dependency_id: int, dependency: schemas.DependencyUpdate, user_ip: str = "127.0.0.1"):
    db_dependency = get_dependency(db, dependency_id)
    if not db_dependency:
        return None

    update_data = dependency.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dependency, key, value)

    db.add(db_dependency)
    db.commit()
    db.refresh(db_dependency)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Dependency", db_dependency.id,
        db_dependency.title, update_data, user_ip
    )
    return db_dependency

def delete_dependency(db: Session, dependency_id: int, user_ip: str = "127.0.0.1"):
    db_dependency = get_dependency(db, dependency_id)
    if not db_dependency:
        return None

    title = db_dependency.title
    db.delete(db_dependency)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Dependency", dependency_id, title, {}, user_ip
    )
    return db_dependency

# ==================== RELEASE CRUD ====================

def create_release(db: Session, release: schemas.ReleaseCreate, user_ip: str = "127.0.0.1"):
    db_release = models.Release(**release.dict())
    db.add(db_release)
    db.commit()
    db.refresh(db_release)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Release", db_release.id,
        db_release.name, {"version": db_release.version, "project_id": db_release.project_id}, user_ip
    )
    return db_release

def get_release(db: Session, release_id: int):
    return db.query(models.Release).filter(models.Release.id == release_id).first()

def get_releases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Release).offset(skip).limit(limit).all()

def get_releases_by_project(db: Session, project_id: int):
    return db.query(models.Release).filter(models.Release.project_id == project_id).all()

def update_release(db: Session, release_id: int, release: schemas.ReleaseUpdate, user_ip: str = "127.0.0.1"):
    db_release = get_release(db, release_id)
    if not db_release:
        return None

    update_data = release.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_release, key, value)

    db.add(db_release)
    db.commit()
    db.refresh(db_release)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Release", db_release.id,
        db_release.name, update_data, user_ip
    )
    return db_release

def delete_release(db: Session, release_id: int, user_ip: str = "127.0.0.1"):
    db_release = get_release(db, release_id)
    if not db_release:
        return None

    name = db_release.name
    db.delete(db_release)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Release", release_id, name, {}, user_ip
    )
    return db_release

# ==================== CHANGE REQUEST CRUD ====================

def create_change_request(db: Session, cr: schemas.ChangeRequestCreate, user_ip: str = "127.0.0.1"):
    db_cr = models.ChangeRequest(**cr.dict())
    db.add(db_cr)
    db.commit()
    db.refresh(db_cr)
    create_activity_log(
        db, models.ActivityAction.CREATE, "ChangeRequest", db_cr.id,
        db_cr.title, {"project_id": db_cr.project_id}, user_ip
    )
    return db_cr

def get_change_request(db: Session, cr_id: int):
    return db.query(models.ChangeRequest).filter(models.ChangeRequest.id == cr_id).first()

def get_change_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ChangeRequest).offset(skip).limit(limit).all()

def get_change_requests_by_project(db: Session, project_id: int):
    return db.query(models.ChangeRequest).filter(models.ChangeRequest.project_id == project_id).all()

def update_change_request(db: Session, cr_id: int, cr: schemas.ChangeRequestUpdate, user_ip: str = "127.0.0.1"):
    db_cr = get_change_request(db, cr_id)
    if not db_cr:
        return None

    update_data = cr.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cr, key, value)

    db.add(db_cr)
    db.commit()
    db.refresh(db_cr)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "ChangeRequest", db_cr.id,
        db_cr.title, update_data, user_ip
    )
    return db_cr

def delete_change_request(db: Session, cr_id: int, user_ip: str = "127.0.0.1"):
    db_cr = get_change_request(db, cr_id)
    if not db_cr:
        return None

    title = db_cr.title
    db.delete(db_cr)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "ChangeRequest", cr_id, title, {}, user_ip
    )
    return db_cr

# ==================== ESTIMATION CRUD ====================

def create_estimation(db: Session, estimation: schemas.EstimationCreate, user_ip: str = "127.0.0.1"):
    db_estimation = models.Estimation(**estimation.dict())
    db.add(db_estimation)
    db.commit()
    db.refresh(db_estimation)
    create_activity_log(
        db, models.ActivityAction.CREATE, "Estimation", db_estimation.id,
        db_estimation.title, {"project_id": db_estimation.project_id}, user_ip
    )
    return db_estimation

def get_estimation(db: Session, estimation_id: int):
    return db.query(models.Estimation).filter(models.Estimation.id == estimation_id).first()

def get_estimations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Estimation).offset(skip).limit(limit).all()

def get_estimations_by_project(db: Session, project_id: int):
    return db.query(models.Estimation).filter(models.Estimation.project_id == project_id).all()

def update_estimation(db: Session, estimation_id: int, estimation: schemas.EstimationUpdate, user_ip: str = "127.0.0.1"):
    db_estimation = get_estimation(db, estimation_id)
    if not db_estimation:
        return None

    update_data = estimation.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_estimation, key, value)

    db.add(db_estimation)
    db.commit()
    db.refresh(db_estimation)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "Estimation", db_estimation.id,
        db_estimation.title, update_data, user_ip
    )
    return db_estimation

def delete_estimation(db: Session, estimation_id: int, user_ip: str = "127.0.0.1"):
    db_estimation = get_estimation(db, estimation_id)
    if not db_estimation:
        return None

    title = db_estimation.title
    db.delete(db_estimation)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "Estimation", estimation_id, title, {}, user_ip
    )
    return db_estimation

# ==================== ACTIVITY LOG CRUD ====================

def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).order_by(desc(models.ActivityLog.timestamp)).offset(skip).limit(limit).all()

def get_activity_logs_by_entity(db: Session, entity_type: str, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).filter(models.ActivityLog.entity_type == entity_type).order_by(desc(models.ActivityLog.timestamp)).offset(skip).limit(limit).all()

def get_activity_logs_by_action(db: Session, action: models.ActivityAction, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).filter(models.ActivityLog.action == action).order_by(desc(models.ActivityLog.timestamp)).offset(skip).limit(limit).all()

# ==================== SETTING CRUD ====================

def create_setting(db: Session, setting: schemas.SettingCreate, user_ip: str = "127.0.0.1"):
    db_setting = models.Setting(**setting.dict())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    create_activity_log(
        db, models.ActivityAction.CONFIG_CHANGE, "Setting", db_setting.id,
        db_setting.key, {"category": db_setting.category.value}, user_ip
    )
    return db_setting

def get_setting(db: Session, setting_id: int):
    return db.query(models.Setting).filter(models.Setting.id == setting_id).first()

def get_setting_by_key(db: Session, key: str):
    return db.query(models.Setting).filter(models.Setting.key == key).first()

def get_settings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Setting).offset(skip).limit(limit).all()

def get_settings_by_category(db: Session, category: models.SettingCategory):
    return db.query(models.Setting).filter(models.Setting.category == category).all()

def update_setting(db: Session, setting_id: int, setting: schemas.SettingUpdate, user_ip: str = "127.0.0.1"):
    db_setting = get_setting(db, setting_id)
    if not db_setting:
        return None

    old_value = db_setting.value
    db_setting.value = setting.value
    if setting.description:
        db_setting.description = setting.description

    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    create_activity_log(
        db, models.ActivityAction.CONFIG_CHANGE, "Setting", db_setting.id,
        db_setting.key, {"old_value": old_value, "new_value": setting.value}, user_ip
    )
    return db_setting

def delete_setting(db: Session, setting_id: int, user_ip: str = "127.0.0.1"):
    db_setting = get_setting(db, setting_id)
    if not db_setting:
        return None

    key = db_setting.key
    db.delete(db_setting)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.CONFIG_CHANGE, "Setting", setting_id, key, {}, user_ip
    )
    return db_setting

# ==================== STATUS REPORT CRUD ====================

def create_status_report(db: Session, report: schemas.StatusReportCreate, user_ip: str = "127.0.0.1"):
    db_report = models.StatusReport(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    create_activity_log(
        db, models.ActivityAction.CREATE, "StatusReport", db_report.id,
        db_report.title, {"project_id": db_report.project_id}, user_ip
    )
    return db_report

def get_status_report(db: Session, report_id: int):
    return db.query(models.StatusReport).filter(models.StatusReport.id == report_id).first()

def get_status_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.StatusReport).offset(skip).limit(limit).all()

def get_status_reports_by_project(db: Session, project_id: int):
    return db.query(models.StatusReport).filter(models.StatusReport.project_id == project_id).all()

def update_status_report(db: Session, report_id: int, report: schemas.StatusReportUpdate, user_ip: str = "127.0.0.1"):
    db_report = get_status_report(db, report_id)
    if not db_report:
        return None

    update_data = report.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_report, key, value)

    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    create_activity_log(
        db, models.ActivityAction.UPDATE, "StatusReport", db_report.id,
        db_report.title, update_data, user_ip
    )
    return db_report

def delete_status_report(db: Session, report_id: int, user_ip: str = "127.0.0.1"):
    db_report = get_status_report(db, report_id)
    if not db_report:
        return None

    title = db_report.title
    db.delete(db_report)
    db.commit()
    create_activity_log(
        db, models.ActivityAction.DELETE, "StatusReport", report_id, title, {}, user_ip
    )
    return db_report
