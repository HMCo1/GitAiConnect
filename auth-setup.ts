import { Request, Response, NextFunction } from 'express';
import { storage } from './server/storage';

// Simple authentication middleware for demo purposes
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // For demo, create or get demo user
    let user = await storage.getUserByUsername('demo');
    
    if (!user) {
      user = await storage.createUser({
        username: 'demo',
        email: 'demo@example.com',
        githubId: undefined,
        githubToken: undefined,
        avatar: undefined
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// GitHub OAuth configuration
export const githubAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI || '/auth/github/callback'
};

// GitHub token validation
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}