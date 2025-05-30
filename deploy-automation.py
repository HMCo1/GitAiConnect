#!/usr/bin/env python3
"""
Complete automated deployment for AI Code Intelligence Platform
Handles GitHub Pages frontend + Hugging Face backend deployment
"""

import os
import shutil
import subprocess
import json
from pathlib import Path

class AutoDeployer:
    def __init__(self):
        self.project_root = Path(".")
        self.dist_dir = self.project_root / "dist"
        self.backend_dir = self.project_root / "deployment" / "backend"
        
    def setup_directories(self):
        """Create deployment directories"""
        print("Setting up deployment directories...")
        self.backend_dir.mkdir(parents=True, exist_ok=True)
        
    def build_frontend(self):
        """Build frontend for GitHub Pages"""
        print("Building frontend...")
        
        # Build the frontend
        subprocess.run(["npm", "run", "build"], check=True)
        
        # Create configuration for GitHub Pages
        config_content = """
window.CONFIG = {
  API_URL: 'https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-backend',
  WS_URL: 'wss://YOUR_USERNAME-ai-code-intelligence-backend.hf.space'
};
"""
        with open(self.dist_dir / "config.js", "w") as f:
            f.write(config_content)
            
        # Update index.html to include config
        index_path = self.dist_dir / "index.html"
        if index_path.exists():
            content = index_path.read_text()
            if "<script src=\"/config.js\"></script>" not in content:
                content = content.replace("<head>", "<head>\n  <script src=\"/config.js\"></script>")
                index_path.write_text(content)
    
    def prepare_backend(self):
        """Prepare backend for Hugging Face Spaces"""
        print("Preparing backend...")
        
        # Copy backend files
        backend_files = [
            "server/",
            "shared/", 
            "app.py",
            "Dockerfile",
            "package.json",
            "package-lock.json",
            "drizzle.config.ts",
            "tsconfig.json",
            "tailwind.config.ts",
            "postcss.config.js",
            "vite.config.ts"
        ]
        
        for item in backend_files:
            src = self.project_root / item
            if src.exists():
                if src.is_dir():
                    dst = self.backend_dir / item
                    if dst.exists():
                        shutil.rmtree(dst)
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, self.backend_dir / item)
        
        # Create Space README
        readme_content = """---
title: AI Code Intelligence Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# AI Code Intelligence Platform Backend

Comprehensive automation platform connecting OpenAI and GitHub APIs.

## Features
- AI-powered code analysis
- GitHub repository integration
- Real-time processing
- Custom GPT integration

## Environment Variables
Set these in your Space settings:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: Your GitHub personal access token  
- `DATABASE_URL`: PostgreSQL connection string
"""
        
        with open(self.backend_dir / "README.md", "w") as f:
            f.write(readme_content)
    
    def create_deployment_instructions(self):
        """Create step-by-step deployment instructions"""
        instructions = """
# Automated Deployment Complete

## Frontend (GitHub Pages)
1. Create repository: ai-code-intelligence-frontend
2. Upload contents of 'dist/' folder
3. Enable GitHub Pages in repository settings
4. Update config.js with your actual Hugging Face Space URL

## Backend (Hugging Face Spaces)  
1. Create Space: ai-code-intelligence-backend
2. Upload contents of 'deployment/backend/' folder
3. Add environment variables:
   - OPENAI_API_KEY: [Your OpenAI API key]
   - GITHUB_TOKEN: [Your GitHub personal access token]
   - DATABASE_URL: [PostgreSQL connection string]

## URLs
- Frontend: https://YOUR_USERNAME.github.io/ai-code-intelligence-frontend/
- Backend: https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-backend
- API: https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-backend/openapi.json

## Custom GPT Setup
Use the backend API URL in your custom GPT configuration for automated control.
"""
        
        with open("DEPLOYMENT_INSTRUCTIONS.md", "w") as f:
            f.write(instructions)
    
    def deploy(self):
        """Run complete automated deployment"""
        print("🚀 Starting automated deployment...")
        
        self.setup_directories()
        self.build_frontend()
        self.prepare_backend()
        self.create_deployment_instructions()
        
        print("✅ Deployment preparation complete!")
        print("📁 Frontend files ready in: dist/")
        print("📁 Backend files ready in: deployment/backend/")
        print("📋 See DEPLOYMENT_INSTRUCTIONS.md for next steps")

if __name__ == "__main__":
    deployer = AutoDeployer()
    deployer.deploy()