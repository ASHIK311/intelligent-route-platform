import { GraphNode, GraphEdge } from '@intelligent-route/shared-types';

export class RoutingGraph {
  public readonly nodes: Map<string, GraphNode> = new Map();
  public readonly edges: Map<string, GraphEdge> = new Map();
  // adjacency map: sourceNodeId -> Array of outgoing edges
  public readonly outgoingEdges: Map<string, GraphEdge[]> = new Map();
  // reverse adjacency map: targetNodeId -> Array of incoming edges (for bidirectional search)
  public readonly incomingEdges: Map<string, GraphEdge[]> = new Map();

  constructor(nodes?: GraphNode[], edges?: GraphEdge[]) {
    if (nodes) {
      for (const node of nodes) {
        this.addNode(node);
      }
    }
    if (edges) {
      for (const edge of edges) {
        this.addEdge(edge);
      }
    }
  }

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.outgoingEdges.has(node.id)) {
      this.outgoingEdges.set(node.id, []);
    }
    if (!this.incomingEdges.has(node.id)) {
      this.incomingEdges.set(node.id, []);
    }
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);

    if (!this.outgoingEdges.has(edge.source)) {
      this.outgoingEdges.set(edge.source, []);
    }
    this.outgoingEdges.get(edge.source)!.push(edge);

    if (!this.incomingEdges.has(edge.target)) {
      this.incomingEdges.set(edge.target, []);
    }
    this.incomingEdges.get(edge.target)!.push(edge);
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  public getOutgoing(nodeId: string): GraphEdge[] {
    return this.outgoingEdges.get(nodeId) || [];
  }

  public getIncoming(nodeId: string): GraphEdge[] {
    return this.incomingEdges.get(nodeId) || [];
  }

  public hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  public get nodeCount(): number {
    return this.nodes.size;
  }

  public get edgeCount(): number {
    return this.edges.size;
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Clone graph with optional edge filtering
   */
  public clone(edgeFilter?: (edge: GraphEdge) => boolean): RoutingGraph {
    const cloned = new RoutingGraph();
    for (const node of this.nodes.values()) {
      cloned.addNode({ ...node });
    }
    for (const edge of this.edges.values()) {
      if (!edgeFilter || edgeFilter(edge)) {
        cloned.addEdge({ ...edge });
      }
    }
    return cloned;
  }
}
