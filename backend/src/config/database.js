const mongoose = require('mongoose')
const { handleDatabaseError } = require('../middleware/errorHandler')

// MongoDB connection configuration
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }
    
    // Connection options (removed deprecated options for Node.js Driver v4+)
    const options = {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000 // How long a send or receive on a socket can take
    }
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options)
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Database: ${conn.connection.name}`)
      console.log(`🔗 Connection State: ${conn.connection.readyState}`)
    }
    
    return conn
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    handleDatabaseError(error)
    
    // Exit process with failure
    process.exit(1)
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err)
  handleDatabaseError(err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB')
})

mongoose.connection.on('reconnected', () => {
  console.log('🟢 Mongoose reconnected to MongoDB')
})

mongoose.connection.on('reconnectFailed', () => {
  console.error('🔴 Mongoose reconnection failed')
})

// Handle connection interruption
mongoose.connection.on('close', () => {
  console.log('🔴 MongoDB connection closed')
})

// Graceful shutdown
const gracefulShutdown = async (msg, callback) => {
  try {
    await mongoose.connection.close()
    console.log(`🛑 Mongoose disconnected through ${msg}`)
    callback()
  } catch (error) {
    console.error('Error during graceful shutdown:', error)
    callback()
  }
}

// For nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2')
  })
})

// For app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0)
  })
})

// For Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0)
  })
})

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    }
  }
}

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected')
    }
    
    const admin = mongoose.connection.db.admin()
    const stats = await admin.serverStatus()
    
    return {
      version: stats.version,
      uptime: stats.uptime,
      connections: stats.connections,
      memory: stats.mem,
      network: stats.network,
      opcounters: stats.opcounters
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return null
  }
}

// Initialize database indexes
const initializeIndexes = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Skipping index creation in production')
      return
    }
    
    console.log('📝 Creating database indexes...')
    
    // This will be called after models are loaded
    // Mongoose will automatically create indexes defined in schemas
    await mongoose.connection.syncIndexes()
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
  }
}

// Drop database (for testing purposes)
const dropDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop database in production')
    }
    
    await mongoose.connection.dropDatabase()
    console.log('🗑️  Database dropped successfully')
  } catch (error) {
    console.error('❌ Error dropping database:', error)
    throw error
  }
}

// Seed database with initial data
const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Skipping database seeding in production')
      return
    }
    
    console.log('🌱 Seeding database...')
    
    // Add your seeding logic here
    // Example: Create default admin user, sample data, etc.
    
    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

module.exports = {
  connectDB,
  gracefulShutdown,
  checkDatabaseHealth,
  getDatabaseStats,
  initializeIndexes,
  dropDatabase,
  seedDatabase
}