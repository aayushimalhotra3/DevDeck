# DevDeck Production Deployment Guide 🚀

## Pre-Deployment Checklist

### 1. Environment Configuration ✅

#### Frontend Environment Variables
```bash
# Production Frontend (.env.production)
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.yourdomain.com
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
```

#### Backend Environment Variables
```bash
# Production Backend (.env.production)
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devdeck

# Security
JWT_SECRET=your_super_secure_jwt_secret_256_bits
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_256_bits
SESSION_SECRET=your_super_secure_session_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/github/callback

# Rate Limiting (Production Values)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=warn

# Optional Services
REDIS_URL=redis://your-redis-instance
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
```

### 2. GitHub OAuth App Configuration

1. **Create Production OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App with:
     - Application name: "DevDeck Production"
     - Homepage URL: `https://yourdomain.com`
     - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

2. **Update Environment Variables**:
   - Copy Client ID and Client Secret to both frontend and backend env files

### 3. Database Setup

#### MongoDB Atlas (Recommended)
```bash
# 1. Create MongoDB Atlas cluster
# 2. Create database user
# 3. Whitelist IP addresses (0.0.0.0/0 for cloud deployment)
# 4. Get connection string
# 5. Update MONGODB_URI in backend environment
```

#### Self-Hosted MongoDB
```bash
# Ensure MongoDB is secured with authentication
# Configure replica set for production
# Set up regular backups
# Monitor performance and logs
```

### 4. Security Hardening

#### SSL/TLS Configuration
```bash
# Ensure HTTPS is enabled
# Use Let's Encrypt for free SSL certificates
# Configure HSTS headers
# Set up proper CORS policies
```

#### Security Headers (Already implemented)
- Content Security Policy (CSP)
- Cross-Origin-Opener-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Rate limiting

## Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
```bash
# 1. Connect GitHub repository to Vercel
# 2. Set environment variables in Vercel dashboard
# 3. Configure build settings:
#    - Framework: Next.js
#    - Build Command: npm run build
#    - Output Directory: .next
# 4. Deploy
```

#### Backend (Railway)
```bash
# 1. Connect GitHub repository to Railway
# 2. Set environment variables in Railway dashboard
# 3. Configure:
#    - Start Command: npm start
#    - Port: 5000
# 4. Deploy
```

### Option 2: Docker Deployment

#### Using Docker Compose
```bash
# 1. Update docker-compose.yml for production
# 2. Set environment variables
# 3. Deploy:
docker-compose -f docker-compose.prod.yml up -d
```

#### Individual Container Deployment
```bash
# Build images
docker build -t devdeck-frontend ./frontend
docker build -t devdeck-backend ./backend

# Run containers
docker run -d --name devdeck-frontend -p 3000:3000 devdeck-frontend
docker run -d --name devdeck-backend -p 5000:5000 devdeck-backend
```

### Option 3: Traditional VPS Deployment

#### Server Setup
```bash
# 1. Set up Ubuntu/CentOS server
# 2. Install Node.js, MongoDB, Nginx
# 3. Configure firewall
# 4. Set up SSL certificates
# 5. Configure reverse proxy
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Verification

### 1. Health Checks
```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend accessibility
curl https://yourdomain.com

# Authentication flow
curl https://api.yourdomain.com/auth/github
```

### 2. Functionality Tests
- [ ] User registration/login
- [ ] GitHub OAuth flow
- [ ] Portfolio creation/editing
- [ ] GitHub repository import
- [ ] Portfolio publishing
- [ ] Public portfolio viewing
- [ ] Real-time updates
- [ ] Mobile responsiveness

### 3. Performance Monitoring
```bash
# Set up monitoring tools:
# - Application performance monitoring (APM)
# - Error tracking (Sentry)
# - Uptime monitoring
# - Database performance monitoring
```

## Maintenance & Monitoring

### 1. Backup Strategy
```bash
# Database backups
# - Daily automated backups
# - Weekly full backups
# - Monthly archive backups
# - Test restore procedures

# Code backups
# - Git repository backups
# - Environment configuration backups
```

### 2. Monitoring Setup
```bash
# Application metrics
# - Response times
# - Error rates
# - User activity
# - Resource usage

# Infrastructure metrics
# - Server performance
# - Database performance
# - Network latency
# - Storage usage
```

### 3. Update Procedures
```bash
# 1. Test updates in staging environment
# 2. Create database backup
# 3. Deploy during low-traffic periods
# 4. Monitor for issues post-deployment
# 5. Have rollback plan ready
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```bash
# Check FRONTEND_URL in backend environment
# Verify CORS configuration in server.js
# Ensure proper domain configuration
```

#### 2. Authentication Issues
```bash
# Verify GitHub OAuth app configuration
# Check callback URLs
# Validate JWT secrets
# Review session configuration
```

#### 3. Database Connection Issues
```bash
# Verify MongoDB URI
# Check network connectivity
# Review authentication credentials
# Monitor connection pool
```

#### 4. Performance Issues
```bash
# Monitor database queries
# Check memory usage
# Review caching strategy
# Optimize API endpoints
```

## Security Considerations

### 1. Regular Security Updates
- Keep dependencies updated
- Monitor security advisories
- Perform regular security audits
- Update SSL certificates

### 2. Access Control
- Use strong passwords
- Enable two-factor authentication
- Limit server access
- Regular access reviews

### 3. Data Protection
- Encrypt sensitive data
- Secure API endpoints
- Implement proper validation
- Regular security testing

## Support & Documentation

- **GitHub Repository**: [Your Repository URL]
- **Documentation**: [Your Documentation URL]
- **Support Email**: support@yourdomain.com
- **Status Page**: [Your Status Page URL]

---

**Last Updated**: January 2024
**Version**: 1.0.0