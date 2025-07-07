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

// @desc    Create/Update portfolio
// @route   POST /api/portfolio
// @access  Private
router.post('/', auth, validatePortfolioUpdate, asyncHandler(async (req, res) => {
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
    message: 'Portfolio saved successfully',
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
// @route   GET /api/portfolio/public/:username
// @access  Public
router.get('/public/:username', asyncHandler(async (req, res) => {
  const { username } = req.params
  const { track_view = 'true' } = req.query
  
  try {
    const portfolio = await Portfolio.findPublishedByUsername(username)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or not published'
      })
    }
    
    // Check if portfolio is password protected
    if (portfolio.publishing.passwordProtected) {
      const { password } = req.query
      if (!password || password !== portfolio.publishing.password) {
        return res.status(401).json({
          success: false,
          message: 'Password required to view this portfolio',
          passwordProtected: true
        })
      }
    }
    
    // Track view if enabled
    if (track_view === 'true') {
      const clientIP = req.ip || req.connection.remoteAddress
      const userAgent = req.get('User-Agent')
      
      // Simple unique view tracking (could be enhanced with more sophisticated logic)
      const isUnique = !req.session || !req.session.viewedPortfolios || 
                      !req.session.viewedPortfolios.includes(portfolio._id.toString())
      
      await portfolio.incrementViews(isUnique)
      
      // Track in session
      if (req.session) {
        if (!req.session.viewedPortfolios) {
          req.session.viewedPortfolios = []
        }
        if (isUnique) {
          req.session.viewedPortfolios.push(portfolio._id.toString())
        }
      }
    }
    
    // Generate SEO metadata
    const seoData = {
      title: portfolio.seo.title || `${portfolio.userId.name || portfolio.userId.username}'s Portfolio`,
      description: portfolio.seo.description || `Check out ${portfolio.userId.name || portfolio.userId.username}'s portfolio on DevDeck`,
      keywords: portfolio.seo.keywords || [],
      ogImage: portfolio.seo.ogImage || portfolio.userId.avatar_url,
      url: `${process.env.FRONTEND_URL}/portfolio/${username}`,
      author: portfolio.userId.name || portfolio.userId.username,
      publishedAt: portfolio.publishing.publishedAt,
      modifiedAt: portfolio.updatedAt
    }
    
    res.status(200).json({
      success: true,
      portfolio: {
        ...portfolio.toJSON(),
        publishing: {
          publishedAt: portfolio.publishing.publishedAt,
          customDomain: portfolio.publishing.customDomain,
          isIndexable: portfolio.publishing.isIndexable
          // Exclude password and passwordProtected for security
        }
      },
      user: {
        username: portfolio.userId.username,
        name: portfolio.userId.name,
        avatar_url: portfolio.userId.avatar_url,
        bio: portfolio.userId.bio,
        location: portfolio.userId.location,
        website: portfolio.userId.website,
        social: {
          twitter: portfolio.userId.twitter,
          linkedin: portfolio.userId.linkedin,
          github: portfolio.userId.github
        }
      },
      seo: seoData
    })
  } catch (error) {
    console.error('Error fetching public portfolio:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    })
  }
}))

// @desc    Publish portfolio
// @route   POST /api/portfolio/publish
// @access  Private
router.post('/publish', auth, asyncHandler(async (req, res) => {
  const { 
    customDomain, 
    isIndexable = true, 
    passwordProtected = false, 
    password 
  } = req.body
  
  try {
    const portfolio = await Portfolio.findByUserId(req.user.userId)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Validate password if password protection is enabled
    if (passwordProtected && (!password || password.length < 6)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long when password protection is enabled'
      })
    }
    
    // Update publishing settings
    portfolio.publishing.customDomain = customDomain || null
    portfolio.publishing.isIndexable = isIndexable
    portfolio.publishing.passwordProtected = passwordProtected
    portfolio.publishing.password = passwordProtected ? password : null
    
    await portfolio.publish()
    
    // Generate portfolio URL
    const portfolioUrl = customDomain 
      ? `https://${customDomain}` 
      : `${process.env.FRONTEND_URL}/portfolio/${req.user.username}`
    
    // Emit real-time update
    if (req.io) {
      req.io.to(`user_${req.user.userId}`).emit('portfolio_published', {
        portfolioId: portfolio._id,
        publishedAt: portfolio.publishing.publishedAt,
        url: portfolioUrl
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Portfolio published successfully',
      portfolio: {
        ...portfolio.toJSON(),
        publishing: {
          publishedAt: portfolio.publishing.publishedAt,
          customDomain: portfolio.publishing.customDomain,
          isIndexable: portfolio.publishing.isIndexable,
          passwordProtected: portfolio.publishing.passwordProtected
          // Exclude password for security
        }
      },
      url: portfolioUrl
    })
  } catch (error) {
    console.error('Error publishing portfolio:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to publish portfolio'
    })
  }
}))

