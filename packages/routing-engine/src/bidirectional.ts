import { RoutingGraph } from './graph.js';
import { MinPriorityQueue } from './priority-queue.js';
import { evaluateEdgeCost, EdgeCostOptions } from './cost-evaluator.js';
import { GraphEdge } from '@intelligent-route/shared-types';

export interface BidirectionalResult {
  found: boolean;
  pathNodeIds: string[];
  edges: GraphEdge[];
  totalCost: number;
  executionTimeMs: number;
  nodesExplored: number;
}

/**
 * Bidirectional Dijkstra Search.
 * Searches forward from origin and backward from destination until frontiers meet.
 */
export function findShortestPathBidirectional(
  graph: RoutingGraph,
  originId: string,
  destinationId: string,
  costOptions: EdgeCostOptions
): BidirectionalResult {
  const startTime = performance.now();

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

  // Forward search state
  const distFwd = new Map<string, number>();
  const prevNodeFwd = new Map<string, string>();
  const prevEdgeFwd = new Map<string, GraphEdge>();
  const pqFwd = new MinPriorityQueue<string>();
  const visitedFwd = new Set<string>();

  // Backward search state
  const distBwd = new Map<string, number>();
  const nextNodeBwd = new Map<string, string>();
  const nextEdgeBwd = new Map<string, GraphEdge>();
  const pqBwd = new MinPriorityQueue<string>();
  const visitedBwd = new Set<string>();

  distFwd.set(originId, 0);
  pqFwd.push(originId, 0);

  distBwd.set(destinationId, 0);
  pqBwd.push(destinationId, 0);

  let nodesExplored = 0;
  let bestIntersectionNode: string | null = null;
  let mu = Infinity; // best total path cost seen so far

  while (!pqFwd.isEmpty() && !pqBwd.isEmpty()) {
    // Check termination condition
    const topFwd = pqFwd.peek();
    const topBwd = pqBwd.peek();
    const minFwd = topFwd ? distFwd.get(topFwd) ?? Infinity : Infinity;
    const minBwd = topBwd ? distBwd.get(topBwd) ?? Infinity : Infinity;

    if (minFwd + minBwd >= mu) {
      break;
    }

    // Step forward
    if (!pqFwd.isEmpty()) {
      const uFwd = pqFwd.pop()!;
      if (!visitedFwd.has(uFwd)) {
        visitedFwd.add(uFwd);
        nodesExplored++;

        const dU = distFwd.get(uFwd)!;
        for (const edge of graph.getOutgoing(uFwd)) {
          const v = edge.target;
          const cost = evaluateEdgeCost(edge, costOptions);
          if (!isFinite(cost)) continue;

          const newDist = dU + cost;
          if (distFwd.get(v) === undefined || newDist < distFwd.get(v)!) {
            distFwd.set(v, newDist);
            prevNodeFwd.set(v, uFwd);
            prevEdgeFwd.set(v, edge);
            pqFwd.push(v, newDist);

            if (distBwd.has(v)) {
              const totalCost = newDist + distBwd.get(v)!;
              if (totalCost < mu) {
                mu = totalCost;
                bestIntersectionNode = v;
              }
            }
          }
        }
      }
    }

    // Step backward
    if (!pqBwd.isEmpty()) {
      const uBwd = pqBwd.pop()!;
      if (!visitedBwd.has(uBwd)) {
        visitedBwd.add(uBwd);
        nodesExplored++;

        const dU = distBwd.get(uBwd)!;
        for (const edge of graph.getIncoming(uBwd)) {
          const v = edge.source;
          const cost = evaluateEdgeCost(edge, costOptions);
          if (!isFinite(cost)) continue;

          const newDist = dU + cost;
          if (distBwd.get(v) === undefined || newDist < distBwd.get(v)!) {
            distBwd.set(v, newDist);
            nextNodeBwd.set(v, uBwd);
            nextEdgeBwd.set(v, edge);
            pqBwd.push(v, newDist);

            if (distFwd.has(v)) {
              const totalCost = distFwd.get(v)! + newDist;
              if (totalCost < mu) {
                mu = totalCost;
                bestIntersectionNode = v;
              }
            }
          }
        }
      }
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  if (!bestIntersectionNode || !isFinite(mu)) {
    return {
      found: false,
      pathNodeIds: [],
      edges: [],
      totalCost: 0,
      executionTimeMs,
      nodesExplored
    };
  }

  // Reconstruct forward path (origin -> bestIntersectionNode)
  const fwdNodes: string[] = [];
  const fwdEdges: GraphEdge[] = [];
  let currFwd: string | undefined = bestIntersectionNode;

  while (currFwd && currFwd !== originId) {
    fwdNodes.unshift(currFwd);
    const edge = prevEdgeFwd.get(currFwd);
    if (edge) fwdEdges.unshift(edge);
    currFwd = prevNodeFwd.get(currFwd);
  }
  fwdNodes.unshift(originId);

  // Reconstruct backward path (bestIntersectionNode -> destination)
  const bwdNodes: string[] = [];
  const bwdEdges: GraphEdge[] = [];
  let currBwd: string | undefined = bestIntersectionNode;

  while (currBwd && currBwd !== destinationId) {
    const next = nextNodeBwd.get(currBwd);
    const edge = nextEdgeBwd.get(currBwd);
    if (next && edge) {
      bwdNodes.push(next);
      bwdEdges.push(edge);
      currBwd = next;
    } else {
      break;
    }
  }

  const fullPathNodes = [...fwdNodes, ...bwdNodes];
  const fullEdges = [...fwdEdges, ...bwdEdges];

  return {
    found: true,
    pathNodeIds: fullPathNodes,
    edges: fullEdges,
    totalCost: mu,
    executionTimeMs,
    nodesExplored
  };
}
