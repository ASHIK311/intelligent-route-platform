import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RoutingGraph,
  MinPriorityQueue,
  findShortestPathDijkstra,
  findShortestPathAStar,
  findShortestPathBidirectional,
  findAlternativeCandidateRoutes,
  calculateHaversineDistance,
  normalizeWeights
} from './index.js';
import { GraphNode, GraphEdge, OptimizationWeights } from '@intelligent-route/shared-types';

test('MinPriorityQueue correctly orders elements by priority', () => {
  const pq = new MinPriorityQueue<string>();
  pq.push('taskC', 30);
  pq.push('taskA', 10);
  pq.push('taskB', 20);
  pq.push('taskZero', 0);

  assert.equal(pq.size, 4);
  assert.equal(pq.pop(), 'taskZero');
  assert.equal(pq.pop(), 'taskA');
  assert.equal(pq.pop(), 'taskB');
  assert.equal(pq.pop(), 'taskC');
  assert.equal(pq.isEmpty(), true);
});

test('calculateHaversineDistance gives accurate distances', () => {
  // San Francisco (37.7749, -122.4194) to Oakland (37.8044, -122.2712) ~ 13.5 km
  const dist = calculateHaversineDistance(37.7749, -122.4194, 37.8044, -122.2712);
  assert.ok(dist > 12 && dist < 15, `Expected ~13.5km, got ${dist}`);

  // Same coordinate is 0
  assert.equal(calculateHaversineDistance(40.7128, -74.006, 40.7128, -74.006), 0);
});

test('normalizeWeights normalizes sum to 1.0', () => {
  const raw: OptimizationWeights = {
    distance: 2,
    travelTime: 4,
    monetaryCost: 2,
    predictedDelay: 1,
    risk: 1,
    userPreference: 0
  };
  const normalized = normalizeWeights(raw);
  const sum =
    normalized.distance +
    normalized.travelTime +
    normalized.monetaryCost +
    normalized.predictedDelay +
    normalized.risk +
    normalized.userPreference;
  assert.ok(Math.abs(sum - 1.0) < 0.0001);
});

// Setup deterministic small test graph:
// Node A (0,0) -> Node B (0, 0.05) -> Node D (0, 0.1)  [Route 1: Short distance 5km, but high toll $10]
// Node A (0,0) -> Node C (0.05, 0) -> Node D (0, 0.1)  [Route 2: Longer distance 10km, free toll $0]
function createSampleTestGraph(): RoutingGraph {
  const nodes: GraphNode[] = [
    { id: 'A', name: 'Start', lat: 37.77, lng: -122.42, type: 'residential' },
    { id: 'B', name: 'Toll Bridge', lat: 37.78, lng: -122.41, type: 'highway_junction' },
    { id: 'C', name: 'Free Bypass', lat: 37.76, lng: -122.40, type: 'arterial' as any },
    { id: 'D', name: 'Destination', lat: 37.79, lng: -122.39, type: 'commercial' },
    { id: 'ISOLATED', name: 'Island', lat: 37.82, lng: -122.35, type: 'residential' }
  ];

  const edges: GraphEdge[] = [
    // Route 1 via B: Fast, short, expensive
    {
      id: 'e_AB',
      source: 'A',
      target: 'B',
      distanceKm: 2.0,
      baseTravelTimeMin: 3.0,
      currentTravelTimeMin: 4.0,
      predictedTravelTimeMin: 4.5,
      monetaryCost: 5.0,
      trafficLevel: 'LOW',
      reliability: 0.95,
      riskScore: 0.1,
      roadType: 'toll_road'
    },
    {
      id: 'e_BD',
      source: 'B',
      target: 'D',
      distanceKm: 2.5,
      baseTravelTimeMin: 4.0,
      currentTravelTimeMin: 5.0,
      predictedTravelTimeMin: 5.5,
      monetaryCost: 5.0,
      trafficLevel: 'LOW',
      reliability: 0.95,
      riskScore: 0.1,
      roadType: 'toll_road'
    },
    // Route 2 via C: Slower, longer, free ($0)
    {
      id: 'e_AC',
      source: 'A',
      target: 'C',
      distanceKm: 5.0,
      baseTravelTimeMin: 8.0,
      currentTravelTimeMin: 9.0,
      predictedTravelTimeMin: 9.0,
      monetaryCost: 0.0,
      trafficLevel: 'LOW',
      reliability: 0.85,
      riskScore: 0.2,
      roadType: 'arterial'
    },
    {
      id: 'e_CD',
      source: 'C',
      target: 'D',
      distanceKm: 5.5,
      baseTravelTimeMin: 9.0,
      currentTravelTimeMin: 10.0,
      predictedTravelTimeMin: 10.0,
      monetaryCost: 0.0,
      trafficLevel: 'LOW',
      reliability: 0.85,
      riskScore: 0.2,
      roadType: 'arterial'
    }
  ];

  return new RoutingGraph(nodes, edges);
}

