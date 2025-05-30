"""
Automated deployment script for Hugging Face Spaces
"""
import subprocess
import os
import sys

def create_hf_space():
    """Create and deploy to Hugging Face Space"""
    
    # Your Hugging Face token
    hf_token = "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"
    
    print("Setting up Hugging Face CLI...")
    
    # Install huggingface_hub if not present
    try:
        subprocess.run(["pip", "install", "huggingface_hub"], check=True)
    except subprocess.CalledProcessError:
        print("Failed to install huggingface_hub")
        return False
    
    # Login to Hugging Face
    try:
        subprocess.run(["huggingface-cli", "login", "--token", hf_token], check=True)
        print("Successfully logged in to Hugging Face")
    except subprocess.CalledProcessError:
        print("Failed to login to Hugging Face")
        return False
    
    # Create space
    space_name = "ai-code-intelligence-platform"
    try:
        subprocess.run([
            "huggingface-cli", "repo", "create", 
            f"spaces/{space_name}",
            "--type", "space",
            "--space_sdk", "docker"
        ], check=True)
        print(f"Created Hugging Face Space: {space_name}")
    except subprocess.CalledProcessError:
        print("Space might already exist or creation failed")
    
    # Clone the space repository
    try:
        subprocess.run([
            "git", "clone", 
            f"https://huggingface.co/spaces/{space_name}",
            "hf_space"
        ], check=True)
    except subprocess.CalledProcessError:
        print("Failed to clone space repository")
        return False
    
    return True

def deploy_files():
    """Copy files to HF space and deploy"""
    
    print("Copying application files...")
    
    # Copy all necessary files
    files_to_copy = [
        "app.py",
        "Dockerfile", 
        "package.json",
        "package-lock.json",
        "README.md",
        "server/",
        "client/",
        "shared/",
        "vite.config.ts",
        "tsconfig.json",
        "tailwind.config.ts",
        "postcss.config.js",
        "components.json",
        "drizzle.config.ts"
    ]
    
    try:
        for item in files_to_copy:
            if os.path.exists(item):
                subprocess.run(["cp", "-r", item, "hf_space/"], check=True)
        
        # Change to space directory
        os.chdir("hf_space")
        
        # Add, commit and push
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Deploy AI Code Intelligence Platform"], check=True)
        subprocess.run(["git", "push"], check=True)
        
        print("Successfully deployed to Hugging Face Spaces!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Deployment failed: {e}")
        return False

if __name__ == "__main__":
    print("Starting Hugging Face Spaces deployment...")
    
    if create_hf_space():
        if deploy_files():
            print("Deployment completed successfully!")
            print("Your app will be available at: https://huggingface.co/spaces/ai-code-intelligence-platform")
        else:
            print("Deployment failed during file upload")
    else:
        print("Failed to create Hugging Face Space")