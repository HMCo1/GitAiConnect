# Deploy to Hugging Face Spaces

## Step 1: Create Your Space

1. Visit: https://huggingface.co/new-space
2. Configuration:
   - **Space name**: `ai-code-intelligence-platform`
   - **SDK**: Docker
   - **Hardware**: CPU basic (free tier)
   - **Visibility**: Public or Private

## Step 2: Upload Project Files

Upload all files from this workspace to your Space:
- `app.py` (Python startup script)
- `Dockerfile` (Container configuration)
- `package.json` & `package-lock.json` (Node.js dependencies)
- `server/` folder (Backend API)
- `client/` folder (Frontend interface)
- `shared/` folder (Database schemas)
- Configuration files: `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `drizzle.config.ts`

## Step 3: Configure Environment Variables

In your Space settings, add these environment variables:

**OpenAI Integration** (Required):
- `OPENAI_API_KEY`: Your OpenAI API key

**Database Configuration** (Required):
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://username:password@hostname:5432/database_name`
  - Get free database from: neon.tech, supabase.com, or railway.app

**GitHub Integration** (Required):
- `GITHUB_TOKEN`: Your GitHub personal access token

**Application Settings**:
- `NODE_ENV`: `production`
- `PORT`: `7860`

## Step 4: Deploy and Test

After uploading files and configuring variables:
1. Your Space will automatically build and deploy
2. Access your platform at: `https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-platform`
3. Test GitHub repository sync
4. Verify AI-powered code analysis
5. Test custom GPT integration via API

Your deployed platform will provide:
- GitHub repository analysis using OpenAI
- Real-time code quality insights
- Security vulnerability detection
- Custom GPT integration endpoints
- Automated workflow creation