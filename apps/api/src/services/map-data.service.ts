import { db } from '../repositories/database.js';
import { GraphNode, GraphEdge, TrafficLevel } from '@intelligent-route/shared-types';
import { RoutingGraph } from '@intelligent-route/routing-engine';

export class MapDataService {
  private routingGraph: RoutingGraph | null = null;

  public getAllNodes(): GraphNode[] {
    return Array.from(db.nodes.values());
  }

  public getNodeById(id: string): GraphNode | undefined {
    return db.nodes.get(id);
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(db.edges.values());
  }

  public getEdgeById(id: string): GraphEdge | undefined {
    return db.edges.get(id);
  }

  public getRoutingGraph(): RoutingGraph {
    if (!this.routingGraph) {
      this.routingGraph = new RoutingGraph(
        this.getAllNodes(),
        this.getAllEdges()
      );
    }
    return this.routingGraph;
  }

  /**
   * Dynamically simulate or update edge traffic conditions.
   * Invalidates cached routing graph.
   */
  public updateEdgeTraffic(edgeId: string, trafficLevel: TrafficLevel, delayMultiplier: number = 1.0): GraphEdge | null {
    const edge = db.edges.get(edgeId);
    if (!edge) return null;

    const trafficMul =
      trafficLevel === 'CONGESTED' ? 2.2 : trafficLevel === 'HIGH' ? 1.6 : trafficLevel === 'MEDIUM' ? 1.25 : 1.0;

    edge.trafficLevel = trafficLevel;
    edge.currentTravelTimeMin = Math.round(edge.baseTravelTimeMin * trafficMul * delayMultiplier * 10) / 10;
    edge.predictedTravelTimeMin = Math.round(edge.currentTravelTimeMin * 1.15 * 10) / 10;
    edge.riskScore = trafficLevel === 'CONGESTED' ? 0.45 : trafficLevel === 'HIGH' ? 0.25 : 0.08;

    db.edges.set(edgeId, edge);

    // Invalidate graph cache
    this.routingGraph = null;

    return edge;
  }
}

export const mapDataService = new MapDataService();
