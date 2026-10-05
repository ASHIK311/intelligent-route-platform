import { mapDataService } from './map-data.service.js';
import {
  findShortestPathAStar,
  findShortestPathDijkstra,
  findShortestPathBidirectional,
  findAlternativeCandidateRoutes,
  CandidateRawRoute
} from '@intelligent-route/routing-engine';
import {
  RouteRequest,
  OptimizationWeights,
  HardConstraints,
  RoutingAlgorithmType,
  GraphEdge
} from '@intelligent-route/shared-types';

export interface RouteComputationResult {
  candidates: CandidateRawRoute[];
  nodesExploredTotal: number;
  calculationTimeMs: number;
}

export class RoutingService {
  public computeCandidateRoutes(
    request: RouteRequest,
    effectiveWeights: OptimizationWeights,
    constraints?: HardConstraints
  ): RouteComputationResult {
    const startTime = performance.now();
    const graph = mapDataService.getRoutingGraph();

    let candidates: CandidateRawRoute[] = [];
    let nodesExploredTotal = 0;

    // Check if waypoints are present
    if (request.waypoints && request.waypoints.length > 0) {
      // Chain waypoints: origin -> wp1 -> wp2 -> destination
      const points = [request.originId, ...request.waypoints, request.destinationId];
      const chainedPath: string[] = [];
      const chainedEdges: GraphEdge[] = [];
      let totalCost = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const u = points[i];
        const v = points[i + 1];
        const legRes = findShortestPathAStar(graph, u, v, {
          weights: effectiveWeights,
          constraints
        });

        if (!legRes.found) {
          // Unreachable waypoint
          return {
            candidates: [],
            nodesExploredTotal,
            calculationTimeMs: performance.now() - startTime
          };
        }

        nodesExploredTotal += legRes.nodesExplored;
        totalCost += legRes.totalCost;

        if (i === 0) {
          chainedPath.push(...legRes.pathNodeIds);
        } else {
          chainedPath.push(...legRes.pathNodeIds.slice(1));
        }
        chainedEdges.push(...legRes.edges);
      }

      candidates.push({
        profileLabel: 'Waypoint Guided',
        pathNodeIds: chainedPath,
        edges: chainedEdges,
        totalCost,
        executionTimeMs: performance.now() - startTime,
        nodesExplored: nodesExploredTotal
      });
    } else {
      // Direct origin -> destination: discover primary and diverse alternatives
      const rawCandidates = findAlternativeCandidateRoutes(
        graph,
        request.originId,
        request.destinationId,
        effectiveWeights,
        constraints
      );

      candidates = rawCandidates;
      nodesExploredTotal = rawCandidates.reduce((sum, c) => sum + c.nodesExplored, 0);

      // If user explicitly requested a specific algorithm for the primary route
      if (request.algorithm && request.algorithm !== 'A*') {
        let singleRes;
        if (request.algorithm === 'Dijkstra') {
          singleRes = findShortestPathDijkstra(graph, request.originId, request.destinationId, {
            weights: effectiveWeights,
            constraints
          });
        } else if (request.algorithm === 'Bidirectional') {
          singleRes = findShortestPathBidirectional(graph, request.originId, request.destinationId, {
            weights: effectiveWeights,
            constraints
          });
        }

        if (singleRes && singleRes.found) {
          candidates[0] = {
            profileLabel: `${request.algorithm} Selected`,
            pathNodeIds: singleRes.pathNodeIds,
            edges: singleRes.edges,
            totalCost: singleRes.totalCost,
            executionTimeMs: singleRes.executionTimeMs,
            nodesExplored: singleRes.nodesExplored
          };
        }
      }
    }

    const calculationTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      candidates,
      nodesExploredTotal,
      calculationTimeMs
    };
  }
}

export const routingService = new RoutingService();
