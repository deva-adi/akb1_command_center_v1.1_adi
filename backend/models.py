from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class ProjectStatus(str, enum.Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"

class RiskStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    BLOCKED = "BLOCKED"

class SprintStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    CLOSED = "CLOSED"

class DependencyStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    BLOCKED = "BLOCKED"

class ReleaseStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    READY = "READY"
    DEPLOYED = "DEPLOYED"
    ROLLED_BACK = "ROLLED_BACK"

class ChangeRequestPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ChangeRequestStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IMPLEMENTED = "IMPLEMENTED"

class EstimationMethod(str, enum.Enum):
    PERT = "PERT"
    TSHIRT = "TSHIRT"
    STORY_POINTS = "STORY_POINTS"

class ActivityAction(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    VIEW = "VIEW"
    CONFIG_CHANGE = "CONFIG_CHANGE"

class SettingCategory(str, enum.Enum):
    GENERAL = "GENERAL"
    MODULE = "MODULE"
    KPI = "KPI"
    DISPLAY = "DISPLAY"

# ==================== MODELS ====================

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.GREEN)
    program_name = Column(String)
    project_manager = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    budget_planned = Column(Float, default=0.0)
    budget_actual = Column(Float, default=0.0)
    strategic_alignment = Column(String)
    health_score = Column(Float, default=85.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    risks = relationship("Risk", back_populates="project", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="project", cascade="all, delete-orphan")
    releases = relationship("Release", back_populates="project", cascade="all, delete-orphan")
    change_requests = relationship("ChangeRequest", back_populates="project", cascade="all, delete-orphan")
    estimations = relationship("Estimation", back_populates="project", cascade="all, delete-orphan")
    status_reports = relationship("StatusReport", back_populates="project", cascade="all, delete-orphan")

class KPI(Base):
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    formula = Column(String)
    value = Column(Float, default=0.0)
    target = Column(Float, default=0.0)
    threshold_green = Column(Float, default=80.0)
    threshold_red = Column(Float, default=50.0)
    unit = Column(String)
    category = Column(String)
    owner = Column(String)
    description = Column(String)
    example1_calc = Column(String)
    example2_calc = Column(String)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    probability = Column(Integer)  # 1-5
    impact = Column(Integer)  # 1-5
    risk_score = Column(Float)  # auto-calculated: probability * impact
    category = Column(String)
    mitigation = Column(String)
    owner = Column(String)
    status = Column(Enum(RiskStatus), default=RiskStatus.OPEN)
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="risks")

class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    pi_number = Column(Integer)
    sprint_number = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    planned_velocity = Column(Float, default=0.0)
    actual_velocity = Column(Float, default=0.0)
    team_size = Column(Integer, default=0)
    capacity_hours = Column(Float, default=0.0)
    status = Column(Enum(SprintStatus), default=SprintStatus.PLANNING)
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="sprints")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    team = Column(String)
    allocation_percent = Column(Float, default=0.0)
    billable_hours = Column(Float, default=0.0)
    available_hours = Column(Float, default=0.0)
    utilization = Column(Float, default=0.0)
    project_id = Column(Integer, ForeignKey("projects.id"))
    skills = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="resources")

class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    source_team = Column(String)
    target_team = Column(String)
    status = Column(Enum(DependencyStatus), default=DependencyStatus.OPEN)
    priority = Column(String)
    due_date = Column(DateTime)
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="dependencies")

class Release(Base):
    __tablename__ = "releases"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, index=True)
    name = Column(String)
    release_date = Column(DateTime)
    status = Column(Enum(ReleaseStatus), default=ReleaseStatus.PLANNED)
    environment = Column(String)
    checklist_items = Column(JSON, default={})
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="releases")

class ChangeRequest(Base):
    __tablename__ = "change_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    requester = Column(String)
    impact_analysis = Column(String)
    priority = Column(Enum(ChangeRequestPriority), default=ChangeRequestPriority.MEDIUM)
    status = Column(Enum(ChangeRequestStatus), default=ChangeRequestStatus.SUBMITTED)
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="change_requests")

class Estimation(Base):
    __tablename__ = "estimations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    method = Column(Enum(EstimationMethod), default=EstimationMethod.PERT)
    optimistic = Column(Float, default=0.0)
    most_likely = Column(Float, default=0.0)
    pessimistic = Column(Float, default=0.0)
    estimate_result = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    project_id = Column(Integer, ForeignKey("projects.id"))
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="estimations")

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(Enum(ActivityAction))
    entity_type = Column(String, index=True)
    entity_id = Column(Integer)
    entity_name = Column(String)
    details = Column(JSON, default={})
    user_ip = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    category = Column(Enum(SettingCategory), default=SettingCategory.GENERAL)
    description = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StatusReport(Base):
    __tablename__ = "status_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    report_date = Column(DateTime)
    period = Column(String)
    executive_summary = Column(String)
    key_achievements = Column(String)
    risks_issues = Column(String)
    next_steps = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="status_reports")
