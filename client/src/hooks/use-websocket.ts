import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts.current = 0;
        
        // Authenticate with demo user (in production, use real user ID)
        wsRef.current?.send(JSON.stringify({
          type: "auth",
          userId: 1, // Demo user ID
        }));

        // Subscribe to relevant channels
        wsRef.current?.send(JSON.stringify({
          type: "subscribe",
          channel: "analysis_updates",
        }));

        wsRef.current?.send(JSON.stringify({
          type: "subscribe",
          channel: "repository_updates",
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, []);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case "connection":
        console.log("WebSocket connection established");
        break;

      case "analysis_update":
        handleAnalysisUpdate(message.data);
        break;

      case "repository_update":
        handleRepositoryUpdate(message.data);
        break;

      case "new_activity":
        handleNewActivity(message.data);
        break;

      case "new_insight":
        handleNewInsight(message.data);
        break;

      case "auth_success":
        console.log("WebSocket authenticated for user:", message.data.userId);
        break;

      case "subscribed":
        console.log("Subscribed to channel:", message.data.channel);
        break;

      case "pong":
        // Heart beat response
        break;

      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  }, [queryClient, toast]);

  const handleAnalysisUpdate = useCallback((data: any) => {
    const { analysisId, status } = data;
    
    // Invalidate analysis queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
    
    if (status === "completed") {
      toast({
        title: "Analysis Complete",
        description: `Code analysis #${analysisId} has finished successfully`,
      });
      
      // Also refresh insights and activities
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    } else if (status === "failed") {
      toast({
        title: "Analysis Failed",
        description: `Code analysis #${analysisId} encountered an error`,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const handleRepositoryUpdate = useCallback((data: any) => {
    const { repositoryId, action } = data;
    
    // Refresh repository data
    queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
    
    if (action === "synced") {
      toast({
        title: "Repository Synced",
        description: "Repository data has been updated from GitHub",
      });
    }
  }, [queryClient, toast]);

  const handleNewActivity = useCallback((data: any) => {
    // Refresh activities
    queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
  }, [queryClient]);

  const handleNewInsight = useCallback((data: any) => {
    const { insight } = data;
    
    // Refresh insights
    queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    
    if (insight.severity === "critical" || insight.severity === "high") {
      toast({
        title: "New Critical Insight",
        description: insight.title,
        variant: insight.severity === "critical" ? "destructive" : "default",
      });
    }
  }, [queryClient, toast]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Start heartbeat
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
  };
}
