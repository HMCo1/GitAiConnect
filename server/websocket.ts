import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface WebSocketClient extends WebSocket {
  userId?: number;
  subscriptions?: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<number, Set<WebSocketClient>>();

  setup(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      clientTracking: true 
    });

    this.wss.on('connection', (ws: WebSocketClient, req) => {
      console.log('WebSocket client connected');
      
      ws.subscriptions = new Set();

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connection',
        data: { status: 'connected', timestamp: new Date().toISOString() }
      });
    });
  }

  private handleMessage(ws: WebSocketClient, message: any) {
    switch (message.type) {
      case 'auth':
        this.authenticateClient(ws, message.userId);
        break;
      case 'subscribe':
        this.subscribeClient(ws, message.channel);
        break;
      case 'unsubscribe':
        this.unsubscribeClient(ws, message.channel);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private authenticateClient(ws: WebSocketClient, userId: number) {
    ws.userId = userId;
    
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);

    this.sendToClient(ws, {
      type: 'auth_success',
      data: { userId, timestamp: new Date().toISOString() }
    });
  }

  private subscribeClient(ws: WebSocketClient, channel: string) {
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    ws.subscriptions.add(channel);

    this.sendToClient(ws, {
      type: 'subscribed',
      data: { channel, timestamp: new Date().toISOString() }
    });
  }

  private unsubscribeClient(ws: WebSocketClient, channel: string) {
    if (ws.subscriptions) {
      ws.subscriptions.delete(channel);
    }

    this.sendToClient(ws, {
      type: 'unsubscribed',
      data: { channel, timestamp: new Date().toISOString() }
    });
  }

  private removeClient(ws: WebSocketClient) {
    if (ws.userId && this.clients.has(ws.userId)) {
      this.clients.get(ws.userId)!.delete(ws);
      if (this.clients.get(ws.userId)!.size === 0) {
        this.clients.delete(ws.userId);
      }
    }
  }

  private sendToClient(ws: WebSocketClient, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Public methods for broadcasting
  broadcastToUser(userId: number, message: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(client => {
        this.sendToClient(client, message);
      });
    }
  }

  broadcastToChannel(channel: string, message: any) {
    this.clients.forEach(clientSet => {
      clientSet.forEach(client => {
        if (client.subscriptions?.has(channel)) {
          this.sendToClient(client, message);
        }
      });
    });
  }

  notifyAnalysisUpdate(userId: number, analysisId: number, status: string, data?: any) {
    this.broadcastToUser(userId, {
      type: 'analysis_update',
      data: {
        analysisId,
        status,
        timestamp: new Date().toISOString(),
        ...data
      }
    });
  }

  notifyRepositoryUpdate(userId: number, repositoryId: number, action: string, data?: any) {
    this.broadcastToUser(userId, {
      type: 'repository_update',
      data: {
        repositoryId,
        action,
        timestamp: new Date().toISOString(),
        ...data
      }
    });
  }

  notifyNewActivity(userId: number, activity: any) {
    this.broadcastToUser(userId, {
      type: 'new_activity',
      data: {
        activity,
        timestamp: new Date().toISOString()
      }
    });
  }

  notifyNewInsight(userId: number, insight: any) {
    this.broadcastToUser(userId, {
      type: 'new_insight',
      data: {
        insight,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const wsManager = new WebSocketManager();

export function setupWebSocket(server: Server) {
  wsManager.setup(server);
}
