const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  // GitHub OAuth data
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar_url: {
    type: String,
    required: true
  },
  
  // Profile information
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  website: {
    type: String,
    maxlength: 200,
    default: ''
  },
  twitter: {
    type: String,
    maxlength: 50,
    default: ''
  },
  linkedin: {
    type: String,
    maxlength: 200,
    default: ''
  },
  
  // GitHub data
  github_data: {
    public_repos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    company: { type: String, default: '' },
    blog: { type: String, default: '' },
    hireable: { type: Boolean, default: null }
  },
  
  // Privacy settings
  privacy: {
    publicProfile: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
    allowIndexing: { type: Boolean, default: true }
  },
  
  // Portfolio settings
  portfolio: {
    isPublished: { type: Boolean, default: false },
    customDomain: { type: String, default: '' },
    theme: { type: String, default: 'default' },
    analytics: { type: Boolean, default: false }
  },
  
  // Access tokens (encrypted)
  tokens: {
    github_access_token: {
      type: String,
      select: false // Don't include in queries by default
    },
    refresh_token: {
      type: String,
      select: false
    }
  },
  
  // Metadata
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.tokens
      delete ret.__v
      return ret
    }
  }
})

// Indexes (removed explicit definitions to avoid duplicates with unique: true)
// The following indexes are automatically created by unique: true:
// - username: 1
// - email: 1  
// - githubId: 1
userSchema.index({ 'portfolio.isPublished': 1 })

// Virtual for portfolio URL
userSchema.virtual('portfolioUrl').get(function() {
  return `${process.env.FRONTEND_URL}/preview/${this.username}`
})

// Methods
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject()
  delete user.tokens
  delete user.privacy
  delete user.github_data
  
  // Only include email if user allows it
  if (!this.privacy.showEmail) {
    delete user.email
  }
  
  // Only include location if user allows it
  if (!this.privacy.showLocation) {
    delete user.location
  }
  
  return user
}

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save()
}

// Static methods
userSchema.statics.findByGithubId = function(githubId) {
  return this.findOne({ githubId })
}

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() })
}

userSchema.statics.isUsernameTaken = async function(username, excludeUserId = null) {
  const query = { username: username.toLowerCase() }
  if (excludeUserId) {
    query._id = { $ne: excludeUserId }
  }
  const user = await this.findOne(query)
  return !!user
}

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure username is lowercase
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase()
  }
  
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase()
  }
  
  next()
})

module.exports = mongoose.model('User', userSchema)