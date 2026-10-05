import { GraphEdge, OptimizationWeights, HardConstraints } from '@intelligent-route/shared-types';

export interface EdgeCostOptions {
  weights: OptimizationWeights;
  constraints?: HardConstraints;
  preferredNodeIds?: Set<string>;
  preferredRoadTypes?: Set<string>;
}

/**
 * Normalizes optimization weights so they sum to 1.0 (preventing scale distortion).
 */
export function normalizeWeights(weights: OptimizationWeights): OptimizationWeights {
  const sum =
    weights.distance +
    weights.travelTime +
    weights.monetaryCost +
    weights.predictedDelay +
    weights.risk +
    weights.userPreference;

  if (sum <= 0) {
    return {
      distance: 0.25,
      travelTime: 0.3,
      monetaryCost: 0.15,
      predictedDelay: 0.2,
      risk: 0.05,
      userPreference: 0.05
    };
  }

  return {
    distance: weights.distance / sum,
    travelTime: weights.travelTime / sum,
    monetaryCost: weights.monetaryCost / sum,
    predictedDelay: weights.predictedDelay / sum,
    risk: weights.risk / sum,
    userPreference: weights.userPreference / sum
  };
}

/**
 * Evaluates the dynamic cost of traversing a specific edge given current weights and constraints.
 * Returns Infinity if edge violates hard constraints.
 */
export function evaluateEdgeCost(edge: GraphEdge, options: EdgeCostOptions): number {
  const { weights, constraints, preferredNodeIds, preferredRoadTypes } = options;

  // 1. Check Hard Constraints
  if (constraints) {
    if (constraints.avoidRoadTypes && constraints.avoidRoadTypes.includes(edge.roadType)) {
      return Infinity;
    }
    if (constraints.avoidEdgeIds && constraints.avoidEdgeIds.includes(edge.id)) {
      return Infinity;
    }
  }

  // 2. Compute Cost Components
  const distance = Math.max(0.01, edge.distanceKm);
  const travelTime = Math.max(0.1, edge.currentTravelTimeMin);
  const monetaryCost = Math.max(0, edge.monetaryCost);
  const predictedDelay = Math.max(0, edge.predictedTravelTimeMin - edge.baseTravelTimeMin);
  const risk = Math.max(0, Math.min(1, edge.riskScore)) * 10; // scaled to comparable range

  // 3. User Preference Penalty
  let userPrefPenalty = 0;
  if (preferredRoadTypes && !preferredRoadTypes.has(edge.roadType)) {
    userPrefPenalty += 2.0;
  }
  if (preferredNodeIds && !preferredNodeIds.has(edge.target)) {
    userPrefPenalty += 0.5;
  }

  // 4. Multi-objective dynamic cost formula from SRS Section 7
  const cost =
    weights.distance * distance +
    weights.travelTime * travelTime +
    weights.monetaryCost * monetaryCost +
    weights.predictedDelay * predictedDelay +
    weights.risk * risk +
    weights.userPreference * userPrefPenalty;

  return Math.max(0.001, cost);
}
