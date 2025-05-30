import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightsList } from "@/components/analysis/insights-list";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { RepositoryCard } from "@/components/repository/repository-card";
import { useWebSocket } from "@/hooks/use-websocket";
import { GitBranch, Bot, ServerCog, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: repositories, isLoading: reposLoading } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  // Connect to WebSocket for real-time updates
  useWebSocket();

  const StatCard = ({ title, value, icon: Icon, change, color }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-github-text">{title}</p>
            <p className="text-2xl font-bold text-github-dark">{value}</p>
          </div>
          <Icon className={`text-2xl ${color}`} />
        </div>
        {change && (
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">{change}</span>
            <span className="text-github-text ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-github-dark mb-2">
          AI Code Intelligence Dashboard
        </h1>
        <p className="text-github-text">
          Intelligent code analysis and automation powered by OpenAI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Active Repositories"
              value={stats?.repositories || 0}
              icon={GitBranch}
              change="+12%"
              color="text-github-blue"
            />
            <StatCard
              title="AI Analyses"
              value={stats?.analyses || 0}
              icon={Bot}
              change="+23%"
              color="text-ai-purple"
            />
            <StatCard
              title="Active Workflows"
              value={stats?.workflows || 0}
              icon={ServerCog}
              change="All running"
              color="text-yellow-500"
            />
            <StatCard
              title="Code Quality Score"
              value={stats?.qualityScore || 0}
              icon={TrendingUp}
              change="+0.3"
              color="text-green-500"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 text-ai-purple" />
              Latest AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <InsightsList insights={insights || []} />
            )}
          </CardContent>
        </Card>

        {/* Repository Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 text-github-blue" />
              Repository Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ActivityFeed activities={activities || []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Analysis Panel */}
      <AnalysisPanel />

      {/* Repository Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Active Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          {reposLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories?.slice(0, 6).map((repo: any) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
