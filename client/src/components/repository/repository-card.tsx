import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { 
  Book, 
  Star, 
  GitBranch, 
  Lock, 
  Globe,
  Bot,
  ExternalLink,
  Loader2
} from "lucide-react";
import type { Repository } from "@/types";

interface RepositoryCardProps {
  repository: Repository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      return apiRequest("POST", `/api/repositories/${repository.id}/analyze`, {
        filePath: "package.json", // Default file to analyze
        analysisType: "code_review",
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "AI analysis has been queued for this repository",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start analysis",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-400",
      TypeScript: "bg-blue-400",
      Python: "bg-green-400",
      Java: "bg-orange-400",
      "C#": "bg-purple-400",
      Go: "bg-cyan-400",
      Rust: "bg-orange-600",
      Ruby: "bg-red-400",
    };
    return colors[language] || "bg-gray-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return "Recently";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Book className="h-4 w-4 text-github-blue" />
              <h3 className="font-medium text-github-dark truncate">
                {repository.name}
              </h3>
            </div>
            <div className="flex items-center space-x-1">
              {repository.isPrivate ? (
                <Lock className="h-4 w-4 text-yellow-600" />
              ) : (
                <Globe className="h-4 w-4 text-green-600" />
              )}
              <Badge variant={repository.isPrivate ? "secondary" : "default"}>
                {repository.isPrivate ? "Private" : "Public"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-github-text line-clamp-2">
            {repository.description || "No description available"}
          </p>

          {/* Language and Stats */}
          <div className="flex items-center justify-between text-xs text-github-text">
            <div className="flex items-center space-x-4">
              {repository.language && (
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`} />
                  <span>{repository.language}</span>
                </div>
              )}
              {repository.stars > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{repository.stars}</span>
                </div>
              )}
            </div>
            <span>Updated {formatDate(repository.updatedAt)}</span>
          </div>

          {/* Quality Score */}
          {repository.qualityScore && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-github-text">Code Quality</span>
                <span className="font-medium text-github-dark">
                  {repository.qualityScore}/10
                </span>
              </div>
              <Progress value={repository.qualityScore * 10} className="h-1" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {repository.qualityScore ? (
                <Badge className="bg-ai-purple text-white">
                  AI Analyzed
                </Badge>
              ) : (
                <Badge variant="outline">
                  Not Analyzed
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => analyzeMutation.mutate()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
                Analyze
              </Button>
              <Button size="sm" variant="ghost">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
