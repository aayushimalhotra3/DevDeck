const express = require('express')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { validateUserUpdate } = require('../middleware/validation')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

// @desc    Get user profile
// @route   GET /api/user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-tokens')
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  res.status(200).json({
    success: true,
    user: user
  })
}))

// @desc    Update user profile
// @route   PUT /api/user
// @access  Private
router.put('/', auth, validateUserUpdate, asyncHandler(async (req, res) => {
  const {
    name,
    bio,
    location,
    website,
    social_links,
    privacy_settings,
    portfolio_settings
  } = req.body
  
  const user = await User.findById(req.user.userId)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  // Update fields if provided
  if (name !== undefined) user.name = name
  if (bio !== undefined) user.bio = bio
  if (location !== undefined) user.location = location
  if (website !== undefined) user.website = website
  
  if (social_links) {
    user.social_links = {
      ...user.social_links,
      ...social_links
    }
  }
  
  if (privacy_settings) {
    user.privacy_settings = {
      ...user.privacy_settings,
      ...privacy_settings
    }
  }
  
  if (portfolio_settings) {
    user.portfolio_settings = {
      ...user.portfolio_settings,
      ...portfolio_settings
    }
  }
  
  await user.save()
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toPublicJSON()
  })
}))

// @desc    Get user by username (public)
// @route   GET /api/user/:username
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
  
  // Check if profile is public
  if (!user.privacy_settings.profile_public) {
    return res.status(403).json({
      success: false,
      message: 'This profile is private'
    })
  }
  
  res.status(200).json({
    success: true,
    user: user.toPublicJSON()
  })
}))

// @desc    Update username
// @route   PUT /api/user/username
// @access  Private
router.put('/username', auth, asyncHandler(async (req, res) => {
  const { username } = req.body
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    })
  }
  
  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 3-30 characters long and contain only letters, numbers, hyphens, and underscores'
    })
  }
  
  const user = await User.findById(req.user.userId)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  // Check if username is already taken
  if (await User.isUsernameTaken(username.toLowerCase())) {
    return res.status(409).json({
      success: false,
      message: 'Username is already taken'
    })
  }
  
  user.username = username.toLowerCase()
  await user.save()
  
  res.status(200).json({
    success: true,
    message: 'Username updated successfully',
    user: user.toPublicJSON()
  })
}))

// @desc    Delete user account
// @route   DELETE /api/user
// @access  Private
router.delete('/', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  // TODO: Also delete associated portfolio data
  await User.findByIdAndDelete(req.user.userId)
  
  // Clear cookie
  res.clearCookie('token')
  
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  })
}))

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  // TODO: Get portfolio statistics from Portfolio model
  const stats = {
    profile_views: 0, // Placeholder
    portfolio_views: 0, // Placeholder
    github_repos: user.github_data?.public_repos || 0,
    github_followers: user.github_data?.followers || 0,
    member_since: user.createdAt,
    last_login: user.last_login
  }
  
  res.status(200).json({
    success: true,
    stats: stats
  })
}))

module.exports = router