import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CodeAnalysisResult {
  qualityScore: number;
  summary: string;
  issues: Array<{
    type: "error" | "warning" | "suggestion";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    line?: number;
    column?: number;
  }>;
  suggestions: string[];
  insights?: Array<{
    type: "optimization" | "security" | "documentation" | "performance";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    suggestions: string[];
  }>;
  metrics: {
    complexity: number;
    maintainability: number;
    security: number;
    performance: number;
  };
}

export class OpenAIService {
  async analyzeCode(
    code: string, 
    analysisType: string = "code_review",
    filePath: string = ""
  ): Promise<CodeAnalysisResult> {
    try {
      const systemPrompt = this.getSystemPrompt(analysisType);
      const userPrompt = this.getUserPrompt(code, filePath, analysisType);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Ensure the result has the expected structure
      return {
        qualityScore: this.clampScore(result.qualityScore || 5),
        summary: result.summary || "Analysis completed",
        issues: Array.isArray(result.issues) ? result.issues : [],
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        insights: Array.isArray(result.insights) ? result.insights : [],
        metrics: {
          complexity: this.clampScore(result.metrics?.complexity || 5),
          maintainability: this.clampScore(result.metrics?.maintainability || 5),
          security: this.clampScore(result.metrics?.security || 5),
          performance: this.clampScore(result.metrics?.performance || 5),
        }
      };
    } catch (error) {
      throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateDocumentation(code: string, filePath: string): Promise<{
    documentation: string;
    summary: string;
    apiEndpoints?: Array<{
      method: string;
      path: string;
      description: string;
      parameters?: string[];
      responses?: string[];
    }>;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a documentation expert. Generate comprehensive documentation for the provided code. Include function descriptions, parameter details, return values, and usage examples. For API endpoints, include method, path, parameters, and responses. Respond with JSON in this format: { 'documentation': string, 'summary': string, 'apiEndpoints': array }"
          },
          {
            role: "user",
            content: `Generate documentation for this ${filePath} file:\n\n${code}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Documentation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reviewPullRequest(
    files: Array<{ path: string; content: string; changes: string }>,
    prDescription: string
  ): Promise<{
    overall: {
      score: number;
      summary: string;
      recommendation: "approve" | "request_changes" | "comment";
    };
    fileReviews: Array<{
      path: string;
      score: number;
      issues: Array<{
        type: "error" | "warning" | "suggestion";
        line?: number;
        message: string;
      }>;
      suggestions: string[];
    }>;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior code reviewer. Analyze the pull request files and provide detailed feedback. Focus on code quality, security, performance, and best practices. Respond with JSON in the format: { 'overall': { 'score': number, 'summary': string, 'recommendation': string }, 'fileReviews': array }"
          },
          {
            role: "user",
            content: `Review this pull request:\n\nDescription: ${prDescription}\n\nFiles:\n${files.map(f => `\n--- ${f.path} ---\n${f.content}\n\nChanges:\n${f.changes}`).join('\n')}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Pull request review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getSystemPrompt(analysisType: string): string {
    const basePrompt = "You are an expert code analyst and software engineer. Analyze the provided code and respond with JSON only.";
    
    switch (analysisType) {
      case "security":
        return `${basePrompt} Focus on security vulnerabilities, authentication issues, input validation, and potential attack vectors.`;
      case "performance":
        return `${basePrompt} Focus on performance bottlenecks, optimization opportunities, memory usage, and algorithmic efficiency.`;
      case "documentation":
        return `${basePrompt} Focus on code documentation, readability, naming conventions, and maintainability.`;
      default:
        return `${basePrompt} Provide a comprehensive code review covering quality, security, performance, and maintainability.`;
    }
  }

  private getUserPrompt(code: string, filePath: string, analysisType: string): string {
    return `Analyze this ${filePath} file for ${analysisType}:

${code}

Provide analysis in JSON format with these fields:
- qualityScore: overall score from 1-10
- summary: brief summary of findings
- issues: array of issues with type, severity, message, line, column
- suggestions: array of improvement suggestions
- insights: array of insights with type, severity, title, description, suggestions
- metrics: object with complexity, maintainability, security, performance scores (1-10)

Focus on actionable feedback and specific improvements.`;
  }

  private clampScore(score: number): number {
    return Math.max(1, Math.min(10, Math.round(score)));
  }
}

export const openaiService = new OpenAIService();
