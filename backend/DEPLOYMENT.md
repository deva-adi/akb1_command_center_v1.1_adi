# AKB1 Command Center v3.0 - Deployment Guide

## Quick Start

### Local Development
```bash
# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Access Points
- **API Root**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Railway Deployment

### Prerequisites
- Railway account and CLI installed
- GitHub repository with code
- `/data` volume configured for persistence

### Configuration Files

#### railway.json
```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### .dockerignore
```
__pycache__
*.pyc
.env
.git
.gitignore
venv
.vscode
*.db
```

### Deployment Steps

1. **Create Railway Project**
```bash
railway init
```

2. **Add Persistent Volume**
```bash
# In Railway dashboard:
# Services > Your App > Variables > Add Volume
# Mount path: /data
# Keep data across deployments: Yes
```

3. **Deploy**
```bash
railway up
```

4. **Set Environment Variables**
```bash
railway variables set DATABASE_URL="sqlite:////data/akb1.db"
railway variables set LOG_LEVEL="info"
```

5. **View Logs**
```bash
railway logs
```

## Production Configuration

### Environment Variables
```bash
# Database (SQLite with persistent volume)
DATABASE_URL=sqlite:////data/akb1.db

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS (update for production)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4
```

### Performance Tuning

#### Uvicorn Workers
```bash
# For Railway (single container):
uvicorn main:app --host 0.0.0.0 --port 8000

# For multi-container:
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Database Optimization
- SQLite is suitable for up to 10,000+ records
- For higher scale, consider PostgreSQL:
```python
# Update database.py:
DATABASE_URL = "postgresql://user:password@host/dbname"
```

### Load Balancing
```bash
# Use Railway's built-in load balancer
# Configure in railway.json:
{
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Docker Compose (Local)

### docker-compose.yml
```yaml
version: '3.8'

services:
  akb1-backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: sqlite:////data/akb1.db
      LOG_LEVEL: info
    volumes:
      - akb1-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  akb1-data:
    driver: local
```

### Run with Docker Compose
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## AWS Deployment

### ECS (Elastic Container Service)

1. **Push to ECR**
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t akb1-backend .
docker tag akb1-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/akb1-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/akb1-backend:latest
```

2. **Create ECS Task Definition**
```json
{
  "family": "akb1-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "akb1-backend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/akb1-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "sqlite:////data/akb1.db"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "akb1-data",
          "containerPath": "/data"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/akb1-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "volumes": [
    {
      "name": "akb1-data",
      "efsVolumeConfiguration": {
        "filesystemId": "fs-12345678",
        "transitEncryption": "ENABLED"
      }
    }
  ]
}
```

3. **Create ECS Service**
```bash
aws ecs create-service \
  --cluster akb1-cluster \
  --service-name akb1-backend \
  --task-definition akb1-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-123],securityGroups=[sg-123],assignPublicIp=ENABLED}"
```

### RDS (For Production Database)

Consider migrating from SQLite to PostgreSQL:

```python
# requirements.txt addition
psycopg2-binary==2.9.9

# database.py
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@rds-endpoint:5432/akb1"
)

engine = create_engine(DATABASE_URL)
```

## GCP Deployment

### Cloud Run

1. **Create Cloud Run Service**
```bash
gcloud run deploy akb1-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --set-env-vars "DATABASE_URL=sqlite:////data/akb1.db"
```

2. **Mount Cloud Storage (for persistent data)**
```bash
# Use GCS bucket instead of /data volume
pip install google-cloud-storage

# Update database.py to use GCS
```

## Azure Deployment

### App Service

```bash
# Create resource group
az group create --name akb1-rg --location eastus

# Create app service plan
az appservice plan create \
  --name akb1-plan \
  --resource-group akb1-rg \
  --sku B1

# Create web app
az webapp create \
  --resource-group akb1-rg \
  --plan akb1-plan \
  --name akb1-backend \
  --runtime PYTHON:3.11

# Configure app
az webapp config appsettings set \
  --resource-group akb1-rg \
  --name akb1-backend \
  --settings \
    WEBSITES_PORT=8000 \
    DATABASE_URL="sqlite:////data/akb1.db"

# Deploy
cd backend && \
  zip -r app.zip . && \
  az webapp deployment source config-zip \
    --resource-group akb1-rg \
    --name akb1-backend \
    --src app.zip
```

## Health Checks & Monitoring

### Health Endpoint
```bash
curl http://localhost:8000/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2025-03-15T10:30:45.123456",
  "version": "3.0.0"
}
```

### Prometheus Metrics (Optional)
```bash
pip install prometheus-client

# Add to main.py:
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

### CloudWatch (AWS)
```python
import watchtower
import logging

handler = watchtower.CloudWatchLogHandler()
logging.getLogger().addHandler(handler)
```

## Backup & Recovery

### Database Backup
```bash
# SQLite backup
cp /data/akb1.db /backup/akb1.db.backup

# Automated backup (cron)
0 2 * * * cp /data/akb1.db /backup/akb1.db.$(date +\%Y\%m\%d).backup
```

### Data Restoration
```bash
# Restore from backup
cp /backup/akb1.db.backup /data/akb1.db
```

## Scaling Strategy

### Vertical Scaling (Single Instance)
- Increase CPU and RAM
- Works up to ~10,000 projects

### Horizontal Scaling
- Requires moving to PostgreSQL
- Implement caching (Redis)
- Use load balancer (ALB, Nginx)

### Database Scaling
```
SQLite (Current)    → Single instance, <10k records
PostgreSQL         → Multiple instances, 100k+ records
PostgreSQL + Cache → Multi-instance, sub-second queries
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway up
```

## Security Checklist

- [ ] CORS configured for production domains
- [ ] Database backups automated
- [ ] Activity logs retained (consider archival)
- [ ] API authentication added (JWT recommended)
- [ ] HTTPS enforced (Railway handles this)
- [ ] Secrets managed via environment variables
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] SQL injection prevented (using ORM)
- [ ] CORS headers configured
- [ ] Health check monitoring enabled
- [ ] Error logging configured

## Monitoring Commands

### Check Application Health
```bash
curl -s http://localhost:8000/api/health | jq
```

### Check Database Size
```bash
ls -lh /data/akb1.db
sqlite3 /data/akb1.db ".tables"
```

### View Recent Logs
```bash
# For Railway
railway logs --tail 50

# For Docker
docker logs -f akb1-backend
```

### Monitor Resource Usage
```bash
# CPU and Memory
docker stats akb1-backend

# Disk usage
du -sh /data
```

## Troubleshooting

### Database Locked Error
```
Solution: Restart application
sqlite3 /data/akb1.db "PRAGMA wal_checkpoint(RESTART);"
```

### Out of Memory
```
Solution: Increase container memory or upgrade plan
Current: 512MB recommended
Minimum: 256MB
```

### Slow Queries
```
Enable SQLite query logging:
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## Support & Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- Railway Docs: https://docs.railway.app/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Uvicorn: https://www.uvicorn.org/

## Version History

- **v3.0.0** (2025-03-15): Initial production release
  - 12 database tables
  - 15 KPIs with worked examples
  - Full CRUD operations
  - Activity logging
  - Executive dashboard
  - Railway-optimized
