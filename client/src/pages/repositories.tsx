import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryCard } from "@/components/repository/repository-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { Plus, RefreshCw, Search } from "lucide-react";

export default function Repositories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const { data: repositories, isLoading } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/repositories/sync"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      toast({
        title: "Success",
        description: "Repositories synced successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync repositories",
        variant: "destructive",
      });
    },
  });

  const filteredRepositories = repositories?.filter((repo: any) => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "analyzed") {
      return matchesSearch && repo.qualityScore != null;
    }
    if (filterType === "private") {
      return matchesSearch && repo.isPrivate;
    }
    if (filterType === "public") {
      return matchesSearch && !repo.isPrivate;
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-github-dark mb-2">Repositories</h1>
          <p className="text-github-text">Manage and analyze your GitHub repositories</p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-github-blue hover:bg-blue-700"
        >
          {syncMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sync from GitHub
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-github-text" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter repositories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repositories</SelectItem>
                <SelectItem value="analyzed">Recently analyzed</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))
        ) : filteredRepositories?.length > 0 ? (
          filteredRepositories.map((repository: any) => (
            <RepositoryCard key={repository.id} repository={repository} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-github-text">
                  {repositories?.length === 0 ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No repositories found</h3>
                      <p className="mb-4">Sync your GitHub repositories to get started</p>
                      <Button 
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        className="bg-github-blue hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Sync Repositories
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No matching repositories</h3>
                      <p>Try adjusting your search or filter criteria</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Stats */}
      {repositories && repositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Repository Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-github-dark">{repositories.length}</div>
                <div className="text-sm text-github-text">Total Repositories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-github-dark">
                  {repositories.filter((r: any) => !r.isPrivate).length}
                </div>
                <div className="text-sm text-github-text">Public</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-github-dark">
                  {repositories.filter((r: any) => r.isPrivate).length}
                </div>
                <div className="text-sm text-github-text">Private</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-github-dark">
                  {repositories.filter((r: any) => r.qualityScore != null).length}
                </div>
                <div className="text-sm text-github-text">Analyzed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
