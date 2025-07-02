const express = require('express')
const axios = require('axios')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

// @desc    Get user's GitHub repositories
// @route   GET /api/github/repos
// @access  Private
router.get('/repos', auth, asyncHandler(async (req, res) => {
  const { page = 1, per_page = 30, sort = 'updated', type = 'owner' } = req.query
  
  const user = await User.findById(req.user.userId)
  
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${user.tokens.github_access_token}`,
        'User-Agent': 'DevDeck-App'
      },
      params: {
        page: parseInt(page),
        per_page: Math.min(parseInt(per_page), 100),
        sort: sort,
        type: type,
        affiliation: 'owner,collaborator'
      }
    })
    
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      homepage: repo.homepage,
      language: repo.language,
      languages_url: repo.languages_url,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      topics: repo.topics || [],
      visibility: repo.visibility,
      private: repo.private,
      fork: repo.fork,
      archived: repo.archived,
      disabled: repo.disabled,
      default_branch: repo.default_branch,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      size: repo.size,
      license: repo.license ? {
        key: repo.license.key,
        name: repo.license.name,
        spdx_id: repo.license.spdx_id
      } : null
    }))
    
    res.status(200).json({
      success: true,
      repos: repos,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: repos.length
      }
    })
    
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token is invalid. Please reconnect your GitHub account.'
      })
    }
    
    if (error.response?.status === 403) {
      return res.status(429).json({
        success: false,
        message: 'GitHub API rate limit exceeded. Please try again later.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repositories from GitHub',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

// @desc    Get specific repository details
// @route   GET /api/github/repos/:owner/:repo
// @access  Private
router.get('/repos/:owner/:repo', auth, asyncHandler(async (req, res) => {
  const { owner, repo } = req.params
  
  const user = await User.findById(req.user.userId)
  
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const [repoResponse, languagesResponse, readmeResponse] = await Promise.allSettled([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${user.tokens.github_access_token}`,
          'User-Agent': 'DevDeck-App'
        }
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Authorization': `token ${user.tokens.github_access_token}`,
          'User-Agent': 'DevDeck-App'
        }
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Authorization': `token ${user.tokens.github_access_token}`,
          'User-Agent': 'DevDeck-App',
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
    ])
    
    if (repoResponse.status === 'rejected') {
      throw repoResponse.reason
    }
    
    const repoData = repoResponse.value.data
    const languages = languagesResponse.status === 'fulfilled' ? languagesResponse.value.data : {}
    const readme = readmeResponse.status === 'fulfilled' ? readmeResponse.value.data : null
    
    const repository = {
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      ssh_url: repoData.ssh_url,
      homepage: repoData.homepage,
      language: repoData.language,
      languages: languages,
      stargazers_count: repoData.stargazers_count,
      watchers_count: repoData.watchers_count,
      forks_count: repoData.forks_count,
      open_issues_count: repoData.open_issues_count,
      topics: repoData.topics || [],
      visibility: repoData.visibility,
      private: repoData.private,
      fork: repoData.fork,
      archived: repoData.archived,
      disabled: repoData.disabled,
      default_branch: repoData.default_branch,
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      pushed_at: repoData.pushed_at,
      size: repoData.size,
      license: repoData.license ? {
        key: repoData.license.key,
        name: repoData.license.name,
        spdx_id: repoData.license.spdx_id
      } : null,
      readme: readme
    }
    
    res.status(200).json({
      success: true,
      repository: repository
    })
    
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message)
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found or you do not have access to it.'
      })
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token is invalid. Please reconnect your GitHub account.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository details from GitHub',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

// @desc    Get user's GitHub profile
// @route   GET /api/github/profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
  
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${user.tokens.github_access_token}`,
        'User-Agent': 'DevDeck-App'
      }
    })
    
    const githubProfile = {
      id: response.data.id,
      login: response.data.login,
      name: response.data.name,
      email: response.data.email,
      bio: response.data.bio,
      avatar_url: response.data.avatar_url,
      location: response.data.location,
      blog: response.data.blog,
      company: response.data.company,
      public_repos: response.data.public_repos,
      public_gists: response.data.public_gists,
      followers: response.data.followers,
      following: response.data.following,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      hireable: response.data.hireable
    }
    
    res.status(200).json({
      success: true,
      profile: githubProfile
    })
    
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token is invalid. Please reconnect your GitHub account.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

// @desc    Sync GitHub data
// @route   POST /api/github/sync
// @access  Private
router.post('/sync', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
  
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${user.tokens.github_access_token}`,
        'User-Agent': 'DevDeck-App'
      }
    })
    
    const githubData = response.data
    
    // Update user's GitHub data
    user.github_data = {
      public_repos: githubData.public_repos,
      followers: githubData.followers,
      following: githubData.following,
      company: githubData.company,
      blog: githubData.blog,
      hireable: githubData.hireable
    }
    
    // Update profile data if user allows it
    if (!user.name || user.name === user.username) {
      user.name = githubData.name || user.name
    }
    
    if (!user.bio) {
      user.bio = githubData.bio || user.bio
    }
    
    if (!user.location) {
      user.location = githubData.location || user.location
    }
    
    if (!user.website) {
      user.website = githubData.blog || user.website
    }
    
    user.avatar_url = githubData.avatar_url
    
    await user.save()
    
    res.status(200).json({
      success: true,
      message: 'GitHub data synced successfully',
      user: user.toPublicJSON()
    })
    
  } catch (error) {
    console.error('GitHub sync error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token is invalid. Please reconnect your GitHub account.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync GitHub data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

// @desc    Search repositories
// @route   GET /api/github/search/repos
// @access  Private
router.get('/search/repos', auth, asyncHandler(async (req, res) => {
  const { q, sort = 'updated', order = 'desc', per_page = 30, page = 1 } = req.query
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    })
  }
  
  const user = await User.findById(req.user.userId)
  
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      headers: {
        'Authorization': `token ${user.tokens.github_access_token}`,
        'User-Agent': 'DevDeck-App'
      },
      params: {
        q: `${q} user:${user.username}`,
        sort: sort,
        order: order,
        per_page: Math.min(parseInt(per_page), 100),
        page: parseInt(page)
      }
    })
    
    const repos = response.data.items.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      topics: repo.topics || [],
      updated_at: repo.updated_at,
      private: repo.private
    }))
    
    res.status(200).json({
      success: true,
      repos: repos,
      total_count: response.data.total_count,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: response.data.total_count
      }
    })
    
  } catch (error) {
    console.error('GitHub search error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub access token is invalid. Please reconnect your GitHub account.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to search repositories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}))

module.exports = router