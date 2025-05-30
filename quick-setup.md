# Quick Setup: Deploy & Connect GitHub

## Immediate Next Steps

### 1. Deploy to Hugging Face Spaces
- Go to: https://huggingface.co/new-space
- Name: `ai-code-intelligence-platform` 
- SDK: Docker
- Upload all project files from this workspace

### 2. Environment Variables Needed
Add these to your Space settings:

**OPENAI_API_KEY**: ✓ Already configured
**DATABASE_URL**: Need PostgreSQL connection string
**GITHUB_TOKEN**: Need your GitHub personal access token

### 3. Get GitHub Token
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with these permissions:
   - `repo` (repository access)
   - `read:user` (profile access)
   - `user:email` (email access)

### 4. Get Database URL
Quick option - Neon (free):
1. Visit neon.tech
2. Create project
3. Copy connection string

### 5. Test Integration
Once deployed:
- Sync repositories from GitHub
- Run AI analysis on your code
- Connect your custom GPT

Your deployed platform will be accessible at:
`https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-platform`