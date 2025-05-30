# Custom GPT Setup Guide for AI Code Intelligence Platform

## Step 1: Create Your Custom GPT

1. Go to **chat.openai.com** and click **"Explore GPTs"**
2. Click **"Create a GPT"** 
3. Choose **"Configure"** tab

## Step 2: Basic Configuration

**Name**: `AI Code Intelligence Assistant`

**Description**: 
```
Your personal AI assistant for code analysis, GitHub integration, and development automation. Connects to your AI Code Intelligence Platform to provide real-time insights, security analysis, and workflow automation.
```

**Instructions**:
```
You are an AI assistant that helps developers with code analysis, GitHub repository management, and automation workflows. You have access to a comprehensive AI Code Intelligence Platform that can analyze code quality, detect security vulnerabilities, optimize performance, and automate development workflows. 

When users ask about code issues:
- Use the analyze_repository action to start AI analysis
- Provide specific, actionable recommendations
- Focus on security vulnerabilities and performance improvements

When users want automation:
- Use create_workflow action to set up automated processes
- Suggest appropriate triggers based on their needs

Always use the get_insights action to show recent findings and trends.
```

## Step 3: Conversation Starters

Add these conversation starters:
```
• Analyze my repository for security vulnerabilities
• Help me set up automated code quality checks  
• What performance issues does my code have?
• Create a workflow for automated testing
• Show me insights from my latest commits
```

## Step 4: Configure Actions

1. Click **"Create new action"**
2. **Import from URL**: `https://your-space-name.hf.space/openapi.json`
3. **Authentication**: None (or API Key if you add authentication later)

## Step 5: Privacy & Sharing

- Set to **"Only me"** initially for testing
- Change to **"Anyone with a link"** when ready to share

## Step 6: Test Your GPT

Try these commands:
- "List my repositories"
- "Analyze repository ID 1 for security issues"
- "Show me recent insights"
- "Create an automated workflow for pull request analysis"

## API Endpoints Available

Your custom GPT can use these actions:

### Repository Analysis
- **Action**: `analyze_repository`
- **Parameters**: `repositoryId`, `analysisType` (quality/security/performance/documentation)

### Get Insights  
- **Action**: `get_insights`
- **Returns**: Recent AI-generated code insights and recommendations

### Create Workflows
- **Action**: `create_workflow` 
- **Parameters**: `name`, `description`, `trigger`, `config`

## Platform URL

Replace `your-space-name` with your actual Hugging Face Space name:
```
https://your-space-name.hf.space
```

## Next Steps

1. Deploy your platform to Hugging Face Spaces
2. Update the OpenAPI URL in your custom GPT settings
3. Test the integration with your repositories
4. Share your custom GPT with your team

Your custom GPT will now have direct access to your AI Code Intelligence Platform and can automate code analysis, security checks, and workflow creation through natural language commands.