// @desc    Unpublish portfolio
// @route   POST /api/portfolio/unpublish
// @access  Private
router.post('/unpublish', auth, asyncHandler(async (req, res) => {
  try {
    const portfolio = await Portfolio.findByUserId(req.user.userId)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    if (portfolio.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Portfolio is not currently published'
      })
    }
    
    // Update status and clear publishing data
    portfolio.status = 'draft'
    portfolio.publishing.publishedAt = null
    portfolio.publishing.customDomain = null
    portfolio.publishing.passwordProtected = false
    portfolio.publishing.password = null
    portfolio.publishing.isIndexable = true
    
    await portfolio.save()
    
    // Emit real-time update
    if (req.io) {
      req.io.to(`user_${req.user.userId}`).emit('portfolio_unpublished', {
        portfolioId: portfolio._id,
        unpublishedAt: new Date()
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Portfolio unpublished successfully',
      portfolio: {
        ...portfolio.toJSON(),
        publishing: {
          publishedAt: null,
          customDomain: null,
          isIndexable: true,
          passwordProtected: false
        }
      }
    })
  } catch (error) {
    console.error('Error unpublishing portfolio:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish portfolio'
    })
  }
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

// @desc    Get all published portfolios for discovery
// @route   GET /api/portfolio/discover
// @access  Public
router.get('/discover', asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort = 'recent', search } = req.query
  
  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: {},
      populate: {
        path: 'userId',
        select: 'username name avatar_url bio location'
      }
    }
    
    // Set sort options
    switch (sort) {
      case 'popular':
        options.sort = { 'stats.views': -1, 'publishing.publishedAt': -1 }
        break
      case 'recent':
        options.sort = { 'publishing.publishedAt': -1 }
        break
      case 'trending':
        options.sort = { 'stats.uniqueViews': -1, 'publishing.publishedAt': -1 }
        break
      default:
        options.sort = { 'publishing.publishedAt': -1 }
    }
    
    // Build query
    let query = {
      status: 'published',
      'publishing.isIndexable': true,
      'publishing.passwordProtected': false
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { 'seo.title': { $regex: search, $options: 'i' } },
        { 'seo.description': { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    const portfolios = await Portfolio.paginate(query, options)
    
    // Transform response to include only necessary data
    const transformedPortfolios = portfolios.docs.map(portfolio => ({
      _id: portfolio._id,
      user: {
        username: portfolio.userId.username,
        name: portfolio.userId.name,
        avatar_url: portfolio.userId.avatar_url,
        bio: portfolio.userId.bio,
        location: portfolio.userId.location
      },
      seo: {
        title: portfolio.seo.title,
        description: portfolio.seo.description,
        ogImage: portfolio.seo.ogImage
      },
      stats: {
        views: portfolio.stats.views,
        uniqueViews: portfolio.stats.uniqueViews
      },
      publishedAt: portfolio.publishing.publishedAt,
      lastModified: portfolio.updatedAt,
      previewBlocks: portfolio.blocks.slice(0, 3).map(block => ({
        type: block.type,
        content: block.type === 'text' ? 
          (block.content.text ? block.content.text.substring(0, 150) + '...' : '') :
          block.content
      }))
    }))
    
    res.status(200).json({
      success: true,
      portfolios: transformedPortfolios,
      pagination: {
        currentPage: portfolios.page,
        totalPages: portfolios.totalPages,
        totalDocs: portfolios.totalDocs,
        hasNextPage: portfolios.hasNextPage,
        hasPrevPage: portfolios.hasPrevPage
      },
      filters: {
        sort,
        search: search || null
      }
    })
  } catch (error) {
    console.error('Error fetching portfolios for discovery:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios'
    })
  }
}))

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/analytics
// @access  Private
router.get('/analytics', auth, asyncHandler(async (req, res) => {
  const { timeframe = '30d' } = req.query
  
  try {
    const portfolio = await Portfolio.findByUserId(req.user.userId)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Calculate timeframe dates
    const now = new Date()
    let startDate
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    const analytics = {
      overview: {
        totalViews: portfolio.stats.views,
        uniqueViews: portfolio.stats.uniqueViews,
        shares: portfolio.stats.shares,
        lastViewed: portfolio.stats.lastViewed,
        status: portfolio.status,
        publishedAt: portfolio.publishing.publishedAt,
        isPublic: portfolio.status === 'published'
      },
      engagement: {
        viewsToday: 0, // Would need daily tracking implementation
        avgViewsPerDay: portfolio.stats.views / Math.max(1, Math.floor((now - (portfolio.publishing.publishedAt || portfolio.createdAt)) / (24 * 60 * 60 * 1000))),
        bounceRate: 0, // Would need session tracking
        avgTimeOnPage: 0 // Would need session tracking
      },
      traffic: {
        directViews: portfolio.stats.views, // Simplified - would need referrer tracking
        socialViews: 0,
        searchViews: 0,
        referralViews: 0
      },
      performance: {
        loadTime: 0, // Would need performance tracking
        mobileViews: 0, // Would need device tracking
        desktopViews: 0
      }
    }
    
    res.status(200).json({
      success: true,
      analytics,
      timeframe
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    })
  }
}))

