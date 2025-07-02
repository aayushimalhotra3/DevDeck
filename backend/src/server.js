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

// Import middleware
const errorHandler = require('./middleware/errorHandler')
const { connectDB } = require('./config/database')
const { initializeWebSocket } = require('./ws')

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'DevDeck API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// API Routes
app.use('/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/github', githubRoutes)

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
app.use(errorHandler)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 DevDeck API server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

module.exports = { app, server, io }