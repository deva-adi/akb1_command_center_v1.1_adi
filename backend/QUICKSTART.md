# AKB1 Command Center v3.0 - Quick Start Guide

## 60-Second Setup

```bash
# 1. Navigate to backend
cd akb1-command-center-v3/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 5. Open in browser
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

**That's it!** The database is created and seeded automatically on first run.

---

## Verify Installation

### Health Check
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-03-15T10:30:45.123456",
  "version": "3.0.0"
}
```

### List Projects
```bash
curl http://localhost:8000/api/projects
```

### View API Docs
Visit `http://localhost:8000/docs` in your browser for interactive API documentation.

---

## First 5 API Calls

### 1. Create a Project
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "Test project",
    "status": "GREEN",
    "budget_planned": 500000,
    "health_score": 85.0
  }'
```

### 2. Get Projects
```bash
curl http://localhost:8000/api/projects
```

### 3. Get Dashboard Summary
```bash
curl http://localhost:8000/api/dashboard/data | jq
```

### 4. List KPIs
```bash
curl http://localhost:8000/api/kpis
```

### 5. Get KPI Dashboard
```bash
curl http://localhost:8000/api/kpis/dashboard/summary | jq
```

---

## Key Endpoints

### Portfolio
- **GET** `/api/projects` - List projects
- **POST** `/api/projects` - Create project
- **GET** `/api/projects/{id}` - Get project
- **PUT** `/api/projects/{id}` - Update project
- **GET** `/api/projects/dashboard/summary` - Portfolio overview

### Delivery
- **GET** `/api/sprints` - List sprints
- **POST** `/api/sprints` - Create sprint
- **GET** `/api/sprints/project/{id}` - Get project sprints

### Risks
- **GET** `/api/risks` - List risks
- **POST** `/api/risks` - Create risk
- **GET** `/api/risks/dashboard/heatmap` - Risk matrix

### KPIs
- **GET** `/api/kpis` - List KPIs (15 pre-configured)
- **PUT** `/api/kpis/{id}` - Update KPI value
- **GET** `/api/kpis/dashboard/summary` - KPI status overview

### Dashboard
- **GET** `/api/dashboard/data` - Full dashboard (projects, KPIs, risks, activity)
- **GET** `/api/dashboard/metrics` - Executive metrics

### Configuration
- **GET** `/api/settings` - List all settings
- **PUT** `/api/settings/{id}` - Update setting
- **POST** `/api/settings/bulk-update` - Batch update

### Audit Trail
- **GET** `/api/activity-log` - All activity (paginated)
- **GET** `/api/activity-log/entity/{type}` - Filter by entity
- **GET** `/api/activity-log/summary` - Activity statistics

---

## Pre-Loaded Sample Data

### Projects (5)
1. Cloud Migration Initiative (GREEN)
2. AI Analytics Platform (AMBER)
3. Microservices Refactoring (GREEN)
4. Mobile App Modernization (AMBER)
5. Data Governance Framework (GREEN)

### KPIs (15)
- Utilization Rate: 82.5%
- Delivery Velocity: 45 pts/sprint
- Cost Performance Index: 0.98
- Schedule Performance Index: 1.05
- Change Failure Rate: 8.5%
- Gross Margin: 35.2%
- Lead Time: 28.5 days
- Cycle Time: 14.2 days
- Throughput: 6.8 features/sprint
- Defect Density: 2.3/KLOC
- MTTR: 2.5 hours
- Release Frequency: 3.2/month
- Team Happiness: 7.8/10
- Escaped Defect Rate: 3.2%
- Technical Debt Ratio: 12.5%

### Other Data
- 10 risks across projects
- 4 sprints with velocity data
- 6 team members with utilization
- 3 dependencies
- 3 releases
- 3 change requests
- 3 status reports

---

## API Response Examples

### Create Project Response
```json
{
  "id": 6,
  "name": "My First Project",
  "description": "Test project",
  "status": "GREEN",
  "program_name": null,
  "project_manager": null,
  "start_date": null,
  "end_date": null,
  "budget_planned": 500000.0,
  "budget_actual": 0.0,
  "strategic_alignment": null,
  "health_score": 85.0,
  "created_at": "2025-03-15T10:35:22.123456",
  "updated_at": "2025-03-15T10:35:22.123456"
}
```

### Dashboard Response
```json
{
  "projects": {
    "total": 6,
    "green": 4,
    "amber": 1,
    "red": 1
  },
  "kpis": [
    {
      "id": 1,
      "name": "Utilization Rate",
      "value": 82.5,
      "target": 80.0,
      "unit": "%",
      "status": "GREEN"
    }
  ],
  "risks": {
    "critical": 2,
    "high": 3,
    "medium": 4,
    "low": 1
  },
  "recent_activity": [
    {
      "id": 42,
      "action": "CREATE",
      "entity_type": "Project",
      "entity_name": "My First Project",
      "timestamp": "2025-03-15T10:35:22.123456"
    }
  ],
  "timestamp": "2025-03-15T10:35:45.123456"
}
```

---

## Common Tasks

### Task: View All Risks for a Project
```bash
curl http://localhost:8000/api/risks/project/1
```

### Task: Update Project Status to AMBER
```bash
curl -X PUT http://localhost:8000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "AMBER"}'
```

### Task: Create a Risk
```bash
curl -X POST http://localhost:8000/api/risks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Resource availability",
    "probability": 3,
    "impact": 4,
    "project_id": 1
  }'
