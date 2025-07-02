const { body, param, query, validationResult } = require('express-validator')

// Helper function to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    })
  }
  
  next()
}

// GitHub OAuth callback validation
const validateGitHubCallback = [
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Invalid authorization code format'),
  handleValidationErrors
]

// User profile update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim(),
  
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters')
    .trim(),
  
  body('website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Website must be a valid URL with protocol (http/https)')
    .isLength({ max: 200 })
    .withMessage('Website URL must not exceed 200 characters'),
  
  body('social_links.twitter')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Twitter handle must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9_]*$/)
    .withMessage('Twitter handle can only contain letters, numbers, and underscores'),
  
  body('social_links.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL')
    .isLength({ max: 200 })
    .withMessage('LinkedIn URL must not exceed 200 characters'),
  
  body('social_links.personal_website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Personal website must be a valid URL with protocol')
    .isLength({ max: 200 })
    .withMessage('Personal website URL must not exceed 200 characters'),
  
  body('privacy_settings.profile_public')
    .optional()
    .isBoolean()
    .withMessage('Profile public setting must be a boolean'),
  
  body('privacy_settings.portfolio_public')
    .optional()
    .isBoolean()
    .withMessage('Portfolio public setting must be a boolean'),
  
  body('privacy_settings.show_email')
    .optional()
    .isBoolean()
    .withMessage('Show email setting must be a boolean'),
  
  body('portfolio_settings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  
  body('portfolio_settings.custom_domain')
    .optional()
    .isFQDN()
    .withMessage('Custom domain must be a valid domain name')
    .isLength({ max: 100 })
    .withMessage('Custom domain must not exceed 100 characters'),
  
  handleValidationErrors
]

// Portfolio update validation
const validatePortfolioUpdate = [
  body('blocks')
    .optional()
    .isArray()
    .withMessage('Blocks must be an array'),
  
  body('blocks.*.type')
    .optional()
    .isIn(['bio', 'projects', 'skills', 'blog', 'experience', 'education', 'contact'])
    .withMessage('Block type must be one of: bio, projects, skills, blog, experience, education, contact'),
  
  body('blocks.*.content')
    .optional()
    .isObject()
    .withMessage('Block content must be an object'),
  
  body('blocks.*.visible')
    .optional()
    .isBoolean()
    .withMessage('Block visibility must be a boolean'),
  
  body('layout.columns')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Layout columns must be between 1 and 3'),
  
  body('layout.spacing')
    .optional()
    .isIn(['tight', 'medium', 'loose'])
    .withMessage('Layout spacing must be tight, medium, or loose'),
  
  body('layout.max_width')
    .optional()
    .matches(/^\d+(px|%|rem|em)$/)
    .withMessage('Max width must be a valid CSS unit'),
  
  body('theme.primary_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),
  
  body('theme.background_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Background color must be a valid hex color'),
  
  body('theme.text_color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Text color must be a valid hex color'),
  
  body('theme.font_family')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Font family must be between 1 and 50 characters'),
  
  body('seo.title')
    .optional()
    .isLength({ min: 1, max: 60 })
    .withMessage('SEO title must be between 1 and 60 characters')
    .trim(),
  
  body('seo.description')
    .optional()
    .isLength({ min: 1, max: 160 })
    .withMessage('SEO description must be between 1 and 160 characters')
    .trim(),
  
  body('seo.keywords')
    .optional()
    .isArray()
    .withMessage('SEO keywords must be an array'),
  
  body('seo.keywords.*')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each keyword must be between 1 and 30 characters'),
  
  body('custom_domain')
    .optional()
    .isFQDN()
    .withMessage('Custom domain must be a valid domain name')
    .isLength({ max: 100 })
    .withMessage('Custom domain must not exceed 100 characters'),
  
  handleValidationErrors
]

// Username parameter validation
const validateUsername = [
  param('username')
    .matches(/^[a-zA-Z0-9_-]{3,30}$/)
    .withMessage('Username must be 3-30 characters long and contain only letters, numbers, hyphens, and underscores'),
  handleValidationErrors
]

// Repository parameters validation
const validateRepoParams = [
  param('owner')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Repository owner must contain only letters, numbers, hyphens, and underscores')
    .isLength({ min: 1, max: 39 })
    .withMessage('Repository owner must be between 1 and 39 characters'),
  
  param('repo')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Repository name must contain only letters, numbers, dots, hyphens, and underscores')
    .isLength({ min: 1, max: 100 })
    .withMessage('Repository name must be between 1 and 100 characters'),
  
  handleValidationErrors
]

// Query parameters validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a number between 1 and 1000'),
  
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Per page must be a number between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['created', 'updated', 'pushed', 'full_name'])
    .withMessage('Sort must be one of: created, updated, pushed, full_name'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors
]

// Search query validation
const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 256 })
    .withMessage('Search query must be between 1 and 256 characters')
    .trim(),
  
  ...validatePagination
]

// Block ID parameter validation
const validateBlockId = [
  param('blockId')
    .matches(/^block_\d+_[a-zA-Z0-9]{9}$/)
    .withMessage('Block ID must be in the format: block_timestamp_randomstring'),
  handleValidationErrors
]

// Contact form validation
const validateContactForm = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .trim(),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim(),
  
  handleValidationErrors
]

// File upload validation
const validateFileUpload = [
  body('file_type')
    .optional()
    .isIn(['image', 'document', 'video'])
    .withMessage('File type must be image, document, or video'),
  
  body('file_size')
    .optional()
    .isInt({ min: 1, max: 10485760 }) // 10MB max
    .withMessage('File size must be between 1 byte and 10MB'),
  
  handleValidationErrors
]

// Environment-specific validation
const validateEnvironment = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Additional production-specific validations
    if (req.body.custom_domain && !req.body.custom_domain.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Custom domain must be a valid domain in production'
      })
    }
  }
  
  next()
}

module.exports = {
  validateGitHubCallback,
  validateUserUpdate,
  validatePortfolioUpdate,
  validateUsername,
  validateRepoParams,
  validatePagination,
  validateSearch,
  validateBlockId,
  validateContactForm,
  validateFileUpload,
  validateEnvironment,
  handleValidationErrors
}