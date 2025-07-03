# Environment Variables Documentation

This document provides a comprehensive guide to all environment variables used in the DevDeck application.

## Overview

DevDeck uses environment variables for configuration management across both frontend and backend services. This approach ensures secure handling of sensitive data and easy deployment across different environments.

## Backend Environment Variables

### Required Variables

These variables are essential for the application to function properly:

#### Server Configuration
```bash
# Server port (default: 5000)
PORT=5000

# Application environment
NODE_ENV=development|production|test

# Frontend URL for CORS and redirects
FRONTEND_URL=http://localhost:3000
```

#### Database Configuration
```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/devdeck

# Test database (for running tests)
MONGODB_TEST_URI=mongodb://localhost:27017/devdeck_test
```

#### JWT Configuration
```bash
# Secret key for JWT token signing (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# JWT token expiration time
JWT_EXPIRES_IN=7d

# Refresh token secret (different from JWT_SECRET)
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Refresh token expiration time
JWT_REFRESH_EXPIRES_IN=30d
```

#### GitHub OAuth Configuration
```bash
# GitHub OAuth App credentials
# Get these from: https://github.com/settings/applications/new
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OAuth callback URL
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

### Optional Variables

These variables enable additional features but are not required for basic functionality:

#### Session Configuration
```bash
# Session secret for express-session
SESSION_SECRET=your_session_secret_here
```

#### Rate Limiting
```bash
# Rate limiting window in milliseconds (default: 15 minutes)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window (default: 100)
RATE_LIMIT_MAX_REQUESTS=100
```

#### WebSocket Configuration
```bash
# WebSocket heartbeat interval in milliseconds
WS_HEARTBEAT_INTERVAL=30000

# WebSocket heartbeat timeout in milliseconds
WS_HEARTBEAT_TIMEOUT=60000
```

#### File Upload Configuration
```bash
# Maximum file size in bytes (default: 10MB)
MAX_FILE_SIZE=10485760

# Upload directory path
UPLOAD_PATH=./uploads

# Allowed file extensions (comma-separated)
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,svg,pdf
```

#### Security Configuration
```bash
# BCrypt salt rounds for password hashing
BCRYPT_ROUNDS=12

# API key for internal services
API_KEY=your_internal_api_key
```

#### Logging Configuration
```bash
# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Debug namespace for development
DEBUG=devdeck:*
```

#### Cache Configuration
```bash
# Cache TTL in seconds (default: 1 hour)
CACHE_TTL=3600

# Redis connection URL (optional)
REDIS_URL=redis://localhost:6379
```

#### Email Configuration
```bash
# SMTP server configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@devdeck.com
```

#### AI Features (OpenAI)
```bash
# OpenAI API key for AI-powered features
OPENAI_API_KEY=your-openai-api-key-here
```

#### Payment Processing (Stripe)
```bash
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe product and price IDs
STRIPE_PRO_PRODUCT_ID=prod_your-pro-product-id
STRIPE_PRO_PRICE_ID=price_your-pro-price-id
STRIPE_ENTERPRISE_PRODUCT_ID=prod_your-enterprise-product-id
STRIPE_ENTERPRISE_PRICE_ID=price_your-enterprise-price-id
```

#### Performance Monitoring
```bash
# Enable performance monitoring
MONITORING_ENABLED=false
```

#### Cloud Storage (Cloudinary)
```bash
# Cloudinary configuration for image uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

---

## Frontend Environment Variables

### Required Variables

#### API Configuration
```bash
# Backend API base URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# WebSocket URL for real-time features
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5000

# Frontend URL for sharing and redirects
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

#### GitHub OAuth (NextAuth)
```bash
# GitHub OAuth credentials (same as backend)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### NextAuth Configuration
```bash
# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret

# NextAuth URL (your frontend URL)
NEXTAUTH_URL=http://localhost:3000
```

### Optional Variables

