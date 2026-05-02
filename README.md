# YDM (Nexus Digital)

A modern full-stack application built with React, Express, and PostgreSQL, deployed on Replit Autoscaling. This project demonstrates API-first development with comprehensive documentation and type safety.

## 🚀 Quick Start

Get the application running in minutes on Replit:

1. **Fork the Repository**
   - Click the "Fork" button at the top
   - Wait for the fork to complete

2. **Configure Environment Variables**
   - Go to your fork's "Secrets" tab
   - Add the required environment variables (see [Environment Setup](#environment-setup))

3. **Deploy**
   - Push any changes to trigger deployment
   - The application will be automatically built and deployed

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Contact Forms**: Submit and manage contact inquiries with email notifications
- **Newsletter Management**: Subscribe users with duplicate prevention
- **Industry Data**: Categorized business sectors with search and pagination
- **Blog Management**: Full CRUD operations with authentication
- **Responsive Design**: Mobile-first UI with modern glass morphism effects

### Technical Features
- **API-First Development**: OpenAPI 3.1.0 specification with code generation
- **Type Safety**: End-to-end TypeScript from database to frontend
- **Monorepo Architecture**: pnpm workspaces with shared packages
- **Auto-Scaling**: Replit Autoscaling deployment
- **Security**: API key authentication, rate limiting, input validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Database      │
│   React SPA     │◄──►│   Express.js    │◄──►│   PostgreSQL    │
│   Vite + TS     │    │   ESM + esbuild │    │   Drizzle ORM   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monorepo Structure

```
ydm/
├── artifacts/                    # Deployable applications
│   ├── api-server/             # Express.js backend
│   ├── nexus-digital/          # React frontend
│   └── mockup-sandbox/         # Component preview system
├── lib/                        # Shared libraries
│   ├── api-spec/               # OpenAPI specification
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Database models and migrations
├── docs/                       # Documentation
│   ├── api.md                  # API usage guide
│   ├── deployment.md           # Deployment instructions
│   └── glossary.md             # Domain terminology
└── scripts/                    # Build automation
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - UI framework with latest features
- **TypeScript 5.9.2** - Type safety and developer experience
- **Vite 7.3.2** - Fast development and build tool
- **Tailwind CSS 4.1.14** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Wouter** - Lightweight routing
- **TanStack Query v5** - Server state management
- **Framer Motion 11.0.0** - Animations and interactions

### Backend
- **Express 5** - Web framework with ESM support
- **esbuild 0.27.3** - Fast JavaScript bundler
- **Pino** - Structured logging
- **Zod 3.25.76** - Runtime validation
- **Drizzle ORM 0.45.2** - Type-safe database access

### Database
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe query builder
- **Database migrations** - Schema versioning

### Development Tools
- **pnpm workspaces** - Monorepo package management
- **Orval 8.5.2** - OpenAPI code generation
- **TypeScript Project References** - Incremental builds
- **Replit Autoscaling** - Deployment platform

## ⚙️ Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# API Server
PORT=23379
BASE_PATH="/api"
NODE_ENV="development"

# Email Service
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="username"
SMTP_PASS="password"
SMTP_FROM="noreply@example.com"

# Authentication
API_KEY="your-secure-api-key-here"

# Frontend
VITE_API_BASE_URL="http://localhost:23379/api"
```

### Database Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create Database**
   ```bash
   createdb ydm
   ```

3. **Push Schema**
   ```bash
   pnpm --filter @workspace/db run push
   ```

## 🛠️ Development

### Prerequisites

- Node.js 24.x or later
- pnpm (latest version)
- PostgreSQL 14.x or later

### Getting Started

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/ydm.git
   cd ydm
   ```

2. **Install Dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   pnpm --filter @workspace/db run push
   ```

5. **Start Development Servers**
   ```bash
   # Start API server (port 23379)
   pnpm --filter @workspace/api-server run dev
   
   # Start frontend (port 3000)
   pnpm --filter @workspace/nexus-digital run dev
   ```

### Common Commands

```bash
# Type check all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Generate API clients
pnpm --filter @workspace/api-spec run codegen

# Run tests
pnpm test

# Database operations
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run studio  # Drizzle Studio
```

### Code Generation Workflow

1. **Update OpenAPI Spec**
   - Edit `lib/api-spec/openapi.yaml`
   - Add new endpoints or schemas

2. **Generate Code**
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```

3. **Use Generated Types**
   - Import hooks from `@workspace/api-client-react`
   - Import schemas from `@workspace/api-zod`

## 📚 API Documentation

### Quick API Reference

**Base URL:** `http://localhost:23379/api` (development)  
**Base URL:** `https://your-domain.com/api` (production)

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/healthz` | Health check | None |
| POST | `/contacts` | Submit contact form | None |
| POST | `/newsletter` | Subscribe to newsletter | None |
| GET | `/industries` | List industries | None |
| GET | `/industries/{slug}` | Get industry by slug | None |
| GET | `/blog/posts` | List blog posts | None |
| POST | `/blog/posts` | Create blog post | API Key |
| PUT | `/blog/posts/{slug}` | Update blog post | API Key |
| DELETE | `/blog/posts/{slug}` | Delete blog post | API Key |

### Full Documentation

- **[API Usage Guide](docs/api.md)** - Complete API documentation
- **[OpenAPI Specification](lib/api-spec/openapi.yaml)** - Raw API contract
- **[Domain Glossary](docs/glossary.md)** - Business terminology

### Code Examples

```javascript
// Submit contact form
const response = await fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'I need help with your services'
  })
});
```

```python
# Get industries with Python
import requests

