# DevDeck Production Deployment Guide

This comprehensive guide covers deploying DevDeck to production with proper monitoring, SSL configuration, and troubleshooting.

## Current Production Status

### Frontend (Vercel)
- **URL**: `https://devdeck-rho.vercel.app`
- **Status**: ✅ Active and accessible
- **SSL**: ✅ Automatic SSL via Vercel

### Backend (Render)
- **URL**: `https://devdeck-1.onrender.com`
- **Status**: ❌ Currently returning 502 errors
- **SSL**: ✅ SSL configured but service unavailable

## Quick Fix for Current Issues

### 1. Backend Service Recovery (Render)

The backend is currently down. Here's how to fix it:

#### Check Render Service Status
1. Log into your Render dashboard
2. Navigate to your DevDeck backend service
3. Check the **Events** tab for error messages
4. Look at **Logs** for detailed error information

#### Common Issues and Solutions

**Issue: Build Failures**
```bash
# Solution: Ensure correct build settings
Build Command: npm install
Start Command: node src/server.js
Root Directory: backend
```

**Issue: Environment Variables Missing**
```bash
# Required environment variables in Render:
MONGODB_URI=mongodb+srv://aayushim33:aayushim33@devdeck-cluster.rtc1ooo.mongodb.net/?retryWrites=true&w=majority&appName=devdeck-cluster
JWT_SECRET=59e8c4fb2bbbd095a794bf4a31fd1ed8
FRONTEND_URL=https://devdeck-rho.vercel.app
GITHUB_CLIENT_ID=Ov23lipDqie7WLlhzbdc
GITHUB_CLIENT_SECRET=87ad4f44f3415626cb20fa4594489a6eed3a7e2c
NODE_ENV=production
PORT=5000
```

**Issue: Database Connection**
- Verify MongoDB URI is correct
- Check if MongoDB Atlas cluster is running
- Ensure IP whitelist includes Render's IPs (or use 0.0.0.0/0 for all IPs)

#### Manual Redeploy
1. In Render dashboard, go to your service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Monitor the build logs for errors

### 2. Frontend Configuration Update

Update the frontend to point to the correct backend URL:

#### Vercel Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://devdeck-1.onrender.com
NEXTAUTH_URL=https://devdeck-rho.vercel.app
NEXTAUTH_SECRET=e5813356b6fe5384eb35d30a146ce-f57844fd7fe42ea9061304a3b56bb23c0e9
GITHUB_ID=Ov23lipDqie7WLlhzbdc
GITHUB_SECRET=87ad4f44f3415626cb20fa4594489a6eed3a7e2c
```

## Complete Production Setup

### Step 1: Backend Deployment (Render)

#### 1.1 Create New Service (if needed)
1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Configure the following settings:

```yaml
Name: devdeck-backend
Environment: Node
Build Command: npm install
Start Command: node src/server.js
Root Directory: backend
Plan: Free (or paid for better performance)
```

#### 1.2 Environment Variables
Add these environment variables in Render:

```bash
# Core Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://aayushim33:aayushim33@devdeck-cluster.rtc1ooo.mongodb.net/?retryWrites=true&w=majority&appName=devdeck-cluster

# Authentication
JWT_SECRET=59e8c4fb2bbbd095a794bf4a31fd1ed8
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=https://devdeck-rho.vercel.app

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23lipDqie7WLlhzbdc
GITHUB_CLIENT_SECRET=87ad4f44f3415626cb20fa4594489a6eed3a7e2c

# NextAuth
NEXTAUTH_SECRET=e5813356b6fe5384eb35d30a146ce-f57844fd7fe42ea9061304a3b56bb23c0e9
NEXTAUTH_URL=https://devdeck-rho.vercel.app

# Optional: Redis for caching (if you have Redis)
# REDIS_URL=your-redis-url

# Optional: Email service
# EMAIL_FROM=noreply@devdeck.com
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

#### 1.3 Health Check Configuration
Render will automatically health check your `/health` endpoint.

### Step 2: Frontend Deployment (Vercel)

#### 2.1 Environment Variables
Add these in Vercel dashboard:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://devdeck-1.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=https://devdeck-rho.vercel.app
NEXTAUTH_SECRET=e5813356b6fe5384eb35d30a146ce-f57844fd7fe42ea9061304a3b56bb23c0e9

# GitHub OAuth
GITHUB_ID=Ov23lipDqie7WLlhzbdc
GITHUB_SECRET=87ad4f44f3415626cb20fa4594489a6eed3a7e2c

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### 2.2 Build Configuration
Vercel should auto-detect Next.js. Verify these settings:

```yaml
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: frontend
```

### Step 3: Database Setup (MongoDB Atlas)

#### 3.1 Verify Cluster Status
1. Log into MongoDB Atlas
2. Check if your cluster `devdeck-cluster` is running
3. Verify connection string is correct

#### 3.2 Network Access
1. Go to **Network Access** in MongoDB Atlas
2. Add IP addresses:
   - `0.0.0.0/0` (allow all - for development)
   - Or specific Render IP ranges for production

#### 3.3 Database User
Ensure the user `aayushim33` has proper permissions:
- Read and write to any database
- Or specific permissions for your database

## Production Monitoring Setup

### 1. Using the Production Monitor Script

