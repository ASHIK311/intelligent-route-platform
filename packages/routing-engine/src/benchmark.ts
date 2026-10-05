import { RoutingGraph } from './graph.js';
import { findShortestPathDijkstra } from './dijkstra.js';
import { findShortestPathAStar } from './a-star.js';
import { findShortestPathBidirectional } from './bidirectional.js';
import { GraphNode, GraphEdge, OptimizationWeights } from '@intelligent-route/shared-types';

/**
 * Generates a 2D grid graph with n x m nodes and random traffic variations.
 */
function generateGridGraph(rows: number, cols: number): RoutingGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const baseLat = 37.70;
  const baseLng = -122.50;
  const step = 0.01;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `n_${r}_${c}`;
      nodes.push({
        id,
        name: `Grid Node (${r},${c})`,
        lat: baseLat + r * step,
        lng: baseLng + c * step,
        type: (r === 0 || c === 0) ? 'highway_junction' : 'residential'
      });
    }
  }

  let edgeCounter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = `n_${r}_${c}`;
      // connect right
      if (c + 1 < cols) {
        const v = `n_${r}_${c + 1}`;
        edgeCounter++;
        edges.push({
          id: `e_${edgeCounter}`,
          source: u,
          target: v,
          distanceKm: 1.1,
          baseTravelTimeMin: 1.5,
          currentTravelTimeMin: 1.5 + (Math.sin(r + c) + 1) * 0.5,
          predictedTravelTimeMin: 1.8,
          monetaryCost: r % 3 === 0 ? 0.75 : 0.0,
          trafficLevel: 'MEDIUM',
          reliability: 0.9,
          riskScore: 0.1,
          roadType: r % 3 === 0 ? 'highway' : 'local'
        });
        edgeCounter++;
        edges.push({
          id: `e_${edgeCounter}`,
          source: v,
          target: u,
          distanceKm: 1.1,
          baseTravelTimeMin: 1.5,
          currentTravelTimeMin: 1.5 + (Math.sin(r + c) + 1) * 0.5,
          predictedTravelTimeMin: 1.8,
          monetaryCost: r % 3 === 0 ? 0.75 : 0.0,
          trafficLevel: 'MEDIUM',
          reliability: 0.9,
          riskScore: 0.1,
          roadType: r % 3 === 0 ? 'highway' : 'local'
        });
      }
      // connect down
      if (r + 1 < rows) {
        const v = `n_${r + 1}_${c}`;
        edgeCounter++;
        edges.push({
          id: `e_${edgeCounter}`,
          source: u,
          target: v,
          distanceKm: 1.1,
          baseTravelTimeMin: 1.5,
          currentTravelTimeMin: 1.6,
          predictedTravelTimeMin: 1.7,
          monetaryCost: 0,
          trafficLevel: 'LOW',
          reliability: 0.95,
          riskScore: 0.05,
          roadType: 'arterial'
        });
        edgeCounter++;
        edges.push({
          id: `e_${edgeCounter}`,
          source: v,
          target: u,
          distanceKm: 1.1,
          baseTravelTimeMin: 1.5,
          currentTravelTimeMin: 1.6,
          predictedTravelTimeMin: 1.7,
          monetaryCost: 0,
          trafficLevel: 'LOW',
          reliability: 0.95,
          riskScore: 0.05,
          roadType: 'arterial'
        });
      }
    }
  }

  return new RoutingGraph(nodes, edges);
}

export function runBenchmark() {
  console.log('--- ROUTING ALGORITHMS EMPIRICAL BENCHMARK ---');
  const rows = 20;
  const cols = 20;
  console.log(`Generating grid graph: ${rows}x${cols} = ${rows * cols} nodes...`);
  const graph = generateGridGraph(rows, cols);
  console.log(`Nodes: ${graph.nodeCount}, Edges: ${graph.edgeCount}`);

  const originId = 'n_0_0';
  const destinationId = `n_${rows - 1}_${cols - 1}`;
  const weights: OptimizationWeights = {
    distance: 0.4,
    travelTime: 0.4,
    monetaryCost: 0.1,
    predictedDelay: 0.1,
    risk: 0.0,
    userPreference: 0.0
  };

  // 1. Dijkstra
  const dResult = findShortestPathDijkstra(graph, originId, destinationId, { weights });
  // 2. A*
  const aResult = findShortestPathAStar(graph, originId, destinationId, { weights });
  // 3. Bidirectional
  const biResult = findShortestPathBidirectional(graph, originId, destinationId, { weights });

  console.log('\nBENCHMARK RESULTS:');
  console.table([
    {
      Algorithm: 'Dijkstra',
      'Time (ms)': dResult.executionTimeMs,
      'Nodes Explored': dResult.nodesExplored,
      Cost: dResult.totalCost.toFixed(3),
      'Path Length': dResult.pathNodeIds.length
    },
    {
      Algorithm: 'A*',
      'Time (ms)': aResult.executionTimeMs,
      'Nodes Explored': aResult.nodesExplored,
      Cost: aResult.totalCost.toFixed(3),
      'Path Length': aResult.pathNodeIds.length
    },
    {
      Algorithm: 'Bidirectional',
      'Time (ms)': biResult.executionTimeMs,
      'Nodes Explored': biResult.nodesExplored,
      Cost: biResult.totalCost.toFixed(3),
      'Path Length': biResult.pathNodeIds.length
    }
  ]);
}

if (process.argv[1]?.endsWith('benchmark.js') || process.argv[1]?.endsWith('benchmark.ts')) {
  runBenchmark();
}
