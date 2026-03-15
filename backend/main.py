from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

from database import init_db, get_db
from routers import (
    projects, kpis, risks, sprints, resources, dependencies,
    releases, change_requests, estimations, activity_log,
    settings, status_reports, dashboard
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AKB1 Command Center v3.0",
    description="Enterprise delivery management and portfolio management platform",
    version="3.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "3.0.0"
    }

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    """Initialize database and run seeding if needed."""
    logger.info("Starting AKB1 Command Center v3.0")
    try:
        init_db()
        logger.info("Database initialized successfully")

        # Check if we need to seed the database
        from database import SessionLocal
        import models
        from seed import seed_database

        db = SessionLocal()
        try:
            project_count = db.query(models.Project).count()
            if project_count == 0:
                logger.info("Database is empty, running seed...")
                seed_database(db)
                logger.info("Database seeding completed successfully")
            else:
                logger.info(f"Database already populated with {project_count} projects")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during startup: {e}", exc_info=True)
        raise

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down AKB1 Command Center v3.0")

# Include routers
app.include_router(projects.router)
app.include_router(kpis.router)
app.include_router(risks.router)
app.include_router(sprints.router)
app.include_router(resources.router)
app.include_router(dependencies.router)
app.include_router(releases.router)
app.include_router(change_requests.router)
app.include_router(estimations.router)
app.include_router(activity_log.router)
app.include_router(settings.router)
app.include_router(status_reports.router)
app.include_router(dashboard.router)

# Root endpoint
@app.get("/api/info")
def api_info():
    """API information endpoint."""
    return {
        "name": "AKB1 Command Center v3.0",
        "description": "Enterprise delivery management and portfolio management platform",
        "version": "3.0.0",
        "endpoints": {
            "health": "/api/health",
            "projects": "/api/projects",
            "kpis": "/api/kpis",
            "risks": "/api/risks",
            "sprints": "/api/sprints",
            "resources": "/api/resources",
            "dependencies": "/api/dependencies",
            "releases": "/api/releases",
            "change_requests": "/api/change-requests",
            "estimations": "/api/estimations",
            "activity_log": "/api/activity-log",
            "settings": "/api/settings",
            "status_reports": "/api/status-reports",
            "dashboard": "/api/dashboard"
        }
    }

# Serve React frontend static files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")

if os.path.exists(frontend_dist):
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA for all non-API routes."""
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return {"error": "Not found"}

        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

        return {"error": "Frontend not built"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
