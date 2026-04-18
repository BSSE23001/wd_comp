# Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 12+ (local or cloud: Supabase, AWS RDS, Azure Database, etc.)
- Environment for hosting (Vercel, Railway, Heroku, Docker, AWS, etc.)

## Step 1: Prepare Production Environment Variables

Create a `.env.production` file or set environment variables in your hosting platform:

```env
# Production environment
NODE_ENV=production
PORT=5000

# Production Database (use connection pooling for scalability)
DATABASE_URL=postgresql://user:pass@pool.db.host:6543/dbname
DIRECT_URL=postgresql://user:pass@db.host:5432/dbname

# Generate new secrets for production (NEVER reuse dev secrets)
JWT_SECRET=your_production_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_production_refresh_secret_min_32_chars

# Advocate credentials (change from defaults!)
ADVOCATE_EMAIL=admin@fairgig.com
ADVOCATE_PASSWORD=ComplexPassword123!@#
```

## Step 2: Generate Secure Secrets

```bash
# Generate 32-character secrets for production
node -e "
const crypto = require('crypto');
console.log('JWT_SECRET:', crypto.randomBytes(32).toString('hex'));
console.log('JWT_REFRESH_SECRET:', crypto.randomBytes(32).toString('hex'));
"
```

## Step 3: Build for Production

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# The compiled code is now in ./dist
```

## Step 4: Deploy

### Option A: Railway (Recommended for Quick Setup)

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Add environment variables in Railway dashboard
4. Railway automatically detects Node.js and runs `pnpm start`

### Option B: Vercel (Not Recommended for Backend)

Vercel is better for frontend. For backend, use Railway, Render, or Heroku.

### Option C: Docker & Self-Hosted

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.0

# Copy workspace files
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build TypeScript
RUN pnpm build

# Expose port
EXPOSE 5000

# Start production server
CMD ["pnpm", "start"]
```

**Build and run:**
```bash
docker build -t fairgig-auth-service .
docker run -p 5000:5000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  fairgig-auth-service
```

### Option D: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create fairgig-auth-service

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL="..."
heroku config:set JWT_SECRET="..."
heroku config:set JWT_REFRESH_SECRET="..."
heroku config:set ADVOCATE_EMAIL="..."
heroku config:set ADVOCATE_PASSWORD="..."

# Deploy
git push heroku main
```

### Option E: AWS ECS + Fargate

1. Build Docker image
2. Push to ECR (Elastic Container Registry)
3. Create ECS task definition
4. Set environment variables in task definition
5. Create Fargate service

## Step 5: Database Setup

### PostgreSQL on Cloud

#### Supabase (Recommended)
1. Create project on supabase.com
2. Go to Project Settings → Database
3. Copy connection string
4. Use `DATABASE_URL` in `.env`

#### AWS RDS
1. Create RDS instance (PostgreSQL)
2. Get endpoint and credentials
3. Build connection string: `postgresql://user:pass@endpoint:5432/dbname`

#### Azure Database for PostgreSQL
1. Create server
2. Get connection string from Azure portal
3. Enable SSL/TLS

#### DigitalOcean Managed Database
1. Create PostgreSQL cluster
2. Copy connection parameters
3. Set in environment variables

### Initialize Database on Production

The app automatically runs `initializeDatabase()` on startup, which:
1. Connects to PostgreSQL
2. Runs `init.sql` to create schema
3. Creates indexes and triggers

No manual schema initialization needed!

## Step 6: Verify Deployment

### Health Check
```bash
curl https://your-app.com/health
```

### API Docs
```
https://your-app.com/api-docs
```

### Create First Advocate Account
```bash
curl -X POST https://your-app.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fairgig.com",
    "password": "ComplexPassword123!@#",
    "role": "ADVOCATE"
  }'
```

## Step 7: Production Security Checklist

