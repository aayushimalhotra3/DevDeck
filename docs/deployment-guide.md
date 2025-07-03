# DevDeck Deployment Guide

Comprehensive deployment documentation for the DevDeck application, covering various deployment strategies, environment configurations, and production best practices.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Platform-Specific Deployments](#platform-specific-deployments)
7. [Database Setup](#database-setup)
8. [SSL/TLS Configuration](#ssltls-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup and Recovery](#backup-and-recovery)
11. [Performance Optimization](#performance-optimization)
12. [Security Hardening](#security-hardening)
13. [Troubleshooting](#troubleshooting)
14. [Maintenance](#maintenance)

---

## Overview

DevDeck is a full-stack application consisting of:
- **Frontend**: Next.js application
- **Backend**: Node.js/Express API server
- **Database**: MongoDB
- **Cache**: Redis (optional but recommended)
- **File Storage**: Cloudinary (for images)
- **Authentication**: GitHub OAuth

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Next.js)     │◄──►│  (Node.js/API)  │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │     Redis       │    │   File Storage  │
│   (Vercel)      │    │   (Cache)       │    │  (Cloudinary)   │
│                 │    │   Port: 6379    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Prerequisites

### System Requirements

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **MongoDB**: 5.0 or higher
- **Redis**: 6.x or higher (optional)
- **Git**: Latest version

### Required Accounts

- **GitHub**: For OAuth authentication
- **MongoDB Atlas**: For cloud database (or self-hosted MongoDB)
- **Cloudinary**: For image storage
- **Vercel/Netlify**: For frontend deployment (optional)
- **Railway/Heroku**: For backend deployment (optional)

### Development Tools

- **Docker**: For containerized deployment
- **PM2**: For process management
- **Nginx**: For reverse proxy (production)
- **Let's Encrypt**: For SSL certificates

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devdeck?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/devdeck_test?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=30d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-backend-domain.com/api/auth/github/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key
SESSION_MAX_AGE=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5

# WebSocket
WEBSOCKET_PORT=5002
WEBSOCKET_CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Security
BCRYPT_ROUNDS=12
CSRF_SECRET=your-csrf-secret
HELMET_CSP_DIRECTIVES=default-src 'self'

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Cache (Redis)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
CACHE_MAX_KEYS=1000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@devdeck.com

# OpenAI API (Optional)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_PRO=price_your-pro-plan-id

# Performance Monitoring
NEW_RELIC_LICENSE_KEY=your-new-relic-key
SENTRY_DSN=your-sentry-dsn

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Development Tools
DEBUG=app:*
VERBOSE_LOGGING=false
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend-domain.com

# GitHub OAuth (for NextAuth)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-domain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES=true

# Performance
NEXT_PUBLIC_ENABLE_SW=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Local Development

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/devdeck.git
   cd devdeck
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   # Edit the files with your configuration
   ```

4. **Start MongoDB and Redis** (if using Docker):
   ```bash
   docker-compose up -d mongodb redis
   ```

5. **Start the development servers**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api-docs

### Docker Development Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: devdeck-mongo-dev
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: devdeck
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  redis:
    image: redis:7-alpine
    container_name: devdeck-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: devdeck-backend-dev
    restart: unless-stopped
    ports:
      - "5001:5001"
      - "5002:5002"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/devdeck?authSource=admin
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mongodb
      - redis
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: devdeck-frontend-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    command: npm run dev

volumes:
  mongodb_data:
  redis_data:
```

Start development environment:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

## Production Deployment

### Manual Deployment

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MongoDB (if self-hosting)
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server -y
```

#### 2. Filebeat Configuration

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/devdeck/*.log
  fields:
    service: devdeck-backend
  fields_under_root: true
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /var/log/nginx/*.log
  fields:
    service: nginx
  fields_under_root: true

output.logstash:
  hosts: ["logstash:5044"]

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_docker_metadata: ~
  - add_kubernetes_metadata: ~
```

#### 3. Kibana Dashboards

```json
{
  "version": "7.10.0",
  "objects": [
    {
      "id": "devdeck-overview",
      "type": "dashboard",
      "attributes": {
        "title": "DevDeck Application Overview",
        "hits": 0,
        "description": "Overview of DevDeck application metrics and logs",
        "panelsJSON": "[]",
        "optionsJSON": "{}",
        "uiStateJSON": "{}",
        "timeRestore": false,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "{}"
        }
      }
    }
  ]
}
```

---

## Backup and Recovery

### Database Backup

#### 1. MongoDB Backup Script

```bash
#!/bin/bash
# backup-mongodb.sh

set -e

# Configuration
BACKUP_DIR="/backups/mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="devdeck_backup_${DATE}"
RETENTION_DAYS=30

# MongoDB connection
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="devdeck"
MONGO_USER="backup_user"
MONGO_PASS="backup_password"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "Starting MongoDB backup: ${BACKUP_NAME}"

# Create backup
mongodump \
  --host "${MONGO_HOST}:${MONGO_PORT}" \
  --db "${MONGO_DB}" \
  --username "${MONGO_USER}" \
  --password "${MONGO_PASS}" \
  --out "${BACKUP_DIR}/${BACKUP_NAME}"

# Compress backup
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Upload to cloud storage (optional)
if [ "$UPLOAD_TO_S3" = "true" ]; then
  aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://${S3_BUCKET}/mongodb-backups/"
  echo "Backup uploaded to S3"
fi

# Clean old backups
find "${BACKUP_DIR}" -name "devdeck_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
echo "Old backups cleaned (older than ${RETENTION_DAYS} days)"

echo "MongoDB backup process completed"
```

#### 2. Automated Backup with Cron

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /scripts/backup-mongodb.sh >> /var/log/backup.log 2>&1

# Weekly full backup on Sunday at 1 AM
0 1 * * 0 /scripts/backup-mongodb-full.sh >> /var/log/backup.log 2>&1
```

### Application Backup

#### 1. Complete Application Backup

```bash
#!/bin/bash
# backup-application.sh

set -e

APP_DIR="/opt/devdeck"
BACKUP_DIR="/backups/application"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="devdeck_app_backup_${DATE}"

echo "Starting application backup: ${BACKUP_NAME}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Stop application
echo "Stopping application..."
pm2 stop all

# Backup application files
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="logs" \
  --exclude="tmp" \
  -C "$(dirname ${APP_DIR})" \
  "$(basename ${APP_DIR})"

# Backup configuration files
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" \
  /etc/nginx/sites-available/devdeck \
  /etc/systemd/system/devdeck*.service \
  "${APP_DIR}/.env" \
  "${APP_DIR}/ecosystem.config.js"

# Start application
echo "Starting application..."
pm2 start all

echo "Application backup completed"
```

### Recovery Procedures

#### 1. MongoDB Recovery

```bash
#!/bin/bash
# restore-mongodb.sh

set -e

BACKUP_FILE="$1"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="devdeck"
MONGO_USER="admin"
MONGO_PASS="admin_password"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

echo "Starting MongoDB restore from: $BACKUP_FILE"

# Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Stop application
pm2 stop all

# Drop existing database (WARNING: This will delete all data)
read -p "This will delete all existing data. Continue? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  mongo "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/admin" --eval "db.getSiblingDB('${MONGO_DB}').dropDatabase()"
else
  echo "Restore cancelled"
  exit 1
fi

# Restore database
mongorestore \
  --host "${MONGO_HOST}:${MONGO_PORT}" \
  --username "${MONGO_USER}" \
  --password "${MONGO_PASS}" \
  --authenticationDatabase admin \
  "${TEMP_DIR}/devdeck_backup_*/devdeck"

# Clean up
rm -rf "$TEMP_DIR"

# Start application
pm2 start all

echo "MongoDB restore completed"
```

#### 2. Disaster Recovery Plan

```markdown
# Disaster Recovery Checklist

## Immediate Response (0-1 hour)
1. [ ] Assess the scope of the incident
2. [ ] Notify stakeholders
3. [ ] Activate backup systems if available
4. [ ] Document the incident

## Short-term Recovery (1-4 hours)
1. [ ] Provision new infrastructure if needed
2. [ ] Restore database from latest backup
3. [ ] Deploy application from backup
4. [ ] Update DNS records if necessary
5. [ ] Test critical functionality

## Long-term Recovery (4-24 hours)
1. [ ] Full system testing
2. [ ] Performance optimization
3. [ ] Security audit
4. [ ] Update monitoring and alerting
5. [ ] Post-incident review

## Recovery Time Objectives (RTO)
- Critical services: 1 hour
- Full functionality: 4 hours
- Complete recovery: 24 hours

## Recovery Point Objectives (RPO)
- Database: 1 hour (hourly backups)
- Application: 24 hours (daily backups)
- Configuration: 24 hours (daily backups)
```

---

## Performance Optimization

### Database Optimization

#### 1. MongoDB Performance Tuning

```javascript
// Database optimization script
// Run in MongoDB shell

// Create compound indexes for common queries
db.portfolios.createIndex({ "userId": 1, "status": 1, "createdAt": -1 });
db.portfolios.createIndex({ "slug": 1, "status": 1 });
db.blocks.createIndex({ "portfolioId": 1, "order": 1 });
db.users.createIndex({ "email": 1, "isActive": 1 });

// Analyze query performance
db.portfolios.find({ "userId": ObjectId("..."), "status": "published" }).explain("executionStats");

// Enable profiling for slow queries
db.setProfilingLevel(2, { slowms: 100 });

// View slow queries
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty();
```

#### 2. Connection Pool Optimization

```javascript
// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 5,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      
      // Performance settings
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Compression
      compressors: ['zlib'],
      zlibCompressionLevel: 6
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Monitor connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Application Performance

#### 1. Node.js Optimization

```javascript
// backend/src/config/performance.js
const cluster = require('cluster');
const os = require('os');

// Cluster configuration for production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numWorkers = process.env.WEB_CONCURRENCY || os.cpus().length;
  
  console.log(`Master ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers`);
  
  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Starting a new worker');
    cluster.fork();
  });
  
} else {
  // Worker process
  require('./server');
  console.log(`Worker ${process.pid} started`);
}

// Memory optimization
if (process.env.NODE_ENV === 'production') {
  // Set memory limits
  process.env.NODE_OPTIONS = '--max-old-space-size=1024';
  
  // Garbage collection optimization
  if (global.gc) {
    setInterval(() => {
      global.gc();
    }, 30000); // Run GC every 30 seconds
  }
}
```

#### 2. Caching Strategy

```javascript
// backend/src/middleware/cache.js
const redis = require('../utils/redis');

// Cache middleware factory
const createCacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`,
    condition = () => true
  } = options;
  
  return async (req, res, next) => {
    // Skip caching for non-GET requests or when condition is false
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }
    
    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get from cache
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        res.set('X-Cache', 'HIT');
        return res.json(data);
      }
      
      // Cache miss - continue to route handler
      res.set('X-Cache', 'MISS');
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache successful responses
        if (res.statusCode === 200) {
          redis.setex(cacheKey, ttl, JSON.stringify(data));
        }
        return originalJson.call(this, data);
      };
      
      next();
      
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache configurations
const portfolioCache = createCacheMiddleware({
  ttl: 600, // 10 minutes
  keyGenerator: (req) => `portfolio:${req.params.id}:${req.user?.id || 'anonymous'}`,
  condition: (req) => !req.user || req.user.role !== 'admin'
});

const userCache = createCacheMiddleware({
  ttl: 300, // 5 minutes
  keyGenerator: (req) => `user:${req.user.id}`,
  condition: (req) => !!req.user
});

module.exports = {
  createCacheMiddleware,
  portfolioCache,
  userCache
};
```

### Frontend Optimization

#### 1. Next.js Performance Configuration

```javascript
// frontend/next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
    optimizeServerReact: true
  },
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'github.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Compression
  compress: true,
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      };
    }
    
    return config;
  }
});
```

#### 2. Service Worker for Caching

```javascript
// frontend/public/sw.js
const CACHE_NAME = 'devdeck-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response for cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

