# System Architecture

## 1. High-Level Architecture Overview

As specified in SRS Section 68, the platform is structured around clean modular boundaries where routing, machine learning prediction, personalization, and multi-objective optimization operate as decoupled subsystems:

```mermaid
graph TD
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef server fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef core fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef storage fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#f8fafc;

    subgraph Presentation_Layer [" 🌐 Frontend Presentation "]
        UI["React 18 + Vite + TailwindCSS Web Client<br/>• 100-Node Vector Map Canvas<br/>• Live Journey Tracker & Radar UI"]:::client
    end

    subgraph API_Gateway [" 🔌 API Gateway & Transport "]
        API["Node.js Express + WebSocket Server<br/>• REST API v1 • Real-time Congestion Telemetry"]:::server
    end

    subgraph Intelligence_Subsystems [" 🧠 Core Computational Engines "]
        RE["@intelligent-route/routing-engine<br/>• A* Search (Admissible Heuristic)<br/>• Dijkstra Exact Baseline<br/>• Bidirectional Dijkstra<br/>• Penalty Deflection Alternatives"]:::core
        ML["@intelligent-route/prediction-client<br/>• Gradient Boosted Decision Trees<br/>• Rush-Hour Cyclical Sin/Cos Features<br/>• 4-Tier Resilient Fallback Cascade"]:::core
        PB["Personal Route Brain Service<br/>• Habit & Routine Corridor Discovery<br/>• Time / Cost Sensitivity Learning<br/>• Soft Affinity Bonus Injection"]:::core
        OE["@intelligent-route/optimization-engine<br/>• Multi-Objective Dynamic Cost Function<br/>• Hard Constraint Enforcement<br/>• Calibrated Route Confidence (0.45-0.98)<br/>• Human-Readable Explanation Engine"]:::core
    end

    subgraph Data_Storage [" 🗄️ Persistence & Infrastructure "]
        DB["PostgreSQL 15 + PostGIS<br/>• Spatial Graph (100 Nodes, 530 Edges)<br/>• Journey History & Feedback Logs"]:::storage
        CACHE["Redis In-Memory Cache<br/>• Hot Path Graph Traversal Cache"]:::storage
    end

    UI <-->|"REST (JSON) / WebSocket (Telemetry)"| API
    API --> PB
    API --> ML
    API --> RE
    RE --> OE
    ML --> OE
    PB --> OE
    OE --> API
    API <--> DB
    API <--> CACHE
```

---

## 2. Component Breakdown

### 2.1 `@intelligent-route/routing-engine`
- **MinPriorityQueue**: High-performance binary min-heap for priority queue operations.
- **RoutingGraph**: Adjacency and reverse adjacency map structure holding nodes and edges.
- **A\* Algorithm**: Uses Euclidean/Haversine admissible heuristic for fast geographic pathfinding.
- **Dijkstra Algorithm**: Exact baseline for correctness validation and comparative benchmarking.
- **Bidirectional Search**: Simultaneous frontier expansion from origin and destination.
- **Alternative Corridor Generator**: Combines profile variation with penalty deflection to discover distinct topological corridors.

### 2.2 `@intelligent-route/optimization-engine`
- **Dynamic Cost Function**:
  $$Score = W_d \cdot \text{Distance} + W_t \cdot \text{TravelTime} + W_c \cdot \text{Cost} + W_p \cdot \text{PredictedDelay} + W_r \cdot \text{Risk} + W_u \cdot \text{UserPrefPenalty}$$
- **Profile Presets**: Normalized weight vectors for `Fastest`, `Cheapest`, `Shortest`, `Balanced`, and `Custom`.
- **Constraint Checker**: Evaluates non-negotiable hard constraints (Max Budget, Max Distance, Arrival Deadline, Forbidden Road Types) prior to ranking.
- **Route Confidence Scorer**: Calibrates route certainty between 0.45 and 0.98 based on traffic volatility, segment reliability, and prediction stability.
- **Explanation Engine**: Generates human-understandable rationale for route selection.

### 2.3 `@intelligent-route/prediction-client`
- **Feature Engineering**: Cyclical time encoding ($\sin / \cos$), rush-hour detection, traffic trend momentum, road capacity.
- **Gradient Boosted Model**: Decision tree ensemble delivering travel time multiplier, delay min, confidence, and delay probability.
- **Historical Baseline**: Time-of-day moving average benchmark.
- **Fallback Cascade**: Gracefully drops to baseline, current observation, or free-flow speed if ML is unavailable.

### 2.4 Personal Route Brain (`personal-brain.service.ts`)
- Continuously aggregates historical journeys.
- Identifies frequent Origin-Destination pairs and preferred corridors.
- Injects soft personalization affinity bonuses into the optimization scoring without violating hard constraints.

---

## 3. Request Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Commuter
    participant UI as 🌐 Web Dashboard (React 18)
    participant API as 🔌 Node.js API Gateway
    participant PB as 🧠 Personal Route Brain
    participant ML as 🔮 ML Prediction Engine
    participant RE as ⚡ Routing Engine (A*/Bidir)
    participant OE as 🎯 Optimization Engine
    participant DB as 🗄️ PostGIS / DB Store

    User->>UI: Select Origin & Destination
    UI->>API: POST /api/v1/routes/search
    API->>PB: Query habit corridors & user sensitivities
    PB-->>API: User profile & affinity bonuses
    API->>ML: Predict edge travel times & congestion momentum
    ML-->>API: Multipliers, delay probabilities & confidence
    API->>RE: Execute A* / Bidirectional Dijkstra search
    RE-->>API: Optimal path + Diverse alternative candidates
    API->>OE: Apply Hard Constraints (Budget, Deadline, Avoid Tolls)
    OE->>OE: Compute Multi-Objective Dynamic Scores
    OE->>OE: Calibrate Confidence (0.45 - 0.98) & Generate Explanations
    OE-->>API: Ranked Route Package
    API->>DB: Persist Search Query & Route Telemetry
    API-->>UI: 200 OK (Recommended Route + Alternatives)
    UI->>User: Render Glowing Polylines, Comparison Cards & Trade-offs
```

