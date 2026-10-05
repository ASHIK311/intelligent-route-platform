import bcrypt from 'bcryptjs';
import {
  User,
  UserPreferences,
  GraphNode,
  GraphEdge,
  JourneyRecord,
  LearnedPattern,
  MLModelMetadata,
  RouteSearchResult,
  CalculatedRoute
} from '@intelligent-route/shared-types';
import { METRO_CITY_GRAPH } from '../data/city_graph.js';

export interface StoredUser extends User {
  passwordHash: string;
}

export class InMemoryDatabase {
  public users: Map<string, StoredUser> = new Map();
  public preferences: Map<string, UserPreferences> = new Map();
  public nodes: Map<string, GraphNode> = new Map();
  public edges: Map<string, GraphEdge> = new Map();
  public searchResults: Map<string, RouteSearchResult> = new Map();
  public calculatedRoutes: Map<string, CalculatedRoute> = new Map();
  public journeys: Map<string, JourneyRecord> = new Map();
  public learnedPatterns: Map<string, LearnedPattern[]> = new Map();
  public modelVersions: Map<string, MLModelMetadata> = new Map();
  public auditLogs: Array<{ id: string; action: string; userId?: string; timestamp: string; details?: unknown }> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    // 1. Seed Nodes & Edges from Metro City Graph
    for (const node of METRO_CITY_GRAPH.nodes) {
      this.nodes.set(node.id, node);
    }
    for (const edge of METRO_CITY_GRAPH.edges) {
      this.edges.set(edge.id, edge);
    }

    // 2. Seed Default Users
    const salt = bcrypt.genSaltSync(10);

    // Admin User
    const adminUser: StoredUser = {
      id: 'usr_admin_1',
      email: 'admin@intelligent-route.io',
      name: 'System Administrator',
      role: 'admin',
      passwordHash: bcrypt.hashSync('admin123', salt),
      createdAt: '2026-01-01T08:00:00.000Z',
      preferences: {
        defaultProfile: 'balanced',
        costSensitivity: 0.5,
        timeSensitivity: 0.7,
        avoidTolls: false
      }
    };
    this.users.set(adminUser.id, adminUser);
    this.preferences.set(adminUser.id, adminUser.preferences);

    // Commuter User (Alex)
    const commuterUser: StoredUser = {
      id: 'usr_commuter_2',
      email: 'alex.commuter@gmail.com',
      name: 'Alex Rivera (Daily Commuter)',
      role: 'user',
      passwordHash: bcrypt.hashSync('commuter123', salt),
      createdAt: '2026-02-15T09:00:00.000Z',
      preferences: {
        defaultProfile: 'fastest',
        costSensitivity: 0.3,
        timeSensitivity: 0.9,
        preferredRoadTypes: ['highway', 'arterial'],
        avoidTolls: false
      }
    };
    this.users.set(commuterUser.id, commuterUser);
    this.preferences.set(commuterUser.id, commuterUser.preferences);

    // Budget Traveler (Taylor)
    const budgetUser: StoredUser = {
      id: 'usr_budget_3',
      email: 'taylor.budget@gmail.com',
      name: 'Taylor Brooks (Cost Conscious)',
      role: 'advanced_user',
      passwordHash: bcrypt.hashSync('budget123', salt),
      createdAt: '2026-03-01T10:00:00.000Z',
      preferences: {
        defaultProfile: 'cheapest',
        costSensitivity: 0.95,
        timeSensitivity: 0.2,
        avoidTolls: true
      }
    };
    this.users.set(budgetUser.id, budgetUser);
    this.preferences.set(budgetUser.id, budgetUser.preferences);

    // 3. Seed Realistic Historical Journeys for Alex Commuter (SRS Section 10 & 23)
    const originDowntown = 'node_1';
    const destTechPark = 'node_21';

