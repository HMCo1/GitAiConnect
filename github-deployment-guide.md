
# GitHub Pages Deployment Guide

## Setup Instructions

### 1. Deploy Backend on Replit
First, deploy your backend on Replit:
1. Click the **Deploy** button in Replit
2. Choose **Autoscale Deployment** 
3. Configure environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GITHUB_TOKEN`: Your GitHub personal access token

### 2. Setup GitHub Repository
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Source: GitHub Actions
4. Configure repository secrets:
   - `REPLIT_API_URL`: Your Replit deployment URL (e.g., https://your-app.replit.app)
   - `REPLIT_WS_URL`: Your Replit WebSocket URL (e.g., wss://your-app.replit.app)

### 3. Configure CORS on Replit
Add your GitHub Pages domain to the CORS configuration in your Replit deployment.

### 4. Automatic Deployment
- Every push to the main branch will automatically deploy to GitHub Pages
- Frontend will be served from GitHub Pages
- Backend API calls will go to your Replit deployment

## URLs
- **Frontend**: `https://your-username.github.io/your-repo-name`
- **Backend**: `https://your-app.replit.app`

## Benefits of This Setup
- Frontend served via GitHub Pages (fast, free)
- Backend on Replit (scalable, persistent)
- Automatic CI/CD pipeline
- Separate environments for development and production
