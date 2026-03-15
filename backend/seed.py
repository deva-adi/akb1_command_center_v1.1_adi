"""Database seeding script for AKB1 Command Center."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
import crud
import schemas

def seed_database(db: Session):
    """Populate database with sample data."""

    # ==================== SEED KPIs ====================
    kpis_data = [
        {
            "name": "Utilization Rate",
            "formula": "(Billable Hours / Available Hours) * 100",
            "value": 82.5,
            "target": 80.0,
            "threshold_green": 75.0,
            "threshold_red": 60.0,
            "unit": "%",
            "category": "Resource Management",
            "owner": "Resource Manager",
            "description": "Percentage of available hours utilized for billable work",
            "example1_calc": "Example 1: 800 billable hrs / 1000 available hrs = 80%",
            "example2_calc": "Example 2: 900 billable hrs / 1100 available hrs = 81.8%",
            "sort_order": 1
        },
        {
            "name": "Delivery Velocity",
            "formula": "Story Points Completed per Sprint",
            "value": 45.0,
            "target": 42.0,
            "threshold_green": 40.0,
            "threshold_red": 30.0,
            "unit": "story points/sprint",
            "category": "Delivery Performance",
            "owner": "Scrum Master",
            "description": "Average story points completed per sprint",
            "example1_calc": "Example 1: Sprint delivered 45 story points (target: 42)",
            "example2_calc": "Example 2: Sprint delivered 48 story points (target: 42)",
            "sort_order": 2
        },
        {
            "name": "Cost Performance Index (CPI)",
            "formula": "Earned Value / Actual Cost",
            "value": 0.98,
            "target": 1.0,
            "threshold_green": 0.95,
            "threshold_red": 0.85,
            "unit": "ratio",
            "category": "Financial",
            "owner": "Finance Manager",
            "description": "Ratio of earned value to actual project cost",
            "example1_calc": "Example 1: EV: $100K, AC: $102K = 100/102 = 0.98",
            "example2_calc": "Example 2: EV: $50K, AC: $48K = 50/48 = 1.04",
            "sort_order": 3
        },
        {
            "name": "Schedule Performance Index (SPI)",
            "formula": "Earned Value / Planned Value",
            "value": 1.05,
            "target": 1.0,
            "threshold_green": 0.95,
            "threshold_red": 0.85,
            "unit": "ratio",
            "category": "Delivery Performance",
            "owner": "Program Manager",
            "description": "Ratio of earned value to planned value",
            "example1_calc": "Example 1: EV: $100K, PV: $95K = 100/95 = 1.05",
            "example2_calc": "Example 2: EV: $80K, PV: $100K = 80/100 = 0.8",
            "sort_order": 4
        },
        {
            "name": "Change Failure Rate (CFR)",
            "formula": "(Failed Deployments / Total Deployments) * 100",
            "value": 8.5,
            "target": 10.0,
            "threshold_green": 15.0,
            "threshold_red": 25.0,
            "unit": "%",
            "category": "Quality",
            "owner": "DevOps Lead",
            "description": "Percentage of deployments that result in failure",
            "example1_calc": "Example 1: 2 failed / 23 total deployments = 8.7%",
            "example2_calc": "Example 2: 1 failed / 25 total deployments = 4%",
            "sort_order": 5
        },
        {
            "name": "Gross Margin",
            "formula": "(Revenue - Cost of Delivery) / Revenue * 100",
            "value": 35.2,
            "target": 38.0,
            "threshold_green": 35.0,
            "threshold_red": 25.0,
            "unit": "%",
            "category": "Financial",
            "owner": "Finance Manager",
            "description": "Percentage of revenue remaining after direct costs",
            "example1_calc": "Example 1: Revenue $100K, Cost $65K = (100-65)/100 = 35%",
            "example2_calc": "Example 2: Revenue $150K, Cost $90K = (150-90)/150 = 40%",
            "sort_order": 6
        },
        {
            "name": "Lead Time",
            "formula": "From requirement to production deployment (days)",
            "value": 28.5,
            "target": 21.0,
            "threshold_green": 35.0,
            "threshold_red": 60.0,
            "unit": "days",
            "category": "Delivery Performance",
            "owner": "Program Manager",
            "description": "Average time from requirement creation to production",
            "example1_calc": "Example 1: Req on Jan 1, deployed Jan 29 = 28 days",
            "example2_calc": "Example 2: Req on Feb 1, deployed Feb 20 = 19 days",
            "sort_order": 7
        },
        {
            "name": "Cycle Time",
            "formula": "From development start to production deployment (days)",
            "value": 14.2,
            "target": 14.0,
            "threshold_green": 21.0,
            "threshold_red": 35.0,
            "unit": "days",
            "category": "Delivery Performance",
            "owner": "Scrum Master",
            "description": "Average time from development start to production",
            "example1_calc": "Example 1: Dev start Jan 10, deployed Jan 24 = 14 days",
            "example2_calc": "Example 2: Dev start Feb 1, deployed Feb 12 = 11 days",
            "sort_order": 8
        },
        {
            "name": "Throughput",
            "formula": "Features deployed to production per sprint",
            "value": 6.8,
            "target": 7.0,
            "threshold_green": 5.0,
            "threshold_red": 2.0,
            "unit": "features/sprint",
            "category": "Delivery Performance",
            "owner": "Product Manager",
            "description": "Number of features successfully deployed per sprint",
            "example1_calc": "Example 1: Sprint 1 deployed 7 features",
            "example2_calc": "Example 2: Sprint 2 deployed 6 features, avg = 6.5",
            "sort_order": 9
        },
        {
            "name": "Defect Density",
            "formula": "Defects found per 1000 lines of code",
            "value": 2.3,
            "target": 2.0,
            "threshold_green": 3.0,
            "threshold_red": 5.0,
            "unit": "defects/KLOC",
            "category": "Quality",
            "owner": "QA Lead",
            "description": "Number of defects found per 1000 lines of code",
            "example1_calc": "Example 1: 115 defects / 50,000 LOC = 2.3 defects/KLOC",
            "example2_calc": "Example 2: 200 defects / 100,000 LOC = 2.0 defects/KLOC",
            "sort_order": 10
        },
        {
            "name": "Mean Time To Resolve (MTTR)",
            "formula": "Average time to resolve critical incidents (hours)",
            "value": 2.5,
            "target": 2.0,
            "threshold_green": 4.0,
            "threshold_red": 8.0,
            "unit": "hours",
            "category": "Operations",
            "owner": "Operations Manager",
            "description": "Average time to resolve critical incidents",
            "example1_calc": "Example 1: (2h + 3h + 2.5h) / 3 = 2.5 hours",
            "example2_calc": "Example 2: (1h + 2h + 2h) / 3 = 1.67 hours",
            "sort_order": 11
        },
        {
            "name": "Release Frequency",
            "formula": "Production releases per month",
            "value": 3.2,
            "target": 3.0,
            "threshold_green": 2.0,
            "threshold_red": 0.5,
            "unit": "releases/month",
            "category": "Delivery Performance",
            "owner": "DevOps Lead",
            "description": "Number of production releases per month",
            "example1_calc": "Example 1: 3 releases in January",
            "example2_calc": "Example 2: 4 releases in February, avg = 3.5/month",
            "sort_order": 12
        },
        {
            "name": "Team Happiness Index",
            "formula": "Employee engagement score (1-10 scale)",
            "value": 7.8,
            "target": 8.0,
            "threshold_green": 7.0,
            "threshold_red": 5.0,
            "unit": "score/10",
            "category": "Team Health",
            "owner": "HR Manager",
            "description": "Employee engagement and satisfaction score",
            "example1_calc": "Example 1: Survey avg score = 7.8/10",
            "example2_calc": "Example 2: Survey avg score = 8.2/10",
            "sort_order": 13
        },
        {
            "name": "Escaped Defect Rate",
            "formula": "(Production defects / Total defects) * 100",
            "value": 3.2,
            "target": 2.0,
            "threshold_green": 5.0,
            "threshold_red": 10.0,
            "unit": "%",
            "category": "Quality",
            "owner": "QA Lead",
            "description": "Percentage of defects that reach production",
            "example1_calc": "Example 1: 4 prod defects / 125 total = 3.2%",
            "example2_calc": "Example 2: 2 prod defects / 150 total = 1.3%",
            "sort_order": 14
        },
        {
            "name": "Technical Debt Ratio",
            "formula": "(Technical debt remediation time / Total dev time) * 100",
            "value": 12.5,
            "target": 10.0,
            "threshold_green": 15.0,
            "threshold_red": 25.0,
            "unit": "%",
            "category": "Code Quality",
            "owner": "Engineering Lead",
            "description": "Percentage of time spent on technical debt",
            "example1_calc": "Example 1: 50 hrs tech debt / 400 hrs total = 12.5%",
            "example2_calc": "Example 2: 30 hrs tech debt / 300 hrs total = 10%",
            "sort_order": 15
        }
    ]

    for kpi_data in kpis_data:
        kpi_schema = schemas.KPICreate(**kpi_data)
        crud.create_kpi(db, kpi_schema)

    # ==================== SEED PROJECTS ====================
    now = datetime.utcnow()
    projects_data = [
        {
            "name": "Cloud Migration Initiative",
            "description": "Enterprise migration to AWS cloud infrastructure",
            "status": models.ProjectStatus.GREEN,
            "program_name": "Digital Transformation",
            "project_manager": "Sarah Johnson",
            "start_date": now - timedelta(days=120),
            "end_date": now + timedelta(days=60),
            "budget_planned": 2500000.0,
            "budget_actual": 2350000.0,
            "strategic_alignment": "Critical for infrastructure modernization",
            "health_score": 88.5
        },
        {
            "name": "AI Analytics Platform",
            "description": "Build AI-driven analytics platform for enterprise insights",
            "status": models.ProjectStatus.AMBER,
            "program_name": "AI Transformation",
            "project_manager": "Rajesh Patel",
            "start_date": now - timedelta(days=90),
            "end_date": now + timedelta(days=120),
            "budget_planned": 1800000.0,
            "budget_actual": 1950000.0,
            "strategic_alignment": "High priority for competitive advantage",
            "health_score": 72.3
        },
        {
            "name": "Microservices Refactoring",
            "description": "Refactor monolithic application to microservices",
            "status": models.ProjectStatus.GREEN,
            "program_name": "Technical Excellence",
            "project_manager": "Emma Davis",
            "start_date": now - timedelta(days=60),
            "end_date": now + timedelta(days=90),
            "budget_planned": 1200000.0,
            "budget_actual": 1150000.0,
            "strategic_alignment": "Supports agility and scalability",
            "health_score": 85.0
        },
        {
            "name": "Mobile App Modernization",
            "description": "Modernize legacy mobile applications",
            "status": models.ProjectStatus.AMBER,
            "program_name": "Customer Experience",
            "project_manager": "Lisa Chen",
            "start_date": now - timedelta(days=45),
            "end_date": now + timedelta(days=135),
            "budget_planned": 900000.0,
            "budget_actual": 1020000.0,
            "strategic_alignment": "Critical for customer retention",
            "health_score": 68.5
        },
        {
            "name": "Data Governance Framework",
            "description": "Implement enterprise data governance and compliance",
            "status": models.ProjectStatus.GREEN,
            "program_name": "Risk & Compliance",
            "project_manager": "Michael Brown",
            "start_date": now - timedelta(days=75),
            "end_date": now + timedelta(days=75),
            "budget_planned": 750000.0,
            "budget_actual": 720000.0,
            "strategic_alignment": "Essential for regulatory compliance",
            "health_score": 82.0
        }
    ]

    projects = []
    for proj_data in projects_data:
        proj_schema = schemas.ProjectCreate(**proj_data)
        proj = crud.create_project(db, proj_schema)
        projects.append(proj)

    # ==================== SEED RISKS ====================
    risks_data = [
        {
            "title": "Cloud migration delays due to legacy system complexity",
            "description": "Unexpected complexity in legacy system data migration",
            "probability": 4,
            "impact": 4,
            "category": "Technical",
            "mitigation": "Assigned dedicated legacy system experts, extended timeline",
            "owner": "Sarah Johnson",
            "status": models.RiskStatus.IN_PROGRESS,
            "project_id": projects[0].id
        },
        {
            "title": "Resource availability for AI project",
            "description": "Shortage of qualified ML engineers available",
            "probability": 3,
            "impact": 5,
            "category": "Resource",
            "mitigation": "Engaged recruitment, contracted external ML consultants",
            "owner": "Rajesh Patel",
            "status": models.RiskStatus.OPEN,
            "project_id": projects[1].id
        },
        {
            "title": "Microservices performance concerns",
            "description": "Potential latency issues in microservices communication",
            "probability": 2,
            "impact": 3,
            "category": "Technical",
            "mitigation": "Performance testing framework, service mesh evaluation",
            "owner": "Emma Davis",
            "status": models.RiskStatus.RESOLVED,
            "project_id": projects[2].id
        },
        {
            "title": "Mobile platform fragmentation",
            "description": "Supporting multiple OS versions increases complexity",
            "probability": 4,
            "impact": 2,
            "category": "Technical",
            "mitigation": "Standardized cross-platform framework selection",
            "owner": "Lisa Chen",
            "status": models.RiskStatus.BLOCKED,
            "project_id": projects[3].id
        },
        {
            "title": "Stakeholder alignment on data governance",
            "description": "Resistance from departments to governance policies",
            "probability": 3,
            "impact": 3,
            "category": "Organizational",
            "mitigation": "Executive sponsorship, change management program",
            "owner": "Michael Brown",
            "status": models.RiskStatus.OPEN,
            "project_id": projects[4].id
        },
        {
            "title": "Budget overrun in cloud migration",
            "description": "Increased infrastructure costs exceeding estimates",
            "probability": 2,
            "impact": 4,
            "category": "Financial",
            "mitigation": "Reserved instances, cost optimization review",
            "owner": "Sarah Johnson",
            "status": models.RiskStatus.IN_PROGRESS,
            "project_id": projects[0].id
        },
        {
            "title": "Model accuracy requirements",
            "description": "AI model may not achieve required accuracy threshold",
            "probability": 3,
            "impact": 4,
            "category": "Technical",
            "mitigation": "Data quality improvement, ensemble methods",
            "owner": "Rajesh Patel",
            "status": models.RiskStatus.OPEN,
            "project_id": projects[1].id
        },
        {
            "title": "Timeline compression for mobile release",
            "description": "Market timing pressure accelerating release schedule",
            "probability": 4,
            "impact": 3,
            "category": "Schedule",
            "mitigation": "Agile prioritization, MVP definition",
            "owner": "Lisa Chen",
            "status": models.RiskStatus.IN_PROGRESS,
            "project_id": projects[3].id
        },
        {
            "title": "Compliance audit failures",
            "description": "Data governance implementation gaps in audit",
            "probability": 2,
            "impact": 5,
            "category": "Compliance",
            "mitigation": "Regular compliance checks, audit readiness prep",
            "owner": "Michael Brown",
            "status": models.RiskStatus.OPEN,
            "project_id": projects[4].id
        },
        {
            "title": "Vendor dependency risk",
            "description": "Over-reliance on specific cloud vendor",
            "probability": 2,
            "impact": 4,
            "category": "Technical",
            "mitigation": "Multi-cloud strategy evaluation, architecture review",
            "owner": "Sarah Johnson",
            "status": models.RiskStatus.OPEN,
            "project_id": projects[0].id
        }
    ]

    for risk_data in risks_data:
        risk_schema = schemas.RiskCreate(**risk_data)
        crud.create_risk(db, risk_schema)

    # ==================== SEED SPRINTS ====================
    sprints_data = [
        {
            "name": "PI-12 Sprint 1",
            "pi_number": 12,
            "sprint_number": 1,
            "start_date": now - timedelta(days=14),
            "end_date": now,
            "planned_velocity": 45.0,
            "actual_velocity": 46.0,
            "team_size": 8,
            "capacity_hours": 320.0,
            "status": models.SprintStatus.CLOSED,
            "project_id": projects[0].id
        },
        {
            "name": "PI-12 Sprint 2",
            "pi_number": 12,
            "sprint_number": 2,
            "start_date": now,
            "end_date": now + timedelta(days=14),
            "planned_velocity": 45.0,
            "actual_velocity": 0.0,
            "team_size": 8,
            "capacity_hours": 320.0,
            "status": models.SprintStatus.IN_PROGRESS,
            "project_id": projects[0].id
        },
        {
            "name": "AI-Sprint-7",
            "pi_number": 2,
            "sprint_number": 7,
            "start_date": now - timedelta(days=7),
            "end_date": now + timedelta(days=7),
            "planned_velocity": 42.0,
            "actual_velocity": 38.0,
            "team_size": 6,
            "capacity_hours": 240.0,
            "status": models.SprintStatus.IN_PROGRESS,
            "project_id": projects[1].id
        },
        {
            "name": "Micro-Sprint-10",
            "pi_number": 3,
            "sprint_number": 10,
            "start_date": now - timedelta(days=14),
            "end_date": now,
            "planned_velocity": 50.0,
            "actual_velocity": 52.0,
            "team_size": 10,
            "capacity_hours": 400.0,
            "status": models.SprintStatus.CLOSED,
            "project_id": projects[2].id
        }
    ]

    for sprint_data in sprints_data:
        sprint_schema = schemas.SprintCreate(**sprint_data)
        crud.create_sprint(db, sprint_schema)

    # ==================== SEED RESOURCES ====================
    resources_data = [
        {
            "name": "Alice Thompson",
            "role": "Senior Architect",
            "team": "Cloud Infrastructure",
            "allocation_percent": 100.0,
            "billable_hours": 160.0,
            "available_hours": 160.0,
            "utilization": 95.0,
            "project_id": projects[0].id,
            "skills": "AWS, Terraform, Python, Docker"
        },
        {
            "name": "Bob Martinez",
            "role": "ML Engineer",
            "team": "AI & Analytics",
            "allocation_percent": 80.0,
            "billable_hours": 120.0,
            "available_hours": 160.0,
            "utilization": 75.0,
            "project_id": projects[1].id,
            "skills": "Python, TensorFlow, scikit-learn, ML Ops"
        },
        {
            "name": "Carol Singh",
            "role": "Backend Engineer",
            "team": "Platform",
            "allocation_percent": 100.0,
            "billable_hours": 150.0,
            "available_hours": 160.0,
            "utilization": 93.75,
            "project_id": projects[2].id,
            "skills": "Java, Spring Boot, Kotlin, Microservices"
        },
        {
            "name": "David Lee",
            "role": "Mobile Developer",
            "team": "Mobile",
            "allocation_percent": 100.0,
            "billable_hours": 140.0,
            "available_hours": 160.0,
            "utilization": 87.5,
            "project_id": projects[3].id,
            "skills": "Swift, Kotlin, React Native, iOS"
        },
        {
            "name": "Emma Wilson",
            "role": "Data Architect",
            "team": "Data & Governance",
            "allocation_percent": 90.0,
            "billable_hours": 135.0,
            "available_hours": 160.0,
            "utilization": 84.375,
            "project_id": projects[4].id,
            "skills": "Snowflake, dbt, SQL, Data Governance"
        },
        {
            "name": "Frank Johnson",
            "role": "DevOps Engineer",
            "team": "Cloud Infrastructure",
            "allocation_percent": 100.0,
            "billable_hours": 155.0,
            "available_hours": 160.0,
            "utilization": 96.875,
            "project_id": projects[0].id,
            "skills": "Kubernetes, CI/CD, AWS, Terraform"
        }
    ]

    for resource_data in resources_data:
        resource_schema = schemas.ResourceCreate(**resource_data)
        crud.create_resource(db, resource_schema)

    # ==================== SEED DEPENDENCIES ====================
    dependencies_data = [
        {
            "title": "Cloud infrastructure readiness for AI platform",
            "description": "AI project depends on cloud infrastructure deployment",
            "source_team": "AI & Analytics",
            "target_team": "Cloud Infrastructure",
            "status": models.DependencyStatus.IN_PROGRESS,
            "priority": "HIGH",
            "due_date": now + timedelta(days=30),
            "project_id": projects[1].id
        },
        {
            "title": "API design alignment between services",
            "description": "Mobile app depends on final API specification",
            "source_team": "Mobile",
            "target_team": "Platform",
            "status": models.DependencyStatus.OPEN,
            "priority": "CRITICAL",
            "due_date": now + timedelta(days=15),
            "project_id": projects[3].id
        },
        {
            "title": "Data catalog for governance",
            "description": "Governance project blocked by data catalog completion",
            "source_team": "Data & Governance",
            "target_team": "Data & Analytics",
            "status": models.DependencyStatus.BLOCKED,
            "priority": "HIGH",
            "due_date": now + timedelta(days=45),
            "project_id": projects[4].id
        }
    ]

    for dep_data in dependencies_data:
        dep_schema = schemas.DependencyCreate(**dep_data)
        crud.create_dependency(db, dep_schema)

    # ==================== SEED RELEASES ====================
    releases_data = [
        {
            "version": "1.0.0",
            "name": "Cloud Migration Phase 1",
            "release_date": now + timedelta(days=45),
            "status": models.ReleaseStatus.IN_PROGRESS,
            "environment": "Staging",
            "checklist_items": {
                "infrastructure_tested": True,
                "security_review": True,
                "performance_validated": False,
                "documentation_complete": True
            },
            "project_id": projects[0].id
        },
        {
            "version": "2.1.0",
            "name": "AI Analytics MVP",
            "release_date": now + timedelta(days=60),
            "status": models.ReleaseStatus.PLANNED,
            "environment": "Staging",
            "checklist_items": {
                "model_accuracy_verified": False,
                "api_documented": False,
                "security_audit": False,
                "training_data_validated": True
            },
            "project_id": projects[1].id
        },
        {
            "version": "3.0.0",
            "name": "Microservices Architecture",
            "release_date": now + timedelta(days=30),
            "status": models.ReleaseStatus.READY,
            "environment": "Production",
            "checklist_items": {
                "integration_tests": True,
                "load_testing": True,
                "migration_plan": True,
                "rollback_plan": True
            },
            "project_id": projects[2].id
        }
    ]

    for release_data in releases_data:
        release_schema = schemas.ReleaseCreate(**release_data)
        crud.create_release(db, release_schema)

    # ==================== SEED CHANGE REQUESTS ====================
    change_requests_data = [
        {
            "title": "Extend cloud migration timeline by 2 weeks",
            "description": "Due to legacy system complexity, additional time needed",
            "requester": "Sarah Johnson",
            "impact_analysis": "Minor delay to overall program, no budget impact",
            "priority": models.ChangeRequestPriority.MEDIUM,
            "status": models.ChangeRequestStatus.APPROVED,
            "project_id": projects[0].id
        },
        {
            "title": "Add GPU resources to AI training cluster",
            "description": "Accelerate model training with additional compute",
            "requester": "Rajesh Patel",
            "impact_analysis": "Increased infrastructure cost ~$15K/month",
            "priority": models.ChangeRequestPriority.HIGH,
            "status": models.ChangeRequestStatus.UNDER_REVIEW,
            "project_id": projects[1].id
        },
        {
            "title": "Update mobile app to support iOS 16+",
            "description": "Drop support for iOS 14 to reduce compatibility issues",
            "requester": "Lisa Chen",
            "impact_analysis": "Reduces device support by ~5%, improves stability",
            "priority": models.ChangeRequestPriority.MEDIUM,
            "status": models.ChangeRequestStatus.SUBMITTED,
            "project_id": projects[3].id
        }
    ]

    for cr_data in change_requests_data:
        cr_schema = schemas.ChangeRequestCreate(**cr_data)
        crud.create_change_request(db, cr_schema)

    # ==================== SEED ESTIMATIONS ====================
    estimations_data = [
        {
            "title": "Cloud database migration effort",
            "method": models.EstimationMethod.PERT,
            "optimistic": 80.0,
            "most_likely": 120.0,
            "pessimistic": 180.0,
            "estimate_result": 123.33,
            "confidence": 0.75,
            "project_id": projects[0].id,
            "notes": "PERT: (80+4*120+180)/6 = 123.33 hours"
        },
        {
            "title": "AI model training and validation",
            "method": models.EstimationMethod.TSHIRT,
            "optimistic": 200.0,
            "most_likely": 400.0,
            "pessimistic": 600.0,
            "estimate_result": 400.0,
            "confidence": 0.65,
            "project_id": projects[1].id,
            "notes": "T-Shirt (Large) estimated at 400 hours"
        },
        {
            "title": "Microservices refactoring",
            "method": models.EstimationMethod.STORY_POINTS,
            "optimistic": 120.0,
            "most_likely": 180.0,
            "pessimistic": 240.0,
            "estimate_result": 180.0,
            "confidence": 0.8,
            "project_id": projects[2].id,
            "notes": "180 story points across entire refactoring"
        }
    ]

    for est_data in estimations_data:
        est_schema = schemas.EstimationCreate(**est_data)
        crud.create_estimation(db, est_schema)

    # ==================== SEED SETTINGS ====================
    settings_data = [
        {
            "key": "app_name",
            "value": "AKB1 Command Center",
            "category": models.SettingCategory.GENERAL,
            "description": "Application name"
        },
        {
            "key": "app_version",
            "value": "3.0.0",
            "category": models.SettingCategory.GENERAL,
            "description": "Current application version"
        },
        {
            "key": "projects_module_enabled",
            "value": "true",
            "category": models.SettingCategory.MODULE,
            "description": "Enable/disable projects module"
        },
        {
            "key": "kpi_dashboard_enabled",
            "value": "true",
            "category": models.SettingCategory.MODULE,
            "description": "Enable/disable KPI dashboard"
        },
        {
            "key": "risk_heatmap_enabled",
            "value": "true",
            "category": models.SettingCategory.MODULE,
            "description": "Enable/disable risk heatmap"
        },
        {
            "key": "portfolio_heading",
            "value": "Portfolio Management",
            "category": models.SettingCategory.DISPLAY,
            "description": "Heading for portfolio section"
        },
        {
            "key": "delivery_heading",
            "value": "Delivery Management",
            "category": models.SettingCategory.DISPLAY,
            "description": "Heading for delivery section"
        },
        {
            "key": "kpi_threshold_warning",
            "value": "70",
            "category": models.SettingCategory.KPI,
            "description": "Warning threshold for KPIs (%)"
        },
        {
            "key": "kpi_threshold_critical",
            "value": "50",
            "category": models.SettingCategory.KPI,
            "description": "Critical threshold for KPIs (%)"
        }
    ]

    for setting_data in settings_data:
        setting_schema = schemas.SettingCreate(**setting_data)
        crud.create_setting(db, setting_schema)

    # ==================== SEED STATUS REPORTS ====================
    status_reports_data = [
        {
            "title": "Cloud Migration - Weekly Status",
            "report_date": now,
            "period": "Week of " + now.strftime("%B %d, %Y"),
            "executive_summary": "Cloud migration progressing on schedule. Infrastructure deployment 85% complete. One risk identified around legacy system complexity.",
            "key_achievements": "Database migration scripts validated, security audit completed, 4 microservices containerized",
            "risks_issues": "Legacy system integration complexity higher than expected, resource availability tight",
            "next_steps": "Complete remaining microservices, begin integration testing, schedule security review",
            "project_id": projects[0].id
        },
        {
            "title": "AI Analytics Platform - Bi-weekly Update",
            "report_date": now - timedelta(days=3),
            "period": "Week of " + (now - timedelta(days=3)).strftime("%B %d, %Y"),
            "executive_summary": "AI platform development on track. Data pipeline 70% complete. Model accuracy meeting targets.",
            "key_achievements": "Data ingestion pipeline designed, initial model trained with 92% accuracy, API framework setup",
            "risks_issues": "Resource constraints for ML engineers, data quality issues in legacy systems",
            "next_steps": "Complete data validation, enhance model with additional features, finalize API design",
            "project_id": projects[1].id
        },
        {
            "title": "Mobile App Modernization - Status",
            "report_date": now - timedelta(days=7),
            "period": "Week of " + (now - timedelta(days=7)).strftime("%B %d, %Y"),
            "executive_summary": "Mobile app modernization 60% complete. Both iOS and Android platforms progressing well. Testing phase imminent.",
            "key_achievements": "UI redesign complete, core features migrated, performance benchmarks set",
            "risks_issues": "Timeline pressure from market demands, iOS 16+ requirement may exclude some users",
            "next_steps": "Begin user acceptance testing, prepare release notes, schedule app store submissions",
            "project_id": projects[3].id
        }
    ]

    for report_data in status_reports_data:
        report_schema = schemas.StatusReportCreate(**report_data)
        crud.create_status_report(db, report_schema)

    db.commit()
    print("Database seeding completed successfully!")
