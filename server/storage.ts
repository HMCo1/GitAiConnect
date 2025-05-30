import { 
  users, repositories, analyses, insights, workflows, activities,
  type User, type InsertUser, type Repository, type InsertRepository,
  type Analysis, type InsertAnalysis, type Insight, type InsertInsight,
  type Workflow, type InsertWorkflow, type Activity, type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Repositories
  getRepository(id: number): Promise<Repository | undefined>;
  getRepositoriesByUserId(userId: number): Promise<Repository[]>;
  getRepositoryByGithubId(githubId: number, userId: number): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository>;
  deleteRepository(id: number): Promise<void>;

  // Analyses
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalysesByRepository(repositoryId: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  updateAnalysis(id: number, updates: Partial<InsertAnalysis>): Promise<Analysis>;

  // Insights
  getInsight(id: number): Promise<Insight | undefined>;
  getInsightsByRepository(repositoryId: number): Promise<Insight[]>;
  getRecentInsights(userId: number, limit?: number): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  updateInsight(id: number, updates: Partial<InsertInsight>): Promise<Insight>;

  // Workflows
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByUser(userId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(id: number): Promise<void>;

  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUser(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Stats
  getUserStats(userId: number): Promise<{
    repositories: number;
    analyses: number;
    workflows: number;
    qualityScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Repositories
  async getRepository(id: number): Promise<Repository | undefined> {
    const [repository] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repository || undefined;
  }

  async getRepositoriesByUserId(userId: number): Promise<Repository[]> {
    return await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, userId))
      .orderBy(desc(repositories.updatedAt));
  }

  async getRepositoryByGithubId(githubId: number, userId: number): Promise<Repository | undefined> {
    const [repository] = await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.githubId, githubId), eq(repositories.userId, userId)));
    return repository || undefined;
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const [repository] = await db.insert(repositories).values({
      ...insertRepository,
      updatedAt: new Date(),
    }).returning();
    return repository;
  }

  async updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository> {
    const [repository] = await db
      .update(repositories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repositories.id, id))
      .returning();
    return repository;
  }

  async deleteRepository(id: number): Promise<void> {
    await db.delete(repositories).where(eq(repositories.id, id));
  }

  // Analyses
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async getAnalysesByRepository(repositoryId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.repositoryId, repositoryId))
      .orderBy(desc(analyses.createdAt));
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(insertAnalysis).returning();
    return analysis;
  }

  async updateAnalysis(id: number, updates: Partial<InsertAnalysis>): Promise<Analysis> {
    const [analysis] = await db
      .update(analyses)
      .set(updates)
      .where(eq(analyses.id, id))
      .returning();
    return analysis;
  }

  // Insights
  async getInsight(id: number): Promise<Insight | undefined> {
    const [insight] = await db.select().from(insights).where(eq(insights.id, id));
    return insight || undefined;
  }

  async getInsightsByRepository(repositoryId: number): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.repositoryId, repositoryId))
      .orderBy(desc(insights.createdAt));
  }

  async getRecentInsights(userId: number, limit = 10): Promise<Insight[]> {
    return await db
      .select({
        id: insights.id,
        repositoryId: insights.repositoryId,
        type: insights.type,
        severity: insights.severity,
        title: insights.title,
        description: insights.description,
        filePath: insights.filePath,
        suggestions: insights.suggestions,
        isResolved: insights.isResolved,
        createdAt: insights.createdAt,
      })
      .from(insights)
      .innerJoin(repositories, eq(insights.repositoryId, repositories.id))
      .where(eq(repositories.userId, userId))
      .orderBy(desc(insights.createdAt))
      .limit(limit);
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db.insert(insights).values(insertInsight).returning();
    return insight;
  }

  async updateInsight(id: number, updates: Partial<InsertInsight>): Promise<Insight> {
    const [insight] = await db
      .update(insights)
      .set(updates)
      .where(eq(insights.id, id))
      .returning();
    return insight;
  }

  // Workflows
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async getWorkflowsByUser(userId: number): Promise<Workflow[]> {
    return await db
      .select()
      .from(workflows)
      .where(eq(workflows.userId, userId))
      .orderBy(desc(workflows.createdAt));
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(workflows).values(insertWorkflow).returning();
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow> {
    const [workflow] = await db
      .update(workflows)
      .set(updates)
      .where(eq(workflows.id, id))
      .returning();
    return workflow;
  }

  async deleteWorkflow(id: number): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async getActivitiesByUser(userId: number, limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Stats
  async getUserStats(userId: number): Promise<{
    repositories: number;
    analyses: number;
    workflows: number;
    qualityScore: number;
  }> {
    const [repoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(repositories)
      .where(eq(repositories.userId, userId));

    const [analysisCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(analyses)
      .innerJoin(repositories, eq(analyses.repositoryId, repositories.id))
      .where(eq(repositories.userId, userId));

    const [workflowCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.userId, userId));

    const [avgQuality] = await db
      .select({ avg: sql<number>`avg(quality_score)` })
      .from(repositories)
      .where(and(eq(repositories.userId, userId), sql`quality_score IS NOT NULL`));

    return {
      repositories: repoCount.count,
      analyses: analysisCount.count,
      workflows: workflowCount.count,
      qualityScore: Math.round(avgQuality.avg || 0),
    };
  }
}

export const storage = new DatabaseStorage();
