const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const asyncHandler = require('../middleware/asyncHandler')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const OpenAI = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// @desc    Generate AI content suggestions for portfolio
// @route   POST /api/ai/suggestions
// @access  Private
router.post('/suggestions', auth, asyncHandler(async (req, res) => {
  try {
    const { blockType, currentContent, userProfile } = req.body
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI features are not available. OpenAI API key not configured.'
      })
    }
    
    let prompt = ''
    
    switch (blockType) {
      case 'bio':
        prompt = `Generate a professional and engaging bio for a developer portfolio. 
        User info: ${JSON.stringify(userProfile)}
        Current bio: ${currentContent || 'None'}
        
        Please provide 3 different bio suggestions that are:
        1. Professional yet personable
        2. Highlight technical skills and experience
        3. Include personality and interests
        4. Keep each bio under 150 words
        
        Return as JSON array with format: [{"text": "bio content", "tone": "professional/casual/creative"}]`
        break
        
      case 'project':
        prompt = `Generate compelling project descriptions for a developer portfolio.
        Project info: ${JSON.stringify(currentContent)}
        User profile: ${JSON.stringify(userProfile)}
        
        Please provide 3 different project description suggestions that:
        1. Highlight technical achievements
        2. Explain the problem solved
        3. Mention technologies used
        4. Include impact or results
        5. Keep each description under 200 words
        
        Return as JSON array with format: [{"description": "project description", "highlights": ["key point 1", "key point 2"]}]`
        break
        
      case 'skills':
        prompt = `Suggest skill categorization and improvements for a developer portfolio.
        Current skills: ${JSON.stringify(currentContent)}
        User profile: ${JSON.stringify(userProfile)}
        
        Please provide:
        1. Better skill categorization
        2. Missing skills to consider adding
        3. Skill level recommendations
        4. Industry-relevant skills for their tech stack
        
        Return as JSON with format: {
          "categories": {"Frontend": [{"name": "React", "level": "Advanced"}]},
          "suggestions": ["Consider adding..."],
          "trending": ["Popular skills in your field"]
        }`
        break
        
      case 'experience':
        prompt = `Generate professional experience descriptions for a developer portfolio.
        Experience info: ${JSON.stringify(currentContent)}
        User profile: ${JSON.stringify(userProfile)}
        
        Please provide 3 different experience description suggestions that:
        1. Use action verbs and quantifiable results
        2. Highlight technical contributions
        3. Show progression and growth
        4. Include relevant technologies
        5. Keep each description under 150 words
        
        Return as JSON array with format: [{"description": "experience description", "achievements": ["achievement 1", "achievement 2"]}]`
        break
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid block type for AI suggestions'
        })
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and technical writer specializing in developer portfolios. Provide helpful, professional, and engaging content suggestions. Always return valid JSON as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
    
    const suggestions = JSON.parse(completion.choices[0].message.content)
    
    res.status(200).json({
      success: true,
      data: {
        suggestions,
        blockType,
        usage: completion.usage
      }
    })
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI suggestions'
    })
  }
}))

// @desc    Optimize portfolio with AI analysis
// @route   POST /api/ai/optimize
// @access  Private
router.post('/optimize', auth, asyncHandler(async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI features are not available. OpenAI API key not configured.'
      })
    }
    
    const portfolio = await Portfolio.findByUserId(req.user.id).populate('userId', 'username name bio github_repos')
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    const prompt = `Analyze this developer portfolio and provide optimization suggestions:
    
    Portfolio Data: ${JSON.stringify({
      blocks: portfolio.blocks,
      user: {
        name: portfolio.userId.name,
        bio: portfolio.userId.bio,
        repoCount: portfolio.userId.github_repos?.length || 0
      }
    })}
    
    Please provide a comprehensive analysis with:
    1. Overall portfolio strength (score 1-10)
    2. Missing essential sections
    3. Content improvement suggestions
    4. Structure and layout recommendations
    5. SEO and discoverability tips
    6. Industry-specific advice
    
    Return as JSON with format: {
      "score": 8,
      "strengths": ["strength 1", "strength 2"],
      "improvements": [
        {"section": "bio", "suggestion": "improve...", "priority": "high"}
      ],
      "missing": ["contact section", "testimonials"],
      "seo": ["seo tip 1", "seo tip 2"],
      "summary": "Overall assessment and next steps"
    }`
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert portfolio reviewer and career coach for developers. Provide actionable, specific feedback to help improve portfolio effectiveness. Always return valid JSON as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    })
    
    const analysis = JSON.parse(completion.choices[0].message.content)
    
    res.status(200).json({
      success: true,
      data: {
        analysis,
        analyzedAt: new Date().toISOString(),
        usage: completion.usage
      }
    })
  } catch (error) {
    console.error('Error optimizing portfolio:', error)
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to optimize portfolio'
    })
  }
}))

// @desc    Generate SEO metadata with AI
// @route   POST /api/ai/seo
// @access  Private
router.post('/seo', auth, asyncHandler(async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI features are not available. OpenAI API key not configured.'
      })
    }
    
    const portfolio = await Portfolio.findByUserId(req.user.id).populate('userId', 'username name bio location')
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    const prompt = `Generate SEO metadata for this developer portfolio:
    
    User: ${portfolio.userId.name || portfolio.userId.username}
    Bio: ${portfolio.userId.bio || 'No bio provided'}
    Location: ${portfolio.userId.location || 'Not specified'}
    
    Portfolio blocks: ${JSON.stringify(portfolio.blocks.map(block => ({
      type: block.type,
      title: block.content.title || block.type
    })))}
    
    Please generate:
    1. SEO-optimized title (under 60 characters)
    2. Meta description (under 160 characters)
    3. Keywords (10-15 relevant keywords)
    4. Open Graph title and description
    5. Twitter card metadata
    
    Return as JSON with format: {
      "title": "SEO title",
      "description": "Meta description",
      "keywords": ["keyword1", "keyword2"],
      "ogTitle": "Open Graph title",
      "ogDescription": "OG description",
      "twitterTitle": "Twitter title",
      "twitterDescription": "Twitter description"
    }`
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert specializing in developer portfolios. Generate compelling, keyword-rich metadata that will help portfolios rank well in search engines. Always return valid JSON as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.5
    })
    
    const seoData = JSON.parse(completion.choices[0].message.content)
    
    // Update portfolio SEO data
    portfolio.seo = {
      ...portfolio.seo,
      ...seoData,
      generatedAt: new Date().toISOString()
    }
    
    await portfolio.save()
    
    res.status(200).json({
      success: true,
      data: {
        seo: seoData,
        usage: completion.usage
      }
    })
  } catch (error) {
    console.error('Error generating SEO metadata:', error)
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate SEO metadata'
    })
  }
}))

// @desc    Get AI usage statistics
// @route   GET /api/ai/usage
// @access  Private
router.get('/usage', auth, asyncHandler(async (req, res) => {
  try {
    // This would typically be stored in a separate usage tracking collection
    // For now, return mock data structure
    const usage = {
      currentMonth: {
        suggestions: 15,
        optimizations: 3,
        seoGenerations: 2,
        totalTokens: 12500
      },
      limits: {
        suggestions: 50,
        optimizations: 10,
        seoGenerations: 10,
        totalTokens: 100000
      },
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    }
    
    res.status(200).json({
      success: true,
      data: usage
    })
  } catch (error) {
    console.error('Error fetching AI usage:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage statistics'
    })
  }
}))

module.exports = router