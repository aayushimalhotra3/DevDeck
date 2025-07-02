const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const asyncHandler = require('../middleware/asyncHandler')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

// @desc    Export portfolio to JSON
// @route   GET /api/export/json
// @access  Private
router.get('/json', auth, asyncHandler(async (req, res) => {
  try {
    const portfolio = await Portfolio.findByUserId(req.user.id)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Create exportable JSON structure
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        platform: 'DevDeck'
      },
      user: {
        username: portfolio.userId.username,
        name: portfolio.userId.name,
        email: portfolio.userId.email,
        avatar_url: portfolio.userId.avatar_url,
        bio: portfolio.userId.bio,
        location: portfolio.userId.location,
        website: portfolio.userId.website,
        social: {
          github: portfolio.userId.github,
          twitter: portfolio.userId.twitter,
          linkedin: portfolio.userId.linkedin
        }
      },
      portfolio: {
        blocks: portfolio.blocks,
        layout: portfolio.layout,
        theme: portfolio.theme,
        seo: portfolio.seo,
        status: portfolio.status,
        stats: portfolio.stats,
        publishing: {
          publishedAt: portfolio.publishing.publishedAt,
          customDomain: portfolio.publishing.customDomain,
          isIndexable: portfolio.publishing.isIndexable
        },
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt
      }
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.userId.username}-portfolio.json"`)
    
    res.status(200).json(exportData)
  } catch (error) {
    console.error('Error exporting portfolio to JSON:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export portfolio'
    })
  }
}))

// @desc    Export portfolio to Markdown
// @route   GET /api/export/markdown
// @access  Private
router.get('/markdown', auth, asyncHandler(async (req, res) => {
  try {
    const portfolio = await Portfolio.findByUserId(req.user.id)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Generate Markdown content
    let markdown = `# ${portfolio.userId.name || portfolio.userId.username}'s Portfolio\n\n`
    
    // Add user info
    if (portfolio.userId.bio) {
      markdown += `## About\n${portfolio.userId.bio}\n\n`
    }
    
    if (portfolio.userId.location) {
      markdown += `📍 **Location:** ${portfolio.userId.location}\n\n`
    }
    
    // Add social links
    const socialLinks = []
    if (portfolio.userId.website) socialLinks.push(`[Website](${portfolio.userId.website})`)
    if (portfolio.userId.github) socialLinks.push(`[GitHub](https://github.com/${portfolio.userId.github})`)
    if (portfolio.userId.twitter) socialLinks.push(`[Twitter](https://twitter.com/${portfolio.userId.twitter})`)
    if (portfolio.userId.linkedin) socialLinks.push(`[LinkedIn](https://linkedin.com/in/${portfolio.userId.linkedin})`)
    
    if (socialLinks.length > 0) {
      markdown += `## Connect\n${socialLinks.join(' • ')}\n\n`
    }
    
    // Process blocks
    portfolio.blocks.forEach((block, index) => {
      switch (block.type) {
        case 'bio':
          if (block.content.text) {
            markdown += `## Bio\n${block.content.text}\n\n`
          }
          break
          
        case 'project':
          markdown += `## ${block.content.title || 'Project'}\n\n`
          if (block.content.description) {
            markdown += `${block.content.description}\n\n`
          }
          if (block.content.technologies && block.content.technologies.length > 0) {
            markdown += `**Technologies:** ${block.content.technologies.join(', ')}\n\n`
          }
          if (block.content.github_url) {
            markdown += `[View on GitHub](${block.content.github_url})\n\n`
          }
          if (block.content.live_url) {
            markdown += `[Live Demo](${block.content.live_url})\n\n`
          }
          break
          
        case 'skills':
          markdown += `## Skills\n\n`
          if (block.content.categories) {
            Object.entries(block.content.categories).forEach(([category, skills]) => {
              markdown += `### ${category}\n`
              skills.forEach(skill => {
                markdown += `- ${skill.name}${skill.level ? ` (${skill.level})` : ''}\n`
              })
              markdown += '\n'
            })
          }
          break
          
        case 'experience':
          markdown += `## ${block.content.title || 'Experience'}\n\n`
          if (block.content.company) {
            markdown += `**${block.content.company}**\n\n`
          }
          if (block.content.duration) {
            markdown += `*${block.content.duration}*\n\n`
          }
          if (block.content.description) {
            markdown += `${block.content.description}\n\n`
          }
          break
          
        case 'text':
          if (block.content.text) {
            markdown += `${block.content.text}\n\n`
          }
          break
      }
    })
    
    // Add footer
    markdown += `---\n\n*Generated from DevDeck on ${new Date().toLocaleDateString()}*\n`
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/markdown')
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.userId.username}-portfolio.md"`)
    
    res.status(200).send(markdown)
  } catch (error) {
    console.error('Error exporting portfolio to Markdown:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export portfolio'
    })
  }
}))

