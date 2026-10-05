/**
 * Intelligent Adaptive Route Optimization & Personal Route Intelligence Platform
 * Shared Types Definition
 */

// --- Graph Types ---
export type RoadType = 'highway' | 'arterial' | 'local' | 'residential' | 'toll_road';
export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CONGESTED';
export type NodeType = 'residential' | 'commercial' | 'highway_junction' | 'industrial' | 'transit_hub' | 'city_center';

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: NodeType;
  elevation?: number;
  tags?: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distanceKm: number;
  baseTravelTimeMin: number;
  currentTravelTimeMin: number;
  predictedTravelTimeMin: number;
  monetaryCost: number;
  trafficLevel: TrafficLevel;
  reliability: number; // 0.0 to 1.0 (higher = more predictable)
  riskScore: number;   // 0.0 to 1.0 (higher = accident/delay risk)
  roadType: RoadType;
  restrictions?: string[];
  speedLimitKmH?: number;
}

export interface CityGraphData {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Optimization & Routing Function Types ---
export type OptimizationProfileType = 'fastest' | 'cheapest' | 'shortest' | 'balanced' | 'custom';

export interface OptimizationWeights {
  distance: number;       // Wd
  travelTime: number;     // Wt
  monetaryCost: number;   // Wc
  predictedDelay: number; // Wp
  risk: number;           // Wr
  userPreference: number; // Wu
}

export interface HardConstraints {
  maxBudget?: number;
  maxDistanceKm?: number;
  arrivalDeadline?: string; // HH:MM or ISO timestamp
  avoidRoadTypes?: RoadType[];
  avoidEdgeIds?: string[];
  requiredWaypoints?: string[];
}

// --- Algorithm & Routing Types ---
export type RoutingAlgorithmType = 'A*' | 'Dijkstra' | 'Bidirectional' | 'YenKSP';

export interface RouteRequest {
  originId: string;
  destinationId: string;
  waypoints?: string[];
  profile: OptimizationProfileType;
  customWeights?: Partial<OptimizationWeights>;
  constraints?: HardConstraints;
  departureTime?: string; // ISO string, defaults to now
  algorithm?: RoutingAlgorithmType;
  userId?: string;
}

export interface RouteSegment {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  travelTimeMin: number;
  predictedTimeMin: number;
  cost: number;
  trafficLevel: TrafficLevel;
  roadType: RoadType;
}

export interface RouteExplanation {
  primaryReason: string;
  secondaryReasons: string[];
  tradeoffs: string[];
  predictionImpact: string;
  personalizationImpact?: string;
}

export interface CalculatedRoute {
  id: string;
  name: string;
  pathNodeIds: string[];
  edges: GraphEdge[];
  segments: RouteSegment[];
  totalDistanceKm: number;
  baseTravelTimeMin: number;
  currentTravelTimeMin: number;
  predictedTravelTimeMin: number;
  estimatedCost: number;
  score: number;
  confidence: number; // 0.0 to 1.0
  delayRisk: 'low' | 'moderate' | 'high';
  algorithm: RoutingAlgorithmType;
  explanation: RouteExplanation;
  meetsConstraints: boolean;
  constraintViolations?: string[];
}

export interface RouteSearchResult {
  searchId: string;
  recommendedRoute: CalculatedRoute;
  alternativeRoutes: CalculatedRoute[];
  allCandidatesCount: number;
  calculationTimeMs: number;
  nodesExplored: number;
  timestamp: string;
  profileUsed: OptimizationProfileType;
  weightsUsed: OptimizationWeights;
}

// --- Personal Route Brain Types ---
export interface UserPreferences {
  defaultProfile: OptimizationProfileType;
  customWeights?: OptimizationWeights;
  costSensitivity: number; // 0.0 to 1.0 (1 = extremely sensitive to money)
  timeSensitivity: number; // 0.0 to 1.0 (1 = extremely sensitive to delays)
  preferredRoadTypes?: RoadType[];
  avoidTolls: boolean;
}

export type PatternType = 'frequent_od' | 'time_of_day_preference' | 'route_affinity';

export interface LearnedPattern {
  id: string;
  userId: string;
  patternType: PatternType;
  originId?: string;
  destinationId?: string;
  preferredNodeIds?: string[];
  affinityScore: number; // 0.0 to 1.0
  observationsCount: number;
  timeWindow?: string;   // e.g. "08:00-09:30"
  description: string;
  lastObservedAt: string;
}

export interface PersonalBrainSummary {
  userId: string;
  tripsAnalyzed: number;
  predictionAccuracyPct: number;
  avgTimeSavedPct: number;
  estimatedCostSaved: number;
  learnedPreferencesCount: number;
  patterns: LearnedPattern[];
  recentJourneysCount: number;
}

// --- Machine Learning Prediction Types ---
export interface PredictionInput {
  edgeId?: string;
  distanceKm: number;
  currentTravelTimeMin: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
  isWeekend: boolean;
  roadType: RoadType;
  trafficLevel: TrafficLevel;
  recentTrafficTrendRatio?: number; // e.g. 1.2 = traffic increased 20% in last 15 min
}

export interface PredictionResult {
  predictedTravelTimeMin: number;
  predictedDelayMin: number;
  confidence: number; // 0.0 to 1.0
  delayProbability: number; // 0.0 to 1.0
  source: 'ML_GRADIENT_BOOST' | 'ML_RANDOM_FOREST' | 'HISTORICAL_BASELINE' | 'CURRENT_OBSERVATION' | 'FALLBACK_BASE';
}

export interface MLModelMetadata {
  modelId: string;
  version: string;
  name: string;
  algorithm: string;
  status: 'TRAINING' | 'CANDIDATE' | 'ACTIVE' | 'RETIRED' | 'FAILED';
  features: string[];
  mae: number;
  rmse: number;
  mape: number;
  trainedAt: string;
  datasetSize: number;
}

// --- User & Journey History Types ---
export type UserRole = 'user' | 'advanced_user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
}

export type JourneyStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface JourneyRecord {
  id: string;
  userId: string;
  routeId: string;
  originId: string;
  destinationId: string;
  pathNodeIds: string[];
  status: JourneyStatus;
  startedAt: string;
  completedAt?: string;
  predictedDurationMin: number;
  actualDurationMin?: number;
  predictionErrorMin?: number;
  actualCost: number;
  userRating?: number; // 1 to 5
  feedbackNotes?: string;
}

// --- Analytics & Admin Monitor Types ---
export interface AlgorithmBenchmark {
  algorithm: RoutingAlgorithmType;
  executionTimeMs: number;
  nodesExplored: number;
  pathCost: number;
  pathLengthNodes: number;
  totalDistanceKm: number;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptimeSeconds: number;
  memoryUsageMb: number;
  cpuLoadPct?: number;
  activeSessions: number;
  totalSearchesCount: number;
  avgCalculationTimeMs: number;
  cacheHitRatePct: number;
  activeModelVersion: string;
  databaseConnected: boolean;
  mlServiceHealthy: boolean;
}

// --- API Standard Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
