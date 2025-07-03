const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const asyncHandler = require('../middleware/asyncHandler')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Premium feature middleware
const requirePremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for this feature',
        upgradeUrl: '/premium/upgrade'
      })
    }
    
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking premium status'
    })
  }
}

// @desc    Get premium plans
// @route   GET /api/premium/plans
// @access  Public
router.get('/plans', asyncHandler(async (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'forever',
      features: [
        'Basic portfolio builder',
        'GitHub integration',
        'Public portfolio sharing',
        'Basic analytics',
        'Standard themes'
      ],
      limits: {
        portfolios: 1,
        customDomains: 0,
        aiSuggestions: 5,
        exportFormats: ['JSON'],
        analytics: 'basic'
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      interval: 'month',
      stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID,
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
      features: [
        'Everything in Free',
        'Unlimited portfolios',
        'Custom domains',
        'Advanced analytics',
        'AI-powered suggestions',
        'Premium themes',
        'Password protection',
        'Export to PDF/Markdown',
        'Priority support'
      ],
      limits: {
        portfolios: -1, // unlimited
        customDomains: 5,
        aiSuggestions: 100,
        exportFormats: ['JSON', 'PDF', 'Markdown'],
        analytics: 'advanced'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      interval: 'month',
      stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID,
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label solutions',
        'Advanced integrations',
        'Custom branding',
        'Dedicated support',
        'API access',
        'SSO integration'
      ],
      limits: {
        portfolios: -1,
        customDomains: -1,
        aiSuggestions: -1,
        exportFormats: ['JSON', 'PDF', 'Markdown', 'HTML'],
        analytics: 'enterprise'
      }
    }
  ]
  
  res.status(200).json({
    success: true,
    data: plans
  })
}))

// @desc    Get user subscription status
// @route   GET /api/premium/subscription
// @access  Private
router.get('/subscription', auth, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    let subscription = {
      status: 'free',
      plan: 'free',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    }
    
    if (user.subscription && user.subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId)
        
        subscription = {
          status: stripeSubscription.status,
          plan: user.subscription.plan,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          stripeSubscriptionId: stripeSubscription.id
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe subscription:', stripeError)
      }
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status'
    })
  }
}))

