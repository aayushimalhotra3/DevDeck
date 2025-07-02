const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bio', 'projects', 'skills', 'blog', 'experience', 'education', 'contact', 'testimonials', 'resume']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  order: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  _id: false
})

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Portfolio content
  blocks: [blockSchema],
  
  // Layout and design
  layout: {
    type: {
      type: String,
      enum: ['grid', 'masonry', 'single-column'],
      default: 'grid'
    },
    columns: {
      type: Number,
      min: 1,
      max: 4,
      default: 2
    },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'spacious'],
      default: 'normal'
    }
  },
  
  // Theme and styling
  theme: {
    name: {
      type: String,
      default: 'default'
    },
    primaryColor: {
      type: String,
      default: '#3b82f6'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    customCSS: {
      type: String,
      maxlength: 10000,
      default: ''
    }
  },
  
  // SEO and metadata
  seo: {
    title: {
      type: String,
      maxlength: 60,
      default: ''
    },
    description: {
      type: String,
      maxlength: 160,
      default: ''
    },
    keywords: [{
      type: String,
      maxlength: 50
    }],
    ogImage: {
      type: String,
      default: ''
    }
  },
  
  // Analytics and tracking
  analytics: {
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    enableTracking: {
      type: Boolean,
      default: false
    }
  },
  
  // Portfolio status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  
  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  
  // Publishing settings
  publishing: {
    publishedAt: {
      type: Date
    },
    customDomain: {
      type: String,
      default: ''
    },
    isIndexable: {
      type: Boolean,
      default: true
    },
    passwordProtected: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      select: false
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v
      return ret
    }
  }
})

// Indexes
portfolioSchema.index({ userId: 1 })
portfolioSchema.index({ status: 1 })
portfolioSchema.index({ 'publishing.publishedAt': -1 })
portfolioSchema.index({ 'stats.views': -1 })

// Virtual for portfolio URL
portfolioSchema.virtual('url').get(function() {
  return this.populate('userId').then(portfolio => {
    return `${process.env.FRONTEND_URL}/preview/${portfolio.userId.username}`
  })
})

// Methods
portfolioSchema.methods.incrementViews = function(isUnique = false) {
  this.stats.views += 1
  if (isUnique) {
    this.stats.uniqueViews += 1
  }
  this.stats.lastViewed = new Date()
  return this.save()
}

portfolioSchema.methods.publish = function() {
  this.status = 'published'
  this.publishing.publishedAt = new Date()
  this.version += 1
  return this.save()
}

portfolioSchema.methods.unpublish = function() {
  this.status = 'draft'
  this.publishing.publishedAt = null
  return this.save()
}

portfolioSchema.methods.addBlock = function(blockData) {
  const newBlock = {
    id: blockData.id || `block-${Date.now()}`,
    type: blockData.type,
    content: blockData.content,
    position: blockData.position || { x: 0, y: 0 },
    order: this.blocks.length,
    isVisible: blockData.isVisible !== undefined ? blockData.isVisible : true,
    settings: blockData.settings || {}
  }
  
  this.blocks.push(newBlock)
  return this.save()
}

portfolioSchema.methods.updateBlock = function(blockId, updateData) {
  const block = this.blocks.id(blockId)
  if (!block) {
    throw new Error('Block not found')
  }
  
  Object.assign(block, updateData)
  return this.save()
}

portfolioSchema.methods.removeBlock = function(blockId) {
  this.blocks.id(blockId).remove()
  return this.save()
}

portfolioSchema.methods.reorderBlocks = function(blockOrders) {
  blockOrders.forEach(({ blockId, order }) => {
    const block = this.blocks.find(b => b.id === blockId)
    if (block) {
      block.order = order
    }
  })
  
  // Sort blocks by order
  this.blocks.sort((a, b) => a.order - b.order)
  return this.save()
}

// Static methods
portfolioSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'username name avatar_url')
}

portfolioSchema.statics.findPublishedByUsername = function(username) {
  return this.findOne({ status: 'published' })
    .populate({
      path: 'userId',
      match: { username: username.toLowerCase() },
      select: 'username name avatar_url bio location website twitter linkedin'
    })
    .then(portfolio => {
      if (!portfolio || !portfolio.userId) {
        return null
      }
      return portfolio
    })
}

portfolioSchema.statics.getPublishedPortfolios = function(limit = 10, skip = 0) {
  return this.find({ status: 'published' })
    .populate('userId', 'username name avatar_url')
    .sort({ 'publishing.publishedAt': -1 })
    .limit(limit)
    .skip(skip)
}

// Pre-save middleware
portfolioSchema.pre('save', function(next) {
  // Update version on content changes
  if (this.isModified('blocks') || this.isModified('theme') || this.isModified('layout')) {
    this.version += 1
  }
  
  next()
})

module.exports = mongoose.model('Portfolio', portfolioSchema)