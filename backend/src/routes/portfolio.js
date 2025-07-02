const express = require('express')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const {
  validatePortfolioUpdate,
  validatePortfolioSave,
  validatePortfolioId,
  validateBlockContent,
  validateUsername,
  validateBlockId
} = require('../middleware/validation')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

// @desc    Get user's portfolio
// @route   GET /api/portfolio
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  let portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    // Create default portfolio if doesn't exist
    portfolio = new Portfolio({
      user: req.user.userId,
      blocks: [],
      layout: {
        columns: 1,
        spacing: 'medium',
        max_width: '1200px'
      },
      theme: {
        primary_color: '#3b82f6',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter'
      }
    })
    
    await portfolio.save()
  }
  
  res.status(200).json({
    success: true,
    portfolio: portfolio
  })
}))

// @desc    Update portfolio
// @route   PUT /api/portfolio
// @access  Private
router.put('/', auth, validatePortfolioUpdate, asyncHandler(async (req, res) => {
  const {
    blocks,
    layout,
    theme,
    seo,
    custom_domain
  } = req.body
  
  let portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    portfolio = new Portfolio({
      user: req.user.userId
    })
  }
  
  // Update fields if provided
  if (blocks !== undefined) {
    portfolio.blocks = blocks
    portfolio.version += 1
  }
  
  if (layout) {
    portfolio.layout = {
      ...portfolio.layout,
      ...layout
    }
  }
  
  if (theme) {
    portfolio.theme = {
      ...portfolio.theme,
      ...theme
    }
  }
  
  if (seo) {
    portfolio.seo = {
      ...portfolio.seo,
      ...seo
    }
  }
  
  if (custom_domain !== undefined) {
    portfolio.custom_domain = custom_domain
  }
  
  portfolio.last_modified = new Date()
  await portfolio.save()
  
  // Emit real-time update via Socket.io
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('portfolio-updated', {
      portfolio: portfolio,
      timestamp: new Date()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Portfolio updated successfully',
    portfolio: portfolio
  })
}))

// @desc    Get public portfolio by username
// @route   GET /api/portfolio/:username
// @access  Public
router.get('/:username', asyncHandler(async (req, res) => {
  const { username } = req.params
  
  const user = await User.findByUsername(username)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  // Check if portfolio is public
  if (!user.privacy_settings.portfolio_public) {
    return res.status(403).json({
      success: false,
      message: 'This portfolio is private'
    })
  }
  
  const portfolio = await Portfolio.findByUserId(user._id)
  
  if (!portfolio || portfolio.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found or not published'
    })
  }
  
  // Increment view count
  await portfolio.incrementViews()
  
  res.status(200).json({
    success: true,
    portfolio: portfolio,
    user: user.toPublicJSON()
  })
}))

// @desc    Publish portfolio
// @route   POST /api/portfolio/publish
// @access  Private
router.post('/publish', auth, asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  await portfolio.publish()
  
  res.status(200).json({
    success: true,
    message: 'Portfolio published successfully',
    portfolio: portfolio
  })
}))

// @desc    Unpublish portfolio
// @route   POST /api/portfolio/unpublish
// @access  Private
router.post('/unpublish', auth, asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  portfolio.status = 'draft'
  await portfolio.save()
  
  res.status(200).json({
    success: true,
    message: 'Portfolio unpublished successfully',
    portfolio: portfolio
  })
}))

// @desc    Add block to portfolio
// @route   POST /api/portfolio/blocks
// @access  Private
router.post('/blocks', auth, asyncHandler(async (req, res) => {
  const { type, content, position } = req.body
  
  if (!type || !content) {
    return res.status(400).json({
      success: false,
      message: 'Block type and content are required'
    })
  }
  
  let portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    portfolio = new Portfolio({
      user: req.user.userId,
      blocks: []
    })
  }
  
  const newBlock = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    content: content,
    order: position !== undefined ? position : portfolio.blocks.length,
    visible: true
  }
  
  portfolio.addBlock(newBlock, position)
  await portfolio.save()
  
  // Emit real-time update
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('block-added', {
      block: newBlock,
      timestamp: new Date()
    })
  }
  
  res.status(201).json({
    success: true,
    message: 'Block added successfully',
    block: newBlock,
    portfolio: portfolio
  })
}))

// @desc    Update block in portfolio
// @route   PUT /api/portfolio/blocks/:blockId
// @access  Private
router.put('/blocks/:blockId', auth, asyncHandler(async (req, res) => {
  const { blockId } = req.params
  const { content, visible } = req.body
  
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  const blockIndex = portfolio.blocks.findIndex(block => block.id === blockId)
  
  if (blockIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Block not found'
    })
  }
  
  // Update block
  if (content !== undefined) {
    portfolio.blocks[blockIndex].content = content
  }
  
  if (visible !== undefined) {
    portfolio.blocks[blockIndex].visible = visible
  }
  
  portfolio.blocks[blockIndex].updated_at = new Date()
  portfolio.version += 1
  portfolio.last_modified = new Date()
  
  await portfolio.save()
  
  // Emit real-time update
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('block-updated', {
      block: portfolio.blocks[blockIndex],
      timestamp: new Date()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Block updated successfully',
    block: portfolio.blocks[blockIndex]
  })
}))

