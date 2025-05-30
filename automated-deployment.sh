#!/bin/bash

# Automated deployment script for AI Code Intelligence Platform
# Frontend: GitHub Pages, Backend: Hugging Face Spaces

set -e

echo "🚀 Starting automated deployment..."

# Configuration
FRONTEND_REPO="ai-code-intelligence-frontend"
BACKEND_SPACE="ai-code-intelligence-backend"
HF_USERNAME="${HF_USERNAME:-your-username}"
GITHUB_USERNAME="${GITHUB_USERNAME:-your-username}"

# Step 1: Build frontend for GitHub Pages
echo "📦 Building frontend for GitHub Pages..."
npm run build

# Step 2: Prepare backend files for Hugging Face
echo "🔧 Preparing backend for Hugging Face Spaces..."
mkdir -p deployment/backend
cp -r server/ shared/ deployment/backend/
cp app.py Dockerfile package.json package-lock.json deployment/backend/
cp *.config.ts *.config.js deployment/backend/

# Step 3: Create deployment configurations
echo "⚙️  Creating deployment configurations..."

# GitHub Pages configuration
cat > dist/config.js << EOF
window.CONFIG = {
  API_URL: 'https://huggingface.co/spaces/${HF_USERNAME}/${BACKEND_SPACE}',
  WS_URL: 'wss://${HF_USERNAME}-${BACKEND_SPACE}.hf.space'
};
EOF

# Hugging Face Space configuration
cat > deployment/backend/README.md << EOF
---
title: AI Code Intelligence Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# AI Code Intelligence Platform Backend

Backend API for the AI Code Intelligence Platform with OpenAI and GitHub integration.

## Environment Variables

Configure these in your Space settings:
- OPENAI_API_KEY: Your OpenAI API key
- GITHUB_TOKEN: Your GitHub personal access token
- DATABASE_URL: PostgreSQL connection string
EOF

echo "✅ Automated deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Upload 'dist/' folder contents to GitHub Pages repository"
echo "2. Upload 'deployment/backend/' contents to Hugging Face Space"
echo "3. Configure environment variables in both platforms"
echo ""
echo "Frontend will be available at: https://${GITHUB_USERNAME}.github.io/${FRONTEND_REPO}/"
echo "Backend will be available at: https://huggingface.co/spaces/${HF_USERNAME}/${BACKEND_SPACE}"