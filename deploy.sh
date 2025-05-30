#!/bin/bash

# Deployment script for Hugging Face Spaces
echo "Preparing deployment to Hugging Face Spaces..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - AI Code Intelligence Platform"
fi

# Add Hugging Face remote (replace with your actual Space URL)
echo "Setting up Hugging Face remote..."
echo "Please update the remote URL with your actual Hugging Face Space repository"
echo "git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME"

# Build the application
echo "Building application..."
npm run build

echo "Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Create a new Space on Hugging Face with Node.js SDK"
echo "2. Set the following secrets in your Space settings:"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - GITHUB_TOKEN: Your GitHub token (optional)"
echo "3. Push this repository to your Hugging Face Space"
echo "4. The app.py file will handle the Node.js startup automatically"