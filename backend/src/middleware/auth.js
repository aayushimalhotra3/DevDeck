const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Authentication middleware for protected routes
 * 
 * This middleware validates JWT tokens from either:
 * 1. HTTP-only cookies (preferred for web clients)
 * 2. Authorization header with Bearer token (for API clients)
 * 
 * Security features:
 * - Validates token signature and expiration
 * - Checks if user still exists in database (handles deleted users)
 * - Excludes sensitive token data from user lookup
 * - Provides detailed error messages for different failure scenarios
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from multiple possible sources
    // Priority: 1. HTTP-only cookie, 2. Authorization header
    let token = req.cookies.token
    
    // Fallback to Authorization header if no cookie present
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7) // Remove 'Bearer ' prefix
      }
    }
    
    // Reject requests without authentication token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify JWT token signature and decode payload
    // This will throw specific errors for invalid/expired tokens
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Verify user still exists in database (handles deleted accounts)
    // Exclude sensitive token data from the query for security
    const user = await User.findById(decoded.userId).select('-tokens')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      })
    }
    
    // Attach sanitized user data to request object for downstream middleware
    // Only include essential user information, not sensitive data
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      name: user.name
    }
    
    next()
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.'
      })
    }
    
    console.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

/**
 * Optional authentication middleware for public routes with user context
 * 
 * This middleware attempts to authenticate users but doesn't fail if:
 * - No token is provided
 * - Token is invalid or expired
 * - User doesn't exist
 * 
 * Use cases:
 * - Public portfolio pages that show different content for logged-in users
 * - API endpoints that provide enhanced data for authenticated users
 * - Routes that need to track user activity but remain publicly accessible
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Extract token using same logic as main auth middleware
    let token = req.cookies.token
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    // Only attempt authentication if token is present
    if (token) {
      try {
        // Attempt to verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-tokens')
        
        // Only attach user data if user exists and token is valid
        if (user) {
          req.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            name: user.name
          }
        }
      } catch (error) {
        // Silently handle authentication errors - don't block the request
        // This allows expired/invalid tokens to be ignored gracefully
        console.log('Optional auth token invalid:', error.message)
      }
    }
    
    // Always continue to next middleware, regardless of authentication status
    next()
    
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next() // Continue even if there's an error
  }
}

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run regular auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    
    // Check if user is admin
    const user = await User.findById(req.user.userId)
    
    if (!user || !user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      })
    }
    
    next()
    
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

/**
 * Rate limiting middleware specifically for authentication routes
 * 
 * Implements a sliding window rate limiter to prevent brute force attacks:
 * - Tracks authentication attempts per IP address
 * - Uses in-memory storage (should be Redis in production)
 * - Implements sliding window algorithm for accurate rate limiting
 * 
 * Security considerations:
 * - Prevents credential stuffing attacks
 * - Mitigates automated login attempts
 * - Provides clear retry-after information
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max attempts: 5 per window
 * - Tracks by IP address
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authRateLimit = (req, res, next) => {
  // Note: In production, this should use Redis or similar persistent storage
  // In-memory storage will reset on server restart
  
  // Extract client IP address with fallback options
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  
  // Rate limiting configuration
  const windowMs = 15 * 60 * 1000 // 15 minutes sliding window
  const maxAttempts = 5 // Maximum attempts per window
  
  // Initialize global attempts tracker if not exists
  // TODO: Replace with Redis for production deployment
  if (!global.authAttempts) {
    global.authAttempts = new Map()
  }
  
  // Get existing attempts for this IP, default to empty array
  const attempts = global.authAttempts.get(ip) || []
  
  // Filter to only include attempts within the current time window
  // This implements the "sliding window" algorithm
  const recentAttempts = attempts.filter(time => now - time < windowMs)
  
  // Check if rate limit has been exceeded
  if (recentAttempts.length >= maxAttempts) {
    // Calculate when the oldest attempt will expire
    const oldestAttempt = recentAttempts[0]
    const retryAfterMs = (oldestAttempt + windowMs) - now
    
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil(retryAfterMs / 1000) // Convert to seconds
    })
  }
  
  // Record current attempt timestamp
  recentAttempts.push(now)
  
  // Update the attempts record for this IP
  global.authAttempts.set(ip, recentAttempts)
  
  // Allow request to proceed
  next()
}

/**
 * Resource ownership verification middleware
 * 
 * This middleware ensures that authenticated users can only access/modify
 * resources they own. It's a critical security component that prevents:
 * - Unauthorized access to other users' portfolios
 * - Cross-user data manipulation
 * - Privilege escalation attacks
 * 
 * Supported resource types:
 * - 'portfolio': Direct user ownership via user field
 * - 'block': Indirect ownership via portfolio.user relationship
 * 
 * Security features:
 * - Validates resource existence before ownership check
 * - Uses string comparison to prevent type coercion attacks
 * - Populates related data for nested ownership verification
 * - Attaches verified resource to request for downstream use
 * 
 * @param {string} resourceType - Type of resource to verify ('portfolio' or 'block')
 * @returns {Function} Express middleware function
 */
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Extract authenticated user ID from previous auth middleware
      const userId = req.user.userId
      
      // Extract resource ID from URL parameters (flexible parameter names)
      const resourceId = req.params.id || req.params.portfolioId
      
      // Validate that resource ID was provided
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        })
      }
      
      let resource
      
      // Load resource based on type with appropriate population
      switch (resourceType) {
        case 'portfolio':
          // Direct portfolio ownership check
          const Portfolio = require('../models/Portfolio')
          resource = await Portfolio.findById(resourceId)
          break
          
        case 'block':
          // Indirect ownership through portfolio relationship
          const Block = require('../models/Block')
          resource = await Block.findById(resourceId).populate('portfolio')
          break
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          })
      }
      
      // Verify resource exists
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`
        })
      }
      
      // Extract owner ID based on resource type and relationship structure
      let ownerId
      if (resourceType === 'portfolio') {
        // Direct ownership: portfolio.user
        ownerId = resource.user.toString()
      } else if (resourceType === 'block') {
        // Indirect ownership: block.portfolio.user
        ownerId = resource.portfolio.user.toString()
      }
      
      // Perform ownership verification using string comparison
      // This prevents ObjectId type coercion vulnerabilities
      if (ownerId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        })
      }
      
      // Attach verified resource to request object for downstream handlers
      // This eliminates need for duplicate database queries
      req.resource = resource
      next()
      
    } catch (error) {
      // Log security-related errors for monitoring
      console.error('Resource ownership check error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during ownership verification'
      })
    }
  }
}

// Middleware to check if user owns the resource
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.params
      
      if (userId && userId !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        })
      }
      
      next()
      
    } catch (error) {
      console.error('Ownership check error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

// Middleware to validate API key (for external integrations)
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      })
    }
    
    // In a real application, you would validate the API key against a database
    // For now, we'll use a simple environment variable check
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      })
    }
    
    next()
    
  } catch (error) {
    console.error('API key validation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  authRateLimit,
  checkOwnership,
  checkResourceOwnership,
  validateApiKey
}