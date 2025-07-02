const express = require('express')
const axios = require('axios')
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const { auth } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')

const router = express.Router()

// In-memory cache for GitHub API responses
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Rate limiting tracker
const rateLimitTracker = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30

// Cache helper functions
const getCacheKey = (userId, endpoint, params = '') => {
  return `${userId}:${endpoint}:${params}`
}

const getFromCache = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Rate limiting helper
const checkRateLimit = (userId) => {
  const now = Date.now()
  const userRequests = rateLimitTracker.get(userId) || []
  
  // Remove requests older than the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW)
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitTracker.set(userId, recentRequests)
  return true
}

// GitHub API helper with better error handling
const makeGitHubRequest = async (url, token, options = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevDeck-Portfolio-Builder',
        ...options.headers
      },
      timeout: 10000,
      ...options
    })
    return response.data
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded')
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid GitHub token')
    }
    if (error.response?.status === 404) {
      throw new Error('Resource not found')
    }
    throw new Error(`GitHub API error: ${error.message}`)
  }
}

// Helper function to extract README content
const extractReadmeContent = async (owner, repo, token) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`
    const readmeData = await makeGitHubRequest(url, token)
    
    // Decode base64 content
    const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')
    
    // Extract first paragraph or first 200 characters as description
    const lines = content.split('\n').filter(line => line.trim())
    let description = ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      // Skip headers, badges, and empty lines
      if (!trimmed.startsWith('#') && !trimmed.startsWith('[![') && !trimmed.startsWith('[!') && trimmed.length > 20) {
        description = trimmed.substring(0, 200)
        break
      }
    }
    
    return {
      content: content.substring(0, 1000), // First 1000 chars
      description: description || null,
      size: readmeData.size,
      download_url: readmeData.download_url
    }
  } catch (error) {
    return null
  }
}

// Helper function to get repository languages
const getRepositoryLanguages = async (owner, repo, token) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/languages`
    const languages = await makeGitHubRequest(url, token)
    
    // Calculate percentages
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
    const languageStats = Object.entries(languages).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: ((bytes / total) * 100).toFixed(1)
    })).sort((a, b) => b.bytes - a.bytes)
    
    return languageStats
  } catch (error) {
    return []
  }
}

// Format repository data for consistent response
const formatRepositoryData = (repo, readmeContent = null, languages = null) => {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || '',
    html_url: repo.html_url,
    clone_url: repo.clone_url,
    ssh_url: repo.ssh_url,
    homepage: repo.homepage || '',
    language: repo.language,
    languages: languages,
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
    } : null,
    readme: readmeContent,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
      type: repo.owner.type
    }
  }
}

// Helper function to format repository data into project block schema
const formatToProjectBlock = (repo, readme = null, languages = []) => {
  return {
    id: `github-${repo.id}`,
    title: repo.name,
    description: readme?.description || repo.description || '',
    technologies: languages.slice(0, 5).map(lang => lang.name), // Top 5 languages
    github_url: repo.html_url,
    live_url: repo.homepage || null,
    image_url: null, // Could be enhanced to extract images from README
    featured: repo.stargazers_count > 10 || false, // Auto-feature popular repos
    metadata: {
      github_id: repo.id,
      full_name: repo.full_name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      languages: languages,
      topics: repo.topics,
      license: repo.license,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      is_fork: repo.fork,
      is_private: repo.private,
      is_archived: repo.archived,
      readme: readme ? {
        content: readme.content,
        size: readme.size
      } : null
    }
  }
}

