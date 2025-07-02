const mongoose = require('mongoose')

const colorPaletteSchema = {
  primary: { type: String, required: true, default: '#3b82f6' },
  secondary: { type: String, required: true, default: '#8b5cf6' },
  accent: { type: String, required: true, default: '#10b981' },
  background: { type: String, required: true, default: '#ffffff' },
  surface: { type: String, required: true, default: '#f8fafc' },
  text: {
    primary: { type: String, required: true, default: '#1f2937' },
    secondary: { type: String, required: true, default: '#6b7280' },
    muted: { type: String, required: true, default: '#9ca3af' }
  },
  border: { type: String, required: true, default: '#e5e7eb' },
  success: { type: String, default: '#10b981' },
  warning: { type: String, default: '#f59e0b' },
  error: { type: String, default: '#ef4444' },
  info: { type: String, default: '#3b82f6' }
}

const typographySchema = {
  fontFamily: {
    primary: { type: String, default: 'Inter' },
    secondary: { type: String, default: 'Inter' },
    mono: { type: String, default: 'JetBrains Mono' }
  },
  fontSize: {
    xs: { type: String, default: '0.75rem' },
    sm: { type: String, default: '0.875rem' },
    base: { type: String, default: '1rem' },
    lg: { type: String, default: '1.125rem' },
    xl: { type: String, default: '1.25rem' },
    '2xl': { type: String, default: '1.5rem' },
    '3xl': { type: String, default: '1.875rem' },
    '4xl': { type: String, default: '2.25rem' }
  },
  fontWeight: {
    light: { type: Number, default: 300 },
    normal: { type: Number, default: 400 },
    medium: { type: Number, default: 500 },
    semibold: { type: Number, default: 600 },
    bold: { type: Number, default: 700 }
  },
  lineHeight: {
    tight: { type: Number, default: 1.25 },
    normal: { type: Number, default: 1.5 },
    relaxed: { type: Number, default: 1.75 }
  }
}

const spacingSchema = {
  xs: { type: String, default: '0.25rem' },
  sm: { type: String, default: '0.5rem' },
  md: { type: String, default: '1rem' },
  lg: { type: String, default: '1.5rem' },
  xl: { type: String, default: '2rem' },
  '2xl': { type: String, default: '3rem' },
  '3xl': { type: String, default: '4rem' }
}

const borderRadiusSchema = {
  none: { type: String, default: '0' },
  sm: { type: String, default: '0.125rem' },
  md: { type: String, default: '0.375rem' },
  lg: { type: String, default: '0.5rem' },
  xl: { type: String, default: '0.75rem' },
  '2xl': { type: String, default: '1rem' },
  full: { type: String, default: '9999px' }
}