test('Dijkstra and A* find the optimal path correctly', () => {
  const graph = createSampleTestGraph();
  const weights: OptimizationWeights = {
    distance: 0.2,
    travelTime: 0.7,
    monetaryCost: 0.1,
    predictedDelay: 0.0,
    risk: 0.0,
    userPreference: 0.0
  };

  const dResult = findShortestPathDijkstra(graph, 'A', 'D', { weights });
  const aResult = findShortestPathAStar(graph, 'A', 'D', { weights });

  assert.equal(dResult.found, true);
  assert.equal(aResult.found, true);
  // With high travel time weight, fastest path is A -> B -> D
  assert.deepEqual(dResult.pathNodeIds, ['A', 'B', 'D']);
  assert.deepEqual(aResult.pathNodeIds, ['A', 'B', 'D']);
  assert.ok(Math.abs(dResult.totalCost - aResult.totalCost) < 0.001);
});

test('Dynamic weighting alters route: Cheapest mode selects free bypass Route C', () => {
  const graph = createSampleTestGraph();
  // Set heavy monetary cost weight
  const cheapWeights: OptimizationWeights = {
    distance: 0.1,
    travelTime: 0.1,
    monetaryCost: 0.8,
    predictedDelay: 0.0,
    risk: 0.0,
    userPreference: 0.0
  };

  const result = findShortestPathAStar(graph, 'A', 'D', { weights: cheapWeights });
  assert.equal(result.found, true);
  assert.deepEqual(result.pathNodeIds, ['A', 'C', 'D']);
});

test('Hard constraints: Avoid toll roads enforces Route C', () => {
  const graph = createSampleTestGraph();
  const weights: OptimizationWeights = {
    distance: 0.5,
    travelTime: 0.5,
    monetaryCost: 0,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  };

  const result = findShortestPathAStar(graph, 'A', 'D', {
    weights,
    constraints: { avoidRoadTypes: ['toll_road'] }
  });

  assert.equal(result.found, true);
  assert.deepEqual(result.pathNodeIds, ['A', 'C', 'D']);
});

test('Bidirectional search finds route between A and D', () => {
  const graph = createSampleTestGraph();
  const weights: OptimizationWeights = {
    distance: 0.5,
    travelTime: 0.5,
    monetaryCost: 0,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  };

  const biResult = findShortestPathBidirectional(graph, 'A', 'D', { weights });
  assert.equal(biResult.found, true);
  assert.equal(biResult.pathNodeIds[0], 'A');
  assert.equal(biResult.pathNodeIds[biResult.pathNodeIds.length - 1], 'D');
});

test('Edge case: Origin equals Destination', () => {
  const graph = createSampleTestGraph();
  const weights = normalizeWeights({
    distance: 1,
    travelTime: 0,
    monetaryCost: 0,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  });

  const resAStar = findShortestPathAStar(graph, 'A', 'A', { weights });
  assert.equal(resAStar.found, true);
  assert.deepEqual(resAStar.pathNodeIds, ['A']);
  assert.equal(resAStar.totalCost, 0);

  const resDijkstra = findShortestPathDijkstra(graph, 'A', 'A', { weights });
  assert.equal(resDijkstra.found, true);
  assert.deepEqual(resDijkstra.pathNodeIds, ['A']);
  assert.equal(resDijkstra.totalCost, 0);
});

test('Edge case: Disconnected graph / No route to isolated island', () => {
  const graph = createSampleTestGraph();
  const weights = normalizeWeights({
    distance: 1,
    travelTime: 0,
    monetaryCost: 0,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  });

  const res = findShortestPathAStar(graph, 'A', 'ISOLATED', { weights });
  assert.equal(res.found, false);
  assert.deepEqual(res.pathNodeIds, []);
});

test('Edge case: Invalid non-existent node ID', () => {
  const graph = createSampleTestGraph();
  const weights = normalizeWeights({
    distance: 1,
    travelTime: 0,
    monetaryCost: 0,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  });

  const res = findShortestPathAStar(graph, 'NON_EXISTENT', 'D', { weights });
  assert.equal(res.found, false);
});

test('Alternative route generation returns diverse candidates', () => {
  const graph = createSampleTestGraph();
  const weights: OptimizationWeights = {
    distance: 0.3,
    travelTime: 0.4,
    monetaryCost: 0.3,
    predictedDelay: 0,
    risk: 0,
    userPreference: 0
  };

  const alternatives = findAlternativeCandidateRoutes(graph, 'A', 'D', weights);
  assert.ok(alternatives.length >= 2, `Expected at least 2 alternatives, got ${alternatives.length}`);
});
