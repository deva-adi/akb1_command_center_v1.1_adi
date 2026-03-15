# AKB1 Command Center v3.0 - Deployment Configuration

This document summarizes the Docker and CI/CD configuration created for the AKB1 Command Center v3.0 project.

## Files Created

### Core Docker Configuration

1. **Dockerfile** (root level)
   - Multi-stage build architecture
   - Stage 1: Node.js 20 Alpine - builds React frontend using Vite
   - Stage 2: Python 3.11 Slim - production runtime
   - Includes system dependencies (sqlite3, curl for health checks)
   - Creates persistent /data volume for SQLite database
   - Includes Docker health check using curl
   - Exposes port 8000

2. **.dockerignore**
   - Excludes unnecessary files from Docker context
   - Reduces build time and image size
   - Excludes node_modules, __pycache__, .git, .env, data/, etc.

3. **docker-compose.yml**
   - Local development configuration
   - Single service: app
   - Port mapping: 8000:8000
   - Volume mounting: ./data:/data for persistent SQLite storage
   - Health check configuration
   - Auto-restart on failure

### GitHub Actions CI/CD

4. **.github/workflows/deploy.yml**
   - Automated deployment pipeline on main branch push
   - Jobs:
     - Checkout code
     - Install Railway CLI
     - Deploy using railway up command
   - Uses RAILWAY_TOKEN secret for authentication

5. **railway.json**
   - Railway platform configuration file
   - Build configuration: Uses Dockerfile
   - Deploy configuration:
     - Start command: uvicorn with proper port binding
     - Health check path: /api/health
     - Restart policy: ON_FAILURE with max 3 retries

### Git Configuration

6. **.gitignore**
   - Comprehensive exclusions for Python and Node.js projects
   - Excludes node_modules/, __pycache__/, virtual environments
   - Excludes environment files (.env), build outputs, IDE settings
   - Excludes data/ directory with persistent storage

### Backend Updates

7. **backend/main.py** (updated)
   - Added static file serving for React frontend
   - Mounts /assets route to built frontend assets
   - Implements SPA fallback route handler
   - Serves index.html for all non-API routes
   - Protects API routes from SPA fallback

### Documentation

8. **README.md**
   - Project overview and tech stack summary
   - Quick start instructions for Docker Compose
   - Development setup (without Docker)
   - Complete API endpoint listing
   - Deployment instructions to Railway
   - Database configuration and troubleshooting
   - Complete file structure documentation

## Architecture Overview

### Multi-Stage Docker Build Process

```
Stage 1: Frontend Builder
├── Base: node:20-alpine
├── Installs npm dependencies
├── Builds React Vite application
└── Output: /app/frontend/dist

Stage 2: Production Runtime
├── Base: python:3.11-slim
├── Installs system dependencies (sqlite3, curl)
├── Installs Python dependencies from requirements.txt
├── Copies backend code
├── Copies built frontend from Stage 1 → frontend_dist/
├── Creates persistent /data directory
└── Runs: uvicorn backend.main:app
```

### Unified Service Architecture

```
Port 8000 (FastAPI + Uvicorn)
├── /api/* → Backend API routes (FastAPI routers)
├── /assets/* → Static assets (React build output)
└── /* → SPA fallback (serves index.html)

Database
└── /data/akb1_command_center.db (persistent SQLite)
```

### CI/CD Pipeline

```
GitHub Push to main
    ↓
GitHub Actions Workflow
    ├── Checkout code
    ├── Install Railway CLI
    └── Execute: railway up
        ↓
    Railway Platform
        ├── Detect Dockerfile
        ├── Build Docker image (multi-stage)
        ├── Push to Railway registry
        └── Deploy container
            ├── Expose port 8000
            ├── Mount persistent storage
            └── Health check: /api/health
```

## Deployment Checklist

### Pre-Deployment

- [ ] Verify Docker build locally: `docker-compose up --build`
- [ ] Test application at http://localhost:8000
- [ ] Verify API endpoints: `curl http://localhost:8000/api/health`
- [ ] Verify SPA serving: Visit http://localhost:8000 in browser
- [ ] Check database initialization in /data/

### Railway Setup

- [ ] Create Railway account (https://railway.app)
- [ ] Create new Railway project
- [ ] Generate Railway token from dashboard
- [ ] Add RAILWAY_TOKEN to GitHub Secrets (Settings → Secrets and variables → Actions)

### Deployment

- [ ] Commit all changes to git
- [ ] Push to main branch: `git push origin main`
- [ ] Monitor GitHub Actions workflow
- [ ] Verify Railway deployment status
- [ ] Test deployed application

## Key Configuration Details

### Frontend Build

- Build tool: Vite
- Output directory: dist/
- Build command: npm run build
- Copied to: frontend_dist/ in production image

### Backend Configuration

- Framework: FastAPI
- Server: Uvicorn
- Port: 8000 (via PORT environment variable)
- Database: SQLite in /data/akb1_command_center.db
- Static files: Mounted at /assets/
- SPA fallback: Handles client-side routing

### Health Check

- Endpoint: /api/health
- Method: GET
- Response includes: status, timestamp, version
- Docker check: curl http://localhost:8000/api/health
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 5 seconds
- Retries: 3

### Data Persistence

- Database: SQLite (/data/)
- Volume mapping: ./data:/data
- Auto-initialization: On first startup
- Auto-seeding: If database is empty
- Backup: Copy /data/ directory before updates

## Environment Variables

### Runtime (Railway)

- PORT: Application port (default: 8000)
- Secrets: RAILWAY_TOKEN (for GitHub Actions)

### Build (Docker)

- No special build variables required
- Base images: node:20-alpine, python:3.11-slim

## File Sizes and Build Time

**Frontend Build:**
- React + dependencies: ~150-200 MB during build
- Final dist/ output: ~500 KB - 1 MB
- Build time: ~2-3 minutes

**Python Installation:**
- Requirements install: ~30-50 MB
- Installation time: ~1-2 minutes

**Total Docker Build Time:** ~3-5 minutes (first build)

**Final Image Size:** ~600-800 MB (with all dependencies)

## Troubleshooting

### Build Fails with "npm: command not found"
- Ensure frontend/ directory contains package.json
- Verify node:20-alpine image has npm installed
- Check that COPY frontend/ . in Stage 1 succeeds

### Health Check Fails
- Ensure curl is installed in Stage 2 (added to apt-get)
- Verify application starts without errors
- Check application logs for startup issues

### Frontend Not Serving
- Verify frontend builds successfully: npm run build
- Ensure Dockerfile copies dist/ to frontend_dist/
- Check main.py mounts /assets and implements SPA fallback

### Database Errors
- Verify /data directory exists and has correct permissions
- Check SQLite file permissions in /data/
- Review application startup logs in Docker output

## Support and Maintenance

### Monitoring

- Check application logs: `docker-compose logs app`
- Monitor health check: Visit http://localhost:8000/api/health
- Review Railway dashboard for deployment status

### Updates

- Update Python dependencies: Modify backend/requirements.txt
- Update Node dependencies: Modify frontend/package.json
- Both will be rebuilt on next Docker build or Railway deployment

### Cleanup

- Remove local data: `rm -rf ./data/`
- Remove Docker containers: `docker-compose down`
- Remove Docker images: `docker rmi <image-name>`

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