// @desc    Export portfolio to PDF
// @route   GET /api/export/pdf
// @access  Private
// Temporarily disabled due to Puppeteer installation issues
/*
router.get('/pdf', auth, asyncHandler(async (req, res) => {
  let browser
  
  try {
    const portfolio = await Portfolio.findByUserId(req.user.id).populate('userId', 'username name email avatar_url bio location website github twitter linkedin')
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Generate HTML content for PDF
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${portfolio.userId.name || portfolio.userId.username}'s Portfolio</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: block;
            }
            h1 {
                color: #2c3e50;
                margin-bottom: 10px;
            }
            h2 {
                color: #34495e;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }
            .social-links {
                margin: 15px 0;
            }
            .social-links a {
                color: #3498db;
                text-decoration: none;
                margin: 0 10px;
            }
            .block {
                margin-bottom: 30px;
                padding: 20px;
                border-left: 4px solid #3498db;
                background: #f8f9fa;
            }
            .tech-tags {
                margin: 10px 0;
            }
            .tech-tag {
                display: inline-block;
                background: #e74c3c;
                color: white;
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 12px;
                margin: 2px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #7f8c8d;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            ${portfolio.userId.avatar_url ? `<img src="${portfolio.userId.avatar_url}" alt="Avatar" class="avatar">` : ''}
            <h1>${portfolio.userId.name || portfolio.userId.username}</h1>
            ${portfolio.userId.bio ? `<p>${portfolio.userId.bio}</p>` : ''}
            ${portfolio.userId.location ? `<p>📍 ${portfolio.userId.location}</p>` : ''}
            
            <div class="social-links">
                ${portfolio.userId.website ? `<a href="${portfolio.userId.website}">Website</a>` : ''}
                ${portfolio.userId.github ? `<a href="https://github.com/${portfolio.userId.github}">GitHub</a>` : ''}
                ${portfolio.userId.twitter ? `<a href="https://twitter.com/${portfolio.userId.twitter}">Twitter</a>` : ''}
                ${portfolio.userId.linkedin ? `<a href="https://linkedin.com/in/${portfolio.userId.linkedin}">LinkedIn</a>` : ''}
            </div>
        </div>
    `
    
    // Process blocks
    portfolio.blocks.forEach((block, index) => {
      html += '<div class="block">'
      
      switch (block.type) {
        case 'bio':
          if (block.content.text) {
            html += `<h2>About Me</h2><p>${block.content.text}</p>`
          }
          break
          
        case 'project':
          html += `<h2>${block.content.title || 'Project'}</h2>`
          if (block.content.description) {
            html += `<p>${block.content.description}</p>`
          }
          if (block.content.technologies && block.content.technologies.length > 0) {
            html += '<div class="tech-tags">'
            block.content.technologies.forEach(tech => {
              html += `<span class="tech-tag">${tech}</span>`
            })
            html += '</div>'
          }
          if (block.content.github_url) {
            html += `<p><strong>GitHub:</strong> <a href="${block.content.github_url}">${block.content.github_url}</a></p>`
          }
          if (block.content.live_url) {
            html += `<p><strong>Live Demo:</strong> <a href="${block.content.live_url}">${block.content.live_url}</a></p>`
          }
          break
          
        case 'skills':
          html += '<h2>Skills</h2>'
          if (block.content.categories) {
            Object.entries(block.content.categories).forEach(([category, skills]) => {
              html += `<h3>${category}</h3><ul>`
              skills.forEach(skill => {
                html += `<li>${skill.name}${skill.level ? ` (${skill.level})` : ''}</li>`
              })
              html += '</ul>'
            })
          }
          break
          
        case 'experience':
          html += `<h2>${block.content.title || 'Experience'}</h2>`
          if (block.content.company) {
            html += `<h3>${block.content.company}</h3>`
          }
          if (block.content.duration) {
            html += `<p><em>${block.content.duration}</em></p>`
          }
          if (block.content.description) {
            html += `<p>${block.content.description}</p>`
          }
          break
          
        case 'text':
          if (block.content.text) {
            html += `<p>${block.content.text}</p>`
          }
          break
      }
      
      html += '</div>'
    })
    
    html += `
        <div class="footer">
            <p>Generated from DevDeck on ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
    `
    
    // Launch Puppeteer and generate PDF
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.userId.username}-portfolio.pdf"`)
    
    res.status(200).send(pdf)
  } catch (error) {
    console.error('Error exporting portfolio to PDF:', error)
    
    if (browser) {
      await browser.close()
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to export portfolio to PDF'
    })
  }
}))
*/

module.exports = router