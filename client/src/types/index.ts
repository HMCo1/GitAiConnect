export interface User {
  id: number;
  username: string;
  email: string;
  githubId?: string;
  githubToken?: string;
  avatar?: string;
  createdAt: string;
}

export interface Repository {
  id: number;
  userId: number;
  githubId: number;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  isPrivate: boolean;
  defaultBranch: string;
  lastAnalyzed?: string;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: number;
  repositoryId: number;
  filePath: string;
  analysisType: string;
  status: "pending" | "running" | "completed" | "failed";
  results?: any;
  suggestions?: any;
  qualityScore?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Insight {
  id: number;
  repositoryId: number;
  type: "optimization" | "security" | "documentation" | "performance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  filePath?: string;
  suggestions?: any;
  isResolved: boolean;
  createdAt: string;
}

export interface Workflow {
  id: number;
  userId: number;
  name: string;
  description?: string;
  trigger: "push" | "pull_request" | "schedule" | "manual";
  config: any;
  isActive: boolean;
  lastRun?: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  userId: number;
  repositoryId?: number;
  type: string;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export interface Stats {
  repositories: number;
  analyses: number;
  workflows: number;
  qualityScore: number;
}
