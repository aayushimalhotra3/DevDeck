const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const { createServer } = require('http')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const portfolioRoutes = require('./routes/portfolio')
const githubRoutes = require('./routes/github')
const exportRoutes = require('./routes/export')
const aiRoutes = require('./routes/ai')
const premiumRoutes = require('./routes/premium')

// Import middleware
const { globalErrorHandler } = require('./middleware/errorHandler')
const { connectDB } = require('./config/database')
const { initializeWebSocket } = require('./ws')

// Import performance utilities
const {
  rateLimits,
  speedLimits,
  securityMiddleware,
  compressionMiddleware,
  optimizeDatabase,
  performanceMonitor,
  optimizeImages,
  optimizeResponse,
  cleanup,
  getHealthStatus
} = require('./utils/performance')

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Apply database optimizations
optimizeDatabase()

// Performance monitoring
app.use(performanceMonitor)

// Compression middleware
app.use(compressionMiddleware)

// Security middleware
app.use(securityMiddleware)

// Image optimization
app.use(optimizeImages)

// Response optimization
app.use(optimizeResponse)

// Rate limiting with performance optimizations
app.use('/api/', rateLimits.general)
app.use('/api/', speedLimits.general)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health check endpoint with performance metrics
app.get('/health', async (req, res) => {
  try {
    const healthStatus = await getHealthStatus()
    res.status(200).json({
      ...healthStatus,
      message: 'DevDeck API is running',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// API Routes with specific rate limits
app.use('/auth', rateLimits.auth, authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/export', rateLimits.export, exportRoutes)
app.use('/api/ai', rateLimits.ai, speedLimits.ai, aiRoutes)
app.use('/api/premium', premiumRoutes)

// Initialize WebSocket server
const io = initializeWebSocket(server)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware (should be last)
app.use(globalErrorHandler)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 DevDeck API server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  
  // Cleanup performance utilities
  await cleanup()
  
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  
  // Cleanup performance utilities
  await cleanup()
  
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

module.exports = { app, server, io }