const shadowSchema = {
  none: { type: String, default: 'none' },
  sm: { type: String, default: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  md: { type: String, default: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  lg: { type: String, default: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  xl: { type: String, default: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }
}

const themeSchema = new mongoose.Schema({
  // Theme identification
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Theme preview
  preview: {
    thumbnail: { type: String, default: '' },
    images: [{ type: String }]
  },
  
  // Color system
  colors: {
    light: colorPaletteSchema,
    dark: colorPaletteSchema
  },
  
  // Typography system
  typography: typographySchema,
  
  // Spacing system
  spacing: spacingSchema,
  
  // Border radius system
  borderRadius: borderRadiusSchema,
  
  // Shadow system
  shadows: shadowSchema,
  
  // Layout settings
  layout: {
    maxWidth: { type: String, default: '1200px' },
    containerPadding: { type: String, default: '1rem' },
    sectionSpacing: { type: String, default: '3rem' },
    blockSpacing: { type: String, default: '1.5rem' }
  },
  
  // Animation settings
  animations: {
    enabled: { type: Boolean, default: true },
    duration: {
      fast: { type: Number, default: 150 },
      normal: { type: Number, default: 300 },
      slow: { type: Number, default: 500 }
    },
    easing: {
      ease: { type: String, default: 'ease' },
      easeIn: { type: String, default: 'ease-in' },
      easeOut: { type: String, default: 'ease-out' },
      easeInOut: { type: String, default: 'ease-in-out' }
    }
  },
  
  // Component styles
  components: {
    button: {
      borderRadius: { type: String, default: 'md' },
      padding: { type: String, default: 'md' },
      fontSize: { type: String, default: 'base' },
      fontWeight: { type: String, default: 'medium' }
    },
    card: {
      borderRadius: { type: String, default: 'lg' },
      padding: { type: String, default: 'lg' },
      shadow: { type: String, default: 'md' },
      border: { type: Boolean, default: true }
    },
    input: {
      borderRadius: { type: String, default: 'md' },
      padding: { type: String, default: 'md' },
      fontSize: { type: String, default: 'base' },
      border: { type: Boolean, default: true }
    }
  },
  
  // Custom CSS
  customCSS: {
    type: String,
    maxlength: 50000,
    default: ''
  },
  
  // Theme metadata
  category: {
    type: String,
    enum: ['minimal', 'modern', 'classic', 'creative', 'professional', 'dark', 'colorful'],
    default: 'modern'
  },
  
  tags: [{
    type: String,
    maxlength: 30
  }],
  
  // Availability
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isPremium: {
    type: Boolean,
    default: false
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Usage statistics
  stats: {
    usageCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  
  // Creator information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version control
  version: {
    type: String,
    default: '1.0.0'
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
themeSchema.index({ name: 1 })
themeSchema.index({ category: 1 })
themeSchema.index({ isPublic: 1 })
themeSchema.index({ isPremium: 1 })
themeSchema.index({ 'stats.usageCount': -1 })
themeSchema.index({ createdBy: 1 })

// Virtual for theme URL
themeSchema.virtual('url').get(function() {
  return `${process.env.FRONTEND_URL}/themes/${this.name}`
})

// Methods
themeSchema.methods.incrementUsage = function() {
  this.stats.usageCount += 1
  return this.save()
}

themeSchema.methods.like = function() {
  this.stats.likes += 1
  return this.save()
}

themeSchema.methods.unlike = function() {
  this.stats.likes = Math.max(0, this.stats.likes - 1)
  return this.save()
}

themeSchema.methods.generateCSS = function(mode = 'light') {
  const colors = this.colors[mode]
  const { typography, spacing, borderRadius, shadows } = this
  
  // Generate CSS variables
  let css = ':root {\n'
  
  // Color variables
  css += `  --color-primary: ${colors.primary};\n`
  css += `  --color-secondary: ${colors.secondary};\n`
  css += `  --color-accent: ${colors.accent};\n`
  css += `  --color-background: ${colors.background};\n`
  css += `  --color-surface: ${colors.surface};\n`
  css += `  --color-text-primary: ${colors.text.primary};\n`
  css += `  --color-text-secondary: ${colors.text.secondary};\n`
  css += `  --color-text-muted: ${colors.text.muted};\n`
  css += `  --color-border: ${colors.border};\n`
  
  // Typography variables
  css += `  --font-family-primary: ${typography.fontFamily.primary};\n`
  css += `  --font-family-secondary: ${typography.fontFamily.secondary};\n`
  css += `  --font-family-mono: ${typography.fontFamily.mono};\n`
  
  // Spacing variables
  Object.entries(spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`
  })
  
  css += '}\n'
  
  // Add custom CSS
  if (this.customCSS) {
    css += '\n' + this.customCSS
  }
  
  return css
}

// Static methods
themeSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).sort({ 'stats.usageCount': -1 })
}

themeSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublic: true }).sort({ 'stats.usageCount': -1 })
}

themeSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ 'stats.usageCount': -1 })
    .limit(limit)
}

themeSchema.statics.findDefault = function() {
  return this.findOne({ isDefault: true })
}

themeSchema.statics.createDefault = async function() {
  const defaultTheme = {
    name: 'default',
    displayName: 'Default Theme',
    description: 'Clean and modern default theme for DevDeck portfolios',
    colors: {
      light: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f8fafc',
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          muted: '#9ca3af'
        },
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        accent: '#34d399',
        background: '#0f172a',
        surface: '#1e293b',
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
          muted: '#94a3b8'
        },
        border: '#334155',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa'
      }
    },
    category: 'modern',
    isDefault: true,
    isPublic: true,
    createdBy: null // System theme
  }
  
  return this.create(defaultTheme)
}

// Pre-save middleware
themeSchema.pre('save', function(next) {
  // Ensure only one default theme
  if (this.isDefault && this.isNew) {
    this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    ).exec()
  }
  
  next()
})

module.exports = mongoose.model('Theme', themeSchema)