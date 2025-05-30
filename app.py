"""
Hugging Face Spaces configuration for Node.js application
This file enables the Node.js app to run on Hugging Face Spaces
"""

import subprocess
import os
import sys

def main():
    """Start the Node.js application"""
    try:
        # Set environment variables for production
        os.environ['NODE_ENV'] = 'production'
        os.environ['PORT'] = '7860'
        
        # Install dependencies
        print("Installing dependencies...")
        subprocess.run(["npm", "ci"], check=True)
        
        # Build the application
        print("Building application...")
        subprocess.run(["npm", "run", "build"], check=True)
        
        # Push database schema if DATABASE_URL is available
        if os.environ.get('DATABASE_URL'):
            print("Setting up database...")
            subprocess.run(["npm", "run", "db:push"], check=True)
        else:
            print("Warning: DATABASE_URL not set, skipping database setup")
        
        # Start the application
        print("Starting application...")
        subprocess.run(["npm", "start"], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()