- [ ] Change all JWT secrets from development values
- [ ] Use strong Advocate password (20+ characters, mixed case, numbers, symbols)
- [ ] Enable HTTPS/TLS (should be automatic on Railway, Vercel, Heroku)
- [ ] Set `NODE_ENV=production` to enable secure cookies
- [ ] Use connection pooling for database (set `max: 20` in db config)
- [ ] Enable CORS only for trusted domains
- [ ] Set up monitoring/logging
- [ ] Configure backups for PostgreSQL
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting (add middleware)
- [ ] Use domain with certificate (not IP)

## Step 8: Monitoring & Logging

### Recommended Tools
- **Error Tracking**: Sentry, Rollbar
- **Logging**: LogRocket, Datadog
- **Performance**: New Relic, DataDog
- **Uptime**: UptimeRobot, Pingdom

### Basic Logging

```bash
# View logs on Railway
railway logs

# View logs on Heroku
heroku logs --tail

# Docker logs
docker logs -f container_id
```

## Step 9: Scaling Considerations

### Database Optimization
- Enable connection pooling (PgBouncer, Supabase pooling)
- Add indexes (already in init.sql)
- Monitor slow queries

### Application Optimization
- Use load balancer for multiple instances
- Cache JWT secret in memory (not re-reading from env)
- Consider Redis for session storage (future enhancement)

### Code Changes for Scaling
```typescript
// Current: Simple pool
const pool = new Pool({ max: 20 });

// Scaled: With monitoring
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Add client error handler
  on: {
    error: (err) => {
      console.error('Pool error:', err);
      // Send to monitoring service
    }
  }
});
```

## Step 10: Disaster Recovery

### Database Backups

#### Supabase
- Automatic daily backups included
- Manual backups available in dashboard

#### AWS RDS
- Enable automated backups (retention 7+ days)
- Create manual snapshots before major changes

#### Manual Backup
```bash
# Export database
pg_dump postgresql://user:pass@host/db > backup.sql

# Restore from backup
psql postgresql://user:pass@host/db < backup.sql
```

### Data Migration

If you need to migrate to a different database:
1. Create backup on old database
2. Restore to new database
3. Update DATABASE_URL
4. Test thoroughly
5. Monitor for issues

## Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env |
| Database connection timeout | Check DATABASE_URL, firewall rules |
| Module not found | Run `pnpm install` before building |
| Memory exceeded | Increase Docker memory limit or host resources |
| Swagger UI not loading | Check that swagger paths are correct in index.ts |

## Performance Monitoring Query

```bash
# Check request rate
curl -s https://your-app.com/api/users \
  -H "Authorization: Bearer {token}" \
  -w "Response time: %{time_total}s\n"
```

## SSL/TLS Certificate

Most modern hosts provide free SSL/TLS (Railway, Vercel, Heroku):
- Railway: Automatic with custom domain
- Heroku: Free with herokuapp.com, auto with custom domain + ACM
- Self-hosted: Use Let's Encrypt + Certbot

## Environment-Specific Features

### Development
- Hot reload with `pnpm dev`
- Detailed error messages
- Swagger UI enabled
- Cookies not secure

### Production
- Compiled code only
- Limited error details (prevent info leakage)
- Swagger UI still accessible (can disable if desired)
- Cookies are secure + HttpOnly

## Next Steps After Deployment

1. **Front-end Integration**: Connect your React/Vue app to deployed API
2. **Email Verification**: Add email confirmation flow (future feature)
3. **2FA**: Implement two-factor authentication (future feature)
4. **Social Login**: Add OAuth providers (future feature)
5. **Admin Dashboard**: Build Advocate management UI

## Support & Debugging

### Enable Debug Logging
```typescript
// In src/db/index.ts
const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  console.log('Query:', text, params); // Log queries
  // ...
};
```

### Check Database Connection
```bash
# From your host
psql -U user -h host -d database

# Test connection string
node -e "
const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log('Connected!', res.rows[0]);
  pool.end();
});
"
```

## Rollback Plan

If something goes wrong in production:

1. Check logs for errors
2. Revert to last working commit
3. Rebuild and redeploy
4. Verify database still intact

```bash
# Quick rollback
git revert HEAD
git push
```

Good luck deploying! 🚀
