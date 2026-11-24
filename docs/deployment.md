# Deployment Guide

Complete guide for deploying IVY LMS to production.

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js 20+** installed
- **PostgreSQL 14+** database provisioned
- **Cloudinary account** (for file uploads)
- **Auth0 account** (for OAuth)
- **Domain name** (for HTTPS)

---

## Environment Variables

Create a `.env.production` file with production values:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/ivy_lms"
DIRECT_URL="postgresql://user:pass@host:5432/ivy_lms"

# Authentication
JWT_SECRET="your-super-secret-production-key-min-32-chars"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Auth0
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="https://your-domain.com"
AUTH0_ISSUER_BASE_URL="https://your-auth0-domain.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Ollama (optional - for AI grading)
OLLAMA_URL="http://your-ollama-server:11434"
OLLAMA_MODEL="llama3.2"
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your Git repository

2. **Configure Environment Variables**
   - Add all variables from `.env.production`
   - Set `NODE_ENV=production`

3. **Database Connection**
   - Use a PostgreSQL provider (Neon, Supabase, Railway)
   - Add `DATABASE_URL` to Vercel environment

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "PRISMA_GENERATE": "true"
  }
}
```

---

### Option 2: Docker Deployment

#### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ivy_lms
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ivy_lms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Build and Run

```bash
# Build the image
docker-compose build

# Run migrations
docker-compose run --rm app npx prisma migrate deploy

# Start services
docker-compose up -d
```

---

### Option 3: Traditional Server (VPS/Cloud)

#### Prerequisites

- Ubuntu 22.04+ server
- Nginx reverse proxy
- PM2 process manager
- SSL certificate (Let's Encrypt)

#### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/DwaftPainter/IVY-LMS
   cd IVY-LMS
   ```

2. **Install Dependencies**
   ```bash
   npm ci
   npx prisma generate
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "ivy-lms" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**

   ```nginx
   # /etc/nginx/sites-available/ivy-lms
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable SSL**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## Database Migration

### Production Migration

```bash
# Set production environment
export DATABASE_URL="your-production-db-url"

# Deploy migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### Rollback (if needed)

```bash
# Reset to specific migration
npx prisma migrate resolve --rolled-back migration_name

# Apply previous migration
npx prisma migrate deploy
```

---

## Post-Deployment Checklist

### Security

- [ ] JWT_SECRET is unique and complex
- [ ] HTTPS is enabled
- [ ] Secure cookie settings enabled
- [ ] Auth0 credentials are production-ready
- [ ] Database connection uses SSL
- [ ] Environment variables are not exposed

### Performance

- [ ] Turbopack build completes successfully
- [ ] Database indexes are created
- [ ] Static assets are served from CDN
- [ ] Images are optimized
- [ ] API routes have rate limiting

### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] Analytics enabled
- [ ] Health check endpoint responding
- [ ] Database connection pool monitored

### SEO

- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Meta tags populated
- [ ] OG tags for social sharing

---

## Health Checks

### API Health Check

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      },
      { status: 503 }
    );
  }
}
```

---

## Monitoring

### Log Management

View logs with PM2:
```bash
pm2 logs ivy-lms
```

Or with Docker:
```bash
docker-compose logs -f app
```

### Database Monitoring

Monitor connection pool:
```sql
SELECT 
  count(*), 
  state 
FROM pg_stat_activity 
WHERE datname = 'ivy_lms' 
GROUP BY state;
```

---

## Backup Strategy

### Database Backups

Automated daily backups:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/ivy_lms_$DATE.sql
gzip backups/ivy_lms_$DATE.sql

# Keep only last 7 days
find backups -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Build Failures

**Problem**: `prisma generate` not running

**Solution**: Add to postinstall in package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Errors

**Problem**: `connection refused`

**Solution**: 
- Verify DATABASE_URL format
- Check firewall rules
- Ensure database accepts external connections

### Memory Issues

**Problem**: Build process runs out of memory

**Solution**:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Static Files Not Found

**Problem**: 404 on static assets

**Solution**: Verify `public` folder is included in build output.

---

## Scaling

### Horizontal Scaling

For multiple instances:

1. Use external session store (Redis)
2. Configure load balancer
3. Enable database connection pooling
4. Use shared file storage (S3/Cloudinary)

### Database Read Replicas

Configure Prisma for read replicas:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
