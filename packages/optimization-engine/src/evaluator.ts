import {
  CalculatedRoute,
  GraphEdge,
  HardConstraints,
  OptimizationProfileType,
  OptimizationWeights,
  RouteSegment
} from '@intelligent-route/shared-types';
import { CandidateRawRoute } from '@intelligent-route/routing-engine';
import { validateHardConstraints } from './constraints.js';
import { calculateRouteConfidence } from './confidence.js';
import { generateRouteExplanation } from './explanation.js';

export interface EvaluationOptions {
  profile: OptimizationProfileType;
  weights: OptimizationWeights;
  constraints?: HardConstraints;
  departureTime?: string;
  preferredNodeIds?: Set<string>;
}

export function evaluateAndRankRoutes(
  rawCandidates: CandidateRawRoute[],
  options: EvaluationOptions
): {
  recommendedRoute: CalculatedRoute;
  alternativeRoutes: CalculatedRoute[];
  allCandidates: CalculatedRoute[];
} {
  const evaluatedRoutes: CalculatedRoute[] = rawCandidates.map((raw, index) => {
    const edges = raw.edges;
    const pathNodeIds = raw.pathNodeIds;

    const totalDistanceKm = Math.round(edges.reduce((sum, e) => sum + e.distanceKm, 0) * 100) / 100;
    const baseTravelTimeMin = Math.round(edges.reduce((sum, e) => sum + e.baseTravelTimeMin, 0) * 10) / 10;
    const currentTravelTimeMin = Math.round(edges.reduce((sum, e) => sum + e.currentTravelTimeMin, 0) * 10) / 10;
    const predictedTravelTimeMin = Math.round(edges.reduce((sum, e) => sum + e.predictedTravelTimeMin, 0) * 10) / 10;
    const estimatedCost = Math.round(edges.reduce((sum, e) => sum + e.monetaryCost, 0) * 100) / 100;

    const segments: RouteSegment[] = edges.map(e => ({
      edgeId: e.id,
      fromNodeId: e.source,
      toNodeId: e.target,
      distanceKm: e.distanceKm,
      travelTimeMin: e.currentTravelTimeMin,
      predictedTimeMin: e.predictedTravelTimeMin,
      cost: e.monetaryCost,
      trafficLevel: e.trafficLevel,
      roadType: e.roadType
    }));

    // Check hard constraints
    const constraintCheck = validateHardConstraints(
      {
        pathNodeIds,
        edges,
        totalDistanceKm,
        totalCost: estimatedCost,
        predictedDurationMin: predictedTravelTimeMin,
        departureTime: options.departureTime
      },
      options.constraints
    );

    // Compute composite route score (lower = better)
    const predictedDelay = Math.max(0, predictedTravelTimeMin - baseTravelTimeMin);
    const avgRisk = edges.length > 0 ? edges.reduce((sum, e) => sum + (e.riskScore ?? 0.1), 0) / edges.length : 0.1;
    let userPrefPenalty = 0;
    if (options.preferredNodeIds) {
      const matchCount = pathNodeIds.filter(id => options.preferredNodeIds!.has(id)).length;
      userPrefPenalty = Math.max(0, (pathNodeIds.length - matchCount) * 0.5);
    }

    const w = options.weights;
    let score =
      w.distance * totalDistanceKm +
      w.travelTime * currentTravelTimeMin +
      w.monetaryCost * estimatedCost +
      w.predictedDelay * predictedDelay +
      w.risk * (avgRisk * 10) +
      w.userPreference * userPrefPenalty;

    // Heavy penalty if route violates hard constraints
    if (!constraintCheck.valid) {
      score += 10000;
    }

    const confidenceResult = calculateRouteConfidence(edges);

    let delayRisk: 'low' | 'moderate' | 'high' = 'low';
    if (predictedDelay > 5 || edges.some(e => e.trafficLevel === 'CONGESTED')) {
      delayRisk = 'high';
    } else if (predictedDelay > 2 || edges.some(e => e.trafficLevel === 'HIGH')) {
      delayRisk = 'moderate';
    }

    const routeLetter = String.fromCharCode(65 + index); // Route A, Route B, etc.
    const name = `Route ${routeLetter} (${raw.profileLabel})`;

    return {
      id: `route_${index + 1}_${Date.now()}`,
      name,
      pathNodeIds,
      edges,
      segments,
      totalDistanceKm,
      baseTravelTimeMin,
      currentTravelTimeMin,
      predictedTravelTimeMin,
      estimatedCost,
      score: Math.round(score * 100) / 100,
      confidence: confidenceResult.confidence,
      delayRisk,
      algorithm: 'A*' as const,
      explanation: {
        primaryReason: '',
        secondaryReasons: [],
        tradeoffs: [],
        predictionImpact: ''
      },
      meetsConstraints: constraintCheck.valid,
      constraintViolations: constraintCheck.violations
    };
  });

  // Sort by score ascending (lowest score is best)
  // Routes meeting constraints always come first
  evaluatedRoutes.sort((a, b) => {
    if (a.meetsConstraints !== b.meetsConstraints) {
      return a.meetsConstraints ? -1 : 1;
    }
    return a.score - b.score;
  });

  const recommended = evaluatedRoutes[0];
  const secondBest = evaluatedRoutes[1];

  // Generate explanations now that ranking is known
  for (const r of evaluatedRoutes) {
    const isRecommended = r === recommended;
    const competitor = isRecommended ? secondBest : recommended;
    r.explanation = generateRouteExplanation(
      {
        name: r.name,
        totalDistanceKm: r.totalDistanceKm,
        currentTravelTimeMin: r.currentTravelTimeMin,
        predictedTravelTimeMin: r.predictedTravelTimeMin,
        estimatedCost: r.estimatedCost,
        score: r.score,
        profile: options.profile,
        personalizationBonusApplied:
          options.preferredNodeIds &&
          r.pathNodeIds.some(id => options.preferredNodeIds!.has(id))
      },
      competitor
        ? {
            name: competitor.name,
            totalDistanceKm: competitor.totalDistanceKm,
            currentTravelTimeMin: competitor.currentTravelTimeMin,
            predictedTravelTimeMin: competitor.predictedTravelTimeMin,
            estimatedCost: competitor.estimatedCost,
            score: competitor.score,
            profile: options.profile
          }
        : undefined
    );
  }

  const alternativeRoutes = evaluatedRoutes.slice(1);

  return {
    recommendedRoute: recommended,
    alternativeRoutes,
    allCandidates: evaluatedRoutes
  };
}