---

## Security Hardening

### Server Security

#### 1. Firewall Configuration

```bash
#!/bin/bash
# setup-firewall.sh

# Reset firewall rules
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH access (change port if needed)
sudo ufw allow 22/tcp

# HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Application ports (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 5001

# Database ports (only from application servers)
sudo ufw allow from 10.0.0.0/8 to any port 27017
sudo ufw allow from 10.0.0.0/8 to any port 6379

# Rate limiting for SSH
sudo ufw limit ssh

# Enable firewall
sudo ufw --force enable

# Show status
sudo ufw status verbose
```

#### 2. Fail2Ban Configuration

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 3600

[devdeck-auth]
enabled = true
filter = devdeck-auth
logpath = /var/log/devdeck/auth.log
maxretry = 5
findtime = 300
bantime = 1800
```

```ini
# /etc/fail2ban/filter.d/devdeck-auth.conf
[Definition]
failregex = ^.*Authentication failed.*IP: <HOST>.*$
            ^.*Invalid login attempt.*IP: <HOST>.*$
            ^.*Brute force attempt detected.*IP: <HOST>.*$
ignoreregex =
```

### Application Security

#### 1. Security Headers Middleware

```javascript
// backend/src/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Enhanced security middleware
const securityMiddleware = (app) => {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://github.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.github.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));
  
  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.'
    },
    skipSuccessfulRequests: true
  });
  
  // Speed limiting (progressive delay)
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs without delay
    delayMs: 500 // add 500ms delay per request after delayAfter
  });
  
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/', speedLimiter);
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'DevDeck');
    res.setHeader('Server', 'DevDeck/1.0');
    next();
  });
};

