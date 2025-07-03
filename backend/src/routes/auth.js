const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validateGitHubCallback } = require('../middleware/validation')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

/**
 * GitHub OAuth initiation endpoint
 * 
 * Initiates the OAuth 2.0 authorization code flow with GitHub:
 * 1. Generates GitHub authorization URL with required parameters
 * 2. Returns the URL to client for redirection
 * 3. Client handles the redirect to GitHub for authentication
 * 
 * Security measures:
 * - Secure scope limitation (user:email, read:user, repo)
 * - Environment-based configuration
 * 
 * Flow: User clicks login → Client gets URL → Client redirects → GitHub → Callback endpoint
 */
// @desc    Initiate GitHub OAuth
// @route   POST /auth/github
// @access  Public
router.post('/github', (req, res) => {
  // OAuth 2.0 configuration from environment variables
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_CALLBACK_URL
  const scope = 'user:email,read:user,repo' // Required permissions for user data and repo access
  
  // Construct GitHub OAuth authorization URL with all required parameters
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`
  
  // Return authorization URL to client for redirection
  res.status(200).json({
    success: true,
    authUrl: githubAuthUrl,
    message: 'Redirect to GitHub for authentication'
  })
})

/**
 * GitHub OAuth callback endpoint
 * 
 * Handles the OAuth 2.0 authorization code flow completion:
 * 1. Validates authorization code from GitHub
 * 2. Exchanges code for access token
 * 3. Fetches user data from GitHub API
 * 4. Creates new user or updates existing user
 * 5. Generates JWT token for session management
 * 6. Sets secure HTTP-only cookie
 * 7. Returns user data for frontend state management
 * 
 * Security considerations:
 * - Validates all required parameters
 * - Uses secure cookie settings
 * - Handles token refresh and user data updates
 * - Implements proper error handling with detailed error responses
 * 
 * Data synchronization:
 * - Syncs GitHub profile data on each login
 * - Updates access tokens for API calls
 * - Maintains user activity tracking
 * - Ensures email availability for user identification
 */
// @desc    GitHub OAuth callback
// @route   POST /auth/github/callback
// @access  Public
router.post('/github/callback', validateGitHubCallback, asyncHandler(async (req, res) => {
  const { code } = req.body
  
  try {
    // Step 1: Exchange authorization code for access token
    // This is the critical OAuth 2.0 token exchange step
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json' // Ensure JSON response format
      }
    })
    
    const { access_token } = tokenResponse.data
    
    // Validate that GitHub provided a valid access token
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token from GitHub'
      })
    }
    
    // Step 2: Fetch authenticated user data from GitHub API
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`,
        'User-Agent': 'DevDeck-App' // Required by GitHub API
      }
    })
    
    const githubUser = userResponse.data
    
    // Step 3: Fetch user email if not publicly available
    // GitHub users can make their email private, so we need to handle both cases
    let email = githubUser.email
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${access_token}`,
          'User-Agent': 'DevDeck-App'
        }
      })
      
      // Find the primary email address from the user's email list
      const primaryEmail = emailResponse.data.find(e => e.primary)
      email = primaryEmail ? primaryEmail.email : null
    }
    
    // Email is required for user identification and communication
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required. Please make sure your GitHub email is public or primary.'
      })
    }
    
    // Step 4: Check if user already exists in our database
    let user = await User.findByGithubId(githubUser.id.toString())
    
    if (user) {
      // Update existing user with latest GitHub data
      // This ensures profile data stays synchronized on each login
      user.name = githubUser.name || user.name
      user.email = email
      user.avatar_url = githubUser.avatar_url
      user.bio = githubUser.bio || user.bio
      user.location = githubUser.location || user.location
      user.website = githubUser.blog || user.website
      
      // Update GitHub profile statistics for portfolio display
      user.github_data = {
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        company: githubUser.company,
        blog: githubUser.blog,
        hireable: githubUser.hireable
      }
      
      // Refresh access token for continued GitHub API access
      user.tokens.github_access_token = access_token
      
      // Track user activity for analytics and security
      await user.updateLastLogin()
    } else {
      // Create new user with comprehensive GitHub data
      // Generate unique username to avoid conflicts
      const username = await generateUniqueUsername(githubUser.login)
      
      user = new User({
        githubId: githubUser.id.toString(),
        username: username,
        email: email,
        name: githubUser.name || githubUser.login, // Fallback to username if no display name
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio || '',
        location: githubUser.location || '',
        website: githubUser.blog || '',
        // Store comprehensive GitHub profile data for portfolio use
        github_data: {
          public_repos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
          company: githubUser.company,
          blog: githubUser.blog,
          hireable: githubUser.hireable
        },
        // Store access token for future GitHub API calls
        tokens: {
          github_access_token: access_token
        }
      })
    }
    
    // Persist user data to database
    await user.save()
    
    // Step 5: Generate JWT token for session management
    // Include essential user data in token payload for quick access
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    // Step 6: Set secure HTTP-only cookie for authentication
    // Security settings prevent XSS attacks and ensure HTTPS in production
    res.cookie('token', token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection while allowing normal navigation
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration
    })
    
    // Step 7: Return user data for frontend state management
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
    // Log detailed error information for debugging
    console.error('GitHub OAuth error:', error.response?.data || error.message)
    
    // Handle specific OAuth errors with appropriate responses
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid GitHub authorization code'
      })
    }
    
    // Generic error response with conditional error details
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
// @route   GET /auth/user
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