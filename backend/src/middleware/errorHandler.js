const mongoose = require('mongoose')

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// Handle Mongoose validation errors
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }))
  
  return new AppError('Validation failed', 400)
}

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0]
  const value = err.keyValue[field]
  
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
  return new AppError(message, 409)
}

// Handle Mongoose cast errors
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401)
}

// Handle JWT expired errors
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401)
}

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  
  // Rendered website errors
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err
  })
}

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      })
    }
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    })
  }
  
  // Rendered website errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err)
  return res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  })
}

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else {
    let error = { ...err }
    error.message = err.message
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      error = handleValidationError(error)
    }
    
    if (error.code === 11000) {
      error = handleDuplicateKeyError(error)
    }
    
    if (error.name === 'CastError') {
      error = handleCastError(error)
    }
    
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError()
    }
    
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError()
    }
    
    sendErrorProd(error, req, res)
  }
}

// Handle unhandled routes
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000) || 60
  })
}

// Database connection error handler
const handleDatabaseError = (error) => {
  console.error('Database connection error:', error)
  
  if (error.name === 'MongoNetworkError') {
    console.error('MongoDB network error - check your connection')
  } else if (error.name === 'MongooseServerSelectionError') {
    console.error('MongoDB server selection error - check if MongoDB is running')
  } else if (error.name === 'MongoParseError') {
    console.error('MongoDB parse error - check your connection string')
  }
  
  // In production, you might want to implement retry logic or graceful shutdown
  if (process.env.NODE_ENV === 'production') {
    // Implement graceful shutdown or retry logic
    console.error('Critical database error in production')
  }
}

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value
  }))
}

// Log error details
const logError = (error, req = null) => {
  const timestamp = new Date().toISOString()
  const errorLog = {
    timestamp,
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    url: req ? req.originalUrl : null,
    method: req ? req.method : null,
    ip: req ? req.ip : null,
    userAgent: req ? req.get('User-Agent') : null,
    userId: req && req.user ? req.user.userId : null
  }
  
  console.error('Error Log:', JSON.stringify(errorLog, null, 2))
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Winston, Sentry, etc.)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.error(err.name, err.message)
  console.error(err.stack)
  
  logError(err)
  
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...')
  console.error(err.name, err.message)
  
  logError(err)
  
  // Close server gracefully
  if (global.server) {
    global.server.close(() => {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
})

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
  
  if (global.server) {
    global.server.close(() => {
      console.log('💥 Process terminated!')
    })
  }
})

module.exports = {
  AppError,
  asyncHandler,
  globalErrorHandler,
  notFound,
  rateLimitHandler,
  handleDatabaseError,
  formatValidationErrors,
  logError
}