module.exports = securityMiddleware;
```

#### 2. Input Validation and Sanitization

```javascript
// backend/src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');
const xss = require('xss');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// XSS protection middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(DOMPurify.sanitize(obj[key]));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};

// Common validation rules
const validationRules = {
  portfolio: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status value')
  ],
  
  user: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters')
  ],
  
  objectId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ]
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validationRules
};
```

### Database Security

#### 1. MongoDB Security Configuration

```javascript
// backend/src/config/database-security.js
const mongoose = require('mongoose');

// Secure connection options
const secureConnectionOptions = {
  // Authentication
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256',
  
  // SSL/TLS
  ssl: process.env.NODE_ENV === 'production',
  sslValidate: true,
  sslCA: process.env.MONGODB_SSL_CA,
  
  // Connection security
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  
  // Additional security options
  retryWrites: true,
  w: 'majority',
  readPreference: 'primaryPreferred'
};

// Schema-level security
const addSecurityToSchema = (schema) => {
  // Add timestamps
  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Update timestamp on save
  schema.pre('save', function() {
    this.updatedAt = new Date();
  });
  
  // Remove sensitive fields from JSON output
  schema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
  };
  
  // Add audit trail
  schema.add({
    auditLog: [{
      action: String,
      userId: mongoose.Schema.Types.ObjectId,
      timestamp: { type: Date, default: Date.now },
      changes: mongoose.Schema.Types.Mixed
    }]
  });
};