response = requests.get('https://your-domain.com/api/industries')
industries = response.json()
```

## 🚀 Deployment

### Replit Autoscaling (Recommended)

1. **Fork the repository** to your Replit account
2. **Configure secrets** in the Replit Secrets tab
3. **Push changes** to trigger automatic deployment
4. **Monitor deployment** in the Replit console

### Manual Deployment

See the [Deployment Guide](docs/deployment.md) for detailed instructions on:
- Docker deployment
- Traditional server setup
- SSL/HTTPS configuration
- Monitoring and logging
- Backup strategies

### Environment-Specific URLs

| Environment | API URL | Frontend URL |
|-------------|---------|--------------|
| Development | `http://localhost:23379/api` | `http://localhost:3000` |
| Staging | `https://staging.your-domain.com/api` | `https://staging.your-domain.com` |
| Production | `https://your-domain.com/api` | `https://your-domain.com` |

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation

3. **Type Check**
   ```bash
   pnpm run typecheck
   ```

4. **Test**
   ```bash
   pnpm test
   ```

5. **Commit**
   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Use generated types from OpenAPI spec
- Write tests for new features

### API Changes

1. Update `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Implement backend changes
4. Update frontend to use new hooks
5. Add tests for new endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) folder
- **API Guide**: See [API Documentation](docs/api.md)
- **Deployment**: See [Deployment Guide](docs/deployment.md)
- **Issues**: Create an issue on GitHub

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check `DATABASE_URL` in `.env` |
| Build fails | Run `pnpm install --frozen-lockfile` |
| API not responding | Check if API server is running on port 23379 |
| Frontend not loading | Check if frontend is running on port 3000 |

### Contact

- **Email**: support@your-domain.com
- **Documentation**: https://docs.your-domain.com
- **Status Page**: https://status.your-domain.com

## 🗺️ Roadmap

### Version 0.2.0 (Planned)
- [ ] User authentication system
- [ ] Advanced blog features
- [ ] File upload support
- [ ] API analytics dashboard

### Version 0.3.0 (Future)
- [ ] Real-time notifications
- [ ] Advanced search
- [ ] Content management UI
- [ ] Multi-language support

## 📊 Project Status

- **Version**: 0.1.0
- **Status**: Production Ready
- **Last Updated**: January 2026
- **Maintainers**: YDM Development Team

---

**Built with ❤️ by the YDM team**
