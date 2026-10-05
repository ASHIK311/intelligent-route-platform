# Production Deployment Guide

## 1. Containerized Deployment (Docker Compose)

The repository provides multi-stage production Dockerfiles and a root `docker-compose.yml` to spin up the entire cluster with one command.

### Architecture:
- `neuro_route_postgres`: PostgreSQL 15 + PostGIS with automated schema migration.
- `neuro_route_redis`: In-memory caching for hot graph segments and route queries.
- `neuro_route_api`: Node.js Express & WebSocket API running with multi-stage Alpine build.
- `neuro_route_web`: Production Nginx web server serving optimized Vite React SPA bundles.

### Running the Stack:
```bash
docker-compose up -d --build
```

Verify service status:
```bash
docker-compose ps
```

Health check:
```bash
curl http://localhost:4000/api/v1/system/health
```

---

## 2. Standalone Production Deployment

### Building Applications
```bash
# Install production dependencies
npm ci

# Build all packages and applications
npm run build
```

### Starting Backend API
```bash
NODE_ENV=production PORT=4000 node apps/api/dist/server.js
```

### Serving Frontend Web App
Serve the static build artifacts located in `apps/web/dist` with any static server or reverse proxy (Nginx, Caddy, Cloudflare, AWS CloudFront).

---

## 3. Environment Variables Reference

Ensure the following variables are configured in production:
```bash
PORT=4000
NODE_ENV=production
API_PREFIX=/api/v1
JWT_SECRET=<STRONG_64_CHAR_SECRET_KEY>
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@host:5432/route_platform
REDIS_URL=redis://host:6379
CLIENT_URL=https://your-domain.com
```

---

## 4. Security Hardening Checklist

- [x] Passwords hashed with Bcrypt (salt rounds = 10).
- [x] JWT token authentication with expiration checks.
- [x] Role-Based Access Control (`user`, `advanced_user`, `admin`).
- [x] CORS whitelist protection.
- [x] Strict input validation and sanitization.
- [x] Stack traces hidden in production error responses.
