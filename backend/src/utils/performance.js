const redis = require('redis')
const compression = require('compression')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const mongoose = require('mongoose')

// Redis client for caching
let redisClient = null

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  })
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })
  
  redisClient.on('connect', () => {
    console.log('Connected to Redis')
  })
  
  redisClient.connect().catch(console.error)
}

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
      return next()
    }
    
    const key = `cache:${req.originalUrl || req.url}`
    
    try {
      const cached = await redisClient.get(key)
      
      if (cached) {
        console.log(`Cache hit for ${key}`)
        return res.json(JSON.parse(cached))
      }
      
      // Store original res.json
      const originalJson = res.json
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data)).catch(console.error)
        
        // Call original json method
        return originalJson.call(this, data)
      }
      
      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

// Cache invalidation
const invalidateCache = async (pattern) => {
  if (!redisClient || !redisClient.isOpen) {
    return
  }
  
  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(keys)
      console.log(`Invalidated ${keys.length} cache entries matching ${pattern}`)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

// Speed limiting (slow down)
const createSpeedLimit = (windowMs, delayAfter, delayMs) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs: delayMs * 10
  })
}

// Common rate limits
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many API requests'), // 100 requests per 15 minutes
  
  // Authentication rate limit
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'), // 5 attempts per 15 minutes
  
  // AI features rate limit
  ai: createRateLimit(60 * 60 * 1000, 20, 'Too many AI requests'), // 20 requests per hour
  
  // Export rate limit
  export: createRateLimit(60 * 60 * 1000, 10, 'Too many export requests'), // 10 exports per hour
  
  // Public portfolio rate limit
  public: createRateLimit(60 * 1000, 30, 'Too many portfolio views') // 30 views per minute
}

// Speed limits
const speedLimits = {
  // Slow down after 10 requests in 1 minute
  general: createSpeedLimit(60 * 1000, 10, 100), // 100ms delay after 10 requests
  
  // Slow down AI requests more aggressively
  ai: createSpeedLimit(60 * 1000, 5, 500) // 500ms delay after 5 requests
}

// Security middleware
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.github.com']
      }
    },
    crossOriginEmbedderPolicy: false
  })
]

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (1-9, 6 is default)
})

// Database optimization
const optimizeDatabase = () => {
  // Connection pooling
  mongoose.set('maxPoolSize', 10)
  mongoose.set('serverSelectionTimeoutMS', 5000)
  mongoose.set('socketTimeoutMS', 45000
  mongoose.set('bufferMaxEntries', 0)
  
  // Enable query result caching
  mongoose.set('bufferCommands', false)
  
  console.log('Database optimization settings applied')
}

// Memory usage monitoring
const monitorMemory = () => {
  const used = process.memoryUsage()
  const usage = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  }
  
  console.log('Memory Usage:', usage, 'MB')
  
  // Alert if memory usage is high
  if (usage.heapUsed > 500) {
    console.warn('High memory usage detected:', usage.heapUsed, 'MB')
  }
  
  return usage
}

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`)
    }
    
    // Log to monitoring service (if configured)
    if (process.env.MONITORING_ENABLED === 'true') {
      // Send metrics to monitoring service
      console.log(`Request: ${req.method} ${req.originalUrl} - ${duration}ms - ${res.statusCode}`)
    }
  })
  
  next()
}

// Image optimization middleware
const optimizeImages = (req, res, next) => {
  // Add cache headers for images
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString())
  }
  
  next()
}

// API response optimization
const optimizeResponse = (req, res, next) => {
  // Add ETag for caching
  res.setHeader('ETag', `"${Date.now()}"`)
  
  // Add cache headers for API responses
  if (req.url.startsWith('/api/')) {
    // Cache GET requests for 5 minutes
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=300')
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
  
  next()
}

// Cleanup function
const cleanup = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    console.log('Redis connection closed')
  }
}

// Health check endpoint data
const getHealthStatus = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: monitorMemory(),
    database: 'connected',
    cache: 'disabled'
  }
  
  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected'
    } else {
      health.database = 'disconnected'
      health.status = 'degraded'
    }
  } catch (error) {
    health.database = 'error'
    health.status = 'unhealthy'
  }
  
  // Check Redis connection
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.ping()
      health.cache = 'connected'
    } catch (error) {
      health.cache = 'error'
      health.status = 'degraded'
    }
  }
  
  return health
}

module.exports = {
  cache,
  invalidateCache,
  rateLimits,
  speedLimits,
  securityMiddleware,
  compressionMiddleware,
  optimizeDatabase,
  monitorMemory,
  performanceMonitor,
  optimizeImages,
  optimizeResponse,
  cleanup,
  getHealthStatus,
  redisClient
}