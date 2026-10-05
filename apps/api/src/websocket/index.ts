import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface WebSocketMessage {
  type: 'SIMULATE_JOURNEY' | 'TRAFFIC_ALERT' | 'ETA_UPDATE' | 'ROUTE_RECALCULATION' | 'PING';
  payload: any;
}

export class WebSocketGateway {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (err) {
          console.warn('[WebSocket] Invalid message received');
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      // Send initial welcome/ready packet
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        payload: {
          status: 'online',
          message: 'Connected to Intelligent Route Platform WebSocket Gateway'
        }
      }));
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'SIMULATE_JOURNEY':
        this.simulateJourneyProgress(ws, message.payload);
        break;

      case 'PING':
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        break;

      default:
        break;
    }
  }

  /**
   * Simulates vehicle moving along route nodes in real time, broadcasting progressive ETAs.
   */
  private simulateJourneyProgress(ws: WebSocket, payload: { pathNodeIds: string[]; totalMin: number }): void {
    const nodes = payload.pathNodeIds || [];
    if (nodes.length <= 1) return;

    let step = 0;
    const interval = setInterval(() => {
      if (step >= nodes.length || ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'JOURNEY_COMPLETED',
            payload: {
              completedNodeId: nodes[nodes.length - 1],
              actualDurationMin: payload.totalMin
            }
          }));
        }
        return;
      }

      const progressPct = Math.round((step / (nodes.length - 1)) * 100);
      const remainingMin = Math.max(0, Math.round(payload.totalMin * (1 - step / (nodes.length - 1))));

      ws.send(JSON.stringify({
        type: 'JOURNEY_PROGRESS',
        payload: {
          currentNodeId: nodes[step],
          stepIndex: step,
          totalSteps: nodes.length,
          progressPct,
          remainingMin
        }
      }));

      step++;
    }, 1200); // 1.2s tick per step for smooth simulation
  }

  public broadcast(message: WebSocketMessage): void {
    const serialized = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  }
}

export const wsGateway = new WebSocketGateway();
