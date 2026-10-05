import { GraphEdge } from '@intelligent-route/shared-types';

export interface RouteConfidenceResult {
  confidence: number; // 0.0 to 1.0 (e.g. 0.92 = 92%)
  category: 'high' | 'medium' | 'low';
  factors: {
    trafficStability: number;
    edgeReliability: number;
    distancePenalty: number;
  };
}

/**
 * Calculates a calibrated confidence score for a route.
 */
export function calculateRouteConfidence(
  edges: GraphEdge[],
  predictionConfidence: number = 0.9
): RouteConfidenceResult {
  if (edges.length === 0) {
    return {
      confidence: 1.0,
      category: 'high',
      factors: { trafficStability: 1.0, edgeReliability: 1.0, distancePenalty: 0.0 }
    };
  }

  // 1. Average edge reliability
  const avgReliability =
    edges.reduce((sum, e) => sum + (e.reliability ?? 0.85), 0) / edges.length;

  // 2. Traffic volatility check (proportion of CONGESTED or HIGH edges)
  const volatileSegments = edges.filter(
    e => e.trafficLevel === 'HIGH' || e.trafficLevel === 'CONGESTED'
  ).length;
  const trafficStability = Math.max(0.4, 1.0 - (volatileSegments / edges.length) * 0.4);

  // 3. Length uncertainty degradation factor
  const totalKm = edges.reduce((sum, e) => sum + e.distanceKm, 0);
  const distancePenalty = Math.min(0.12, (totalKm / 100) * 0.05);

  // Calibrated composite confidence
  const rawConfidence =
    0.35 * avgReliability +
    0.35 * trafficStability +
    0.30 * predictionConfidence -
    distancePenalty;

  const confidence = Math.max(0.45, Math.min(0.98, Math.round(rawConfidence * 100) / 100));

  let category: 'high' | 'medium' | 'low' = 'high';
  if (confidence < 0.70) {
    category = 'low';
  } else if (confidence < 0.85) {
    category = 'medium';
  }

  return {
    confidence,
    category,
    factors: {
      trafficStability: Math.round(trafficStability * 100) / 100,
      edgeReliability: Math.round(avgReliability * 100) / 100,
      distancePenalty: Math.round(distancePenalty * 100) / 100
    }
  };
}
