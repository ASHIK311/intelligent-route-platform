# Platform Setup Guide

## 1. System Requirements

- **Operating System:** Windows, macOS, or Linux
- **Runtime:** Node.js version 20.0.0+ (Tested on v26.0.0)
- **Package Manager:** npm version 10.0.0+ (or yarn / pnpm)
- **Optional:** Docker & Docker Compose (for containerized PostgreSQL and Redis)
- **Optional:** Python 3.10+ (for standalone `ml/training/train.py` experimentation)

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Key environment parameters:
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `4000` | Node.js API HTTP and WebSocket port |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`) |
| `API_PREFIX` | `/api/v1` | Root routing prefix for REST endpoints |
| `JWT_SECRET` | `super-secret...` | Secret key for signing JWT tokens |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS authorization |
| `DATABASE_URL` | `file:./dev.sqlite` | SQLite connection or PostgreSQL connection string |

---

## 3. Installation & Build

```bash
# 1. Install all dependencies across npm workspaces
npm install

# 2. Build shared packages and applications
npm run build
```

---

## 4. Running the Platform

### Option A: Local Development Mode (Zero-Config)
The platform includes an embedded in-memory repository pre-seeded with 100 metropolitan nodes, 530 edges, and historical trips:

```bash
# Terminal 1: Run Node.js API backend
npm run dev:api

# Terminal 2: Run React / Vite Web frontend
npm run dev:web
```

Access the interactive web application at:
**[http://localhost:3000](http://localhost:3000)** (or [http://localhost:5173](http://localhost:5173) if configured)

API Health endpoint:
**[http://localhost:4000/api/v1/system/health](http://localhost:4000/api/v1/system/health)**

---

### Option B: Docker Compose (Full Stack with PostGIS & Redis)

```bash
docker-compose up --build
```

Services initialized:
- `neuro_route_postgres` on port `5432` with PostGIS extension.
- `neuro_route_redis` on port `6379`.
- `neuro_route_api` on port `4000`.
- `neuro_route_web` on port `80`.

---

## 5. Running Tests & Benchmarks

```bash
# Execute automated test suites (29 unit & integration tests)
npm run test

# Run empirical algorithm benchmark on 400-node grid
npm run benchmark
```
