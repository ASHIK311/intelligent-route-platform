import { RoutingGraph } from './graph.js';
import { MinPriorityQueue } from './priority-queue.js';
import { evaluateEdgeCost, EdgeCostOptions } from './cost-evaluator.js';
import { calculateHaversineDistance } from './distance.js';
import { GraphEdge } from '@intelligent-route/shared-types';

export interface AStarResult {
  found: boolean;
  pathNodeIds: string[];
  edges: GraphEdge[];
  totalCost: number;
  executionTimeMs: number;
  nodesExplored: number;
}

/**
 * A* algorithm with admissible geographic heuristic.
 * f(n) = g(n) + h(n)
 */
export function findShortestPathAStar(
  graph: RoutingGraph,
  originId: string,
  destinationId: string,
  costOptions: EdgeCostOptions
): AStarResult {
  const startTime = performance.now();

  // Edge cases
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

  const destinationNode = graph.getNode(destinationId)!;

  // Heuristic function: admissible lower bound on cost to destination
  const heuristic = (nodeId: string): number => {
    const node = graph.getNode(nodeId);
    if (!node) return 0;
    const distKm = calculateHaversineDistance(
      node.lat,
      node.lng,
      destinationNode.lat,
      destinationNode.lng
    );
    // Admissible heuristic scaled by minimum distance weight factor
    const weightFactor = Math.max(0.01, costOptions.weights.distance);
    return distKm * weightFactor;
  };

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previousNodes = new Map<string, string>();
  const previousEdges = new Map<string, GraphEdge>();
  const pq = new MinPriorityQueue<string>();
  const closedSet = new Set<string>();

  gScore.set(originId, 0);
  const initialF = heuristic(originId);
  fScore.set(originId, initialF);
  pq.push(originId, initialF);

  let nodesExplored = 0;

  while (!pq.isEmpty()) {
    const currentNodeId = pq.pop()!;

    if (currentNodeId === destinationId) {
      nodesExplored++;
      break;
    }

    if (closedSet.has(currentNodeId)) continue;
    closedSet.add(currentNodeId);
    nodesExplored++;

    const currentG = gScore.get(currentNodeId)!;
    const outgoing = graph.getOutgoing(currentNodeId);

    for (const edge of outgoing) {
      const neighborId = edge.target;
      if (closedSet.has(neighborId)) continue;

      const edgeCost = evaluateEdgeCost(edge, costOptions);
      if (!isFinite(edgeCost)) continue;

      const tentativeG = currentG + edgeCost;
      const existingG = gScore.get(neighborId);

      if (existingG === undefined || tentativeG < existingG) {
        previousNodes.set(neighborId, currentNodeId);
        previousEdges.set(neighborId, edge);
        gScore.set(neighborId, tentativeG);
        const f = tentativeG + heuristic(neighborId);
        fScore.set(neighborId, f);
        pq.push(neighborId, f);
      }
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  if (!gScore.has(destinationId) || !previousNodes.has(destinationId)) {
    return {
      found: false,
      pathNodeIds: [],
      edges: [],
      totalCost: 0,
      executionTimeMs,
      nodesExplored
    };
  }

  // Path reconstruction
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
    totalCost: gScore.get(destinationId)!,
    executionTimeMs,
    nodesExplored
  };
}
