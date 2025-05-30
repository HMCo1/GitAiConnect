# GitHub Integration Setup Instructions

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub.com and sign in
2. Click your profile picture → Settings
3. Scroll down to "Developer settings" 
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token (classic)"
6. Set expiration (recommend "No expiration" for continuous access)
7. Select these scopes:
   - `repo` - Full control of private repositories
   - `public_repo` - Access to public repositories  
   - `read:user` - Read access to profile info
   - `user:email` - Access to user email addresses
   - `read:org` - Read access to organization membership
8. Click "Generate token"
9. Copy the token immediately (it won't be shown again)

## Step 2: Get Database Connection

You need a PostgreSQL database for storing analysis results. Choose one option:

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy the connection string from dashboard
5. Format: `postgresql://username:password@hostname/dbname`

### Option B: Supabase (Alternative - Free)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Replace `[YOUR-PASSWORD]` with your actual password

### Option C: Railway (Alternative - Free tier)
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from variables tab

## Step 3: Deploy to Hugging Face Spaces

1. Go to https://huggingface.co/new-space
2. Name your space: `ai-code-intelligence-platform`
3. Choose SDK: **Docker**
4. Visibility: Public (or Private if preferred)
5. Create Space

## Step 4: Upload Project Files

Upload all these files to your Hugging Face Space:
- `app.py` (Python startup script)
- `Dockerfile` (Container configuration)
- `package.json` and `package-lock.json` (Dependencies)
- All folders: `server/`, `client/`, `shared/`
- Config files: `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, etc.

## Step 5: Configure Environment Variables

In your Space settings, add these secrets:

**Required:**
- `OPENAI_API_KEY`: (already configured)
- `DATABASE_URL`: Your PostgreSQL connection string

**For GitHub Integration:**
- `GITHUB_TOKEN`: Your personal access token from Step 1

## Step 6: Test Integration

After deployment:
1. Visit your deployed platform
2. Click "Sync Repositories" to connect GitHub
3. Select repositories to analyze
4. Start code analysis with AI
5. View insights and recommendations

Your platform will automatically:
- Import repositories from GitHub
- Analyze code quality and security
- Generate AI-powered insights
- Track commits and changes
- Create automated workflows

Would you like me to help you get the GitHub token first, or do you already have database credentials ready?