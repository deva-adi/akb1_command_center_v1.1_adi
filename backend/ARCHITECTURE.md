# AKB1 Command Center v3.0 - Architecture Documentation

## System Overview

AKB1 Command Center v3.0 is a FastAPI-based backend system designed for enterprise delivery leaders to manage portfolio, delivery, and risk in real-time.

**Core Design Principles:**
1. **Operational Excellence**: Every action tracked and audited
2. **Real-time Metrics**: KPIs calculated and aggregated on-demand
3. **Governance-First**: Settings-driven configuration for enterprise control
4. **Scalability**: Ready for growth from 5 to 5,000 projects
5. **Simplicity**: SQLite foundation with PostgreSQL migration path

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP/REST API                       │
│              (FastAPI + Uvicorn + CORS)                │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼────────┐ ┌──▼─────┐  ┌────▼──────┐
    │  Routers   │ │ Schemas │  │   CRUD    │
    │  (13 APIs) │ │(Pydantic)│  │ Operations│
    └───┬────────┘ └──┬─────┘  └────┬──────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   SQLAlchemy ORM Layer     │
        │  (Models + Relationships)  │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   SQLite Database          │
        │  /data/akb1.db (persistent)│
        └────────────────────────────┘
```

## Component Layers

### 1. API Layer (FastAPI Routers)
- **13 Router Modules**: Each handles a functional area
- **REST Conventions**: Standard GET, POST, PUT, DELETE patterns
- **CORS Enabled**: Cross-origin requests supported for web/mobile clients
- **Auto Documentation**: Swagger UI and ReDoc available

#### Router Endpoints
```
projects.py          → Portfolio management (5 endpoints + 1 dashboard)
kpis.py             → KPI engine (5 endpoints + 1 dashboard)
risks.py            → Risk matrix (5 endpoints + 1 dashboard)
sprints.py          → Sprint planning (5 endpoints)
resources.py        → Resource management (5 endpoints + 1 dashboard)
dependencies.py     → Dependency tracking (5 endpoints)
releases.py         → Release management (5 endpoints)
change_requests.py  → Change requests (5 endpoints)
estimations.py      → Estimation engine (5 endpoints)
activity_log.py     → Audit trail (4 endpoints)
settings.py         → Configuration (7 endpoints + 1 bulk)
status_reports.py   → Status reporting (5 endpoints)
dashboard.py        → Executive dashboard (2 endpoints)
```

### 2. Data Validation Layer (Pydantic Schemas)
- **Type Safety**: All inputs validated against schemas
- **Request/Response Schemas**: Create, Update, Response patterns
- **Enums**: Status values constrained to valid options
- **Error Handling**: 422 validation errors with details

#### Schema Patterns
```python
# Request schemas
ProjectCreate    # For POST /api/projects
ProjectUpdate    # For PUT /api/projects/{id}

# Response schemas
ProjectResponse  # Returned by API
DashboardData    # Complex aggregated data

# Enum constraints
ProjectStatus    → GREEN, AMBER, RED
RiskStatus       → OPEN, IN_PROGRESS, RESOLVED, BLOCKED
ActivityAction   → CREATE, UPDATE, DELETE, VIEW, CONFIG_CHANGE
```

### 3. Business Logic Layer (CRUD Operations)
- **Atomic Operations**: Each operation is transactional
- **Automatic Logging**: Activity log entry created for every mutation
- **Relationship Management**: Foreign keys maintained
- **Query Functions**: Optimized query methods

#### CRUD Patterns
```python
# Create with automatic activity log
crud.create_project(db, project_schema, user_ip)

# Read operations
crud.get_project(db, project_id)
crud.get_projects(db, skip=0, limit=100)

# Update with change tracking
crud.update_project(db, project_id, update_schema, user_ip)

# Delete with audit trail
crud.delete_project(db, project_id, user_ip)
```

### 4. Data Model Layer (SQLAlchemy)
- **12 Tables**: Core domain entities
- **Foreign Keys**: Referential integrity
- **Relationships**: Bi-directional navigation
- **Cascading**: Automatic child deletion
- **Timestamps**: created_at, updated_at on all entities

#### Entity Relationships
```
Project (1) ──────────────────── (Many) Risk
         ├──────────────────── (Many) Sprint
         ├──────────────────── (Many) Resource
         ├──────────────────── (Many) Dependency
         ├──────────────────── (Many) Release
         ├──────────────────── (Many) ChangeRequest
         ├──────────────────── (Many) Estimation
         └──────────────────── (Many) StatusReport