// @desc    Create checkout session for premium upgrade
// @route   POST /api/premium/checkout
// @access  Private
router.post('/checkout', auth, asyncHandler(async (req, res) => {
  try {
    const { planId } = req.body
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Payment processing is not available'
      })
    }
    
    const user = await User.findById(req.user.id)
    
    let priceId
    switch (planId) {
      case 'pro':
        priceId = process.env.STRIPE_PRO_PRICE_ID
        break
      case 'enterprise':
        priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid plan selected'
        })
    }
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.FRONTEND_URL}/premium?upgrade=cancelled`,
      metadata: {
        userId: user._id.toString(),
        planId: planId
      }
    })
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    })
  }
}))

// @desc    Handle Stripe webhook
// @route   POST /api/premium/webhook
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  try {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    let event
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        const userId = session.metadata.userId
        const planId = session.metadata.planId
        
        // Update user subscription
        await User.findByIdAndUpdate(userId, {
          subscription: {
            status: 'active',
            plan: planId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            startDate: new Date(),
            lastPayment: new Date()
          }
        })
        
        console.log(`Subscription activated for user ${userId}, plan: ${planId}`)
        break
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        const customerId = invoice.customer
        
        // Update last payment date
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': customerId },
          { 'subscription.lastPayment': new Date() }
        )
        
        console.log(`Payment succeeded for customer ${customerId}`)
        break
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        const failedCustomerId = failedInvoice.customer
        
        // Handle failed payment
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': failedCustomerId },
          { 'subscription.status': 'past_due' }
        )
        
        console.log(`Payment failed for customer ${failedCustomerId}`)
        break
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        
        // Cancel subscription
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': deletedSubscription.id },
          {
            subscription: {
              status: 'cancelled',
              plan: 'free',
              cancelledAt: new Date()
            }
          }
        )
        
        console.log(`Subscription cancelled: ${deletedSubscription.id}`)
        break
        
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    
    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    })
  }
}))

// @desc    Cancel subscription
// @route   POST /api/premium/cancel
// @access  Private
router.post('/cancel', auth, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      })
    }
    
    // Cancel at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    })
    
    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period'
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    })
  }
}))

// @desc    Get advanced analytics (Premium feature)
// @route   GET /api/premium/analytics/advanced
// @access  Private (Premium)
router.get('/analytics/advanced', auth, requirePremium, asyncHandler(async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    const portfolio = await Portfolio.findByUserId(req.user.id)
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }
    
    // Calculate date range
    const now = new Date()
    let startDate
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    // Advanced analytics data (would be calculated from actual tracking data)
    const analytics = {
      overview: {
        totalViews: portfolio.stats.totalViews || 0,
        uniqueViews: portfolio.stats.uniqueViews || 0,
        bounceRate: 0.35, // 35%
        avgTimeOnPage: 145, // seconds
        conversionRate: 0.08 // 8%
      },
      traffic: {
        sources: [
          { source: 'Direct', visits: 45, percentage: 35 },
          { source: 'GitHub', visits: 32, percentage: 25 },
          { source: 'LinkedIn', visits: 26, percentage: 20 },
          { source: 'Google', visits: 19, percentage: 15 },
          { source: 'Other', visits: 6, percentage: 5 }
        ],
        devices: [
          { device: 'Desktop', visits: 78, percentage: 60 },
          { device: 'Mobile', visits: 39, percentage: 30 },
          { device: 'Tablet', visits: 13, percentage: 10 }
        ],
        browsers: [
          { browser: 'Chrome', visits: 85, percentage: 65 },
          { browser: 'Safari', visits: 26, percentage: 20 },
          { browser: 'Firefox', visits: 13, percentage: 10 },
          { browser: 'Edge', visits: 6, percentage: 5 }
        ]
      },
      engagement: {
        dailyViews: generateDailyViews(startDate, now),
        popularSections: [
          { section: 'Projects', views: 89, timeSpent: 180 },
          { section: 'About', views: 76, timeSpent: 95 },
          { section: 'Skills', views: 54, timeSpent: 65 },
          { section: 'Experience', views: 43, timeSpent: 120 }
        ],
        interactions: {
          projectClicks: 23,
          githubClicks: 18,
          contactClicks: 12,
          resumeDownloads: 8
        }
      },
      performance: {
        loadTime: 1.2, // seconds
        mobileScore: 95,
        desktopScore: 98,
        seoScore: 87,
        accessibilityScore: 92
      },
      goals: {
        profileViews: { target: 1000, current: 756, progress: 75.6 },
        projectClicks: { target: 50, current: 23, progress: 46 },
        contactForms: { target: 20, current: 12, progress: 60 }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        analytics,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching advanced analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advanced analytics'
    })
  }
}))

// Helper function to generate daily views data
function generateDailyViews(startDate, endDate) {
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    days.push({
      date: currentDate.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 20) + 5, // Random data for demo
      uniqueViews: Math.floor(Math.random() * 15) + 3
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
}

// @desc    Get premium themes (Premium feature)
// @route   GET /api/premium/themes
// @access  Private (Premium)
router.get('/themes', auth, requirePremium, asyncHandler(async (req, res) => {
  const premiumThemes = [
    {
      id: 'gradient-pro',
      name: 'Gradient Pro',
      category: 'Modern',
      preview: '/themes/gradient-pro-preview.jpg',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb'
      },
      features: ['Animated gradients', 'Smooth transitions', 'Dark mode']
    },
    {
      id: 'minimal-elite',
      name: 'Minimal Elite',
      category: 'Professional',
      preview: '/themes/minimal-elite-preview.jpg',
      colors: {
        primary: '#2d3748',
        secondary: '#4a5568',
        accent: '#ed8936'
      },
      features: ['Clean typography', 'Subtle animations', 'Mobile-first']
    },
    {
      id: 'neon-dev',
      name: 'Neon Developer',
      category: 'Creative',
      preview: '/themes/neon-dev-preview.jpg',
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#00ff88'
      },
      features: ['Neon effects', 'Code-inspired design', 'Terminal aesthetics']
    }
  ]
  
  res.status(200).json({
    success: true,
    data: premiumThemes
  })
}))

module.exports = router