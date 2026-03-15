from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import crud
import schemas
from database import get_db
import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/data", response_model=schemas.DashboardData)
def get_dashboard_data(db: Session = Depends(get_db)):
    """Get aggregated dashboard data from all modules."""

    # Projects summary
    projects = db.query(models.Project).all()
    total_projects = len(projects)
    green = len([p for p in projects if p.status == models.ProjectStatus.GREEN])
    amber = len([p for p in projects if p.status == models.ProjectStatus.AMBER])
    red = len([p for p in projects if p.status == models.ProjectStatus.RED])

    project_summary = schemas.ProjectSummary(
        total=total_projects,
        green=green,
        amber=amber,
        red=red
    )

    # KPIs summary
    kpis = db.query(models.KPI).filter(models.KPI.is_active == True).all()
    kpi_summaries = []
    for kpi in kpis:
        if kpi.value >= kpi.threshold_green:
            status = "GREEN"
        elif kpi.value >= kpi.threshold_red:
            status = "AMBER"
        else:
            status = "RED"

        kpi_summaries.append(schemas.KPISummary(
            id=kpi.id,
            name=kpi.name,
            value=kpi.value,
            target=kpi.target,
            unit=kpi.unit,
            status=status
        ))

    # Risks summary
    risks = db.query(models.Risk).all()
    critical = len([r for r in risks if r.risk_score > 20])
    high = len([r for r in risks if 15 < r.risk_score <= 20])
    medium = len([r for r in risks if 9 <= r.risk_score <= 15])
    low = len([r for r in risks if r.risk_score < 9])

    risk_summary = schemas.RiskSummary(
        critical=critical,
        high=high,
        medium=medium,
        low=low
    )

    # Recent activity
    recent_logs = db.query(models.ActivityLog).order_by(
        models.ActivityLog.timestamp.desc()
    ).limit(20).all()

    activity_responses = []
    for log in recent_logs:
        activity_responses.append(schemas.ActivityLogResponse(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            details=log.details,
            user_ip=log.user_ip,
            timestamp=log.timestamp
        ))

    return schemas.DashboardData(
        projects=project_summary,
        kpis=kpi_summaries,
        risks=risk_summary,
        recent_activity=activity_responses,
        timestamp=datetime.utcnow()
    )

@router.get("/metrics", response_model=dict)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get executive-level metrics summary."""

    # Project metrics
    projects = db.query(models.Project).all()
    total_budget = sum([p.budget_planned for p in projects])
    spent_budget = sum([p.budget_actual for p in projects])
    avg_health = sum([p.health_score for p in projects]) / len(projects) if projects else 0

    # Delivery metrics — include CLOSED sprints for efficiency, all sprints with data for velocity
    sprints = db.query(models.Sprint).all()
    completed_sprints = len([s for s in sprints if s.status == models.SprintStatus.CLOSED])
    active_sprints = len([s for s in sprints if s.status == models.SprintStatus.IN_PROGRESS])
    # Include all sprints that have velocity data (CLOSED + IN_PROGRESS with actual work)
    sprints_with_data = [s for s in sprints if s.status in (models.SprintStatus.CLOSED, models.SprintStatus.IN_PROGRESS)]
    planned_velocity = sum([s.planned_velocity for s in sprints_with_data if s.planned_velocity])
    actual_velocity = sum([s.actual_velocity for s in sprints_with_data if s.actual_velocity])

    velocity_efficiency = (actual_velocity / planned_velocity * 100) if planned_velocity > 0 else 0

    # Resource metrics
    resources = db.query(models.Resource).all()
    avg_utilization = sum([r.utilization for r in resources]) / len(resources) if resources else 0
    over_allocated = len([r for r in resources if r.utilization > 100])
    under_allocated = len([r for r in resources if r.utilization < 50])

    # Risk metrics
    risks = db.query(models.Risk).all()
    open_risks = len([r for r in risks if r.status == models.RiskStatus.OPEN])
    resolved_risks = len([r for r in risks if r.status == models.RiskStatus.RESOLVED])

    # Dependency metrics
    dependencies = db.query(models.Dependency).all()
    blocked_deps = len([d for d in dependencies if d.status == models.DependencyStatus.BLOCKED])
    resolved_deps = len([d for d in dependencies if d.status == models.DependencyStatus.RESOLVED])

    return {
        "project_metrics": {
            "total_projects": len(projects),
            "total_budget_planned": total_budget,
            "total_budget_spent": spent_budget,
            "budget_utilization_percent": round((spent_budget / total_budget * 100) if total_budget > 0 else 0, 2),
            "average_health_score": round(avg_health, 2)
        },
        "delivery_metrics": {
            "completed_sprints": completed_sprints,
            "active_sprints": active_sprints,
            "planned_velocity": planned_velocity,
            "actual_velocity": actual_velocity,
            "velocity_efficiency_percent": round(velocity_efficiency, 2)
        },
        "resource_metrics": {
            "total_resources": len(resources),
            "average_utilization_percent": round(avg_utilization, 2),
            "over_allocated_count": over_allocated,
            "under_allocated_count": under_allocated
        },
        "risk_metrics": {
            "total_risks": len(risks),
            "open_risks": open_risks,
            "resolved_risks": resolved_risks,
            "risk_resolution_percent": round((resolved_risks / len(risks) * 100) if risks else 0, 2)
        },
        "dependency_metrics": {
            "total_dependencies": len(dependencies),
            "blocked_dependencies": blocked_deps,
            "resolved_dependencies": resolved_deps
        }
    }
