const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validateGitHubCallback } = require('../middleware/validation')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

// @desc    GitHub OAuth callback
// @route   POST /auth/github/callback
// @access  Public
router.post('/github/callback', validateGitHubCallback, asyncHandler(async (req, res) => {
  const { code } = req.body
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    const { access_token } = tokenResponse.data
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token from GitHub'
      })
    }
    
    // Get user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`,
        'User-Agent': 'DevDeck-App'
      }
    })
    
    const githubUser = userResponse.data
    
    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${access_token}`,
          'User-Agent': 'DevDeck-App'
        }
      })
      
      const primaryEmail = emailResponse.data.find(e => e.primary)
      email = primaryEmail ? primaryEmail.email : null
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required. Please make sure your GitHub email is public or primary.'
      })
    }
    
    // Check if user exists
    let user = await User.findByGithubId(githubUser.id.toString())
    
    if (user) {
      // Update existing user
      user.name = githubUser.name || user.name
      user.email = email
      user.avatar_url = githubUser.avatar_url
      user.bio = githubUser.bio || user.bio
      user.location = githubUser.location || user.location
      user.website = githubUser.blog || user.website
      user.github_data = {
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        company: githubUser.company,
        blog: githubUser.blog,
        hireable: githubUser.hireable
      }
      user.tokens.github_access_token = access_token
      
      await user.updateLastLogin()
    } else {
      // Create new user
      const username = await generateUniqueUsername(githubUser.login)
      
      user = new User({
        githubId: githubUser.id.toString(),
        username: username,
        email: email,
        name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio || '',
        location: githubUser.location || '',
        website: githubUser.blog || '',
        github_data: {
          public_repos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
          company: githubUser.company,
          blog: githubUser.blog,
          hireable: githubUser.hireable
        },
        tokens: {
          github_access_token: access_token
        }
      })
    }
    
    await user.save()
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio
      }
    })
    
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid GitHub authorization code'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

// @desc    Logout user
// @route   POST /auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
})

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.cookies.token
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-tokens')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      user: user
    })
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}))

// @desc    Refresh token
// @route   POST /auth/refresh
// @access  Private
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies.token
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    // Set new cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    })
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}))

// Helper function to generate unique username
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername.toLowerCase()
  let counter = 1
  
  while (await User.isUsernameTaken(username)) {
    username = `${baseUsername.toLowerCase()}${counter}`
    counter++
  }
  
  return username
}

module.exports = router