    for (let i = 1; i <= 45; i++) {
      const dayOffset = 50 - i;
      const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      date.setHours(8, 15 + (i % 15), 0, 0);

      const predictedMin = 28 + (i % 5);
      // Small prediction error between -2 and +3
      const error = (i % 7) - 3;
      const actualMin = Math.max(18, predictedMin + error);

      const journeyId = `jny_${i}`;
      this.journeys.set(journeyId, {
        id: journeyId,
        userId: commuterUser.id,
        routeId: `route_hist_${i}`,
        originId: originDowntown,
        destinationId: destTechPark,
        pathNodeIds: ['node_1', 'node_4', 'node_11', 'node_21'],
        status: 'COMPLETED',
        startedAt: date.toISOString(),
        completedAt: new Date(date.getTime() + actualMin * 60 * 1000).toISOString(),
        predictedDurationMin: predictedMin,
        actualDurationMin: actualMin,
        predictionErrorMin: error,
        actualCost: 2.50,
        userRating: error <= 1 ? 5 : error <= 3 ? 4 : 3,
        feedbackNotes: error <= 1 ? 'Accurate arrival estimate' : 'Minor rush hour slowdown'
      });
    }

    // 4. Seed Learned Patterns for Alex Commuter
    this.learnedPatterns.set(commuterUser.id, [
      {
        id: 'pat_1',
        userId: commuterUser.id,
        patternType: 'frequent_od',
        originId: originDowntown,
        destinationId: destTechPark,
        preferredNodeIds: ['node_1', 'node_4', 'node_11', 'node_21'],
        affinityScore: 0.94,
        observationsCount: 42,
        timeWindow: '08:00 - 09:00',
        description: 'Frequent morning weekday commute from Downtown to Silicon Tech Campus',
        lastObservedAt: new Date().toISOString()
      },
      {
        id: 'pat_2',
        userId: commuterUser.id,
        patternType: 'time_of_day_preference',
        originId: destTechPark,
        destinationId: originDowntown,
        preferredNodeIds: ['node_21', 'node_15', 'node_2', 'node_1'],
        affinityScore: 0.88,
        observationsCount: 38,
        timeWindow: '17:30 - 18:30',
        description: 'Evening return commute via Golden Gate Express Highway',
        lastObservedAt: new Date().toISOString()
      }
    ]);

    // 5. Seed Model Registry Versions (SRS Section 42)
    this.modelVersions.set('gbt-v1.4.2', {
      modelId: 'gbt-traveltime-v1.4',
      version: '1.4.2',
      name: 'Urban Congestion Gradient Boosted Ensemble',
      algorithm: 'Gradient Boosted Decision Trees (15 Estimators)',
      status: 'ACTIVE',
      features: ['hourSin', 'hourCos', 'isRushHour', 'isWeekend', 'distanceKm', 'trafficTrend', 'roadType'],
      mae: 1.82,
      rmse: 2.34,
      mape: 6.8,
      datasetSize: 12500,
      trainedAt: '2026-09-15T00:00:00.000Z'
    });

    this.modelVersions.set('rf-v1.3.0', {
      modelId: 'rf-traveltime-v1.3',
      version: '1.3.0',
      name: 'Random Forest Highway Latency Estimator',
      algorithm: 'Random Forest Regressor (50 Trees)',
      status: 'RETIRED',
      features: ['distanceKm', 'hour', 'roadType'],
      mae: 2.95,
      rmse: 3.81,
      mape: 11.2,
      datasetSize: 8400,
      trainedAt: '2026-06-01T00:00:00.000Z'
    });

    this.modelVersions.set('xgb-v1.5.0', {
      modelId: 'xgb-traveltime-v1.5',
      version: '1.5.0',
      name: 'NextGen Deep Spatio-Temporal Regressor',
      algorithm: 'Extreme Gradient Boosting with Attention',
      status: 'CANDIDATE',
      features: ['hourSin', 'hourCos', 'weatherPrecip', 'eventRadius', 'trafficTrend', 'volatilityIndex'],
      mae: 1.54,
      rmse: 1.98,
      mape: 5.4,
      datasetSize: 25000,
      trainedAt: '2026-10-01T00:00:00.000Z'
    });
  }
}

// Global database singleton
export const db = new InMemoryDatabase();
