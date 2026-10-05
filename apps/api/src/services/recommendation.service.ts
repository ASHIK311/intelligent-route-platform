import {
  RouteRequest,
  RouteSearchResult,
  CalculatedRoute,
  OptimizationWeights
} from '@intelligent-route/shared-types';
import { resolveEffectiveWeights, evaluateAndRankRoutes } from '@intelligent-route/optimization-engine';
import { routingService } from './routing.service.js';
import { personalBrainService } from './personal-brain.service.js';
import { predictionService } from './prediction.service.js';
import { db } from '../repositories/database.js';

export class RecommendationService {
  public async searchAndRecommend(request: RouteRequest): Promise<RouteSearchResult> {
    const startTime = performance.now();

    // 1. Resolve effective weights
    const effectiveWeights: OptimizationWeights = resolveEffectiveWeights(
      request.profile,
      request.customWeights
    );

    // 2. Query Personal Route Brain for user affinities if userId provided
    let preferredNodeIds: Set<string> | undefined;
    if (request.userId) {
      preferredNodeIds = personalBrainService.getPreferredNodeIds(
        request.userId,
        request.originId,
        request.destinationId
      );
    }

    // 3. Compute Candidate Routes from graph
    const routingResult = routingService.computeCandidateRoutes(
      request,
      effectiveWeights,
      request.constraints
    );

    if (routingResult.candidates.length === 0) {
      throw new Error('NO_ROUTE_FOUND');
    }

    // 4. Enrich edges with ML predictions for the departure time
    const depDate = request.departureTime ? new Date(request.departureTime) : new Date();
    const hour = depDate.getHours();
    const minute = depDate.getMinutes();
    const dayOfWeek = depDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const cand of routingResult.candidates) {
      for (const edge of cand.edges) {
        const pred = await predictionService.predict({
          edgeId: edge.id,
          distanceKm: edge.distanceKm,
          currentTravelTimeMin: edge.currentTravelTimeMin,
          hour,
          minute,
          dayOfWeek,
          isWeekend,
          roadType: edge.roadType,
          trafficLevel: edge.trafficLevel,
          recentTrafficTrendRatio: 1.15
        });
        edge.predictedTravelTimeMin = pred.predictedTravelTimeMin;
      }
    }

    // 5. Evaluate and Rank Candidate Routes
    const evaluation = evaluateAndRankRoutes(routingResult.candidates, {
      profile: request.profile,
      weights: effectiveWeights,
      constraints: request.constraints,
      departureTime: request.departureTime,
      preferredNodeIds
    });

    const searchId = `search_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const result: RouteSearchResult = {
      searchId,
      recommendedRoute: evaluation.recommendedRoute,
      alternativeRoutes: evaluation.alternativeRoutes,
      allCandidatesCount: evaluation.allCandidates.length,
      calculationTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      nodesExplored: routingResult.nodesExploredTotal,
      timestamp: new Date().toISOString(),
      profileUsed: request.profile,
      weightsUsed: effectiveWeights
    };

    // Store in DB
    db.searchResults.set(searchId, result);
    db.calculatedRoutes.set(evaluation.recommendedRoute.id, evaluation.recommendedRoute);
    for (const alt of evaluation.alternativeRoutes) {
      db.calculatedRoutes.set(alt.id, alt);
    }

    return result;
  }
}

export const recommendationService = new RecommendationService();