Global Singletons:
KPI (system-wide metrics)
ActivityLog (all audits)
Setting (configuration)
```

### 5. Data Persistence Layer (SQLite)
- **File-based**: `/data/akb1.db`
- **Railway Support**: Persistent volume mount
- **Auto-init**: Tables created on startup
- **Auto-seed**: Sample data on first run

## Data Model (12 Tables)

### Core Domain Tables

#### 1. projects
- Portfolio management and status tracking
- Fields: name, status (RAG), budget_planned, budget_actual, health_score
- Unique: name
- Cascade: All child entities deleted when project deleted

#### 2. kpis
- System-wide KPI definitions and values
- Fields: name, formula, value, target, thresholds (green/red)
- 15 Pre-seeded KPIs covering delivery, finance, quality, resource
- Sortable via sort_order field

#### 3. risks
- Risk matrix with probability × impact
- Fields: probability (1-5), impact (1-5), risk_score (auto-calculated)
- Status: OPEN, IN_PROGRESS, RESOLVED, BLOCKED
- Relationships: linked to Project

#### 4. sprints
- Agile sprint/PI planning
- Fields: planned_velocity, actual_velocity, team_size, capacity_hours
- Status: PLANNING, IN_PROGRESS, REVIEW, CLOSED
- Relationships: linked to Project

#### 5. resources
- Team member allocation and utilization
- Fields: allocation_percent, billable_hours, available_hours, utilization
- Relationships: linked to Project

#### 6. dependencies
- Cross-team dependencies and blockers
- Fields: source_team, target_team, priority, due_date
- Status: OPEN, IN_PROGRESS, RESOLVED, BLOCKED
- Relationships: linked to Project

#### 7. releases
- Release management with checklist
- Fields: version, release_date, environment
- Status: PLANNED, IN_PROGRESS, READY, DEPLOYED, ROLLED_BACK
- checklist_items: JSON field for flexible tracking

#### 8. change_requests
- Change request workflow and approval
- Fields: priority, impact_analysis
- Status: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
- Relationships: linked to Project

#### 9. estimations
- Three-point estimation support
- Methods: PERT, TSHIRT, STORY_POINTS
- Calculation: PERT = (O + 4M + P) / 6
- Relationships: linked to Project

#### 10. activity_log
- Immutable audit trail
- Fields: action, entity_type, entity_id, details (JSON), user_ip
- Actions: CREATE, UPDATE, DELETE, VIEW, CONFIG_CHANGE
- Indexed on: entity_type, action, timestamp

#### 11. settings
- Configuration management
- Fields: key (unique), value, category
- Categories: GENERAL, MODULE, KPI, DISPLAY
- Not soft-deleted; direct deletion allowed

#### 12. status_reports
- Period status reporting
- Fields: report_date, period, executive_summary, key_achievements
- Relationships: linked to Project

## Activity Logging Architecture

Every mutation operation automatically creates an audit trail entry:

```
User Request
    │
    ▼
Validate (Pydantic)
    │
    ▼
CRUD Operation
    │
    ├─ Modify Database
    │
    └─ create_activity_log()
         │
         ├─ action (CREATE/UPDATE/DELETE)
         ├─ entity_type (e.g., "Project")
         ├─ entity_id
         ├─ entity_name
         ├─ details (JSON - changed fields)
         ├─ user_ip
         └─ timestamp
         │
         ▼
    Return Response
```

### Activity Log Query Patterns
```bash
GET /api/activity-log                    # All activities (paginated)
GET /api/activity-log/entity/Project     # Filter by entity
GET /api/activity-log/action/UPDATE      # Filter by action
GET /api/activity-log/summary            # Statistics
```

## KPI Calculation & Status Logic

### Status Determination
```python
if kpi.value >= kpi.threshold_green:
    status = "GREEN"     # Target achieved
elif kpi.value >= kpi.threshold_red:
    status = "AMBER"     # Warning zone
else:
    status = "RED"       # Critical