// @desc    Delete block from portfolio
// @route   DELETE /api/portfolio/blocks/:blockId
// @access  Private
router.delete('/blocks/:blockId', auth, asyncHandler(async (req, res) => {
  const { blockId } = req.params
  
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  const removedBlock = portfolio.removeBlock(blockId)
  
  if (!removedBlock) {
    return res.status(404).json({
      success: false,
      message: 'Block not found'
    })
  }
  
  await portfolio.save()
  
  // Emit real-time update
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('block-deleted', {
      blockId: blockId,
      timestamp: new Date()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Block deleted successfully'
  })
}))

// @desc    Reorder blocks in portfolio
// @route   PUT /api/portfolio/blocks/reorder
// @access  Private
router.put('/blocks/reorder', auth, asyncHandler(async (req, res) => {
  const { blockIds } = req.body
  
  if (!Array.isArray(blockIds)) {
    return res.status(400).json({
      success: false,
      message: 'Block IDs must be an array'
    })
  }
  
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  portfolio.reorderBlocks(blockIds)
  await portfolio.save()
  
  // Emit real-time update
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('blocks-reordered', {
      blockIds: blockIds,
      timestamp: new Date()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Blocks reordered successfully',
    portfolio: portfolio
  })
}))

// @desc    Save portfolio data (autosave endpoint)
// @route   POST /api/portfolio/save
// @access  Private
router.post('/save', auth, validatePortfolioSave, validateBlockContent, asyncHandler(async (req, res) => {
  const { blocks, layout, theme, seo, version } = req.body
  
  let portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    portfolio = new Portfolio({
      userId: req.user.userId,
      blocks: blocks || [],
      layout: layout || {},
      theme: theme || {},
      seo: seo || {}
    })
  } else {
    // Check version for conflict resolution
    if (version && portfolio.version > version) {
      return res.status(409).json({
        success: false,
        message: 'Portfolio has been modified by another session',
        currentVersion: portfolio.version,
        portfolio: portfolio
      })
    }
    
    // Update fields if provided
    if (blocks !== undefined) portfolio.blocks = blocks
    if (layout) portfolio.layout = { ...portfolio.layout, ...layout }
    if (theme) portfolio.theme = { ...portfolio.theme, ...theme }
    if (seo) portfolio.seo = { ...portfolio.seo, ...seo }
  }
  
  await portfolio.save()
  
  // Emit real-time update via Socket.io
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('portfolio-saved', {
      portfolio: portfolio,
      timestamp: new Date().toISOString()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Portfolio saved successfully',
    portfolio: portfolio,
    version: portfolio.version
  })
}))

// @desc    Get portfolio by ID
// @route   GET /api/portfolio/:id
// @access  Private
router.get('/:id', auth, validatePortfolioId, asyncHandler(async (req, res) => {
  const { id } = req.params
  
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid portfolio ID format'
    })
  }
  
  const portfolio = await Portfolio.findById(id).populate('userId', 'username name avatar_url')
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  // Check if user has access to this portfolio
  if (portfolio.userId._id.toString() !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this portfolio'
    })
  }
  
  res.status(200).json({
    success: true,
    portfolio: portfolio
  })
}))

// @desc    Update portfolio by ID
// @route   PUT /api/portfolio/:id
// @access  Private
router.put('/:id', auth, validatePortfolioId, validatePortfolioUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { blocks, layout, theme, seo, custom_domain, version } = req.body
  
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid portfolio ID format'
    })
  }
  
  const portfolio = await Portfolio.findById(id)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  // Check if user has access to this portfolio
  if (portfolio.userId.toString() !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this portfolio'
    })
  }
  
  // Check version for conflict resolution
  if (version && portfolio.version > version) {
    return res.status(409).json({
      success: false,
      message: 'Portfolio has been modified by another session',
      currentVersion: portfolio.version,
      portfolio: portfolio
    })
  }
  
  // Update fields if provided
  if (blocks !== undefined) portfolio.blocks = blocks
  if (layout) portfolio.layout = { ...portfolio.layout, ...layout }
  if (theme) portfolio.theme = { ...portfolio.theme, ...theme }
  if (seo) portfolio.seo = { ...portfolio.seo, ...seo }
  if (custom_domain !== undefined) portfolio.publishing.customDomain = custom_domain
  
  await portfolio.save()
  
  // Emit real-time update via Socket.io
  if (req.io) {
    req.io.to(`portfolio-${req.user.userId}`).emit('portfolio-updated', {
      portfolio: portfolio,
      timestamp: new Date().toISOString()
    })
  }
  
  res.status(200).json({
    success: true,
    message: 'Portfolio updated successfully',
    portfolio: portfolio
  })
}))

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/analytics
// @access  Private
router.get('/analytics', auth, asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByUserId(req.user.userId)
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    })
  }
  
  const analytics = {
    views: portfolio.stats.views,
    uniqueViews: portfolio.stats.uniqueViews,
    lastViewed: portfolio.stats.lastViewed,
    shares: portfolio.stats.shares,
    status: portfolio.status,
    publishedAt: portfolio.publishing.publishedAt
  }
  
  res.status(200).json({
    success: true,
    analytics: analytics
  })
}))

module.exports = router