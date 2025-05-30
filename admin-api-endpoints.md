# Admin API Endpoints for OpenAI Integration

## Custom GPT Control Endpoints

Your deployed platform provides these endpoints for OpenAI admin API control:

### 1. Repository Analysis Control
```
POST /api/gpt/connect
{
  "action": "analyze_repository",
  "repositoryId": 1,
  "analysisType": "security" // quality, security, performance, documentation
}
```

### 2. Insights Retrieval
```
POST /api/gpt/connect
{
  "action": "get_insights"
}
```

### 3. Workflow Automation
```
POST /api/gpt/connect
{
  "action": "create_workflow",
  "name": "Automated Security Analysis",
  "trigger": "push",
  "description": "Run security analysis on every push"
}
```

### 4. Repository Management
```
GET /api/repositories
POST /api/repositories/sync
```

## OpenAI GPT Integration

Your custom GPT can control the platform through these actions:
- Analyze code quality and security across repositories
- Generate automated insights and recommendations
- Create workflows for continuous analysis
- Sync and manage GitHub repositories

## Admin Control Features

The platform enables admin-level control through:
- Direct API access for repository analysis
- Automated workflow creation and management
- Real-time insights generation using your OpenAI API
- GitHub repository synchronization and monitoring

## Deployment URL Format

After deploying to Hugging Face Spaces:
```
https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-platform
```

All admin API endpoints will be accessible at this base URL for integration with your OpenAI admin account.