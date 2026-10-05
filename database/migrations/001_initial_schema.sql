-- Migration 001: Initial Schema
-- Intelligent Adaptive Route Optimization & Personal Route Intelligence Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    default_profile VARCHAR(32) NOT NULL DEFAULT 'balanced',
    cost_sensitivity NUMERIC(3,2) DEFAULT 0.50,
    time_sensitivity NUMERIC(3,2) DEFAULT 0.50,
    avoid_tolls BOOLEAN DEFAULT FALSE,
    preferred_road_types JSONB DEFAULT '[]'::jsonb,
    custom_weights JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    node_type VARCHAR(64) NOT NULL,
    elevation NUMERIC(6,2) DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_segments (
    id VARCHAR(64) PRIMARY KEY,
    source_location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
    target_location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
    distance_km NUMERIC(6,2) NOT NULL,
    base_travel_time_min NUMERIC(6,2) NOT NULL,
    current_travel_time_min NUMERIC(6,2) NOT NULL,
    predicted_travel_time_min NUMERIC(6,2) NOT NULL,
    monetary_cost NUMERIC(6,2) DEFAULT 0.00,
    traffic_level VARCHAR(32) DEFAULT 'LOW',
    reliability NUMERIC(3,2) DEFAULT 0.90,
    risk_score NUMERIC(3,2) DEFAULT 0.10,
    road_type VARCHAR(64) DEFAULT 'local',
    speed_limit_km_h NUMERIC(5,1) DEFAULT 50.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    origin_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64) NOT NULL,
    optimization_profile VARCHAR(32) NOT NULL,
    weights_used JSONB NOT NULL,
    constraints JSONB DEFAULT NULL,
    calculation_time_ms NUMERIC(7,2) NOT NULL,
    nodes_explored INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES route_requests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path_node_ids JSONB NOT NULL,
    total_distance_km NUMERIC(6,2) NOT NULL,
    current_travel_time_min NUMERIC(6,2) NOT NULL,
    predicted_travel_time_min NUMERIC(6,2) NOT NULL,
    estimated_cost NUMERIC(6,2) NOT NULL,
    score NUMERIC(8,3) NOT NULL,
    confidence NUMERIC(3,2) NOT NULL,
    delay_risk VARCHAR(32) NOT NULL,
    algorithm VARCHAR(32) NOT NULL,
    explanation JSONB NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS route_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    route_id VARCHAR(64) REFERENCES routes(id) ON DELETE SET NULL,
    origin_id VARCHAR(64) NOT NULL,
    destination_id VARCHAR(64) NOT NULL,
    path_node_ids JSONB NOT NULL,
    status VARCHAR(32) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    predicted_duration_min NUMERIC(6,2) NOT NULL,
    actual_duration_min NUMERIC(6,2) DEFAULT NULL,
    prediction_error_min NUMERIC(6,2) DEFAULT NULL,
    actual_cost NUMERIC(6,2) NOT NULL,
    user_rating INTEGER DEFAULT NULL,
    feedback_notes TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS learned_patterns (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(64) NOT NULL,
    origin_id VARCHAR(64),
    destination_id VARCHAR(64),
    preferred_node_ids JSONB DEFAULT '[]'::jsonb,
    affinity_score NUMERIC(3,2) NOT NULL,
    observations_count INTEGER DEFAULT 1,
    time_window VARCHAR(64),
    description TEXT NOT NULL,
    last_observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id VARCHAR(64) PRIMARY KEY,
    version VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    features JSONB NOT NULL,
    mae NUMERIC(5,2) NOT NULL,
    rmse NUMERIC(5,2) NOT NULL,
    mape NUMERIC(5,2) NOT NULL,
    dataset_size INTEGER NOT NULL,
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64),
    entity_id VARCHAR(64),
    details JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