module.exports = {
  secureConnectionOptions,
  addSecurityToSchema
};
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5001

# Check application logs
pm2 logs devdeck-backend
pm2 logs devdeck-frontend

# Check system resources
free -h
df -h
top

# Check environment variables
env | grep -E '(NODE_ENV|MONGODB_URI|JWT_SECRET)'

# Test database connection
mongo "$MONGODB_URI" --eval "db.runCommand('ping')"

# Test Redis connection
redis-cli -u "$REDIS_URL" ping
```

#### 2. Database Connection Issues

```bash
# MongoDB troubleshooting
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --host localhost:27017 --eval "db.runCommand('ping')"

# Check authentication
mongo "mongodb://username:password@localhost:27017/devdeck?authSource=admin"

# Redis troubleshooting
# Check Redis status
sudo systemctl status redis-server

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Test Redis connection
redis-cli ping
```

#### 3. Performance Issues

```bash
# Monitor system resources
htop
iotop
netstat -i

# Check application metrics
curl http://localhost:5001/metrics
curl http://localhost:5001/health

# Database performance
mongo --eval "db.runCommand({serverStatus: 1})"
mongo --eval "db.runCommand({dbStats: 1})"

# Check slow queries
mongo --eval "db.system.profile.find().limit(5).sort({ts:-1}).pretty()"

# Network diagnostics
ping google.com
traceroute google.com
dig google.com
```

### Debugging Tools

#### 1. Application Debugging

```javascript
// backend/src/utils/debug.js
const debug = require('debug');
const util = require('util');

// Create debug namespaces
const debuggers = {
  app: debug('devdeck:app'),
  db: debug('devdeck:db'),
  auth: debug('devdeck:auth'),
  api: debug('devdeck:api'),
  cache: debug('devdeck:cache'),
  error: debug('devdeck:error')
};

// Enhanced error logging
const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    process: {
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  debuggers.error(util.inspect(errorInfo, { depth: null, colors: true }));
  
  // Send to external logging service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
};

