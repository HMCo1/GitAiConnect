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
        # Install dependencies
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], check=True)
        
        # Push database schema
        print("Setting up database...")
        subprocess.run(["npm", "run", "db:push"], check=True)
        
        # Start the application
        print("Starting application...")
        subprocess.run(["npm", "run", "dev"], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()