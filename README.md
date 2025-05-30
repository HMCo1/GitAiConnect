# AI Code Intelligence Platform

A comprehensive automation platform that connects OpenAI and GitHub APIs with advanced storage, real-time processing, and extensive third-party integrations.

## Features

🤖 **AI-Powered Code Analysis**
- Intelligent code quality assessment
- Security vulnerability detection
- Performance optimization suggestions
- Automated documentation generation

🔗 **GitHub Integration**
- Repository synchronization
- Real-time webhook processing
- Pull request analysis
- Commit tracking and insights

⚡ **Real-Time Processing**
- WebSocket connections for live updates
- Background analysis processing
- Instant notifications

📊 **Advanced Analytics**
- Code quality metrics
- Repository insights
- Activity tracking
- Performance dashboards

## Quick Start

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_token
```

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Initialize database: `npm run db:push`
5. Start development server: `npm run dev`

## Deployment

### Hugging Face Spaces

This application is configured for deployment on Hugging Face Spaces with Node.js runtime.

1. Create a new Space on Hugging Face
2. Select "Node.js" as the SDK
3. Upload this repository
4. Configure secrets in Space settings:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`

### GitHub Pages

For static deployment, build the application:

```bash
npm run build
```

The built files in `dist/` can be deployed to GitHub Pages or any static hosting service.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **AI Integration**: OpenAI GPT-4o for code analysis
- **Real-time**: WebSocket connections
- **Database**: PostgreSQL with Drizzle ORM

## API Endpoints

### Core Routes
- `GET /api/user` - Get current user
- `GET /api/repositories` - List repositories
- `POST /api/repositories/sync` - Sync from GitHub
- `POST /api/repositories/:id/analyze` - Start AI analysis

### Analysis Routes
- `GET /api/analyses/:id` - Get analysis results
- `GET /api/insights` - Get AI insights
- `PATCH /api/insights/:id` - Update insight status

### Real-time
- `WebSocket /ws` - Real-time updates and notifications

## Configuration

The application supports multiple deployment environments:

- **Development**: Full-featured with hot reload
- **Production**: Optimized build with static serving
- **Hugging Face**: Containerized deployment with environment secrets

## Security

- API key management through environment variables
- Secure GitHub token handling
- PostgreSQL with connection pooling
- WebSocket authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details