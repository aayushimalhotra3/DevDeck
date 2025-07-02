const mongoose = require('mongoose')

// Block content schemas for different block types
const bioContentSchema = {
  title: { type: String, maxlength: 100, default: '' },
  description: { type: String, maxlength: 1000, default: '' },
  avatar: { type: String, default: '' },
  skills: [{ type: String, maxlength: 50 }],
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
    email: { type: String, default: '' }
  }
}

const projectContentSchema = {
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500, default: '' },
  image: { type: String, default: '' },
  technologies: [{ type: String, maxlength: 30 }],
  links: {
    github: { type: String, default: '' },
    live: { type: String, default: '' },
    demo: { type: String, default: '' }
  },
  featured: { type: Boolean, default: false },
  stats: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String, default: '' }
  }
}

const skillsContentSchema = {
  categories: [{
    name: { type: String, required: true, maxlength: 50 },
    skills: [{
      name: { type: String, required: true, maxlength: 50 },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      icon: { type: String, default: '' },
      color: { type: String, default: '#3b82f6' }
    }]
  }]
}

const experienceContentSchema = {
  items: [{
    title: { type: String, required: true, maxlength: 100 },
    company: { type: String, required: true, maxlength: 100 },
    location: { type: String, maxlength: 100, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 1000, default: '' },
    technologies: [{ type: String, maxlength: 30 }],
    achievements: [{ type: String, maxlength: 200 }]
  }]
}

const educationContentSchema = {
  items: [{
    degree: { type: String, required: true, maxlength: 100 },
    institution: { type: String, required: true, maxlength: 100 },
    location: { type: String, maxlength: 100, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    gpa: { type: String, maxlength: 10, default: '' },
    description: { type: String, maxlength: 500, default: '' },
    achievements: [{ type: String, maxlength: 200 }]
  }]
}

const contactContentSchema = {
  title: { type: String, maxlength: 100, default: 'Get In Touch' },
  description: { type: String, maxlength: 500, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, maxlength: 20, default: '' },
  location: { type: String, maxlength: 100, default: '' },
  availability: {
    status: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
    message: { type: String, maxlength: 200, default: '' }
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  }
}

const blogContentSchema = {
  posts: [{
    title: { type: String, required: true, maxlength: 100 },
    excerpt: { type: String, maxlength: 300, default: '' },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    tags: [{ type: String, maxlength: 30 }],
    readTime: { type: Number, default: 5 },
    featured: { type: Boolean, default: false }
  }],
  rssUrl: { type: String, default: '' },
  platform: { type: String, enum: ['medium', 'dev.to', 'hashnode', 'custom'], default: 'custom' }
}

const blockSchema = new mongoose.Schema({
  // Block identification
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Block type
  type: {
    type: String,
    required: true,
    enum: ['bio', 'projects', 'skills', 'experience', 'education', 'contact', 'blog']
  },
  
  // Block content (varies by type)
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(content) {
        // Validate content based on block type
        switch (this.type) {
          case 'bio':
            return validateContent(content, bioContentSchema)
          case 'projects':
            return validateContent(content, projectContentSchema)
          case 'skills':
            return validateContent(content, skillsContentSchema)
          case 'experience':
            return validateContent(content, experienceContentSchema)
          case 'education':
            return validateContent(content, educationContentSchema)
          case 'contact':
            return validateContent(content, contactContentSchema)
          case 'blog':
            return validateContent(content, blogContentSchema)
          default:
            return false
        }
      },
      message: 'Invalid content for block type'
    }
  },
  
  // Layout and positioning
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 1 },
    height: { type: Number, default: 1 }
  },
  
  // Display order
  order: {
    type: Number,
    default: 0
  },
  
  // Visibility
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Block-specific settings
  settings: {
    // Styling
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
    borderRadius: { type: String, default: 'md' },
    shadow: { type: String, default: 'sm' },
    padding: { type: String, default: 'md' },
    
    // Animation
    animation: {
      type: { type: String, enum: ['none', 'fade', 'slide', 'scale'], default: 'none' },
      duration: { type: Number, default: 300 },
      delay: { type: Number, default: 0 }
    },
    
    // Responsive behavior
    responsive: {
      hideOnMobile: { type: Boolean, default: false },
      hideOnTablet: { type: Boolean, default: false },
      mobileOrder: { type: Number, default: 0 }
    }
  },
  
  // Metadata
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Helper function to validate content structure
function validateContent(content, schema) {
  // Basic validation - in a real app, you'd use a more robust validator
  try {
    return typeof content === 'object' && content !== null
  } catch (error) {
    return false
  }
}

// Indexes
blockSchema.index({ portfolioId: 1, order: 1 })
blockSchema.index({ type: 1 })
blockSchema.index({ createdBy: 1 })
blockSchema.index({ isVisible: 1 })

// Virtual for block URL
blockSchema.virtual('url').get(function() {
  return `${process.env.FRONTEND_URL}/block/${this.id}`
})

// Methods
blockSchema.methods.updateContent = function(newContent) {
  this.content = { ...this.content, ...newContent }
  return this.save()
}

blockSchema.methods.updatePosition = function(newPosition) {
  this.position = { ...this.position, ...newPosition }
  return this.save()
}

blockSchema.methods.updateSettings = function(newSettings) {
  this.settings = { ...this.settings, ...newSettings }
  return this.save()
}

blockSchema.methods.toggleVisibility = function() {
  this.isVisible = !this.isVisible
  return this.save()
}

// Static methods
blockSchema.statics.findByPortfolio = function(portfolioId) {
  return this.find({ portfolioId, isVisible: true })
    .sort({ order: 1 })
    .populate('createdBy', 'username name')
}

blockSchema.statics.findByType = function(type, portfolioId = null) {
  const query = { type, isVisible: true }
  if (portfolioId) {
    query.portfolioId = portfolioId
  }
  return this.find(query).sort({ order: 1 })
}

blockSchema.statics.getBlockTypes = function() {
  return ['bio', 'projects', 'skills', 'experience', 'education', 'contact', 'blog']
}

// Pre-save middleware
blockSchema.pre('save', function(next) {
  // Generate unique ID if not provided
  if (!this.id) {
    this.id = `block-${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  next()
})

module.exports = mongoose.model('Block', blockSchema)