# Example: Utilization Rate
# value: 82.5%, threshold_green: 75%, threshold_red: 60%
# Status: GREEN (82.5 >= 75)
```

### 15 KPIs and Formulas

| # | Name | Formula | Example | Green Threshold |
|---|------|---------|---------|-----------------|
| 1 | Utilization Rate | (Billable/Available) * 100 | 800/1000 = 80% | >= 75% |
| 2 | Delivery Velocity | Story Pts/Sprint | 45 pts | >= 40 pts |
| 3 | Cost Performance Index | Earned Value / Actual | 100K/102K = 0.98 | >= 0.95 |
| 4 | Schedule Performance Index | Earned/Planned Value | 100K/95K = 1.05 | >= 0.95 |
| 5 | Change Failure Rate | Failed/Total * 100 | 2/23 = 8.7% | <= 15% |
| 6 | Gross Margin | (Rev-Cost)/Rev * 100 | (100K-65K)/100K = 35% | >= 35% |
| 7 | Lead Time | Days from req to production | 28.5 days | <= 35 days |
| 8 | Cycle Time | Days from dev to prod | 14.2 days | <= 21 days |
| 9 | Throughput | Features/Sprint | 6.8 features | >= 5 features |
| 10 | Defect Density | Defects per KLOC | 2.3 defects | <= 3 defects |
| 11 | MTTR | Avg incident resolution | 2.5 hours | <= 4 hours |
| 12 | Release Frequency | Releases/Month | 3.2 | >= 2/month |
| 13 | Team Happiness | Employee score (1-10) | 7.8/10 | >= 7.0 |
| 14 | Escaped Defect Rate | Prod Defects/Total * 100 | 3.2% | <= 5% |
| 15 | Technical Debt Ratio | Debt Time/Total * 100 | 12.5% | <= 15% |

## Dashboard Data Aggregation

### /api/dashboard/data Aggregation

```python
def get_dashboard_data():
    # 1. Project Summary
    total, green, amber, red = count_by_status(projects)

    # 2. KPI Summary (with status)
    for kpi in active_kpis:
        status = calculate_status(kpi.value, kpi.thresholds)
        kpi_summaries.append({id, name, value, status})

    # 3. Risk Summary (by severity)
    critical = count(risks where risk_score > 20)
    high = count(risks where 15 < risk_score <= 20)
    medium = count(risks where 9 <= risk_score <= 15)
    low = count(risks where risk_score < 9)

    # 4. Recent Activity (last 20)
    recent_logs = query(activity_log)
        .order_by(timestamp DESC)
        .limit(20)

    return {
        projects: ProjectSummary,
        kpis: List[KPISummary],
        risks: RiskSummary,
        recent_activity: List[ActivityLogResponse],
        timestamp: now
    }
```

### /api/dashboard/metrics Aggregation

```
Project Metrics
├─ total_projects
├─ total_budget_planned
├─ total_budget_spent
├─ budget_utilization_percent
└─ average_health_score

Delivery Metrics
├─ completed_sprints
├─ active_sprints
├─ planned_velocity
├─ actual_velocity
└─ velocity_efficiency_percent

Resource Metrics
├─ total_resources
├─ average_utilization_percent
├─ over_allocated_count
└─ under_allocated_count

Risk Metrics
├─ total_risks
├─ open_risks
├─ resolved_risks
└─ risk_resolution_percent

Dependency Metrics
├─ total_dependencies
├─ blocked_dependencies
└─ resolved_dependencies
```

## Request/Response Flow

### Example: Create Project

```
POST /api/projects
├─ Body: ProjectCreate (Pydantic validation)
├─ Dependency: Session (get_db)
│
├─ Validation Check
│  └─ Project.name unique?
│
├─ CRUD Operation
│  ├─ db.add(Project(...))
│  ├─ db.commit()
│  └─ db.refresh() → populated entity
│
├─ Activity Logging
│  └─ ActivityLog(
│      action=CREATE,
│      entity_type='Project',
│      entity_id=1,
│      entity_name='Cloud Migration',
│      details={'status': 'GREEN'},
│      user_ip='192.168.1.1',
│      timestamp=now
│     )
│
└─ Response
   └─ ProjectResponse (entity data + timestamps)
```

### Example: Get Dashboard

```
GET /api/dashboard/data
├─ Dependencies: Session (get_db)
│
├─ Project Aggregation
│  ├─ Count all projects
│  ├─ Count by status
│  └─ Build ProjectSummary
│
├─ KPI Aggregation
│  ├─ Query active KPIs
│  ├─ Calculate status for each
│  └─ Build List[KPISummary]
│
├─ Risk Aggregation
│  ├─ Query all risks
│  ├─ Categorize by severity
│  └─ Build RiskSummary
│
├─ Activity Aggregation
│  ├─ Query recent 20 logs
│  ├─ Order by timestamp DESC
│  └─ Build List[ActivityLogResponse]
│
└─ Response
   └─ DashboardData (aggregated)
```

## Configuration Management

### Settings Architecture

```
Settings
├─ GENERAL Category
│  ├─ app_name
│  ├─ app_version
│  └─ environment
│
├─ MODULE Category
│  ├─ projects_module_enabled
│  ├─ kpi_dashboard_enabled
│  ├─ risk_heatmap_enabled
│  └─ [more feature flags]
│
├─ KPI Category
│  ├─ kpi_threshold_warning
│  └─ kpi_threshold_critical
│
└─ DISPLAY Category
   ├─ portfolio_heading
   ├─ delivery_heading
   └─ [UI customizations]
