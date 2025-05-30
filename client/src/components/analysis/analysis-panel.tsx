import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { 
  Bot, 
  CheckCircle, 
  Lightbulb, 
  AlertTriangle, 
  Shield,
  Loader2
} from "lucide-react";

export function AnalysisPanel() {
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("code_review");
  const { toast } = useToast();

  const { data: repositories } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const { data: files } = useQuery({
    queryKey: ["/api/repositories", selectedRepo, "files"],
    enabled: !!selectedRepo,
  });

  const { data: fileContent } = useQuery({
    queryKey: ["/api/repositories", selectedRepo, "content", selectedFile],
    enabled: !!selectedRepo && !!selectedFile,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/repositories/${selectedRepo}/analyze`, {
      filePath: selectedFile,
      analysisType,
    }),
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "AI analysis has been queued",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start analysis",
        variant: "destructive",
      });
    },
  });

  // Mock analysis results for demo
  const mockResults = {
    qualityScore: 8.7,
    insights: [
      {
        type: "optimization",
        message: "Code structure follows React best practices",
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        type: "suggestion",
        message: "Consider implementing useMemo for expensive calculations",
        icon: Lightbulb,
        color: "text-yellow-500",
      },
      {
        type: "warning",
        message: "Missing error boundary for component tree",
        icon: AlertTriangle,
        color: "text-orange-500",
      },
      {
        type: "security",
        message: "No sensitive data exposure detected",
        icon: Shield,
        color: "text-blue-500",
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 text-ai-purple" />
          Quick Code Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-github-dark mb-2">
                Select Repository & File
              </label>
              <div className="space-y-3">
                <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories?.map((repo: any) => (
                      <SelectItem key={repo.id} value={repo.id.toString()}>
                        {repo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedFile} 
                  onValueChange={setSelectedFile}
                  disabled={!selectedRepo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file" />
                  </SelectTrigger>
                  <SelectContent>
                    {files?.slice(0, 20).map((file: any) => (
                      <SelectItem key={file.path} value={file.path}>
                        {file.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code_review">Code Review</SelectItem>
                    <SelectItem value="security">Security Analysis</SelectItem>
                    <SelectItem value="performance">Performance Analysis</SelectItem>
                    <SelectItem value="documentation">Documentation Review</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => analyzeMutation.mutate()}
                  disabled={!selectedRepo || !selectedFile || analyzeMutation.isPending}
                  className="w-full bg-ai-purple hover:bg-purple-700"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* File Preview */}
            {fileContent && (
              <div>
                <label className="block text-sm font-medium text-github-dark mb-2">
                  File Preview
                </label>
                <div className="bg-gray-900 rounded-md p-4 font-mono text-sm text-green-400 h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {fileContent.content?.slice(0, 500)}
                    {fileContent.content?.length > 500 && "..."}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            <label className="block text-sm font-medium text-github-dark mb-2">
              AI Analysis Results
            </label>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-md p-4 border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-ai-purple rounded-full animate-pulse mr-2" />
                <span className="text-sm font-medium text-ai-purple">
                  {selectedFile ? "Analysis Complete" : "Select file to analyze"}
                </span>
              </div>

              {selectedFile && (
                <>
                  <div className="space-y-3 text-sm mb-4">
                    {mockResults.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <insight.icon className={`mt-0.5 h-4 w-4 ${insight.color}`} />
                        <span>{insight.message}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Quality Score: {mockResults.qualityScore}/10</span>
                      <span>Analysis time: 2.3s</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
