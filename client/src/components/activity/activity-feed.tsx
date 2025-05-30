import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  GitBranch, 
  Bot, 
  AlertCircle, 
  GitCommit,
  FileText,
  Clock
} from "lucide-react";
import type { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "analysis_complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pr_opened":
        return <GitBranch className="h-4 w-4 text-github-blue" />;
      case "ai_analysis":
        return <Bot className="h-4 w-4 text-ai-purple" />;
      case "workflow_failed":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "commit_pushed":
        return <GitCommit className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-github-text" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "analysis_complete":
        return "bg-green-100";
      case "pr_opened":
        return "bg-blue-100";
      case "ai_analysis":
        return "bg-purple-100";
      case "workflow_failed":
        return "bg-orange-100";
      case "commit_pushed":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-github-text">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recent activity</p>
        <p className="text-sm">Activity will appear here as you use the platform</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-github-dark">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-github-text mt-1">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center mt-2 text-xs text-github-text space-x-2">
                  <span>{formatTimeAgo(activity.createdAt)}</span>
                  {activity.metadata?.qualityScore && (
                    <Badge variant="outline" className="text-xs">
                      Quality: {activity.metadata.qualityScore}/10
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