```

### Settings Update Flow

```
PUT /api/settings/{id}
├─ SettingUpdate validation
├─ Lookup existing setting
├─ Update value
├─ ActivityLog(action=CONFIG_CHANGE)
└─ Return updated setting

POST /api/settings/bulk-update
├─ List[updates] validation
├─ For each update:
│  ├─ Lookup by key
│  ├─ Update or Create
│  └─ Activity log
└─ Return results summary
```

## Error Handling

### Standard HTTP Status Codes

```
200 OK          ✓ Success
201 Created     ✓ Resource created (not used; POST returns 200)
400 Bad Request ✗ Validation error
404 Not Found   ✗ Resource missing
409 Conflict    ✗ Unique constraint (e.g., duplicate project name)
422 Unprocessable Entity ✗ Pydantic validation failed
500 Server Error ✗ Unhandled exception
```

### Error Response Format

```json
{
  "detail": "Project with this name already exists"
}
```

## Performance Considerations

### Query Optimization

#### Indexes
```
Projects:       id (PK), name (unique)
KPIs:          id (PK), name (unique), is_active
Risks:         id (PK), project_id (FK)
ActivityLog:   id (PK), entity_type, action, timestamp
```

#### Pagination
```
Default:  skip=0, limit=100
Max:      limit=1000
Pattern:  GET /api/projects?skip=0&limit=50
```

### Database Scalability

| Scale | Database | Recommendation |
|-------|----------|-----------------|
| <10K projects | SQLite | Current (fits in memory) |
| 10K-100K projects | SQLite + caching | Add Redis cache layer |
| 100K+ projects | PostgreSQL | Migrate to PostgreSQL |

### Caching Strategy (Future)

```python
# Add to future versions
from redis import Redis

@app.get("/api/dashboard/data")
def get_dashboard_data():
    cached = redis.get("dashboard:data")
    if cached:
        return json.loads(cached)

    data = calculate_dashboard_data()
    redis.setex("dashboard:data", 300, json.dumps(data))
    return data
```

## Security Architecture

### Input Validation
- All inputs validated by Pydantic schemas
- No SQL injection (using ORM)
- Type checking enforced

### Audit Trail
- Every mutation logged
- User IP captured
- Changes tracked in JSON

### CORS Configuration
```python
# Development: allow all origins
CORSMiddleware(allow_origins=["*"])

# Production: specific origins
CORSMiddleware(allow_origins=[
    "https://yourdomain.com",
    "https://app.yourdomain.com"
])
```

## Deployment Architecture

### Local Development
```
Source Code → Python Interpreter → Uvicorn → http://localhost:8000
```

### Railway Deployment
```
GitHub Repo
    ↓
Docker Build
    ↓
Container Registry
    ↓
Railway Service (Uvicorn)
    ↓
/data Volume (Persistent)
    ↓
Public URL (HTTPS)
```

### Multi-Instance (Future)
```
Load Balancer (ALB/Nginx)
    ├─ Instance 1 (Port 8000)
    ├─ Instance 2 (Port 8001)
    └─ Instance 3 (Port 8002)
         ↓
    PostgreSQL (Shared)
    Redis (Cache)
```

## Technology Choices & Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | FastAPI | Modern, fast, built-in validation, auto-docs |
| Database | SQLite | Simple, no ops needed, sufficient for 10K+ records |
| ORM | SQLAlchemy | Type-safe, relationship support, flexible |
| Validation | Pydantic | Runtime type checking, excellent errors |
| Server | Uvicorn | Fast ASGI server, Railway compatible |
| Persistence | Railway /data | Managed, simple, persistent across deploys |

## Future Enhancement Paths

### Path 1: Advanced Analytics
- Add BI tool integration (Tableau, Looker)
- Real-time KPI calculation
- Predictive analytics (ML models)

### Path 2: Scale to Enterprise
- Migrate to PostgreSQL
- Add Redis caching
- Implement sharding strategy

### Path 3: Advanced Governance
- Role-based access control (RBAC)
- Multi-tenant support
- Approval workflows

### Path 4: Mobile & Native
- React Native mobile app
- Offline-first sync
- Push notifications

## Summary

AKB1 Command Center v3.0 provides a complete, production-ready backend for enterprise delivery management with:

✓ 13 API modules covering all delivery domains
✓ Automatic activity logging for compliance
✓ 15 pre-configured KPIs with worked examples
✓ Real-time dashboard aggregation
✓ Configuration management for customization
✓ Clear migration path to PostgreSQL for scale
✓ Railway-optimized deployment
✓ 3,400+ lines of well-structured code

The system is ready for deployment and can scale from 5 to 5,000 projects with proper configuration.