// Performance monitoring
const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = process.hrtime.bigint();
    try {
      const result = await fn(...args);
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      debuggers.app(`${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;
      
      logError(error, { operation: name, duration: `${duration.toFixed(2)}ms` });
      throw error;
    }
  };
};

module.exports = {
  debuggers,
  logError,
  measurePerformance
};
```

#### 2. Health Check Script

```bash
#!/bin/bash
# health-check.sh

set -e

echo "=== DevDeck Health Check ==="
echo "Timestamp: $(date)"
echo

# Check system resources
echo "--- System Resources ---"
echo "Memory Usage:"
free -h
echo
echo "Disk Usage:"
df -h /
echo
echo "CPU Load:"
uptime
echo

# Check services
echo "--- Services Status ---"
services=("mongod" "redis-server" "nginx")
for service in "${services[@]}"; do
  if systemctl is-active --quiet "$service"; then
    echo "✓ $service is running"
  else
    echo "✗ $service is not running"
  fi
done
echo

# Check application
echo "--- Application Health ---"
if curl -f -s http://localhost:5001/health > /dev/null; then
  echo "✓ Backend API is responding"
  curl -s http://localhost:5001/health | jq '.status'
else
  echo "✗ Backend API is not responding"
fi

if curl -f -s http://localhost:3000 > /dev/null; then
  echo "✓ Frontend is responding"
else
  echo "✗ Frontend is not responding"
fi
echo

# Check database connectivity
echo "--- Database Connectivity ---"
if mongo --quiet --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
  echo "✓ MongoDB is accessible"
else
  echo "✗ MongoDB is not accessible"
fi

if redis-cli ping > /dev/null 2>&1; then
  echo "✓ Redis is accessible"
else
  echo "✗ Redis is not accessible"
fi
echo

# Check logs for errors
echo "--- Recent Errors ---"
echo "Backend errors (last 10):"
grep -i error /var/log/devdeck/backend.log | tail -10 || echo "No recent errors"
echo

echo "Nginx errors (last 5):"
grep -i error /var/log/nginx/error.log | tail -5 || echo "No recent errors"
echo

echo "=== Health Check Complete ==="
```

---

## Maintenance

### Regular Maintenance Tasks

#### 1. Daily Maintenance Script

```bash
#!/bin/bash
# daily-maintenance.sh

set -e

LOG_FILE="/var/log/maintenance.log"
echo "$(date): Starting daily maintenance" >> "$LOG_FILE"

# Backup database
echo "Creating database backup..."
/scripts/backup-mongodb.sh >> "$LOG_FILE" 2>&1

# Clean old logs
echo "Cleaning old logs..."
find /var/log/devdeck -name "*.log" -mtime +30 -delete
find /var/log/nginx -name "*.log" -mtime +30 -delete

# Clean temporary files
echo "Cleaning temporary files..."
find /tmp -name "devdeck-*" -mtime +1 -delete

# Update system packages (security updates only)
echo "Installing security updates..."
sudo unattended-upgrade

# Restart services if needed
echo "Checking for service restarts..."
if [ -f /var/run/reboot-required ]; then
  echo "System reboot required" >> "$LOG_FILE"
fi

# Generate health report
echo "Generating health report..."
/scripts/health-check.sh >> "/var/log/health-$(date +%Y%m%d).log"

echo "$(date): Daily maintenance completed" >> "$LOG_FILE"
```

#### 2. Weekly Maintenance Script

```bash
#!/bin/bash
# weekly-maintenance.sh

set -e

LOG_FILE="/var/log/maintenance.log"
echo "$(date): Starting weekly maintenance" >> "$LOG_FILE"

# Full database backup
echo "Creating full database backup..."
/scripts/backup-mongodb-full.sh >> "$LOG_FILE" 2>&1

# Optimize database
echo "Optimizing database..."
mongo devdeck --eval "db.runCommand({compact: 'portfolios'})"
mongo devdeck --eval "db.runCommand({compact: 'users'})"
mongo devdeck --eval "db.runCommand({compact: 'blocks'})"

# Clear Redis cache
echo "Clearing Redis cache..."
redis-cli FLUSHDB

# Update SSL certificates
echo "Checking SSL certificates..."
certbot renew --quiet

# Security scan
echo "Running security scan..."
/scripts/security-scan.sh >> "$LOG_FILE" 2>&1

# Performance analysis
echo "Analyzing performance..."
/scripts/performance-analysis.sh >> "$LOG_FILE" 2>&1

echo "$(date): Weekly maintenance completed" >> "$LOG_FILE"
```

### Monitoring and Alerting

#### 1. Monitoring Script

```bash
#!/bin/bash
# monitor.sh

set -e

# Configuration
ALERT_EMAIL="admin@devdeck.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
THRESHOLD_CPU=80
THRESHOLD_MEMORY=80
THRESHOLD_DISK=90

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
  echo "HIGH CPU USAGE: ${CPU_USAGE}%" | mail -s "DevDeck Alert: High CPU Usage" "$ALERT_EMAIL"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > $THRESHOLD_MEMORY" | bc -l) )); then
  echo "HIGH MEMORY USAGE: ${MEMORY_USAGE}%" | mail -s "DevDeck Alert: High Memory Usage" "$ALERT_EMAIL"
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt "$THRESHOLD_DISK" ]; then
  echo "HIGH DISK USAGE: ${DISK_USAGE}%" | mail -s "DevDeck Alert: High Disk Usage" "$ALERT_EMAIL"
fi

# Check application health
if ! curl -f -s http://localhost:5001/health > /dev/null; then
  echo "APPLICATION DOWN: Backend API not responding" | mail -s "DevDeck Alert: Application Down" "$ALERT_EMAIL"
fi

# Check database connectivity
if ! mongo --quiet --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
  echo "DATABASE DOWN: MongoDB not responding" | mail -s "DevDeck Alert: Database Down" "$ALERT_EMAIL"
fi

# Send Slack notification for critical alerts
send_slack_alert() {
  local message="$1"
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 DevDeck Alert: $message\"}" \
    "$SLACK_WEBHOOK"
}

# Example usage:
# send_slack_alert "High CPU usage detected: ${CPU_USAGE}%"
```

#### 2. Automated Deployment Updates

```bash
#!/bin/bash
# auto-deploy.sh

set -e

APP_DIR="/opt/devdeck"
BACKUP_DIR="/backups/deployments"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "Starting automated deployment: $DATE"

# Create backup before deployment
echo "Creating pre-deployment backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$APP_DIR" "$BACKUP_DIR/devdeck_pre_deploy_$DATE"

# Stop application
echo "Stopping application..."
pm2 stop all

# Pull latest changes
echo "Pulling latest changes..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main

# Install dependencies
echo "Installing dependencies..."
cd backend && npm ci --production
cd ../frontend && npm ci

# Build application
echo "Building application..."
cd ../backend && npm run build
cd ../frontend && npm run build

# Run database migrations
echo "Running database migrations..."
cd ../backend && npm run migrate

# Start application
echo "Starting application..."
pm2 start all

# Wait for application to start
echo "Waiting for application to start..."
sleep 30

# Health check
echo "Performing health check..."
if curl -f -s http://localhost:5001/health > /dev/null; then
  echo "✓ Deployment successful"
  # Clean old backups
  find "$BACKUP_DIR" -name "devdeck_pre_deploy_*" -mtime +7 -exec rm -rf {} \;
else
  echo "✗ Deployment failed - rolling back"
  pm2 stop all
  rm -rf "$APP_DIR"
  mv "$BACKUP_DIR/devdeck_pre_deploy_$DATE" "$APP_DIR"
  pm2 start all
  exit 1
fi

echo "Deployment completed: $DATE"
```

### Cron Job Setup

```bash
# Add to crontab (crontab -e)

# Daily maintenance at 2 AM
0 2 * * * /scripts/daily-maintenance.sh

# Weekly maintenance on Sunday at 1 AM
0 1 * * 0 /scripts/weekly-maintenance.sh

# Monitor every 5 minutes
*/5 * * * * /scripts/monitor.sh

# Health check every minute
* * * * * /scripts/health-check.sh > /dev/null 2>&1

# SSL certificate renewal check daily
0 3 * * * /usr/bin/certbot renew --quiet

# Log rotation weekly
0 4 * * 0 /usr/sbin/logrotate /etc/logrotate.conf
```

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying DevDeck in various environments, from local development to production-ready infrastructure. Key points to remember:

1. **Security First**: Always implement proper security measures including firewalls, SSL/TLS, input validation, and regular updates.

2. **Monitoring**: Set up comprehensive monitoring and alerting to catch issues before they affect users.

3. **Backups**: Implement automated backup strategies with tested recovery procedures.

4. **Performance**: Optimize database queries, implement caching, and monitor resource usage.

5. **Maintenance**: Establish regular maintenance routines to keep the system healthy and secure.

6. **Documentation**: Keep deployment documentation updated as the application evolves.

For additional support or questions about deployment, please refer to the project's GitHub repository or contact the development team.

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: DevDeck Team. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-username/devdeck.git
cd devdeck

# Install dependencies
npm install
cd backend && npm install --production
cd ../frontend && npm install

# Build applications
cd backend && npm run build
cd ../frontend && npm run build

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit with production values

# Start services with PM2
pm2 start ecosystem.config.js
```

#### 3. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'devdeck-backend',
      script: './backend/dist/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'devdeck-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/devdeck
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API Rate Limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001/health;
        access_log off;
    }
}

# Rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/devdeck /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Docker Production Deployment

#### 1. Production Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Build application
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src/ tests/ *.config.js

USER nodejs

EXPOSE 5001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: devdeck-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: devdeck
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - devdeck-network
    command: mongod --auth

  redis:
    image: redis:7-alpine
    container_name: devdeck-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - devdeck-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: devdeck-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/devdeck?authSource=admin
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - redis
    networks:
      - devdeck-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devdeck-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    networks:
      - devdeck-network

  nginx:
    image: nginx:alpine
    container_name: devdeck-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - devdeck-network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  devdeck-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Create production environment file
cp .env.example .env.prod
# Edit with production values

# Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend if needed
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## Platform-Specific Deployments

### Vercel (Frontend)

#### 1. Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-domain.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "https://your-backend-domain.com",
    "NEXTAUTH_URL": "https://your-frontend-domain.vercel.app"
  },
  "functions": {
    "frontend/pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

### Railway (Backend)

#### 1. Railway Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "$PORT"
```

#### 2. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Heroku (Full Stack)

#### 1. Heroku Configuration

```json
// package.json (root)
{
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "npm run start:backend",
    "start:backend": "cd backend && npm start",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "8.x"
  }
}
```

```
# Procfile
web: npm start
release: cd backend && npm run migrate
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
# ... other environment variables

# Deploy
git push heroku main
```

### AWS (Complete Infrastructure)

#### 1. AWS Architecture

```yaml
# aws-infrastructure.yml (CloudFormation)
AWSTemplateFormatVersion: '2010-09-09'
Description: 'DevDeck Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-devdeck-vpc'

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-devdeck-igw'

  # Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-devdeck-public-subnet-1'

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-devdeck-public-subnet-2'

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub '${Environment}-devdeck-cluster'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1
        - CapacityProvider: FARGATE_SPOT
          Weight: 4

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-devdeck-alb'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # RDS (MongoDB alternative)
  DocumentDBCluster:
    Type: AWS::DocDB::DBCluster
    Properties:
      DBClusterIdentifier: !Sub '${Environment}-devdeck-docdb'
      MasterUsername: admin
      MasterUserPassword: !Ref DBPassword
      Engine: docdb
      EngineVersion: '4.0.0'
      BackupRetentionPeriod: 7
      PreferredBackupWindow: '03:00-04:00'
      PreferredMaintenanceWindow: 'sun:04:00-sun:05:00'
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DocumentDBSubnetGroup

  # ElastiCache (Redis)
  ElastiCacheSubnetGroup:
    Type: AWS::ElastiCache::SubnetGroup
    Properties:
      Description: Subnet group for ElastiCache
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  ElastiCacheCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheClusterName: !Sub '${Environment}-devdeck-redis'
      Engine: redis
      CacheNodeType: cache.t3.micro
      NumCacheNodes: 1
      VpcSecurityGroupIds:
        - !Ref CacheSecurityGroup
      CacheSubnetGroupName: !Ref ElastiCacheSubnetGroup

Outputs:
  LoadBalancerDNS:
    Description: DNS name of the load balancer
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub '${Environment}-devdeck-alb-dns'
```

#### 2. ECS Task Definitions

```json
// ecs-task-definition.json
{
  "family": "devdeck-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "devdeck-backend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/devdeck-backend:latest",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5001"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/devdeck/mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/devdeck/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/devdeck-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:5001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### 3. Deploy to AWS

```bash
# Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build backend image
cd backend
docker build -t devdeck-backend .
docker tag devdeck-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/devdeck-backend:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/devdeck-backend:latest

# Deploy infrastructure
aws cloudformation deploy \
  --template-file aws-infrastructure.yml \
  --stack-name devdeck-infrastructure \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_IAM

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster devdeck-cluster \
  --service-name devdeck-backend-service \
  --task-definition devdeck-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

---

## Database Setup

### MongoDB Atlas (Recommended)

#### 1. Create Cluster

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Choose your cloud provider and region
4. Configure cluster tier (M0 for free tier)
5. Create database user
6. Configure network access (IP whitelist)

#### 2. Connection String

```bash
# Standard connection
mongodb+srv://username:password@cluster0.mongodb.net/devdeck?retryWrites=true&w=majority

# With additional options
mongodb+srv://username:password@cluster0.mongodb.net/devdeck?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1
```

#### 3. Database Initialization

```javascript
// scripts/init-db.js
const { MongoClient } = require('mongodb');

async function initializeDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('devdeck');
    
    // Create collections with validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'githubId'],
          properties: {
            username: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 30
            },
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            },
            githubId: {
              bsonType: 'string'
            }
          }
        }
      }
    });
    
    await db.createCollection('portfolios', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'userId'],
          properties: {
            title: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 100
            },
            userId: {
              bsonType: 'objectId'
            },
            status: {
              enum: ['draft', 'published', 'archived']
            }
          }
        }
      }
    });
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ githubId: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    await db.collection('portfolios').createIndex({ userId: 1 });
    await db.collection('portfolios').createIndex({ slug: 1 }, { unique: true });
    await db.collection('portfolios').createIndex({ status: 1 });
    await db.collection('portfolios').createIndex({ createdAt: -1 });
    
    await db.collection('blocks').createIndex({ portfolioId: 1 });
    await db.collection('blocks').createIndex({ portfolioId: 1, order: 1 });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
```

### Self-Hosted MongoDB

#### 1. Installation

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Configuration

```yaml
# /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1,10.0.0.0/8

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled

replication:
  replSetName: "rs0"
```

#### 3. Security Setup

```javascript
// MongoDB shell commands
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use devdeck
db.createUser({
  user: "devdeck_user",
  pwd: "secure_app_password",
  roles: [ { role: "readWrite", db: "devdeck" } ]
})
```

### Redis Setup

#### 1. Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

#### 2. Configuration

```conf
# /etc/redis/redis.conf

# Network
bind 127.0.0.1 ::1
port 6379
protected-mode yes

# Security
requirepass your_secure_redis_password

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

appendonly yes
appendfsync everysec

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

#### 3. Start Redis

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli
127.0.0.1:6379> AUTH your_secure_redis_password
127.0.0.1:6379> ping
PONG
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

#### 1. Install Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. Obtain Certificate

```bash
# For Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# For standalone (if not using web server)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

#### 3. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

#### 1. Generate Private Key

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out certificate.csr

# Self-signed certificate (for development)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
```

#### 2. Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /path/to/chain.crt;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}
```

---

## Monitoring and Logging

### Application Monitoring

#### 1. Health Check Endpoint

```javascript
// backend/src/routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('../utils/redis');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    services: {},
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    cpu: {
      usage: process.cpuUsage()
    }
  };

  // Check MongoDB
  try {
    const dbState = mongoose.connection.readyState;
    health.services.database = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      state: dbState
    };
  } catch (error) {
    health.services.database = {
      status: 'error',
      error: error.message
    };
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    if (redis.client) {
      const start = Date.now();
      await redis.client.ping();
      const responseTime = Date.now() - start;
      
      health.services.redis = {
        status: 'connected',
        responseTime: `${responseTime}ms`
      };
    } else {
      health.services.redis = {
        status: 'not_configured'
      };
    }
  } catch (error) {
    health.services.redis = {
      status: 'error',
      error: error.message
    };
    health.status = 'unhealthy';
  }

  // Check external services
  try {
    const githubCheck = await fetch('https://api.github.com/rate_limit', {
      timeout: 5000
    });
    
    health.services.github = {
      status: githubCheck.ok ? 'available' : 'unavailable',
      responseTime: githubCheck.headers.get('x-response-time')
    };
  } catch (error) {
    health.services.github = {
      status: 'error',
      error: error.message
    };
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

#### 2. Prometheus Metrics

```javascript
// backend/src/middleware/metrics.js
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseQueries = new promClient.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'collection']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueries);

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    activeConnections,
    databaseQueries
  }
};
```

### Logging Configuration

#### 1. Winston Logger Setup

```javascript
// backend/src/utils/logger.js
const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// Add request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};
```

#### 2. Log Rotation

```javascript
// Add to winston transports
const DailyRotateFile = require('winston-daily-rotate-file');

const rotatingFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

transports.push(rotatingFileTransport);
```

### ELK Stack Integration

#### 1. Logstash Configuration

```ruby
# logstash.conf
input {
  file {
    path => "/var/log/devdeck/*.log"
    start_position => "beginning"
    codec => "json"
  }
  
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "devdeck-backend" {
    mutate {
      add_field => { "service" => "backend" }
    }
  }
  
  if [fields][service] == "devdeck-frontend" {
    mutate {
      add_field => { "service" => "frontend" }
    }
  }
  
  # Parse timestamp
  date {
    match => [ "timestamp", "yyyy-MM-dd HH:mm:ss:SSS" ]
  }
  
  # Extract user ID from message
  if [message] =~ /userId/ {
    grok {
      match => { "message" => "userId: %{DATA:user_id}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "devdeck-logs-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
```

#### 2