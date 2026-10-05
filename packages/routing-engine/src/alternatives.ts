import { RoutingGraph } from './graph.js';
import { findShortestPathAStar } from './a-star.js';
import { EdgeCostOptions, normalizeWeights } from './cost-evaluator.js';
import { OptimizationWeights, HardConstraints, GraphEdge } from '@intelligent-route/shared-types';

export interface CandidateRawRoute {
  profileLabel: string;
  pathNodeIds: string[];
  edges: GraphEdge[];
  totalCost: number;
  executionTimeMs: number;
  nodesExplored: number;
}

/**
 * Calculates similarity between two paths as the Jaccard similarity of their edge IDs.
 */
export function calculatePathSimilarity(pathA: string[], pathB: string[]): number {
  if (pathA.length <= 1 || pathB.length <= 1) return 1.0;
  const setA = new Set(pathA);
  let intersection = 0;
  for (const node of pathB) {
    if (setA.has(node)) intersection++;
  }
  const union = new Set([...pathA, ...pathB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Finds diverse alternative routes by evaluating different optimization profiles
 * and applying penalty deflection to discover distinct topological corridors.
 */
export function findAlternativeCandidateRoutes(
  graph: RoutingGraph,
  originId: string,
  destinationId: string,
  primaryWeights: OptimizationWeights,
  constraints?: HardConstraints
): CandidateRawRoute[] {
  const candidates: CandidateRawRoute[] = [];

  // Profile presets
  const profiles: { label: string; weights: OptimizationWeights }[] = [
    { label: 'Primary Selected', weights: normalizeWeights(primaryWeights) },
    {
      label: 'Fastest',
      weights: normalizeWeights({
        travelTime: 0.7,
        distance: 0.1,
        monetaryCost: 0.05,
        predictedDelay: 0.1,
        risk: 0.03,
        userPreference: 0.02
      })
    },
    {
      label: 'Cheapest',
      weights: normalizeWeights({
        monetaryCost: 0.65,
        distance: 0.15,
        travelTime: 0.1,
        predictedDelay: 0.05,
        risk: 0.03,
        userPreference: 0.02
      })
    },
    {
      label: 'Shortest',
      weights: normalizeWeights({
        distance: 0.75,
        travelTime: 0.15,
        monetaryCost: 0.05,
        predictedDelay: 0.03,
        risk: 0.01,
        userPreference: 0.01
      })
    }
  ];

  for (const prof of profiles) {
    const costOptions: EdgeCostOptions = {
      weights: prof.weights,
      constraints
    };
    const res = findShortestPathAStar(graph, originId, destinationId, costOptions);
    if (res.found && res.pathNodeIds.length > 0) {
      // Check if duplicate of existing candidate
      const isDuplicate = candidates.some(c =>
        c.pathNodeIds.length === res.pathNodeIds.length &&
        c.pathNodeIds.every((nodeId, idx) => nodeId === res.pathNodeIds[idx])
      );
      if (!isDuplicate) {
        candidates.push({
          profileLabel: prof.label,
          pathNodeIds: res.pathNodeIds,
          edges: res.edges,
          totalCost: res.totalCost,
          executionTimeMs: res.executionTimeMs,
          nodesExplored: res.nodesExplored
        });
      }
    }
  }

  // If we only have 1 route, use penalty deflection to find a diverse alternative
  if (candidates.length === 1 && candidates[0].edges.length > 1) {
    const primaryEdgeIds = new Set(candidates[0].edges.map(e => e.id));
    // Clone graph and temporarily increase cost on primary edges
    const deflectedGraph = new RoutingGraph();
    for (const node of graph.getAllNodes()) {
      deflectedGraph.addNode(node);
    }
    for (const edge of graph.getAllEdges()) {
      if (primaryEdgeIds.has(edge.id)) {
        // heavily penalize primary edges
        deflectedGraph.addEdge({
          ...edge,
          currentTravelTimeMin: edge.currentTravelTimeMin * 2.5,
          distanceKm: edge.distanceKm * 1.5
        });
      } else {
        deflectedGraph.addEdge(edge);
      }
    }

    const deflectedRes = findShortestPathAStar(deflectedGraph, originId, destinationId, {
      weights: normalizeWeights(primaryWeights),
      constraints
    });

    if (
      deflectedRes.found &&
      calculatePathSimilarity(candidates[0].pathNodeIds, deflectedRes.pathNodeIds) < 0.85
    ) {
      // retrieve original edge details
      const origEdges = deflectedRes.edges.map(e => graph.getEdge(e.id) || e);
      candidates.push({
        profileLabel: 'Alternative Corridor',
        pathNodeIds: deflectedRes.pathNodeIds,
        edges: origEdges,
        totalCost: deflectedRes.totalCost,
        executionTimeMs: deflectedRes.executionTimeMs,
        nodesExplored: deflectedRes.nodesExplored
      });
    }
  }

  return candidates;
}
