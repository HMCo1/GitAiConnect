# GitHub Personal Access Token Setup

## Step 1: Create Your Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Fill in these details:
   - **Note**: `AI Code Intelligence Platform`
   - **Expiration**: No expiration (recommended for continuous access)
   
4. **Select these permissions**:
   - `repo` - Access to repositories
   - `read:user` - Read user profile
   - `user:email` - Access to email address

5. Click "Generate token"
6. **Copy the token immediately** (it won't be shown again)

## Step 2: Test Your Token

You can verify your token works by running this command:
```bash
curl -H "Authorization: token YOUR_TOKEN_HERE" https://api.github.com/user
```

This should return your GitHub profile information.

## What This Token Enables

With your GitHub token, the platform can:
- Import your repositories automatically
- Analyze code files for quality and security
- Track commits and changes
- Generate insights about your codebase
- Set up automated workflows

## Security Note

Keep your token secure - it provides access to your GitHub repositories. Only use it with trusted applications like this AI Code Intelligence Platform.