const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Analytics Models
const AnalyticsEvent = require('./analytics-models').AnalyticsEvent;
const UserSession = require('./analytics-models').UserSession;
const PageView = require('./analytics-models').PageView;

// Middleware for analytics data validation
const validateAnalyticsData = (req, res, next) => {
  const { event, properties } = req.body;
  
  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'Event name is required and must be a string' });
  }
  
  if (properties && typeof properties !== 'object') {
    return res.status(400).json({ error: 'Properties must be an object' });
  }
  
  next();
};

// Track analytics event
router.post('/track', validateAnalyticsData, async (req, res) => {
  try {
    const { event, properties } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Create analytics event
    const analyticsEvent = new AnalyticsEvent({
      event,
      properties: {
        ...properties,
        clientIP: req.headers['x-anonymize-ip'] ? 'anonymized' : clientIP,
        userAgent,
        timestamp: new Date()
      },
      sessionId: properties.sessionId,
      userId: properties.userId,
      createdAt: new Date()
    });
    
    await analyticsEvent.save();
    
    // Handle specific event types
    if (event === 'page_view') {
      await handlePageView(properties);
    } else if (event === 'session_start') {
      await handleSessionStart(properties);
    }
    
    res.status(200).json({ success: true, eventId: analyticsEvent._id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeRangeMs = parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - timeRangeMs);
    
    // Parallel data fetching for better performance
    const [overview, traffic, performance, userBehavior, conversion] = await Promise.all([
      getOverviewData(startDate),
      getTrafficData(startDate),
      getPerformanceData(startDate),
      getUserBehaviorData(startDate),
      getConversionData(startDate)
    ]);
    
    res.json({
      overview,
      traffic,
      performance,
      userBehavior,
      conversion,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    
    const [activeUsers, recentEvents, currentPageViews] = await Promise.all([
      UserSession.countDocuments({
        lastActivity: { $gte: last5Minutes },
        isActive: true
      }),
      AnalyticsEvent.find({
        createdAt: { $gte: last5Minutes }
      }).sort({ createdAt: -1 }).limit(50),
      PageView.aggregate([
        { $match: { createdAt: { $gte: last5Minutes } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      activeUsers,
      recentEvents,
      currentPageViews,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time data error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time data' });
  }
});

// Get custom report
router.post('/report', async (req, res) => {
  try {
    const { metrics, filters, groupBy, timeRange } = req.body;
    
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Metrics array is required' });
    }
    
    const report = await generateCustomReport({
      metrics,
      filters: filters || {},
      groupBy: groupBy || 'day',
      timeRange: timeRange || '30d'
    });
    
    res.json(report);
  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    const timeRangeMs = parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - timeRangeMs);
    
    const events = await AnalyticsEvent.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    if (format === 'csv') {
      const csv = convertToCSV(events);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.json`);
      res.json(events);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Helper functions
async function handlePageView(properties) {
  const pageView = new PageView({
    page: properties.pageName || properties.path,
    path: properties.path,
    referrer: properties.referrer,
    sessionId: properties.sessionId,
    userId: properties.userId,
    loadTime: properties.loadTime,
    createdAt: new Date()
  });
  
  await pageView.save();
}

async function handleSessionStart(properties) {
  const session = new UserSession({
    sessionId: properties.sessionId,
    userId: properties.userId,
    userAgent: properties.userAgent,
    language: properties.language,
    timezone: properties.timezone,
    screen: properties.screen,
    viewport: properties.viewport,
    startTime: new Date(),
    lastActivity: new Date(),
    isActive: true
  });
  
  await session.save();
}

async function getOverviewData(startDate) {
  const [totalUsers, totalSessions, totalPageViews, sessionStats] = await Promise.all([
    AnalyticsEvent.distinct('properties.userId', {
      createdAt: { $gte: startDate },
      'properties.userId': { $exists: true, $ne: null }
    }),
    UserSession.countDocuments({ startTime: { $gte: startDate } }),
    PageView.countDocuments({ createdAt: { $gte: startDate } }),
    UserSession.aggregate([
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          totalBounces: {
            $sum: {
              $cond: [{ $lte: ['$pageViews', 1] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);
  
  const sessionStatsData = sessionStats[0] || { avgDuration: 0, totalBounces: 0 };
  const bounceRate = totalSessions > 0 ? sessionStatsData.totalBounces / totalSessions : 0;
  
  // Calculate conversion rate (example: users who completed a goal)
  const conversions = await AnalyticsEvent.countDocuments({
    event: 'goal_completed',
    createdAt: { $gte: startDate }
  });
  const conversionRate = totalUsers.length > 0 ? conversions / totalUsers.length : 0;
  
  return {
    totalUsers: totalUsers.length,
    totalSessions,
    totalPageViews,
    averageSessionDuration: Math.round(sessionStatsData.avgDuration || 0),
    bounceRate,
    conversionRate
  };
}

async function getTrafficData(startDate) {
  // Daily traffic data
  const daily = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        pageViews: { $sum: 1 },
        users: { $addToSet: '$userId' },
        sessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        date: '$_id',
        pageViews: 1,
        users: { $size: '$users' },
        sessions: { $size: '$sessions' }
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  // Traffic sources
  const sources = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate }, referrer: { $exists: true, $ne: '' } } },
    {
      $group: {
        _id: {
          $cond: [
            { $regexMatch: { input: '$referrer', regex: /google/i } },
            'Google',
            {
              $cond: [
                { $regexMatch: { input: '$referrer', regex: /facebook/i } },
                'Facebook',
                {
                  $cond: [
                    { $regexMatch: { input: '$referrer', regex: /twitter/i } },
                    'Twitter',
                    'Other'
                  ]
                }
              ]
            }
          ]
        },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        source: '$_id',
        users: { $size: '$users' }
      }
    }
  ]);
  
  const totalSourceUsers = sources.reduce((sum, source) => sum + source.users, 0);
  const sourcesWithPercentage = sources.map(source => ({
    source: source.source,
    users: source.users,
    percentage: totalSourceUsers > 0 ? (source.users / totalSourceUsers) * 100 : 0
  }));
  
  // Device breakdown
  const devices = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'session_start',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $regexMatch: { input: '$properties.userAgent', regex: /Mobile/i } },
            'Mobile',
            {
              $cond: [
                { $regexMatch: { input: '$properties.userAgent', regex: /Tablet/i } },
                'Tablet',
                'Desktop'
              ]
            }
          ]
        },
        users: { $addToSet: '$properties.userId' }
      }
    },
    {
      $project: {
        device: '$_id',
        users: { $size: '$users' }
      }
    }
  ]);
  
  const totalDeviceUsers = devices.reduce((sum, device) => sum + device.users, 0);
  const devicesWithPercentage = devices.map(device => ({
    device: device.device,
    users: device.users,
    percentage: totalDeviceUsers > 0 ? (device.users / totalDeviceUsers) * 100 : 0
  }));
  
  return {
    daily,
    sources: sourcesWithPercentage,
    devices: devicesWithPercentage
  };
}

async function getPerformanceData(startDate) {
  // Core Web Vitals
  const coreWebVitals = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'core_web_vital',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$properties.metric',
        avgValue: { $avg: '$properties.value' },
        ratings: { $push: '$properties.rating' }
      }
    }
  ]);
  
  const webVitalsData = {
    lcp: { value: 0, rating: 'good' },
    fid: { value: 0, rating: 'good' },
    cls: { value: 0, rating: 'good' }
  };
  
  coreWebVitals.forEach(vital => {
    if (vital._id && webVitalsData[vital._id.toLowerCase()]) {
      webVitalsData[vital._id.toLowerCase()] = {
        value: Math.round(vital.avgValue),
        rating: getMostCommonRating(vital.ratings)
      };
    }
  });
  
  // Page load times
  const pageLoadTimes = await PageView.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        loadTime: { $exists: true, $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$page',
        averageTime: { $avg: '$loadTime' },
        loadTimes: { $push: '$loadTime' }
      }
    },
    {
      $project: {
        page: '$_id',
        averageTime: { $round: ['$averageTime', 0] },
        p95Time: {
          $arrayElemAt: [
            {
              $slice: [
                { $sortArray: { input: '$loadTimes', sortBy: 1 } },
                { $round: [{ $multiply: [{ $size: '$loadTimes' }, 0.95] }, 0] },
                1
              ]
            },
            0
          ]
        }
      }
    },
    { $sort: { averageTime: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    coreWebVitals: webVitalsData,
    pageLoadTimes
  };
}

async function getUserBehaviorData(startDate) {
  // Top pages
  const topPages = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        avgTime: { $avg: '$timeOnPage' }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        avgTime: { $round: ['$avgTime', 0] }
      }
    },
    { $sort: { views: -1 } },
    { $limit: 10 }
  ]);
  
  // User flow (simplified)
  const userFlow = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $sort: { sessionId: 1, createdAt: 1 } },
    {
      $group: {
        _id: '$sessionId',
        pages: { $push: '$page' }
      }
    },
    {
      $project: {
        transitions: {
          $map: {
            input: { $range: [0, { $subtract: [{ $size: '$pages' }, 1] }] },
            as: 'index',
            in: {
              from: { $arrayElemAt: ['$pages', '$$index'] },
              to: { $arrayElemAt: ['$pages', { $add: ['$$index', 1] }] }
            }
          }
        }
      }
    },
    { $unwind: '$transitions' },
    {
      $group: {
        _id: {
          from: '$transitions.from',
          to: '$transitions.to'
        },
        users: { $sum: 1 }
      }
    },
    {
      $project: {
        from: '$_id.from',
        to: '$_id.to',
        users: 1
      }
    },
    { $sort: { users: -1 } },
    { $limit: 10 }
  ]);
  
  // Top events
  const events = await AnalyticsEvent.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        event: { $nin: ['page_view', 'session_start', 'core_web_vital'] }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$properties.userId' }
      }
    },
    {
      $project: {
        event: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    topPages,
    userFlow,
    events
  };
}

async function getConversionData(startDate) {
  // Conversion funnel (example)
  const funnelSteps = [
    { step: 'Landing', event: 'page_view' },
    { step: 'Sign Up', event: 'signup_started' },
    { step: 'Profile Created', event: 'profile_created' },
    { step: 'First Project', event: 'project_created' },
    { step: 'Deployed', event: 'project_deployed' }
  ];
  
  const funnels = [];
  let previousUsers = null;
  
  for (const step of funnelSteps) {
    const users = await AnalyticsEvent.distinct('properties.userId', {
      event: step.event,
      createdAt: { $gte: startDate },
      'properties.userId': { $exists: true, $ne: null }
    });
    
    const conversionRate = previousUsers ? users.length / previousUsers : 1;
    
    funnels.push({
      step: step.step,
      users: users.length,
      conversionRate
    });
    
    previousUsers = users.length;
  }
  
  // Goals
  const goals = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'goal_completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$properties.goalName',
        completions: { $sum: 1 },
        value: { $sum: { $ifNull: ['$properties.value', 0] } }
      }
    },
    {
      $project: {
        goal: '$_id',
        completions: 1,
        value: { $round: ['$value', 2] }
      }
    },
    { $sort: { completions: -1 } }
  ]);
  
  return {
    funnels,
    goals
  };
}

function parseTimeRange(timeRange) {
  const ranges = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };
  
  return ranges[timeRange] || ranges['7d'];
}

function getMostCommonRating(ratings) {
  const counts = ratings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'good');
}

function convertToCSV(events) {
  if (events.length === 0) return '';
  
  const headers = ['timestamp', 'event', 'userId', 'sessionId', 'properties'];
  const csvRows = [headers.join(',')];
  
  events.forEach(event => {
    const row = [
      event.createdAt.toISOString(),
      event.event,
      event.userId || '',
      event.sessionId || '',
      JSON.stringify(event.properties).replace(/"/g, '""')
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

async function generateCustomReport(options) {
  // Implementation for custom reports
  // This would be expanded based on specific requirements
  return {
    message: 'Custom report generation not yet implemented',
    options
  };
}

module.exports = router;
