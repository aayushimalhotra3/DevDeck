const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Portfolio = require('./models/Portfolio')

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-tokens')
    
    if (!user) {
      return next(new Error('User not found'))
    }
    
    socket.userId = user._id.toString()
    socket.user = user
    next()
  } catch (error) {
    next(new Error('Invalid authentication token'))
  }
}

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })
  
  // Authentication middleware
  io.use(authenticateSocket)
  
  // Connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`)
    
    // Join user to their personal room
    socket.join(`user-${socket.userId}`)
    
    // Portfolio editing events
    setupPortfolioEvents(socket, io)
    
    // Real-time collaboration events
    setupCollaborationEvents(socket, io)
    
    // Presence events
    setupPresenceEvents(socket, io)
    
    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.user.username} (${reason})`)
      
      // Notify others in portfolio rooms about user leaving
      socket.rooms.forEach(room => {
        if (room.startsWith('portfolio-')) {
          socket.to(room).emit('user-left', {
            userId: socket.userId,
            username: socket.user.username,
            timestamp: new Date().toISOString()
          })
        }
      })
    })
  })
  
  return io
}

// Portfolio editing events
const setupPortfolioEvents = (socket, io) => {
  // Join portfolio editing room
  socket.on('join-portfolio', async (portfolioId) => {
    try {
      // Verify user has access to this portfolio
      const portfolio = await Portfolio.findById(portfolioId)
      if (!portfolio || portfolio.userId.toString() !== socket.userId) {
        socket.emit('error', { message: 'Access denied to portfolio' })
        return
      }
      
      const roomName = `portfolio-${portfolioId}`
      socket.join(roomName)
      
      // Notify others in the room
      socket.to(roomName).emit('user-joined', {
        userId: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar_url,
        timestamp: new Date().toISOString()
      })
      
      // Send current portfolio state
      socket.emit('portfolio-state', {
        portfolio,
        timestamp: new Date().toISOString()
      })
      
      console.log(`📝 ${socket.user.username} joined portfolio ${portfolioId}`)
    } catch (error) {
      console.error('Error joining portfolio:', error)
      socket.emit('error', { message: 'Failed to join portfolio' })
    }
  })
  
  // Leave portfolio editing room
  socket.on('leave-portfolio', (portfolioId) => {
    const roomName = `portfolio-${portfolioId}`
    socket.leave(roomName)
    
    // Notify others in the room
    socket.to(roomName).emit('user-left', {
      userId: socket.userId,
      username: socket.user.username,
      timestamp: new Date().toISOString()
    })
    
    console.log(`📝 ${socket.user.username} left portfolio ${portfolioId}`)
  })
  
  // Block operations
  socket.on('block-add', async (data) => {
    try {
      const { portfolioId, block } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('block-added', {
        block,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`🧱 Block added by ${socket.user.username} in portfolio ${portfolioId}`)
    } catch (error) {
      console.error('Error adding block:', error)
      socket.emit('error', { message: 'Failed to add block' })
    }
  })
  
  socket.on('block-update', async (data) => {
    try {
      const { portfolioId, blockId, changes } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('block-updated', {
        blockId,
        changes,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`🧱 Block ${blockId} updated by ${socket.user.username}`)
    } catch (error) {
      console.error('Error updating block:', error)
      socket.emit('error', { message: 'Failed to update block' })
    }
  })
  
  socket.on('block-delete', async (data) => {
    try {
      const { portfolioId, blockId } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('block-deleted', {
        blockId,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`🧱 Block ${blockId} deleted by ${socket.user.username}`)
    } catch (error) {
      console.error('Error deleting block:', error)
      socket.emit('error', { message: 'Failed to delete block' })
    }
  })
  
  socket.on('block-reorder', async (data) => {
    try {
      const { portfolioId, blockOrders } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('blocks-reordered', {
        blockOrders,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`🔄 Blocks reordered by ${socket.user.username}`)
    } catch (error) {
      console.error('Error reordering blocks:', error)
      socket.emit('error', { message: 'Failed to reorder blocks' })
    }
  })
  
  // Theme and layout changes
  socket.on('theme-update', async (data) => {
    try {
      const { portfolioId, theme } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('theme-updated', {
        theme,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`🎨 Theme updated by ${socket.user.username}`)
    } catch (error) {
      console.error('Error updating theme:', error)
      socket.emit('error', { message: 'Failed to update theme' })
    }
  })
  
  socket.on('layout-update', async (data) => {
    try {
      const { portfolioId, layout } = data
      const roomName = `portfolio-${portfolioId}`
      
      // Broadcast to other users in the room
      socket.to(roomName).emit('layout-updated', {
        layout,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      })
      
      console.log(`📐 Layout updated by ${socket.user.username}`)
    } catch (error) {
      console.error('Error updating layout:', error)
      socket.emit('error', { message: 'Failed to update layout' })
    }
  })
}

// Real-time collaboration events
const setupCollaborationEvents = (socket, io) => {
  // Cursor tracking
  socket.on('cursor-move', (data) => {
    const { portfolioId, position } = data
    const roomName = `portfolio-${portfolioId}`
    
    socket.to(roomName).emit('cursor-moved', {
      userId: socket.userId,
      username: socket.user.username,
      position,
      timestamp: new Date().toISOString()
    })
  })
  
  // Selection tracking
  socket.on('selection-change', (data) => {
    const { portfolioId, selectedBlocks } = data
    const roomName = `portfolio-${portfolioId}`
    
    socket.to(roomName).emit('selection-changed', {
      userId: socket.userId,
      username: socket.user.username,
      selectedBlocks,
      timestamp: new Date().toISOString()
    })
  })
  
  // Typing indicators
  socket.on('typing-start', (data) => {
    const { portfolioId, blockId } = data
    const roomName = `portfolio-${portfolioId}`
    
    socket.to(roomName).emit('user-typing', {
      userId: socket.userId,
      username: socket.user.username,
      blockId,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('typing-stop', (data) => {
    const { portfolioId, blockId } = data
    const roomName = `portfolio-${portfolioId}`
    
    socket.to(roomName).emit('user-stopped-typing', {
      userId: socket.userId,
      username: socket.user.username,
      blockId,
      timestamp: new Date().toISOString()
    })
  })
}

// Presence events
const setupPresenceEvents = (socket, io) => {
  // Get online users in a portfolio
  socket.on('get-online-users', async (portfolioId) => {
    try {
      const roomName = `portfolio-${portfolioId}`
      const room = io.sockets.adapter.rooms.get(roomName)
      
      if (room) {
        const onlineUsers = []
        for (const socketId of room) {
          const userSocket = io.sockets.sockets.get(socketId)
          if (userSocket && userSocket.user) {
            onlineUsers.push({
              userId: userSocket.userId,
              username: userSocket.user.username,
              avatar: userSocket.user.avatar_url
            })
          }
        }
        
        socket.emit('online-users', {
          portfolioId,
          users: onlineUsers,
          count: onlineUsers.length
        })
      } else {
        socket.emit('online-users', {
          portfolioId,
          users: [],
          count: 0
        })
      }
    } catch (error) {
      console.error('Error getting online users:', error)
      socket.emit('error', { message: 'Failed to get online users' })
    }
  })
  
  // Heartbeat for presence
  socket.on('heartbeat', () => {
    socket.emit('heartbeat-ack', {
      timestamp: new Date().toISOString()
    })
  })
}

// Utility functions
const broadcastToPortfolio = (io, portfolioId, event, data) => {
  io.to(`portfolio-${portfolioId}`).emit(event, data)
}

const broadcastToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data)
}

module.exports = {
  initializeWebSocket,
  broadcastToPortfolio,
  broadcastToUser
}