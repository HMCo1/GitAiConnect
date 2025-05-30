import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { 
  Shield, 
  Zap, 
  FileText, 
  Code, 
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import type { Insight } from "@/types";

interface InsightsListProps {
  insights: Insight[];
}

export function InsightsList({ insights }: InsightsListProps) {
  const { toast } = useToast();

  const resolveMutation = useMutation({
    mutationFn: (insightId: number) => 
      apiRequest("PATCH", `/api/insights/${insightId}`, { isResolved: true }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Insight marked as resolved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "performance":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "documentation":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Code className="h-4 w-4 text-purple-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else {
      return "Just now";
    }
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-github-text">
        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No insights available</p>
        <p className="text-sm">Run an analysis to see AI-powered insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card
          key={insight.id}
          className={`border-l-4 ${getSeverityColor(insight.severity)} ${
            insight.isResolved ? "opacity-60" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(insight.type)}
                  <h4 className="font-medium text-github-dark">{insight.title}</h4>
                  <Badge className={getSeverityBadge(insight.severity)}>
                    {insight.severity}
                  </Badge>
                  {insight.isResolved && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-github-text mb-3">
                  {insight.description}
                </p>

                {insight.filePath && (
                  <div className="flex items-center text-xs text-github-text mb-2">
                    <FileText className="h-3 w-3 mr-1" />
                    <span className="font-mono">{insight.filePath}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-github-text">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(insight.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!insight.isResolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveMutation.mutate(insight.id)}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {insight.suggestions && Array.isArray(insight.suggestions) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-xs font-medium text-github-dark mb-2">
                  Suggestions:
                </h5>
                <ul className="text-xs text-github-text space-y-1">
                  {insight.suggestions.slice(0, 3).map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
