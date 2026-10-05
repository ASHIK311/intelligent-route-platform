import { RoutingGraph } from './graph.js';
import { MinPriorityQueue } from './priority-queue.js';
import { evaluateEdgeCost, EdgeCostOptions } from './cost-evaluator.js';
import { GraphEdge } from '@intelligent-route/shared-types';

export interface DijkstraResult {
  found: boolean;
  pathNodeIds: string[];
  edges: GraphEdge[];
  totalCost: number;
  executionTimeMs: number;
  nodesExplored: number;
}

/**
 * Dijkstra shortest path implementation.
 * Used as correctness baseline and fallback validation algorithm.
 */
export function findShortestPathDijkstra(
  graph: RoutingGraph,
  originId: string,
  destinationId: string,
  costOptions: EdgeCostOptions
): DijkstraResult {
  const startTime = performance.now();

  // Edge Case: Node existence validation
  if (!graph.hasNode(originId) || !graph.hasNode(destinationId)) {
    return {
      found: false,
      pathNodeIds: [],
      edges: [],
      totalCost: 0,
      executionTimeMs: performance.now() - startTime,
      nodesExplored: 0
    };
  }

  // Edge Case: Origin equals Destination
  if (originId === destinationId) {
    return {
      found: true,
      pathNodeIds: [originId],
      edges: [],
      totalCost: 0,
      executionTimeMs: performance.now() - startTime,
      nodesExplored: 1
    };
  }

  const distances = new Map<string, number>();
  const previousNodes = new Map<string, string>();
  const previousEdges = new Map<string, GraphEdge>();
  const pq = new MinPriorityQueue<string>();
  const visited = new Set<string>();

  distances.set(originId, 0);
  pq.push(originId, 0);

  let nodesExplored = 0;

  while (!pq.isEmpty()) {
    const currentNodeId = pq.pop()!;

    if (visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);
    nodesExplored++;

    if (currentNodeId === destinationId) {
      break;
    }

    const currentDist = distances.get(currentNodeId)!;
    const outgoing = graph.getOutgoing(currentNodeId);

    for (const edge of outgoing) {
      const neighborId = edge.target;
      if (visited.has(neighborId)) continue;

      const edgeCost = evaluateEdgeCost(edge, costOptions);
      if (!isFinite(edgeCost)) continue; // skip edges violating hard constraints

      const newDist = currentDist + edgeCost;
      const existingDist = distances.get(neighborId);

      if (existingDist === undefined || newDist < existingDist) {
        distances.set(neighborId, newDist);
        previousNodes.set(neighborId, currentNodeId);
        previousEdges.set(neighborId, edge);
        pq.push(neighborId, newDist);
      }
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  if (!distances.has(destinationId) || !previousNodes.has(destinationId)) {
    return {
      found: false,
      pathNodeIds: [],
      edges: [],
      totalCost: 0,
      executionTimeMs,
      nodesExplored
    };
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const edges: GraphEdge[] = [];
  let curr: string | undefined = destinationId;

  while (curr) {
    pathNodeIds.unshift(curr);
    const edge = previousEdges.get(curr);
    if (edge) edges.unshift(edge);
    curr = previousNodes.get(curr);
  }

  return {
    found: true,
    pathNodeIds,
    edges,
    totalCost: distances.get(destinationId)!,
    executionTimeMs,
    nodesExplored
  };
}
