# Testing & Quality Assurance Guide

## 1. Testing Philosophy

Following SRS Section 39 & 62, every core component is covered by deterministic unit and integration test suites using Node.js's native test runner (`node:test` and `node:assert/strict`).

---

## 2. Test Execution Commands

```bash
# Run all test suites across all workspaces
npm run test

# Run tests for a specific workspace:
npm run test --workspace=@intelligent-route/routing-engine
npm run test --workspace=@intelligent-route/optimization-engine
npm run test --workspace=@intelligent-route/prediction-client
npm run test --workspace=@intelligent-route/api

# Run empirical algorithm benchmarks
npm run benchmark
```

---

## 3. Test Coverage Breakdown

### 3.1 Routing Engine (`@intelligent-route/routing-engine`) — 11 Tests
- `MinPriorityQueue` binary min-heap ordering and extract-min.
- `calculateHaversineDistance` accuracy against known coordinates.
- `normalizeWeights` weight vector normalization.
- `findShortestPathAStar` and `findShortestPathDijkstra` optimality verification.
- Dynamic weight alteration: Cheapest mode selects free bypass Route C over toll bridge.
- Hard constraint enforcement: `avoidRoadTypes: ['toll_road']` eliminates toll corridors.
- Bidirectional search correctness between distant nodes.
- **Edge cases:**
  - Origin equals destination ($0$ distance, single node, zero cost).
  - Disconnected graph / unreachable isolated island.
  - Invalid non-existent node ID handling.
- Diverse alternative corridor generation via penalty deflection.

### 3.2 Optimization Engine (`@intelligent-route/optimization-engine`) — 6 Tests
- Verification of standard profile presets (`fastest`, `cheapest`, `shortest`, `balanced`).
- Custom weight override resolution.
- Hard constraints validator (budget exceeded, deadline missed, avoided road types).
- Route confidence score calibration under varying traffic congestion.
- Human-readable route explanation generation and tradeoff analysis.
- Multi-candidate route ranking and recommended route determination.

### 3.3 Prediction Client (`@intelligent-route/prediction-client`) — 4 Tests
- Cyclical time feature engineering ($\sin/\cos$) and rush-hour identification.
- Gradient Boosted Decision Tree ensemble inference.
- Resilient fallback cascade (ML $\rightarrow$ Baseline $\rightarrow$ Current Observation).
- **Comparative evaluation:** Verified that ML Model outperforms the Historical Moving Average Baseline on unseen test data with lower MAE and RMSE.

### 3.4 API Integration Tests (`@intelligent-route/api`) — 8 Tests
- `GET /api/v1/system/health` health status verification.
- `GET /api/v1/map/graph` returns complete 100 nodes and 530 edges.
- `POST /api/v1/routes/search` returns recommended and alternative routes with confidence and explanations.
- Edge case handling: Same origin and destination returns `400 SAME_ORIGIN_DESTINATION`.
- `GET /api/v1/personal-brain` returns user analytics, accuracy %, and learned habits.
- Journey tracking full lifecycle: Start journey $\rightarrow$ Complete journey $\rightarrow$ Submit 5-star feedback rating.
- Live admin algorithm benchmarking: Dijkstra vs A\* vs Bidirectional.

---

## 4. Benchmark Verification Results

Empirical results from 400-node grid benchmark:
- **Dijkstra:** 1.20 ms, 400 nodes explored, cost 42.612
- **A\*:** 0.82 ms, 400 nodes explored, cost 42.612
- **Bidirectional Search:** 0.63 ms, 379 nodes explored, cost 42.612