// @desc    Get public portfolios for browsing
// @route   GET /api/portfolio/public
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  try {
    const {
      category = 'all',
      sort = 'recent',
      search = '',
      page = 1,
      limit = 12
    } = req.query;

    // Build query for published portfolios
    let query = {
      status: 'published',
      'publishing.isIndexable': true,
      'publishing.passwordProtected': false
    };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'seo.title': searchRegex },
        { 'seo.description': searchRegex },
        { 'seo.keywords': { $in: [searchRegex] } }
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'stats.shares': -1, 'stats.views': -1 };
        break;
      case 'views':
        sortOptions = { 'stats.views': -1 };
        break;
      case 'recent':
      default:
        sortOptions = { 'publishing.publishedAt': -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const portfolios = await Portfolio.find(query)
      .populate('userId', 'username name avatar_url')
      .select('-publishing.password -__v')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Portfolio.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      portfolios,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public portfolios:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// @desc    Clone a portfolio
// @route   POST /api/portfolio/clone
// @access  Private
router.post('/clone', auth, asyncHandler(async (req, res) => {
  try {
    const { portfolioId } = req.body;
    const userId = req.user.userId;

    if (!portfolioId) {
      return res.status(400).json({ message: 'Portfolio ID is required' });
    }

    // Find the source portfolio
    const sourcePortfolio = await Portfolio.findById(portfolioId);
    if (!sourcePortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Check if portfolio is public
    if (sourcePortfolio.status !== 'published' || !sourcePortfolio.publishing.isIndexable) {
      return res.status(403).json({ message: 'Portfolio is not publicly available for cloning' });
    }

    // Check if user already has a portfolio
    const existingPortfolio = await Portfolio.findByUserId(userId);
    if (existingPortfolio) {
      return res.status(400).json({ 
        message: 'You already have a portfolio. Delete your current portfolio first to clone a new one.' 
      });
    }

    // Create cloned portfolio
    const clonedPortfolio = new Portfolio({
      user: userId,
      blocks: sourcePortfolio.blocks.map(block => ({
        ...block.toObject(),
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Generate new IDs for blocks
      })),
      layout: sourcePortfolio.layout,
      theme: sourcePortfolio.theme,
      seo: {
        title: '',
        description: '',
        keywords: [],
        ogImage: ''
      },
      status: 'draft',
      version: 1,
      stats: {
        views: 0,
        uniqueViews: 0,
        shares: 0
      },
      publishing: {
        isIndexable: true,
        passwordProtected: false
      }
    });

    await clonedPortfolio.save();

    // Increment share count for source portfolio
    await Portfolio.findByIdAndUpdate(portfolioId, {
      $inc: { 'stats.shares': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio cloned successfully',
      portfolio: clonedPortfolio
    });
  } catch (error) {
    console.error('Error cloning portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

module.exports = router