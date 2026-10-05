# REST & WebSocket API Documentation

All REST endpoints are rooted at `/api/v1`.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates a registered user.
```json
// Request Body
{
  "email": "alex.commuter@gmail.com",
  "password": "commuter123"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_commuter_2",
      "email": "alex.commuter@gmail.com",
      "name": "Alex Rivera",
      "role": "user"
    }
  }
}
```

### `POST /api/v1/auth/register`
Creates a new user profile.

### `GET /api/v1/auth/me`
Returns current authenticated user details. Requires `Authorization: Bearer <token>`.

---

## 2. Map & Graph Endpoints

### `GET /api/v1/map/graph`
Returns complete metropolitan road network (100 nodes, 530 edges).
```json
{
  "success": true,
  "data": {
    "id": "graph_metro_1",
    "nodeCount": 100,
    "edgeCount": 530,
    "nodes": [...],
    "edges": [...]
  }
}
```

### `POST /api/v1/map/traffic/:edgeId`
Dynamically updates traffic congestion on a specific edge segment.
```json
// Request Body
{
  "trafficLevel": "CONGESTED", // LOW, MEDIUM, HIGH, CONGESTED
  "delayMultiplier": 2.2
}
```

---

## 3. Route Optimization Endpoints

### `POST /api/v1/routes/search`
Calculates optimal recommended route and alternatives.
```json
// Request Body
{
  "originId": "node_1",
  "destinationId": "node_21",
  "waypoints": ["node_15"],
  "profile": "balanced", // fastest, cheapest, shortest, balanced, custom
  "constraints": {
    "maxBudget": 5.0,
    "maxDistanceKm": 25.0,
    "arrivalDeadline": "09:00",
    "avoidRoadTypes": ["toll_road"]
  },
  "algorithm": "A*" // A*, Dijkstra, Bidirectional
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "searchId": "search_179123_abc",
    "recommendedRoute": {
      "id": "route_1_179123",
      "name": "Route A (Primary Selected)",
      "pathNodeIds": ["node_1", "node_4", "node_11", "node_21"],
      "totalDistanceKm": 8.5,
      "currentTravelTimeMin": 24.0,
      "predictedTravelTimeMin": 27.5,
      "estimatedCost": 2.10,
      "score": 14.82,
      "confidence": 0.94,
      "delayRisk": "low",
      "explanation": {
        "primaryReason": "Recommended as the optimal balance: ~8 min faster than alternatives with minimal toll impact.",
        "secondaryReasons": ["Estimated toll cost: $2.10.", "1.2 km shorter than alternative corridors."],
        "tradeoffs": ["Costs $0.40 more than alternative Route B."],
        "predictionImpact": "Traffic conditions ahead are predicted to remain stable with low delay risk."
      }
    },
    "alternativeRoutes": [...],
    "calculationTimeMs": 6.8,
    "nodesExplored": 48
  }
}
```

---

## 4. Journey Tracking & Feedback Endpoints

### `POST /api/v1/history/start`
Registers the start of a route journey.
```json
{
  "routeId": "route_1_179123",
  "originId": "node_1",
  "destinationId": "node_21",
  "pathNodeIds": ["node_1", "node_4", "node_11", "node_21"],
  "predictedDurationMin": 28,
  "estimatedCost": 2.10
}
```

### `POST /api/v1/history/:id/complete`
Logs completion of a journey with actual arrival duration. Automatically triggers Personal Route Brain habit analysis.
```json
{
  "actualDurationMin": 27.0,
  "actualCost": 2.10
}
```

### `POST /api/v1/history/:id/feedback`
Submits user feedback rating (1 to 5) and review notes.
```json
{
  "rating": 5,
  "feedbackNotes": "Accurate prediction and smooth commute!"
}
```

---

## 5. Personal Route Brain Endpoints

### `GET /api/v1/personal-brain`
Returns trips analyzed, prediction accuracy %, time saved %, and learned habit patterns.

### `POST /api/v1/personal-brain/analyze`
Forces re-analysis of completed journeys to detect emerging corridors.

---

## 6. System & Admin Endpoints

### `GET /api/v1/system/health`
Returns system status, heap memory, search count, and uptime.

### `POST /api/v1/admin/benchmark`
Runs live comparative algorithm benchmark between Dijkstra, A*, and Bidirectional Search on current graph.

### `POST /api/v1/admin/models/:versionId/promote`
Promotes a candidate ML model to `ACTIVE` production status.

---

## 7. WebSocket Gateway (`ws://localhost:4000/ws`)

### Client Messages:
- `SIMULATE_JOURNEY`: `{ "pathNodeIds": ["node_1", "node_4", ...], "totalMin": 28 }`
- `PING`: `{}`

### Server Broadcasts:
- `JOURNEY_PROGRESS`: Current node step, progress percentage, remaining ETA.
- `JOURNEY_COMPLETED`: Final arrival confirmation.
- `TRAFFIC_ALERT`: Dynamic congestion changes on active corridor.
