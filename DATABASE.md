# Database Architecture & Schema Specification

## 1. Overview

The platform uses a relational architecture designed for PostgreSQL + PostGIS, with support for zero-config SQLite or memory persistence for rapid local development.

---

## 2. Entity Relationship Diagram (ERD)

```text
┌──────────────┐         1:1         ┌───────────────────┐
│    users     ├─────────────────────┤ user_preferences  │
└──────┬───────┘                     └───────────────────┘
       │ 1:N
       ├────────────────────────┐
       │                        │
┌──────▼───────┐         ┌──────▼────────┐
│route_requests│         │ route_history │
└──────┬───────┘         └──────┬────────┘
       │ 1:N                    │ 1:N
┌──────▼───────┐         ┌──────▼──────────┐
│    routes    │         │ learned_patterns│
└──────────────┘         └─────────────────┘

┌──────────────┐         1:N         ┌───────────────────┐
│  locations   ├─────────────────────┤  route_segments   │
│ (Graph Nodes)│                     │   (Graph Edges)   │
└──────────────┘                     └───────────────────┘
```

---

## 3. Core Tables Specification

1. **`users`**
   - `id`: VARCHAR(64) PRIMARY KEY
   - `email`: VARCHAR(255) UNIQUE
   - `password_hash`: VARCHAR(255) (Bcrypt hashed)
   - `name`: VARCHAR(255)
   - `role`: 'user' | 'advanced_user' | 'admin'
   - `created_at`: TIMESTAMP

2. **`user_preferences`**
   - `user_id`: VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE
   - `default_profile`: 'balanced' | 'fastest' | 'cheapest' | 'shortest' | 'custom'
   - `cost_sensitivity`: NUMERIC(3,2) (0.0 to 1.0)
   - `time_sensitivity`: NUMERIC(3,2) (0.0 to 1.0)
   - `avoid_tolls`: BOOLEAN

3. **`locations` (Graph Nodes)**
   - `id`: VARCHAR(64) PRIMARY KEY (e.g. `node_1`)
   - `name`: VARCHAR(255)
   - `lat`, `lng`: NUMERIC(9,6) (Geographic coordinates)
   - `node_type`: 'residential' | 'commercial' | 'transit_hub' | 'industrial'
   - `elevation`: NUMERIC(6,2)

4. **`route_segments` (Graph Edges)**
   - `id`: VARCHAR(64) PRIMARY KEY
   - `source_location_id`: REFERENCES locations(id)
   - `target_location_id`: REFERENCES locations(id)
   - `distance_km`: NUMERIC(6,2)
   - `base_travel_time_min`: NUMERIC(6,2)
   - `current_travel_time_min`: NUMERIC(6,2)
   - `predicted_travel_time_min`: NUMERIC(6,2)
   - `monetary_cost`: NUMERIC(6,2) (Toll in USD)
   - `traffic_level`: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONGESTED'
   - `road_type`: 'highway' | 'arterial' | 'local' | 'residential' | 'toll_road'

5. **`route_history` (Journeys)**
   - `id`: VARCHAR(64) PRIMARY KEY
   - `user_id`: REFERENCES users(id)
   - `status`: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
   - `predicted_duration_min`: NUMERIC(6,2)
   - `actual_duration_min`: NUMERIC(6,2)
   - `prediction_error_min`: NUMERIC(6,2)
   - `user_rating`: INTEGER (1 to 5)
   - `feedback_notes`: TEXT

6. **`learned_patterns` (Personal Route Brain)**
   - `id`: VARCHAR(64) PRIMARY KEY
   - `user_id`: REFERENCES users(id)
   - `pattern_type`: 'frequent_od' | 'time_of_day_preference' | 'route_affinity'
   - `origin_id`, `destination_id`: VARCHAR(64)
   - `preferred_node_ids`: JSONB
   - `affinity_score`: NUMERIC(3,2) (0.0 to 1.0)

7. **`model_versions`**
   - `version`: VARCHAR(32) PRIMARY KEY
   - `name`: VARCHAR(255)
   - `algorithm`: VARCHAR(128)
   - `status`: 'ACTIVE' | 'CANDIDATE' | 'RETIRED'
   - `mae`, `rmse`, `mape`: NUMERIC

---

## 4. Migrations & Schema Location

- Production schema: `database/schema/schema.sql`
- Initial migration: `database/migrations/001_initial_schema.sql`
- Deterministic seed data: `database/seeds/city_graph_seed.json`
