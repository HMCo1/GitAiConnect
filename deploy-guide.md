# Deployment Guide: Hugging Face Spaces + GitHub Integration

## Part 1: Deploy to Hugging Face Spaces

### Step 1: Create Your Space
1. Go to https://huggingface.co/new-space
2. Space name: `ai-code-intelligence-platform`
3. SDK: Choose **Docker**
4. Hardware: CPU basic (free tier)
5. Visibility: Public or Private

### Step 2: Upload Files
Upload these files to your Space:
- All project files (app.py, Dockerfile, package.json, etc.)
- Source code (server/, client/, shared/ folders)
- Configuration files (tsconfig.json, tailwind.config.ts, etc.)

### Step 3: Configure Environment Variables
In your Space settings, add these secrets:

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key (already available)
- `DATABASE_URL`: PostgreSQL connection string

**Optional for GitHub features:**
- `GITHUB_TOKEN`: Your GitHub personal access token

### Step 4: Get Database URL
You'll need a PostgreSQL database. Options:
- **Neon**: https://neon.tech (free tier available)
- **Supabase**: https://supabase.com (free tier available)
- **Railway**: https://railway.app (free tier available)

Example DATABASE_URL format:
```
postgresql://username:password@hostname:5432/database_name
```

## Part 2: GitHub Integration Setup

### Step 1: Create GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (full repository access)
   - `read:user` (read user profile)
   - `user:email` (read user email)
4. Copy the token

### Step 2: Configure GitHub Integration
Add your GitHub token to the Space environment variables:
- Key: `GITHUB_TOKEN`
- Value: Your personal access token

### Step 3: Test GitHub Connection
Your platform will automatically:
- Sync repositories from your GitHub account
- Analyze code quality and security
- Track commits and pull requests
- Generate automated insights

## Deployment Checklist

- [ ] Hugging Face Space created
- [ ] All files uploaded
- [ ] OPENAI_API_KEY configured
- [ ] DATABASE_URL configured  
- [ ] GITHUB_TOKEN configured
- [ ] Space successfully deployed
- [ ] Custom GPT created and connected

## Next Steps After Deployment

1. **Test Repository Sync**: Visit your deployed platform and sync GitHub repositories
2. **Run Code Analysis**: Analyze repositories for quality and security issues
3. **Set Up Custom GPT**: Use the deployed URL in your custom GPT configuration
4. **Create Workflows**: Set up automated analysis workflows

Your platform URL will be:
```
https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-platform
```