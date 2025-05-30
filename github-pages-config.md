# GitHub Pages Frontend + Hugging Face Backend Setup

## Architecture Overview

- **Frontend**: Hosted on GitHub Pages (static site)
- **Backend**: Hosted on Hugging Face Spaces (API server)
- **Integration**: Frontend connects to Hugging Face backend via API calls

## Step 1: Deploy Backend to Hugging Face Spaces

1. Create Space at: https://huggingface.co/new-space
   - Name: `ai-code-intelligence-backend`
   - SDK: Docker
   - Upload backend files: `app.py`, `Dockerfile`, `server/`, `shared/`, etc.

2. Configure environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `DATABASE_URL`: PostgreSQL connection string

## Step 2: Configure Frontend for GitHub Pages

The frontend will be configured to connect to your Hugging Face backend API.

Backend URL will be: `https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-backend`

## Step 3: GitHub Repository Setup

1. Create new GitHub repository: `ai-code-intelligence-frontend`
2. Enable GitHub Pages in repository settings
3. Upload frontend build files

This setup provides:
- Static frontend hosting (free on GitHub Pages)
- Scalable backend with database (Hugging Face Spaces)
- Cross-origin API integration
- Admin control through your deployed backend