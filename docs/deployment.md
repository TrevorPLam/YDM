# YDM Deployment Guide

## Overview

This guide covers deploying the YDM (Nexus Digital) application to production environments. YDM is built as a monorepo using pnpm workspaces with separate API server and frontend applications.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Database      │
│   (React SPA)   │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│   Port 80       │    │   Port 23379    │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: 24.x or later
- **pnpm**: Latest version (see package.json engines)
- **PostgreSQL**: 14.x or later
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB available space

### Environment Variables

Required environment variables for production deployment:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# API Server
PORT=23379
BASE_PATH="/api"
NODE_ENV="production"

# Email Service (if using)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="username"
SMTP_PASS="password"
SMTP_FROM="noreply@example.com"

# Authentication
API_KEY="your-secure-api-key-here"

# Frontend
VITE_API_BASE_URL="https://your-domain.com/api"
```

## Deployment Options

### 1. Replit Autoscaling (Recommended)

YDM is optimized for Replit Autoscaling deployment with automatic scaling.

#### Setup Steps

1. **Fork the Repository**
   ```bash
   # Fork the YDM repository to your Replit account
   ```

2. **Configure Environment Variables**
   - Go to your Replit's Secrets tab
   - Add all required environment variables from the prerequisites section

3. **Configure .replit File**
   
   The repository includes a pre-configured `.replit` file:
   ```toml
   modules = ["nodejs-24"]
   
   [deployment]
   router = "application"
   deploymentTarget = "autoscale"
   
   [deployment.postBuild]
   args = ["pnpm", "store", "prune"]
   env = { "CI" = "true" }
   
   [[ports]]
   localPort = 23379
   externalPort = 80
   ```

4. **Deploy**
   - Push changes to your fork
   - Replit will automatically build and deploy
   - Monitor deployment logs in the Replit console

#### Replit-Specific Features

- **Auto-scalaling**: Automatically scales based on traffic
- **Post-build optimization**: pnpm store pruning for smaller images
- **Development plugins**: Cartographer, Dev Banner, Runtime Error Modal
- **Health checks**: Built-in `/api/healthz` endpoint

### 2. Manual Docker Deployment

#### Dockerfile (API Server)

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/package.json ./

USER nextjs

EXPOSE 23379

CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "23379:23379"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ydm
      - NODE_ENV=production
      - PORT=23379
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:23379/api
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=ydm
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Traditional Server Deployment

#### Build Process

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build all packages
pnpm run build

# 3. Push database schema
pnpm --filter @workspace/db run push

# 4. Start API server
pnpm --filter @workspace/api-server run start

# 5. Serve frontend files
# Use nginx, apache, or any static file server
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /path/to/artifacts/nexus-digital/dist/public;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:23379;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

### 2. Database Creation

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ydm;
CREATE USER ydm_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ydm TO ydm_user;
\q
```

### 3. Schema Migration

```bash
# Navigate to project root
cd /path/to/ydm

# Push schema to database
pnpm --filter @workspace/db run push

# Verify tables were created
psql $DATABASE_URL -c "\dt"
```

## SSL/HTTPS Setup

### 1. Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo systemctl status certbot.timer
```

### 2. Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### 1. Application Logs

The API server uses structured logging with Pino:

```bash
# View logs in production
tail -f /var/log/ydm/api.log

# Log levels: error, warn, info, debug
LOG_LEVEL=info pnpm --filter @workspace/api-server run start
```

### 2. Health Checks

```bash
# API health check
curl https://your-domain.com/api/healthz

# Expected response
{"status":"healthy"}
```

### 3. Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Start API server with PM2
pm2 start artifacts/api-server/dist/index.js --name "ydm-api"

# Start frontend build process
pm2 start "pnpm --filter @workspace/nexus-digital run preview" --name "ydm-frontend"

# Save PM2 configuration
pm2 save

# Monitor processes
pm2 monit

# View logs
pm2 logs ydm-api
```

### 4. System Monitoring

```bash
# System resource monitoring
htop
iostat -x 1
free -h

# Database monitoring
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Log rotation
sudo nano /etc/logrotate.d/ydm
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use secure, randomly generated API keys
- Rotate secrets regularly
- Use different keys for development/staging/production

### 2. Database Security

```sql
-- Create read-only user for analytics
CREATE USER ydm_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE ydm TO ydm_readonly;
GRANT USAGE ON SCHEMA public TO ydm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ydm_readonly;
```

### 3. Network Security

```bash
# Firewall configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. Rate Limiting

The API includes built-in rate limiting. Configure additional limits in your reverse proxy:

```nginx
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:23379;
    }
}
```

## Backup Strategy

### 1. Database Backups

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/ydm"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ydm_backup_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL > $BACKUP_FILE

# Keep last 7 days of backups
find $BACKUP_DIR -name "ydm_backup_*.sql" -mtime +7 -delete

# Compress old backups
gzip $BACKUP_FILE
```

### 2. Automated Backups with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup_script.sh
```

### 3. Application Backups

```bash
# Backup built artifacts
tar -czf ydm_app_backup_$(date +%Y%m%d).tar.gz artifacts/*/dist/
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. Port Already in Use

```bash
# Find process using port
sudo lsof -i :23379

# Kill process
sudo kill -9 <PID>
```

#### 3. Memory Issues

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter @workspace/api-server run start
```

#### 4. Build Failures

```bash
# Clear caches
pnpm store prune
rm -rf node_modules
pnpm install --frozen-lockfile

# Check TypeScript errors
pnpm run typecheck
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM blog_posts WHERE status = 'published';
```

#### 2. Application Optimization

```bash
# Enable production optimizations
NODE_ENV=production

# Use cluster mode for multiple CPU cores
pm2 start artifacts/api-server/dist/index.js --name "ydm-api" -i max
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database created and schema pushed
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] Backup strategy implemented
- [ ] Monitoring configured

### Post-Deployment

- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] Email service tested
- [ ] API endpoints tested
- [ ] Frontend loading correctly
- [ ] Error monitoring active
- [ ] Performance benchmarks recorded

### Ongoing Maintenance

- [ ] Daily backups verified
- [ ] SSL certificates monitored
- [ ] Log rotation working
- [ ] Security updates applied
- [ ] Performance metrics monitored
- [ ] Database maintenance performed

## Support

For deployment issues:
- Check the troubleshooting section above
- Review application logs for error messages
- Verify all prerequisites are met
- Contact support: support@your-domain.com