```bash
# Single health check
PRODUCTION_URL=https://devdeck-1.onrender.com bash scripts/production-monitor.sh check

# Continuous monitoring (every 5 minutes)
PRODUCTION_URL=https://devdeck-1.onrender.com bash scripts/production-monitor.sh monitor

# With Slack alerts
PRODUCTION_URL=https://devdeck-1.onrender.com ALERT_WEBHOOK=https://hooks.slack.com/your-webhook bash scripts/production-monitor.sh monitor
```

### 2. API Testing

```bash
# Test production API
PRODUCTION_URL=https://devdeck-1.onrender.com TEST_EMAIL=test@example.com bash scripts/test-production-api.sh
```

### 3. Setting Up Alerts

#### Slack Webhook Setup
1. Create a Slack app in your workspace
2. Add incoming webhook
3. Use the webhook URL in monitoring scripts

#### Email Alerts (Alternative)
Modify the monitoring script to send email alerts:

```bash
# Add to production-monitor.sh
send_email_alert() {
    local message="$1"
    echo "$message" | mail -s "DevDeck Alert" admin@yourcompany.com
}
```

## Performance Optimization

### 1. Backend Optimizations

#### Enable Compression
Already configured in `utils/performance.js`

#### Database Indexing
```javascript
// Add to your models for better query performance
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  // ... other fields
});

// Compound indexes for complex queries
userSchema.index({ email: 1, createdAt: -1 });
```

#### Caching with Redis
```bash
# Add Redis to Render (paid plan required)
REDIS_URL=redis://your-redis-instance
```

### 2. Frontend Optimizations

#### Image Optimization
```javascript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/profile.jpg"
  alt="Profile"
  width={500}
  height={300}
  priority
/>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze
```

## Security Hardening

### 1. Environment Variables Security
- Never commit `.env` files
- Use different secrets for different environments
- Rotate secrets regularly

### 2. CORS Configuration
```javascript
// In backend server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Rate Limiting
Already configured in `utils/performance.js`

### 4. Security Headers
```javascript
// Additional security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.github.com']
    }
  }
}));
```

## Troubleshooting Guide

### Common Issues

#### 1. 502 Bad Gateway (Current Issue)
**Symptoms**: Backend returns 502 errors
**Causes**:
- Service not running
- Build failed
- Environment variables missing
- Database connection failed

**Solutions**:
1. Check Render service logs
2. Verify environment variables
3. Test database connection
4. Redeploy service

#### 2. CORS Errors
**Symptoms**: Frontend can't connect to backend
**Solutions**:
1. Verify `FRONTEND_URL` in backend environment
2. Check CORS configuration
3. Ensure URLs match exactly (no trailing slashes)

#### 3. Authentication Issues
**Symptoms**: Login/signup not working
**Solutions**:
1. Verify JWT secrets match
2. Check GitHub OAuth configuration
3. Ensure NextAuth URL is correct

#### 4. Database Connection Issues
**Symptoms**: Database operations fail
**Solutions**:
1. Check MongoDB Atlas cluster status
2. Verify connection string
3. Check network access settings
4. Test connection from local environment

### Debugging Commands

```bash
# Test backend health
curl https://devdeck-1.onrender.com/health

# Test database connection
curl https://devdeck-1.onrender.com/health | jq '.database'

# Test frontend
curl -I https://devdeck-rho.vercel.app

# Check SSL certificate
echo | openssl s_client -servername devdeck-1.onrender.com -connect devdeck-1.onrender.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Maintenance Tasks

### Daily
- Check service health
- Monitor error logs
- Verify database connectivity

### Weekly
- Review performance metrics
- Check SSL certificate status
- Update dependencies (if needed)

### Monthly
- Security audit
- Performance optimization review
- Backup verification
- Cost optimization review

## Scaling Considerations

### When to Scale
- Response times > 2 seconds
- Memory usage > 80%
- CPU usage > 80%
- Error rate > 1%

### Scaling Options

#### Render
- Upgrade to paid plans for better performance
- Enable auto-scaling
- Add Redis for caching

#### Vercel
- Upgrade for better build performance
- Use Edge Functions for API routes
- Implement ISR (Incremental Static Regeneration)

#### Database
- Upgrade MongoDB Atlas tier
- Add read replicas
- Implement database sharding

## Backup and Recovery

### Database Backups
```bash
# MongoDB Atlas automatic backups are enabled
# Manual backup
mongodump --uri="mongodb+srv://aayushim33:aayushim33@devdeck-cluster.rtc1ooo.mongodb.net/devdeck"
```

### Code Backups
- GitHub repository (primary)
- Regular commits and tags
- Environment variable backups (securely stored)

### Recovery Procedures
1. Restore from GitHub
2. Redeploy to Render/Vercel
3. Restore database from backup
4. Update environment variables
5. Test all functionality

## Support and Documentation

### Internal Documentation
- API documentation: `/docs/api-documentation.md`
- Environment variables: `/docs/environment-variables.md`
- Testing guide: `/docs/testing-guide.md`

### External Resources
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Getting Help
1. Check service status pages
2. Review error logs
3. Consult documentation
4. Contact platform support if needed

This guide should help you get DevDeck running smoothly in production. The key immediate action is to fix the backend service on Render by checking the logs and ensuring all environment variables are properly configured.