import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { githubService } from "./github";
import { openaiService } from "./openai";
import { setupWebSocket } from "./websocket";
import { insertRepositorySchema, insertAnalysisSchema, insertWorkflowSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket
  setupWebSocket(httpServer);

  // Auth routes
  app.get("/api/user", async (req, res) => {
    try {
      // For demo purposes, using a default user
      // In production, this would come from session/auth
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({
          username: "demo",
          email: "demo@example.com",
          avatar: "https://github.com/github.png",
        });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // GitHub OAuth routes
  app.post("/api/auth/github", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "GitHub token required" });
      }

      const githubUser = await githubService.getCurrentUser(token);
      let user = await storage.getUserByGithubId(githubUser.id.toString());
      
      if (!user) {
        user = await storage.createUser({
          username: githubUser.login,
          email: githubUser.email || `${githubUser.login}@github.local`,
          githubId: githubUser.id.toString(),
          githubToken: token,
          avatar: githubUser.avatar_url,
        });
      } else {
        user = await storage.updateUser(user.id, {
          githubToken: token,
          avatar: githubUser.avatar_url,
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "GitHub authentication failed" });
    }
  });

  // Repository routes
  app.get("/api/repositories", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const repositories = await storage.getRepositoriesByUserId(user.id);
      res.json(repositories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.post("/api/repositories/sync", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "GitHub token required" });
      }

      const githubRepos = await githubService.getUserRepositories(user.githubToken);
      const syncedRepos = [];

      for (const githubRepo of githubRepos) {
        let repo = await storage.getRepositoryByGithubId(githubRepo.id, user.id);
        
        if (!repo) {
          repo = await storage.createRepository({
            userId: user.id,
            githubId: githubRepo.id,
            name: githubRepo.name,
            fullName: githubRepo.full_name,
            description: githubRepo.description,
            language: githubRepo.language,
            stars: githubRepo.stargazers_count,
            isPrivate: githubRepo.private,
            defaultBranch: githubRepo.default_branch,
          });
        } else {
          repo = await storage.updateRepository(repo.id, {
            description: githubRepo.description,
            language: githubRepo.language,
            stars: githubRepo.stargazers_count,
            defaultBranch: githubRepo.default_branch,
          });
        }

        syncedRepos.push(repo);
      }

      res.json(syncedRepos);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync repositories" });
    }
  });

  app.get("/api/repositories/:id", async (req, res) => {
    try {
      const repository = await storage.getRepository(parseInt(req.params.id));
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repository);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repository" });
    }
  });

  app.get("/api/repositories/:id/files", async (req, res) => {
    try {
      const repository = await storage.getRepository(parseInt(req.params.id));
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user?.githubToken) {
        return res.status(401).json({ error: "GitHub token required" });
      }

      const files = await githubService.getRepositoryFiles(
        user.githubToken,
        repository.fullName,
        repository.defaultBranch || "main"
      );

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repository files" });
    }
  });

  app.get("/api/repositories/:id/content/:path(*)", async (req, res) => {
    try {
      const repository = await storage.getRepository(parseInt(req.params.id));
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user?.githubToken) {
        return res.status(401).json({ error: "GitHub token required" });
      }

      const content = await githubService.getFileContent(
        user.githubToken,
        repository.fullName,
        req.params.path,
        repository.defaultBranch || "main"
      );

      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  // Analysis routes
  app.post("/api/repositories/:id/analyze", async (req, res) => {
    try {
      const repository = await storage.getRepository(parseInt(req.params.id));
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const { filePath, analysisType = "code_review" } = req.body;
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user?.githubToken) {
        return res.status(401).json({ error: "GitHub token required" });
      }

      // Create analysis record
      const analysis = await storage.createAnalysis({
        repositoryId: repository.id,
        filePath,
        analysisType,
        status: "pending",
      });

      // Start analysis in background
      setImmediate(async () => {
        try {
          await storage.updateAnalysis(analysis.id, { status: "running" });

          const fileContent = await githubService.getFileContent(
            user.githubToken!,
            repository.fullName,
            filePath,
            repository.defaultBranch || "main"
          );

          const analysisResult = await openaiService.analyzeCode(
            fileContent.content,
            analysisType,
            filePath
          );

          await storage.updateAnalysis(analysis.id, {
            status: "completed",
            results: analysisResult,
            qualityScore: analysisResult.qualityScore,
          });

          // Create insights if any issues found
          if (analysisResult.insights) {
            for (const insight of analysisResult.insights) {
              await storage.createInsight({
                repositoryId: repository.id,
                type: insight.type,
                severity: insight.severity,
                title: insight.title,
                description: insight.description,
                filePath,
                suggestions: insight.suggestions,
              });
            }
          }

          // Create activity
          await storage.createActivity({
            userId: user.id,
            repositoryId: repository.id,
            type: "analysis_complete",
            title: "AI Analysis Complete",
            description: `Code analysis completed for ${filePath}`,
            metadata: { analysisId: analysis.id, qualityScore: analysisResult.qualityScore },
          });

        } catch (error) {
          await storage.updateAnalysis(analysis.id, {
            status: "failed",
            results: { error: error instanceof Error ? error.message : "Analysis failed" },
          });
        }
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to start analysis" });
    }
  });

  app.get("/api/repositories/:id/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalysesByRepository(parseInt(req.params.id));
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(parseInt(req.params.id));
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Insights routes
  app.get("/api/insights", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const insights = await storage.getRecentInsights(user.id, limit);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.get("/api/repositories/:id/insights", async (req, res) => {
    try {
      const insights = await storage.getInsightsByRepository(parseInt(req.params.id));
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repository insights" });
    }
  });

  app.patch("/api/insights/:id", async (req, res) => {
    try {
      const { isResolved } = req.body;
      const insight = await storage.updateInsight(parseInt(req.params.id), {
        isResolved,
      });
      res.json(insight);
    } catch (error) {
      res.status(500).json({ error: "Failed to update insight" });
    }
  });

  // Workflow routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const workflows = await storage.getWorkflowsByUser(user.id);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const workflowData = insertWorkflowSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const workflow = await storage.createWorkflow(workflowData);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = await storage.updateWorkflow(parseInt(req.params.id), req.body);
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      await storage.deleteWorkflow(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getActivitiesByUser(user.id, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Custom GPT integration endpoint
  app.post("/api/gpt/connect", async (req, res) => {
    try {
      const { action, repositoryId, analysisType, name, description, trigger, config } = req.body;
      
      switch (action) {
        case "analyze_repository":
          if (!repositoryId) {
            return res.status(400).json({ error: "Repository ID required" });
          }
          
          const repository = await storage.getRepository(repositoryId);
          if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
          }

          const analysis = await storage.createAnalysis({
            repositoryId,
            filePath: ".",
            analysisType: analysisType || "quality",
            status: "pending"
          });

          res.json({
            message: "Analysis started successfully",
            analysisId: analysis.id,
            status: "pending",
            repository: {
              name: repository.name,
              language: repository.language,
              stars: repository.stars
            }
          });
          break;

        case "get_insights":
          const user = await storage.getUserByUsername("demo");
          const insights = await storage.getRecentInsights(user?.id || 1);
          res.json({
            insights: insights.map(insight => ({
              type: insight.type,
              severity: insight.severity,
              title: insight.title,
              description: insight.description,
              filePath: insight.filePath,
              suggestions: insight.suggestions
            }))
          });
          break;

        case "create_workflow":
          const currentUser = await storage.getUserByUsername("demo");
          const workflow = await storage.createWorkflow({
            userId: currentUser?.id || 1,
            name: name || "GPT Generated Workflow",
            description: description || "Automated workflow created by custom GPT",
            trigger: trigger || "manual",
            config: config || {},
            isActive: true
          });
          
          res.json({
            message: "Workflow created successfully",
            workflow: {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              trigger: workflow.trigger,
              isActive: workflow.isActive
            }
          });
          break;

        default:
          res.status(400).json({ error: "Invalid action specified" });
      }
    } catch (error) {
      console.error(`GPT connection error: ${(error as Error).message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve OpenAPI specification for custom GPT
  app.get("/openapi.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const spec = {
      "openapi": "3.0.0",
      "info": {
        "title": "AI Code Intelligence Platform API",
        "description": "API for custom GPT integration with code analysis and automation features",
        "version": "1.0.0"
      },
      "servers": [{ "url": baseUrl }],
      "paths": {
        "/api/repositories": {
          "get": {
            "summary": "List all repositories",
            "operationId": "getRepositories",
            "responses": {
              "200": {
                "description": "List of repositories",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer" },
                          "name": { "type": "string" },
                          "language": { "type": "string" },
                          "stars": { "type": "integer" },
                          "qualityScore": { "type": "number" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/gpt/connect": {
          "post": {
            "summary": "GPT integration endpoint",
            "operationId": "gptConnect",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "action": {
                        "type": "string",
                        "enum": ["analyze_repository", "get_insights", "create_workflow"],
                        "description": "Action to perform"
                      },
                      "repositoryId": {
                        "type": "integer",
                        "description": "Repository ID for analysis"
                      },
                      "analysisType": {
                        "type": "string",
                        "enum": ["quality", "security", "performance", "documentation"],
                        "description": "Type of analysis to perform"
                      },
                      "name": {
                        "type": "string",
                        "description": "Workflow name"
                      },
                      "description": {
                        "type": "string", 
                        "description": "Workflow description"
                      },
                      "trigger": {
                        "type": "string",
                        "enum": ["push", "pull_request", "schedule", "manual"],
                        "description": "Workflow trigger"
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Success response",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "message": { "type": "string" },
                        "data": { "type": "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    res.json(spec);
  });

  return httpServer;
}
