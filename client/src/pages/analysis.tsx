import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { InsightsList } from "@/components/analysis/insights-list";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Bot,
  FileText,
  Shield,
  Zap,
  Code
} from "lucide-react";

export default function Analysis() {
  const [selectedRepo, setSelectedRepo] = useState<string>("all");

  const { data: repositories } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/insights", { limit: 50 }],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

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
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const filteredInsights = insights?.filter((insight: any) => 
    selectedRepo === "all" || insight.repositoryId === parseInt(selectedRepo)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-github-dark mb-2">
          AI Code Analysis
        </h1>
        <p className="text-github-text">
          Intelligent code analysis results and insights
        </p>
      </div>

      {/* Quick Analysis Panel */}
      <AnalysisPanel />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-github-dark">
              Filter by Repository:
            </label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repositories</SelectItem>
                {repositories?.map((repo: any) => (
                  <SelectItem key={repo.id} value={repo.id.toString()}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 text-ai-purple" />
                Analysis Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <InsightsList insights={filteredInsights || []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-github-text">Total Insights</span>
                    <Badge variant="secondary">{filteredInsights?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-github-text">Critical Issues</span>
                    <Badge className="bg-red-100 text-red-800">
                      {filteredInsights?.filter((i: any) => i.severity === "critical").length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-github-text">High Priority</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {filteredInsights?.filter((i: any) => i.severity === "high").length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-github-text">Resolved</span>
                    <Badge className="bg-green-100 text-green-800">
                      {filteredInsights?.filter((i: any) => i.isResolved).length || 0}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insight Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["security", "performance", "optimization", "documentation"].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type)}
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                  <Badge variant="outline">
                    {filteredInsights?.filter((i: any) => i.type === type).length || 0}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
