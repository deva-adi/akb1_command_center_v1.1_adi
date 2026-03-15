from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================

class ProjectStatusEnum(str, Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"

class RiskStatusEnum(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    BLOCKED = "BLOCKED"

class SprintStatusEnum(str, Enum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    CLOSED = "CLOSED"

class DependencyStatusEnum(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    BLOCKED = "BLOCKED"

class ReleaseStatusEnum(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    READY = "READY"
    DEPLOYED = "DEPLOYED"
    ROLLED_BACK = "ROLLED_BACK"

class ChangeRequestPriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ChangeRequestStatusEnum(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IMPLEMENTED = "IMPLEMENTED"

class EstimationMethodEnum(str, Enum):
    PERT = "PERT"
    TSHIRT = "TSHIRT"
    STORY_POINTS = "STORY_POINTS"

class ActivityActionEnum(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    VIEW = "VIEW"
    CONFIG_CHANGE = "CONFIG_CHANGE"

class SettingCategoryEnum(str, Enum):
    GENERAL = "GENERAL"
    MODULE = "MODULE"
    KPI = "KPI"
    DISPLAY = "DISPLAY"

# ==================== PROJECT SCHEMAS ====================

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatusEnum = ProjectStatusEnum.GREEN
    program_name: Optional[str] = None
    project_manager: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_planned: float = 0.0
    budget_actual: float = 0.0
    strategic_alignment: Optional[str] = None
    health_score: float = 85.0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None
    program_name: Optional[str] = None
    project_manager: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_planned: Optional[float] = None
    budget_actual: Optional[float] = None
    strategic_alignment: Optional[str] = None
    health_score: Optional[float] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== KPI SCHEMAS ====================

class KPIBase(BaseModel):
    name: str
    formula: str
    value: float = 0.0
    target: float = 0.0
    threshold_green: float = 80.0
    threshold_red: float = 50.0
    unit: str
    category: str
    owner: Optional[str] = None
    description: Optional[str] = None
    example1_calc: Optional[str] = None
    example2_calc: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class KPICreate(KPIBase):
    pass

class KPIUpdate(BaseModel):
    name: Optional[str] = None
    formula: Optional[str] = None
    value: Optional[float] = None
    target: Optional[float] = None
    threshold_green: Optional[float] = None
    threshold_red: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    owner: Optional[str] = None
    description: Optional[str] = None
    example1_calc: Optional[str] = None
    example2_calc: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class KPIResponse(KPIBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== RISK SCHEMAS ====================

class RiskBase(BaseModel):
    title: str
    description: Optional[str] = None
    probability: int
    impact: int
    category: Optional[str] = None
    mitigation: Optional[str] = None
    owner: Optional[str] = None
    status: RiskStatusEnum = RiskStatusEnum.OPEN
    project_id: int

class RiskCreate(RiskBase):
    pass

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    probability: Optional[int] = None
    impact: Optional[int] = None
    category: Optional[str] = None
    mitigation: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[RiskStatusEnum] = None

class RiskResponse(RiskBase):
    id: int
    risk_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== SPRINT SCHEMAS ====================

class SprintBase(BaseModel):
    name: str
    pi_number: int
    sprint_number: int
    start_date: datetime
    end_date: datetime
    planned_velocity: float = 0.0
    actual_velocity: float = 0.0
    team_size: int = 0
    capacity_hours: float = 0.0
    status: SprintStatusEnum = SprintStatusEnum.PLANNING
    project_id: int

class SprintCreate(SprintBase):
    pass

class SprintUpdate(BaseModel):
    name: Optional[str] = None
    pi_number: Optional[int] = None
    sprint_number: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    planned_velocity: Optional[float] = None
    actual_velocity: Optional[float] = None
    team_size: Optional[int] = None
    capacity_hours: Optional[float] = None
    status: Optional[SprintStatusEnum] = None

class SprintResponse(SprintBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== RESOURCE SCHEMAS ====================

class ResourceBase(BaseModel):
    name: str
    role: str
    team: str
    allocation_percent: float = 0.0
    billable_hours: float = 0.0
    available_hours: float = 0.0
    utilization: float = 0.0
    project_id: int
    skills: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    team: Optional[str] = None
    allocation_percent: Optional[float] = None
    billable_hours: Optional[float] = None
    available_hours: Optional[float] = None
    utilization: Optional[float] = None
    skills: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== DEPENDENCY SCHEMAS ====================

class DependencyBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_team: str
    target_team: str
    status: DependencyStatusEnum = DependencyStatusEnum.OPEN
    priority: str
    due_date: Optional[datetime] = None
    project_id: int

class DependencyCreate(DependencyBase):
    pass

class DependencyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    source_team: Optional[str] = None
    target_team: Optional[str] = None
    status: Optional[DependencyStatusEnum] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class DependencyResponse(DependencyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== RELEASE SCHEMAS ====================

class ReleaseBase(BaseModel):
    version: str
    name: str
    release_date: datetime
    status: ReleaseStatusEnum = ReleaseStatusEnum.PLANNED
    environment: str
    checklist_items: Dict[str, Any] = {}
    project_id: int

class ReleaseCreate(ReleaseBase):
    pass

class ReleaseUpdate(BaseModel):
    version: Optional[str] = None
    name: Optional[str] = None
    release_date: Optional[datetime] = None
    status: Optional[ReleaseStatusEnum] = None
    environment: Optional[str] = None
    checklist_items: Optional[Dict[str, Any]] = None

class ReleaseResponse(ReleaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== CHANGE REQUEST SCHEMAS ====================

class ChangeRequestBase(BaseModel):
    title: str
    description: Optional[str] = None
    requester: str
    impact_analysis: Optional[str] = None
    priority: ChangeRequestPriorityEnum = ChangeRequestPriorityEnum.MEDIUM
    status: ChangeRequestStatusEnum = ChangeRequestStatusEnum.SUBMITTED
    project_id: int

class ChangeRequestCreate(ChangeRequestBase):
    pass

class ChangeRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requester: Optional[str] = None
    impact_analysis: Optional[str] = None
    priority: Optional[ChangeRequestPriorityEnum] = None
    status: Optional[ChangeRequestStatusEnum] = None

class ChangeRequestResponse(ChangeRequestBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== ESTIMATION SCHEMAS ====================

class EstimationBase(BaseModel):
    title: str
    method: EstimationMethodEnum = EstimationMethodEnum.PERT
    optimistic: float = 0.0
    most_likely: float = 0.0
    pessimistic: float = 0.0
    estimate_result: float = 0.0
    confidence: float = 0.0
    project_id: int
    notes: Optional[str] = None

class EstimationCreate(EstimationBase):
    pass

class EstimationUpdate(BaseModel):
    title: Optional[str] = None
    method: Optional[EstimationMethodEnum] = None
    optimistic: Optional[float] = None
    most_likely: Optional[float] = None
    pessimistic: Optional[float] = None
    estimate_result: Optional[float] = None
    confidence: Optional[float] = None
    notes: Optional[str] = None

class EstimationResponse(EstimationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== ACTIVITY LOG SCHEMAS ====================

class ActivityLogBase(BaseModel):
    action: ActivityActionEnum
    entity_type: str
    entity_id: int
    entity_name: str
    details: Dict[str, Any] = {}
    user_ip: Optional[str] = None

class ActivityLogResponse(ActivityLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# ==================== SETTING SCHEMAS ====================

class SettingBase(BaseModel):
    key: str
    value: str
    category: SettingCategoryEnum = SettingCategoryEnum.GENERAL
    description: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class SettingResponse(SettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== STATUS REPORT SCHEMAS ====================

class StatusReportBase(BaseModel):
    title: str
    report_date: datetime
    period: str
    executive_summary: Optional[str] = None
    key_achievements: Optional[str] = None
    risks_issues: Optional[str] = None
    next_steps: Optional[str] = None
    project_id: int

class StatusReportCreate(StatusReportBase):
    pass

class StatusReportUpdate(BaseModel):
    title: Optional[str] = None
    report_date: Optional[datetime] = None
    period: Optional[str] = None
    executive_summary: Optional[str] = None
    key_achievements: Optional[str] = None
    risks_issues: Optional[str] = None
    next_steps: Optional[str] = None

class StatusReportResponse(StatusReportBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==================== DASHBOARD SCHEMAS ====================

class KPISummary(BaseModel):
    id: int
    name: str
    value: float
    target: float
    unit: str
    status: str  # GREEN, AMBER, RED based on thresholds

class RiskSummary(BaseModel):
    critical: int
    high: int
    medium: int
    low: int

class ProjectSummary(BaseModel):
    total: int
    green: int
    amber: int
    red: int

class DashboardData(BaseModel):
    projects: ProjectSummary
    kpis: List[KPISummary]
    risks: RiskSummary
    recent_activity: List[ActivityLogResponse]
    timestamp: datetime
