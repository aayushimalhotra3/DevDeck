const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.token
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-tokens')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      })
    }
    
    // Add user info to request
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

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-tokens')
        
        if (user) {
          req.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            name: user.name
          }
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth token invalid:', error.message)
      }
    }
    
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

// Rate limiting middleware for authentication routes
const authRateLimit = (req, res, next) => {
  // This would typically use a more sophisticated rate limiting solution
  // For now, we'll implement a simple in-memory rate limiter
  
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5
  
  if (!global.authAttempts) {
    global.authAttempts = new Map()
  }
  
  const attempts = global.authAttempts.get(ip) || []
  const recentAttempts = attempts.filter(time => now - time < windowMs)
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    })
  }
  
  // Add current attempt
  recentAttempts.push(now)
  global.authAttempts.set(ip, recentAttempts)
  
  next()
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
  validateApiKey
}