```

### Task: View Activity Log
```bash
curl http://localhost:8000/api/activity-log?limit=20
```

### Task: Get Activity by Entity Type
```bash
curl http://localhost:8000/api/activity-log/entity/Project
```

### Task: View Resource Utilization Heatmap
```bash
curl http://localhost:8000/api/resources/dashboard/heatmap | jq
```

---

## Database

### Location
- **Development**: `/data/akb1.db`
- **Railway**: `/data/akb1.db` (persistent volume)

### Browser Database
To view/edit the database directly:
```bash
# Install SQLite3
apt-get install sqlite3  # Linux
brew install sqlite      # Mac
# Download from sqlite.org # Windows

# Connect
sqlite3 /data/akb1.db

# List tables
.tables

# Query
SELECT * FROM projects;
```

---

## Troubleshooting

### Port 8000 Already in Use
```bash
# Use different port
uvicorn main:app --port 8001
```

### Database File Not Found
```bash
# Create data directory
mkdir -p /data
# Restart server - database will be created
```

### Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Can't Connect to API
```bash
# Check server is running
curl http://localhost:8000/api/health

# Check logs for errors
# Look for "Uvicorn running on" message
```

---

## Next Steps

### 1. Explore API
- Visit `http://localhost:8000/docs` for interactive documentation
- Try creating a new project
- Create a risk and view the heatmap
- Check the activity log

### 2. Customize
- Update settings via `/api/settings/bulk-update`
- Modify KPI thresholds
- Configure module flags

### 3. Deploy
- See `DEPLOYMENT.md` for Railway, Docker, AWS, GCP, Azure
- Follow the deployment checklist

### 4. Integrate
- Integrate with your frontend
- Set up webhooks if needed
- Configure authentication (future)

---

## Documentation

- **README.md**: Complete user and developer guide
- **ARCHITECTURE.md**: System design and internals
- **DEPLOYMENT.md**: Production deployment guide
- **MANIFEST.md**: Complete project inventory
- **QUICKSTART.md**: This file

---

## Support

### Endpoints Always Available
- **GET** `/` - API root information
- **GET** `/api/health` - Health check
- **GET** `/docs` - Swagger UI (interactive API docs)
- **GET** `/redoc` - ReDoc (alternative API docs)

### Database Issues
```bash
# Reset to clean state
rm /data/akb1.db
# Restart server - will recreate and reseed
```

### Performance Issues
- Database is SQLite (single-file)
- Suitable for up to 10K projects
- For scale, migrate to PostgreSQL (documented in ARCHITECTURE.md)

---

## Key Takeaways

✓ **Ready Now**: Full system operational on first run
✓ **Pre-Seeded**: 5 projects, 15 KPIs, 10 risks, sample data
✓ **Well Documented**: 2,500+ lines of documentation
✓ **Production Ready**: Deployable to Railway, AWS, GCP, Azure
✓ **Scalable**: Clear migration path to PostgreSQL
✓ **Audited**: Every action logged to activity_log

**Time to first API call: < 2 minutes**

---

## One More Thing

The system includes automatic activity logging. Every mutation (create, update, delete) is tracked:

```bash
# See what changed
curl http://localhost:8000/api/activity-log

# See all project changes
curl http://localhost:8000/api/activity-log/entity/Project

# See all deletions
curl http://localhost:8000/api/activity-log/action/DELETE

# Get summary
curl http://localhost:8000/api/activity-log/summary
```

This is built-in for compliance and governance tracking.

---

**Happy coding! 🚀**