// @desc    Get user's GitHub repositories
// @route   GET /api/github/repos
// @access  Private
router.get('/repos', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { page = 1, per_page = 30, sort = 'updated', type = 'owner' } = req.query
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    })
  }
  
  // Check cache
  const cacheKey = getCacheKey(userId, 'repos', `${page}-${per_page}-${sort}-${type}`)
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      repos: cachedData,
      cached: true,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: cachedData.length
      }
    })
  }
  
  const user = await User.findById(userId)
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const url = `https://api.github.com/user/repos?page=${page}&per_page=${Math.min(parseInt(per_page), 100)}&sort=${sort}&type=${type}&affiliation=owner,collaborator`
    const repos = await makeGitHubRequest(url, user.tokens.github_access_token)
    
    const formattedRepos = repos.map(repo => formatRepositoryData(repo))
    
    // Cache the result
    setCache(cacheKey, formattedRepos)
    
    res.json({
      success: true,
      repos: formattedRepos,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: formattedRepos.length
      }
    })
  } catch (error) {
    console.error('GitHub API error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}))

// @desc    Get repositories formatted as project blocks
// @route   GET /api/github/repos/projects
// @access  Private
router.get('/repos/projects', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { page = 1, per_page = 10, include_readme = 'true', include_languages = 'true' } = req.query
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    })
  }
  
  // Check cache
  const cacheKey = getCacheKey(userId, 'project-blocks', `${page}-${per_page}-${include_readme}-${include_languages}`)
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      projects: cachedData,
      cached: true
    })
  }
  
  const user = await User.findById(userId)
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    // Get repositories
    const url = `https://api.github.com/user/repos?page=${page}&per_page=${Math.min(parseInt(per_page), 50)}&sort=updated&type=owner&affiliation=owner`
    const repos = await makeGitHubRequest(url, user.tokens.github_access_token)
    
    // Filter out forks and archived repos by default
    const filteredRepos = repos.filter(repo => !repo.fork && !repo.archived)
    
    const projects = []
    
    for (const repo of filteredRepos) {
      let readme = null
      let languages = []
      
      // Extract README if requested
      if (include_readme === 'true') {
        readme = await extractReadmeContent(repo.owner.login, repo.name, user.tokens.github_access_token)
      }
      
      // Get languages if requested
      if (include_languages === 'true') {
        languages = await getRepositoryLanguages(repo.owner.login, repo.name, user.tokens.github_access_token)
      }
      
      const projectBlock = formatToProjectBlock(repo, readme, languages)
      projects.push(projectBlock)
    }
    
    // Cache the result
    setCache(cacheKey, projects)
    
    res.json({
      success: true,
      projects: projects,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: projects.length
      }
    })
  } catch (error) {
    console.error('GitHub API error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}))

// @desc    Get user's pinned GitHub repositories
// @route   GET /api/github/repos/pinned
// @access  Private
router.get('/repos/pinned', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    })
  }
  
  // Check cache
  const cacheKey = getCacheKey(userId, 'pinned-repos')
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      repos: cachedData,
      cached: true
    })
  }
  
  const user = await User.findById(userId)
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    // Get user profile to get the username
    const profileUrl = 'https://api.github.com/user'
    const profile = await makeGitHubRequest(profileUrl, user.tokens.github_access_token)
    
    // GitHub GraphQL API for pinned repositories
    const graphqlQuery = {
      query: `
        query {
          user(login: "${profile.login}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  id
                  name
                  nameWithOwner
                  description
                  url
                  homepageUrl
                  primaryLanguage {
                    name
                    color
                  }
                  stargazerCount
                  forkCount
                  isPrivate
                  isFork
                  isArchived
                  createdAt
                  updatedAt
                  pushedAt
                  repositoryTopics(first: 10) {
                    nodes {
                      topic {
                        name
                      }
                    }
                  }
                  licenseInfo {
                    key
                    name
                    spdxId
                  }
                }
              }
            }
          }
        }
      `
    }
    
    const graphqlResponse = await axios.post('https://api.github.com/graphql', graphqlQuery, {
      headers: {
        'Authorization': `Bearer ${user.tokens.github_access_token}`,
        'User-Agent': 'DevDeck-App',
        'Content-Type': 'application/json'
      }
    })
    
    if (graphqlResponse.data.errors) {
      throw new Error(`GraphQL Error: ${graphqlResponse.data.errors[0].message}`)
    }
    
    const pinnedRepos = graphqlResponse.data.data.user.pinnedItems.nodes.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.nameWithOwner,
      description: repo.description,
      html_url: repo.url,
      homepage: repo.homepageUrl,
      language: repo.primaryLanguage?.name || null,
      language_color: repo.primaryLanguage?.color || null,
      stargazers_count: repo.stargazerCount,
      forks_count: repo.forkCount,
      topics: repo.repositoryTopics.nodes.map(topic => topic.topic.name),
      private: repo.isPrivate,
      fork: repo.isFork,
      archived: repo.isArchived,
      created_at: repo.createdAt,
      updated_at: repo.updatedAt,
      pushed_at: repo.pushedAt,
      license: repo.licenseInfo ? {
        key: repo.licenseInfo.key,
        name: repo.licenseInfo.name,
        spdx_id: repo.licenseInfo.spdxId
      } : null,
      pinned: true
    }))
    
    // Cache the result
    setCache(cacheKey, pinnedRepos)
    
    res.json({
      success: true,
      repos: pinnedRepos
    })
  } catch (error) {
    console.error('GitHub API error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}))

// @desc    Get specific repository details
// @route   GET /api/github/repos/:owner/:repo
// @access  Private
router.get('/repos/:owner/:repo', auth, asyncHandler(async (req, res) => {
  const { owner, repo } = req.params
  const userId = req.user.id
  const { include_readme = 'true', include_languages = 'true', format = 'raw' } = req.query
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    })
  }
  
  // Check cache
  const cacheKey = getCacheKey(userId, 'repo-details', `${owner}-${repo}-${include_readme}-${include_languages}-${format}`)
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      ...cachedData,
      cached: true
    })
  }
  
  const user = await User.findById(userId)
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}`
    const repoData = await makeGitHubRequest(url, user.tokens.github_access_token)
    
    let readme = null
    let languages = []
    
    // Extract README if requested
    if (include_readme === 'true') {
      readme = await extractReadmeContent(owner, repo, user.tokens.github_access_token)
    }
    
    // Get languages if requested
    if (include_languages === 'true') {
      languages = await getRepositoryLanguages(owner, repo, user.tokens.github_access_token)
    }
    
    let responseData
    
    if (format === 'project') {
      // Format as project block
      responseData = {
        project: formatToProjectBlock(repoData, readme, languages)
      }
    } else {
      // Raw repository data with additional info
      responseData = {
        repository: {
          ...formatRepositoryData(repoData),
          owner: {
            login: repoData.owner.login,
            id: repoData.owner.id,
            avatar_url: repoData.owner.avatar_url,
            html_url: repoData.owner.html_url,
            type: repoData.owner.type
          },
          readme: readme,
          languages: languages
        }
      }
    }
    
    // Cache the result
    setCache(cacheKey, responseData)
    
    res.json({
      success: true,
      ...responseData
    })
  } catch (error) {
    console.error('GitHub API error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}))

// @desc    Get user's GitHub profile
// @route   GET /api/github/user
// @access  Private
router.get('/user', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    })
  }
  
  // Check cache
  const cacheKey = getCacheKey(userId, 'profile')
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return res.json({
      success: true,
      profile: cachedData,
      cached: true
    })
  }
  
  const user = await User.findById(userId)
  if (!user || !user.tokens.github_access_token) {
    return res.status(401).json({
      success: false,
      message: 'GitHub access token not found. Please reconnect your GitHub account.'
    })
  }
  
  try {
    const url = 'https://api.github.com/user'
    const data = await makeGitHubRequest(url, user.tokens.github_access_token)
    
    const profile = {
      id: data.id,
      login: data.login,
      name: data.name,
      email: data.email,
      bio: data.bio,
      company: data.company,
      location: data.location,
      blog: data.blog,
      twitter_username: data.twitter_username,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      public_repos: data.public_repos,
      public_gists: data.public_gists,
      followers: data.followers,
      following: data.following,
      hireable: data.hireable,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    
    // Cache the result
    setCache(cacheKey, profile)
    
    res.json({
      success: true,
      profile: profile
    })
  } catch (error) {
    console.error('GitHub API error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
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