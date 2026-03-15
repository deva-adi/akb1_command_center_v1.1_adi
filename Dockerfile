# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/ .

# Install dependencies
RUN npm install

# Build frontend
RUN npm run build

# Stage 2: Production runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for SQLite and runtime
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY backend/requirements.txt ./backend/

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Create persistent data directory for SQLite
# Railway mounts persistent volumes to this path - configure in Railway dashboard
RUN mkdir -p /data && chmod 755 /data

# Declare volume for SQLite persistence across deploys
VOLUME /data

# Environment variable for data directory (overridable via Railway env vars)
ENV DATA_DIR=/data

# Expose port
EXPOSE 8000

# Health check (Railway uses its own healthcheck, this is for Docker)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Set default port
ENV PORT=8000

# Set working directory to backend for proper imports
WORKDIR /app/backend

# Start command (shell form to support env var expansion)
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