#### Analytics
```bash
# Google Analytics tracking ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

#### Feature Flags
```bash
# Enable beta features
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false

# Enable AI features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

---

## Environment-Specific Configurations

### Development Environment

```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/devdeck
JWT_SECRET=dev_jwt_secret_key
GITHUB_CLIENT_ID=your_dev_github_client_id
GITHUB_CLIENT_SECRET=your_dev_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_dev_github_client_id
GITHUB_CLIENT_SECRET=your_dev_github_client_secret
NEXTAUTH_SECRET=dev_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Production Environment

```bash
# Backend
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://devdeck.dev
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devdeck
JWT_SECRET=super_secure_production_jwt_secret
GITHUB_CLIENT_ID=your_prod_github_client_id
GITHUB_CLIENT_SECRET=your_prod_github_client_secret
GITHUB_CALLBACK_URL=https://api.devdeck.dev/api/auth/github/callback

# Frontend
NEXT_PUBLIC_BACKEND_URL=https://api.devdeck.dev
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.devdeck.dev
NEXT_PUBLIC_FRONTEND_URL=https://devdeck.dev
GITHUB_CLIENT_ID=your_prod_github_client_id
GITHUB_CLIENT_SECRET=your_prod_github_client_secret
NEXTAUTH_SECRET=super_secure_production_nextauth_secret
NEXTAUTH_URL=https://devdeck.dev
```

---

## Security Best Practices

### Secret Generation

```bash
# Generate secure JWT secret
openssl rand -base64 64

# Generate NextAuth secret
openssl rand -base64 32

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variable Security

1. **Never commit `.env` files** to version control
2. **Use different secrets** for different environments
3. **Rotate secrets regularly** in production
4. **Use strong, random values** for all secrets
5. **Limit access** to production environment variables
6. **Use encrypted storage** for sensitive variables in CI/CD

### Variable Validation

The application validates required environment variables on startup:

```javascript
// Backend validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
]

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

---

## Deployment Platform Configurations

### Vercel (Frontend)

```bash
# Environment Variables in Vercel Dashboard
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Railway (Backend)

```bash
# Environment Variables in Railway Dashboard
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend.railway.app/api/auth/github/callback
```

### Heroku (Alternative Backend)

```bash
# Set via Heroku CLI
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-app.vercel.app
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_jwt_secret
# ... other variables
```

---

## Environment Variable Templates

### Backend Template (.env.example)

See `/backend/.env.example` for the complete backend template.

### Frontend Template (.env.example)

See `/frontend/.env.example` for the complete frontend template.

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` matches your frontend domain
   - Ensure no trailing slashes in URLs

2. **Authentication Failures**
   - Verify GitHub OAuth credentials
   - Check callback URLs match GitHub app settings
   - Ensure JWT secrets are consistent

3. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network connectivity
   - Ensure database user has proper permissions

4. **WebSocket Connection Failures**
   - Check WebSocket URL format (ws:// or wss://)
   - Verify firewall/proxy settings
   - Ensure WebSocket port is accessible

### Debugging Environment Variables

```javascript
// Log environment variables (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    // Don't log secrets!
  })
}
```

---

## Migration Guide

### From Development to Production

1. **Update all URLs** from localhost to production domains
2. **Generate new secrets** for production environment
3. **Configure GitHub OAuth** with production callback URLs
4. **Set up MongoDB Atlas** or production database
5. **Configure deployment platform** environment variables
6. **Test all integrations** in staging environment first

### Environment Variable Checklist

- [ ] All required variables are set
- [ ] Secrets are unique and secure
- [ ] URLs match deployment domains
- [ ] GitHub OAuth is configured correctly
- [ ] Database connection is working
- [ ] CORS is properly configured
- [ ] WebSocket URLs are correct
- [ ] Optional features are configured as needed

---

## Support

For environment variable configuration issues:

1. Check this documentation
2. Verify against `.env.example` files
3. Test in development environment first
4. Check deployment platform documentation
5. Contact support with specific error messages