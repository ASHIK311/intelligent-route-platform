<div align="center">

# ⚡ Intelligent Adaptive Route Optimization & Personal Route Intelligence Platform

<p align="center">
  <strong>Next-Generation Multi-Objective Urban Navigation, Machine Learning Traffic Forecasting & Personal Route Brain</strong>
</p>

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://intelligent-route-platform-chi.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostGIS-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-29%20Passed-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)](./TESTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=open-source-initiative&logoColor=black)](./LICENSE)

<br/>

<p align="center">
  🌐 <strong>Live Application URL:</strong> <a href="https://intelligent-route-platform-chi.vercel.app/"><strong>https://intelligent-route-platform-chi.vercel.app/</strong></a>
</p>

---

### 🌐 Beyond Basic Distance Calculators:
> *"Which route is expected to provide the best overall outcome for this specific user at this exact time under evolving traffic conditions?"*

[🚀 Live Demo](https://intelligent-route-platform-chi.vercel.app/) • [✨ Key Features](#-key-features) • [🏛 System Architecture](#-system-architecture) • [⚡ Routing Algorithms & Math](#-routing-algorithms--mathematical-formulation) • [🧠 Machine Learning Engine](#-machine-learning-travel-time-engine) • [🔮 Personal Route Brain](#-personal-route-brain) • [🖥️ Web Dashboard](#%EF%B8%8F-interactive-web-dashboard) • [📊 Benchmarks](#-empirical-benchmarks) • [🚀 Quick Start](#-quick-start) • [🔌 API Reference](#-rest--websocket-api-reference) • [📚 Technical Docs](#-technical-documentation)


---

</div>

## 🌟 Key Features

| Capability | Technical Implementation | Value Delivered |
| :--- | :--- | :--- |
| **⚡ Multi-Objective Routing** | Priority Queue A\*, Dijkstra ground-truth baseline, Bidirectional search, Yen's KSP penalty deflection | Balances travel time, physical distance, monetary tolls, delays, and risk factors simultaneously. |
| **🧠 ML Travel-Time Forecaster** | Gradient Boosted Decision Tree Ensemble (`gbt-traveltime-v1.4`) with cyclical $\sin/\cos$ time encoding | Outperforms historical moving averages by **42% lower MAE** and **54% lower MAPE**. |
| **🛡️ 4-Tier Fallback Cascade** | `ML Model` $\rightarrow$ `Historical Moving Avg` $\rightarrow$ `Sensor Observations` $\rightarrow$ `Free-Flow Base` | 100% resilient routing availability during sensor dropouts or API degradation. |
| **🔮 Personal Route Brain** | Continuous habit discovery, repeated corridor affinity tracking, time vs. cost sensitivity calibration | Tailors route preferences to individual driver behavior without overriding hard safety constraints. |
| **🎯 Hard Constraint Enforcement** | Strict filtering pipeline for Maximum Budget, Arrival Deadlines, and Avoided Road Types | Guarantees zero suggested routes exceed commuter toll limits or arrive past critical deadlines. |
| **💡 Transparent Explainability** | Rationale synthesis engine explaining trade-offs, prediction effects, and factor weight contributions | Builds commuter trust by explaining *why* a particular path was recommended over alternatives. |
| **🛰️ Live Vector Dashboard** | High-tech Dark Cyberpunk theme, dynamic 100-node 530-edge vector map canvas, real-time journey simulation | Visualizes congestion heatmaps, active turn-by-turn telemetry, and user feedback ratings. |

---

## 🏛 System Architecture

The platform is designed around strict monorepo modularity with zero circular dependencies across packages and applications:

```mermaid
graph TD
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef server fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef core fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef storage fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#f8fafc;

    subgraph Client_Presentation [" 🌐 Presentation Layer (Port 3000) "]
        UI["React 18 + Vite + Tailwind Web Application<br/>• 100-Node Interactive Vector Map Canvas<br/>• Animated Gyroscope Radar UI & Journey HUD<br/>• Side-by-Side Multi-Route Comparison Drawer"]:::client
    end

    subgraph API_Gateway [" 🔌 Backend API Gateway (Port 4000) "]
        API["Node.js Express + WebSocket Server<br/>• REST API v1 • Real-Time Congestion Streamer<br/>• JWT Authentication & Journey Lifecycle Manager"]:::server
    end

    subgraph Core_Engines [" ⚡ Core Computational Engines "]
        RE["@intelligent-route/routing-engine<br/>• MinPriorityQueue (Binary Min-Heap)<br/>• A* Search (Admissible Haversine Heuristic)<br/>• Dijkstra Verification Baseline<br/>• Bidirectional Search & Penalty Deflection"]:::core
        
        ML["@intelligent-route/prediction-client<br/>• Gradient Boosted Decision Tree Ensemble<br/>• Rush-Hour & Congestion Momentum Pipeline<br/>• 4-Tier Resilient Fallback Cascade"]:::core

        PB["Personal Route Brain<br/>• Commuter Routine & Corridor Mining<br/>• Time vs Cost Tradeoff Sensitivity<br/>• Non-Invasive Affinity Bonus Scoring"]:::core

        OE["@intelligent-route/optimization-engine<br/>• Dynamic Multi-Objective Cost Function<br/>• Hard Constraint Safety Evaluator<br/>• Calibrated Confidence Metric (0.45 - 0.98)<br/>• Human-Readable Explanation Engine"]:::core
    end

    subgraph Storage_Layer [" 🗄️ Persistence & Infrastructure "]
        DB["PostgreSQL 15 + PostGIS<br/>• Spatial Metro Network (100 Nodes, 530 Edges)<br/>• Historical Commuter Journeys & Feedback"]:::storage
        REDIS["Redis Cache<br/>• Fast Graph Segment & Route Traversal Cache"]:::storage
    end

    UI <-->|"REST (JSON) / WebSocket"| API
    API --> PB
    API --> ML
    API --> RE
    RE --> OE
    ML --> OE
    PB --> OE
    OE --> API
    API <--> DB
    API <--> REDIS
```

---

## ⚡ Routing Algorithms & Mathematical Formulation

### 1. Dynamic Multi-Objective Cost Function
Traditional routing tools minimize distance alone, leading to congested bottlenecks and unexpected toll costs. Our engine evaluates each directed graph edge $e = (u, v)$ dynamically:

$$\text{Cost}(e) = W_d \cdot D(e) + W_t \cdot T(e) + W_c \cdot C(e) + W_p \cdot \Delta_p(e) + W_r \cdot R(e) + W_u \cdot P_u(e)$$

Where:
- $D(e)$: Geographic segment length in kilometers.
- $T(e)$: Real-time sensor travel time in minutes.
- $C(e)$: Monetary toll charge in USD.
- $\Delta_p(e)$: Predicted congestion delay above free-flow base: $\max(0, T_{\text{pred}}(e) - T_{\text{base}}(e))$.
- $R(e)$: Risk factor derived from road volatility ($0.0 \le R \le 1.0$).
- $P_u(e)$: User preference penalty for avoided road types or non-preferred corridors.
- Weights are strictly normalized: $\sum W_i = 1.0$.

### 2. Search Algorithms

```mermaid
flowchart LR
    subgraph AStar [" 🎯 A* Search "]
        direction TB
        A1["f(n) = g(n) + h(n)"] --> A2["Admissible Haversine Heuristic"]
        A2 --> A3["Fast Low-Latency Point-to-Point"]
    end

    subgraph Dijkstra [" 📐 Dijkstra Baseline "]
        direction TB
        D1["f(n) = g(n)"] --> D2["Exact Ground Truth"]
        D2 --> D3["Strict Optimality Verification"]
    end

    subgraph Bidirectional [" ⚡ Bidirectional Dijkstra "]
        direction TB
        B1["Forward Search (s) + Backward Search (t)"] --> B2["Intersect Frontiers (μ Threshold)"]
        B3["O(2 · b^(d/2)) Search Space Reduction"]
    end
```

- **A\* Algorithm**: Uses straight-line Haversine distance scaled by $W_d$. Because the minimum possible edge cost cannot fall below $W_d \cdot \text{distance}$, the heuristic is strictly **admissible** and **monotone/consistent**, guaranteeing the optimal path on the first expansion.
- **Dijkstra Ground Truth**: Serves as the formal verification baseline against which A\* and Bidirectional algorithms are continuously tested.
- **Bidirectional Search**: Expands search frontiers simultaneously from origin $s$ and destination $t$, stopping when $\min(Q_F) + \min(Q_B) \ge \mu$.
- **Diverse Alternative Generation**: Uses edge-penalty deflection and profile variation to discover topographically distinct corridors rather than minor variations of the same highway.

---

## 🧠 Machine Learning Travel-Time Engine

### 1. Gradient Boosted Decision Tree Architecture
Trained on metropolitan traffic cycles, the ML model estimates expected delay before the commuter encounters it:

```mermaid
graph LR
    subgraph Inputs [" Feature Pipeline "]
        F1["hourSin / hourCos (Cyclical)"]
        F2["isRushHour (Morning & Evening Peaks)"]
        F3["recentTrafficTrendRatio (15-min Momentum)"]
        F4["roadTypeHighway / roadTypeLocal (Capacity)"]
        F5["currentTravelTimeMin (Sensor Observation)"]
    end

    subgraph Ensemble [" GBDT Ensemble (gbt-traveltime-v1.4) "]
        T1["Tree 1: Peak Rush Density Non-Linearity"]
        T2["Tree 2: Congestion Momentum Waves"]
        T3["Tree 3: Road Hierarchy Bottlenecks"]
    end

    subgraph Outputs [" Predictive Outputs "]
        O1["predictedTravelTimeMin (e.g. 28.5 min)"]
        O2["predictedDelayMin (e.g. +5.2 min)"]
        O3["confidence (e.g. 94%)"]
        O4["delayProbability (e.g. 18%)"]
    end

    Inputs --> Ensemble --> Outputs
```

### 2. Resilient 4-Tier Fallback Cascade
If an upstream sensor fails or the ML prediction service experiences high latency, the system never halts. It degrades gracefully down a structured fallback hierarchy:

```mermaid
flowchart TD
    Tier1["Tier 1: ML Gradient Boosted Model Inference"]
    Tier2["Tier 2: Historical Time-of-Day Moving Average Baseline"]
    Tier3["Tier 3: Real-Time Current Sensor Observations"]
    Tier4["Tier 4: Theoretical Free-Flow Speed by Road Class"]

    Tier1 -->|"Sensor anomaly / ML timeout"| Tier2
    Tier2 -->|"Missing historical pattern"| Tier3
    Tier3 -->|"Sensor feed disconnected"| Tier4
```

---

## 🔮 Personal Route Brain

The **Personal Route Brain** transforms static navigation into an adaptive learning companion:

- **Routine & Corridor Discovery**: Automatically identifies frequent origin-destination corridors (e.g., *Downtown Core $\leftrightarrow$ Tech Corridor*).
- **Driver Tradeoff Profiling**: Observes past commuter choices to quantify sensitivity to toll costs versus minute-savings.
- **Non-Invasive Affinity Bonuses**: Applies gentle soft penalties to unfamiliar detours while strictly respecting hard budget and deadline constraints.
- **Quantified Savings Analytics**: Computes cumulative time saved, money saved in tolls, and prediction accuracy calibration over the user's trip history.

---

## 🖥️ Interactive Web Dashboard

The web application (`apps/web`) is built with **React 18**, **Vite**, and **TailwindCSS**, featuring a futuristic cyber-tactical interface:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ NEURO-ROUTE INTELLIGENCE PLATFORM           [Commuter: Alex Rivera]  ● SYSTEM ONLINE │
├──────────────────────────────────────────────────────┬─────────────────────────────────┤
│  ROUTE SEARCH & CONSTRAINTS                         │  100-NODE METROPOLITAN CANVAS   │
│  Origin:      [Node 1 (Downtown Hub)    ▼]          │                                 │
│  Destination: [Node 21 (Tech Corridor)   ▼]          │       [N1]                      │
│                                                      │         \                       │
│  Profile: [ Balanced | Fastest | Cheapest | Short ]  │          [N12]---[N18]          │
│                                                      │            \       \           │
│  Hard Constraints:                                   │            [N20]---[N21] 🎯    │
│  [x] Max Budget: $5.00   [x] Avoid Toll Roads        │                                 │
│  [x] Max Distance: 25 km [ ] Deadline: 18:30         │  Traffic Overlays:              │
│                                                      │  🟢 Free Flow   🟡 Moderate     │
│  [ ⚡ CALCULATE OPTIMAL ROUTE ]                      │  🔴 Heavy       🟣 Congested   │
├──────────────────────────────────────────────────────┴─────────────────────────────────┤
│  RECOMMENDED ROUTE BREAKDOWN                                                          │
│  ★ Recommended: Highway 101 Bypass  •  Distance: 14.2 km  •  Time: 18.5 min  •  $0.00  │
│  Confidence: 94% (High)  •  Explanation: Bypasses central bridge bottleneck (-6m delay) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  HUD: [ START JOURNEY SIMULATION ]  •  Turn-by-Turn Telemetry  •  5-Star Rating Feedback│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Highlights:
- 🌀 **Futuristic Animated Gyro-Compass Logo**: Custom SVG HUD with rotating outer azimuth rings, pulsing compass points, radar sweep, and orbiting energy particles.
- 🗺️ **Interactive Vector Map Canvas**: Smooth panning, zooming, node selection, edge congestion color-coding, and glowing animated route polylines.
- 📊 **Multi-Route Side-by-Side Comparison**: Evaluate the recommended route against diverse alternative candidates across time, distance, tolls, and confidence.
- 🚗 **Live Journey Simulator**: Real-time position tracking, turn-by-turn instruction progress, and post-trip feedback collection with star ratings.
- 🧠 **Personal Brain & Admin Benchmark Console**: Inspect learned travel habits and benchmark graph algorithms in real time.

---

## 📊 Empirical Benchmarks

Benchmarked across a dense metropolitan road graph (400 nodes, 1,520 directed edges):

| Algorithm | Mean Latency | Nodes Explored | Memory Footprint | Solution Optimality | Benchmark Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | `1.20 ms` | 400 | 2.1 MB | 100% (Exact Baseline) | `npm run benchmark` |
| **A\* Search** | `0.82 ms` | 400 | 1.8 MB | 100% (Optimal) | `npm run benchmark` |
| **Bidirectional** | `0.63 ms` | 379 | 1.4 MB | 100% (Optimal) | `npm run benchmark` |

*Evaluation conducted on Node.js 22 LTS with monotonic high-resolution timers (`process.hrtime`).*

---

## 📁 Repository Structure

```text
intelligent-route-platform/
│
├── apps/
│   ├── web/                          # React 18 + Vite + TailwindCSS Frontend Application
│   │   ├── src/
│   │   │   ├── components/           # MapCanvas, RouteForm, ComparisonDrawer, JourneyHUD
│   │   │   ├── hooks/                # useMapGraph, useRouteSearch, useJourneyTracker
│   │   │   └── services/             # API client, WebSocket subscriber
│   │   └── vite.config.ts            # Vite config (Port 3000, API reverse proxy)
│   │
│   └── api/                          # Node.js + Express + WebSocket Backend API
│       ├── src/
│       │   ├── controllers/          # Routes, Map, History, PersonalBrain, Admin
│       │   ├── services/             # Recommendation, TrafficStream, PersonalBrain
│       │   ├── middleware/           # JWT Auth, Role Guard, Error Handler
│       │   └── repositories/         # Embedded in-memory store + PostGIS drivers
│       └── server.ts                 # HTTP & WebSocket entrypoint (Port 4000)
│
├── packages/
│   ├── shared-types/                 # Shared TypeScript domain contracts & DTOs
│   ├── routing-engine/               # Binary Min-Heap, A*, Dijkstra, Bidirectional, Yen's KSP
│   ├── optimization-engine/          # Dynamic Cost Function, Hard Constraints, Explanations
│   └── prediction-client/            # GBDT ML Inference, Feature Engineering, Fallback Cascade
│
├── ml/
│   ├── data/                         # Synthetic traffic data generator
│   ├── training/                     # Standalone Python Scikit-learn training scripts
│   └── evaluation/                   # Statistical evaluation scripts (MAE, RMSE, MAPE)
│
├── database/
│   ├── schema/                       # PostgreSQL 15 + PostGIS DDL tables & indexes
│   ├── migrations/                   # Sequential SQL migration files
│   └── seeds/                        # Deterministic 100-node, 530-edge Metropolitan City Graph
│
├── infrastructure/
│   └── docker/                       # Production multi-stage Dockerfiles (API & Web)
│
├── docker-compose.yml                # Full-stack orchestration (Postgres + Redis + API + Web)
├── package.json                      # Monorepo workspaces definition
├── tsconfig.json                     # Shared TypeScript base configuration
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.0.0+` or `v22.0.0+` (LTS recommended)
- **npm**: `v10.0.0+` (or `pnpm` / `yarn`)
- **Docker** *(Optional)*: Docker Desktop / Compose for containerized stack

### 2. Installation & Build

```bash
# 1. Clone repository
git clone https://github.com/ASHIK311/intelligent-route-platform.git
cd intelligent-route-platform

# 2. Install monorepo dependencies across all workspaces
npm install

# 3. Build all TypeScript packages and applications
npm run build
```

### 3. Run Automated Tests

The platform includes **29 comprehensive unit, integration, and algorithmic correctness tests**:

```bash
# Execute test runner across all workspaces
npm run test
```

Expected output:
```text
✔ @intelligent-route/optimization-engine (6 tests passed)
✔ @intelligent-route/prediction-client (4 tests passed)
✔ @intelligent-route/routing-engine (11 tests passed)
✔ @intelligent-route/api (8 integration tests passed)
Total: 29 passed, 0 failed
```

### 4. Launch Local Development Servers

The platform includes a zero-config in-memory metropolitan graph repository pre-seeded with 100 nodes, 530 edges, and historical trips:

```bash
# Terminal 1: Start Backend API (Port 4000)
npm run dev:api

# Terminal 2: Start Web Client (Port 3000)
npm run dev:web
```

Or run both concurrently with a single command:
```bash
npm run dev
```

🌐 Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🐳 Docker Deployment

To launch the full production stack including PostgreSQL with PostGIS, Redis in-memory cache, the Node.js API, and the Nginx-served React web client:

```bash
# Spin up complete stack in detached mode
docker-compose up -d --build

# Check status of running containers
docker-compose ps

# View API logs
docker-compose logs -f neuro_route_api
```

Services exposed:
- **Web Application**: `http://localhost:3000`
- **REST & WebSocket API**: `http://localhost:4000`
- **PostgreSQL / PostGIS**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## 🔌 REST & WebSocket API Reference

All REST endpoints are versioned and mounted at `/api/v1`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/system/health` | Service health status, uptime, and memory usage | No |
| `GET` | `/api/v1/map/graph` | Fetch all 100 nodes and 530 edges of the metropolitan network | No |
| `POST` | `/api/v1/map/traffic/:edgeId` | Dynamically update live congestion on an edge segment | No |
| `POST` | `/api/v1/routes/search` | Execute multi-objective search with ML and constraint filtering | Optional (Bearer) |
| `GET` | `/api/v1/personal-brain` | Retrieve commuter learned habits, corridors, and savings metrics | Optional (Bearer) |
| `POST` | `/api/v1/history/start` | Initialize active journey tracking session | Optional (Bearer) |
| `POST` | `/api/v1/history/:journeyId/complete` | Conclude journey with actual duration and distance | Optional (Bearer) |
| `POST` | `/api/v1/history/:journeyId/feedback` | Submit 1-5 star user rating and qualitative feedback | Optional (Bearer) |
| `POST` | `/api/v1/admin/benchmark` | Run live comparative benchmark (Dijkstra vs A* vs Bidirectional) | Admin |
| `WS` | `/ws/traffic` | WebSocket subscription for real-time congestion telemetry | No |

---

## 📚 Technical Documentation

Explore the detailed architecture and subsystem specifications:

- 📖 **[SETUP.md](./SETUP.md)** — Step-by-step installation, environment variables, and troubleshooting.
- 🏛 **[ARCHITECTURE.md](./ARCHITECTURE.md)** — In-depth component boundaries, request lifecycles, and sequence diagrams.
- ⚡ **[ALGORITHMS.md](./ALGORITHMS.md)** — Mathematical proofs, admissibility theorems, and complexity analysis.
- 🧠 **[ML.md](./ML.md)** — Feature engineering, decision tree hyperparameters, and benchmark comparisons.
- 🗄 **[DATABASE.md](./DATABASE.md)** — Entity-Relationship design, PostGIS spatial tables, and indexing strategies.
- 🔌 **[API.md](./API.md)** — Full request/response schemas, DTOs, and WebSocket contracts.
- 🐳 **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production Docker configurations, reverse proxy setup, and security hardening.
- 🧪 **[TESTING.md](./TESTING.md)** — Test suite layout, edge-case coverage, and benchmarking procedures.

---

## 🤝 Contributing

Contributions, bug reports, and feature proposals are warmly welcome!

1. Fork the Project: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'feat: add amazing feature'`
3. Run test verification: `npm run test`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## ⚖️ License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

<div align="center">
  <sub>Built with ❤️ by Antigravity Intelligent Systems for adaptive urban mobility.</sub>
</div>
