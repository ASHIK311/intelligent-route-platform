# Intelligent Adaptive Route Optimization & Personal Route Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Version:** 1.0.0  
> **Architecture:** Modern Monorepo · Modular Micro-Packages · Web Client + Node.js API + ML Prediction Engine + Personal Route Brain

An intelligent, multi-objective transportation decision-support platform that goes beyond basic distance calculators to answer:
> **"Which route is expected to provide the best overall outcome for this user at this time?"**

---

## 🌟 Key Features

1. **Multi-Objective Dynamic Routing Engine**
   - **A\* Algorithm**: Admissible geographic heuristic for low-latency searches.
   - **Dijkstra Baseline**: Strict optimality verification and benchmark comparison.
   - **Bidirectional Search**: Simultaneous frontier expansion for large metropolitan graphs.
   - **Alternative Corridor Generation**: Yen's KSP / penalty deflection to discover distinct topological options.

2. **Dynamic Multi-Objective Cost Function**
   $$\text{Score} = W_d \cdot \text{Dist} + W_t \cdot \text{Time} + W_c \cdot \text{Cost} + W_p \cdot \text{Delay} + W_r \cdot \text{Risk} + W_u \cdot \text{UserPrefPenalty}$$
   - Preset profiles: **Balanced**, **Fastest**, **Cheapest**, **Shortest**, **Custom Weights**.
   - Enforces **Hard Constraints** (Max budget, deadline, avoided roads) strictly before soft optimization.

3. **Machine Learning Travel-Time Prediction Engine**
   - Gradient Boosted Decision Tree Ensemble trained on cyclical rush-hour traffic dynamics.
   - Delivers predicted travel times, confidence scores (e.g. 94%), and delay probability.
   - Outperforms historical moving average baseline on held-out evaluation datasets.
   - Resilient Fallback Cascade: `ML` → `Historical Baseline` → `Current Observation` → `Free-Flow Base`.

4. **Personal Route Brain**
   - Learns user-specific travel habits, repeated origin-destination corridors, and cost/time sensitivities.
   - Calculates time saved (%), money saved ($), and prediction calibration across historical trips.
   - Personalization affinity bonus never blindly overrides objective hard constraints.

5. **Transparent Route Explanation Engine**
   - Explains primary reasons, secondary factors, major tradeoffs, and ML prediction impacts.

6. **Interactive Professional Web Dashboard**
   - High-tech dark-theme vector map canvas of the 100-node 530-edge metropolitan road network.
   - Color-coded traffic congestion overlays and animated route polylines.
   - Side-by-side route comparison drawer.
   - Real-time journey tracking simulator with 5-star user rating and feedback collection.
   - Personal Brain Dashboard, Analytics Dashboard, and Admin Console.

---

## 📂 Repository Structure

```text
intelligent-route-platform/
│
├── apps/
│   ├── web/                     # React + Vite + TypeScript + Tailwind web application
│   └── api/                     # Node.js + Express + WebSocket backend API
│
├── packages/
│   ├── shared-types/            # Shared TypeScript contracts & interfaces
│   ├── routing-engine/          # Priority Queue, A*, Dijkstra, Bidirectional, Alternatives
│   ├── optimization-engine/     # Dynamic cost scoring, profiles, constraints, confidence
│   └── prediction-client/       # Gradient Boosted ML inference, baselines, metrics
│
├── ml/
│   ├── data/                    # Traffic dataset generators & training data
│   ├── training/                # Standalone Python / Scikit-learn training scripts
│   └── evaluation/              # Model evaluation metrics (MAE, RMSE, MAPE)
│
├── database/
│   ├── schema/                  # PostgreSQL + PostGIS schema definitions
│   ├── migrations/              # Database migration scripts
│   └── seeds/                   # Deterministic 100-node 530-edge Metro City Graph
│
├── infrastructure/
│   └── docker/                  # Production Dockerfiles for API and Web
│
├── docs/                        # Complete technical documentation suite
├── docker-compose.yml           # Full stack container orchestration
└── package.json                 # Root npm workspaces
```

---

## 🚀 Quick Start

### 1. Requirements
- Node.js `v20+` or `v22+`
- npm `v10+`

### 2. Install Dependencies & Build
```bash
# Install workspace dependencies
npm install

# Compile all TypeScript packages and applications
npm run build
```

### 3. Run Automated Tests
```bash
# Run test suites across all packages
npm run test
```

### 4. Start Development Servers
```bash
# In terminal 1 (API Server - Port 4000):
npm run dev:api

# In terminal 2 (Web Client - Port 5173):
npm run dev:web
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📚 Technical Documentation

- **[SETUP.md](./SETUP.md)** — Step-by-step installation, environments, and troubleshooting.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — High-level and component architecture diagrams.
- **[API.md](./API.md)** — Complete REST & WebSocket API specification.
- **[ALGORITHMS.md](./ALGORITHMS.md)** — Dijkstra, A\*, Bidirectional, and Yen KSP analysis.
- **[ML.md](./ML.md)** — Machine learning features, models, baselines, and evaluation.
- **[DATABASE.md](./DATABASE.md)** — Entity-Relationship design, PostgreSQL/PostGIS, and tables.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Docker, container orchestration, and production setup.
- **[TESTING.md](./TESTING.md)** — Test coverage, benchmarks, and verification procedures.

---

## ⚖️ License
MIT License. Created for intelligent adaptive transportation optimization.
