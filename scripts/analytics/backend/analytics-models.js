const mongoose = require('mongoose');

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'analytics_events'
});

// Compound indexes for better query performance
analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });
analyticsEventSchema.index({ 'properties.userId': 1, createdAt: -1 });

// Static methods for analytics
analyticsEventSchema.statics.getEventCounts = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        event: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsEventSchema.statics.getUserActivity = function(userId, startDate, endDate) {
  return this.find({
    userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate || new Date()
    }
  }).sort({ createdAt: -1 });
};

// User Session Schema
const userSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  userAgent: String,
  language: String,
  timezone: String,
  screen: {
    width: Number,
    height: Number
  },
  viewport: {
    width: Number,
    height: Number
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: Date,
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  events: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  referrer: String,
  landingPage: String,
  exitPage: String,
  country: String,
  city: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    index: true
  },
  browser: String,
  os: String
}, {
  timestamps: true,
  collection: 'user_sessions'
});

// Compound indexes
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ isActive: 1, lastActivity: -1 });
userSessionSchema.index({ startTime: -1, endTime: -1 });

// Pre-save middleware to calculate duration
userSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  } else if (this.lastActivity && this.startTime) {
    this.duration = Math.round((this.lastActivity - this.startTime) / 1000);
  }
  next();
});

// Static methods
userSessionSchema.statics.getActiveUsers = function(timeWindow = 5) {
  const cutoff = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.countDocuments({
    lastActivity: { $gte: cutoff },
    isActive: true
  });
};

userSessionSchema.statics.getSessionStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        startTime: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgPageViews: { $avg: '$pageViews' },
        totalBounces: {
          $sum: {
            $cond: [{ $lte: ['$pageViews', 1] }, 1, 0]
          }
        },
        deviceBreakdown: {
          $push: '$device'
        }
      }
    },
    {
      $project: {
        totalSessions: 1,
        avgDuration: { $round: ['$avgDuration', 0] },
        avgPageViews: { $round: ['$avgPageViews', 2] },
        bounceRate: {
          $cond: [
            { $gt: ['$totalSessions', 0] },
            { $divide: ['$totalBounces', '$totalSessions'] },
            0
          ]
        },
        deviceBreakdown: 1
      }
    }
  ]);
};

// Page View Schema
const pageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  title: String,
  referrer: String,
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  loadTime: Number, // in milliseconds
  timeOnPage: Number, // in seconds
  scrollDepth: {
    type: Number,
    min: 0,
    max: 100
  },
  exitPage: {
    type: Boolean,
    default: false
  },
  bounced: {
    type: Boolean,
    default: false
  },
  converted: {
    type: Boolean,
    default: false
  },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String
}, {
  timestamps: true,
  collection: 'page_views'
});

// Compound indexes
pageViewSchema.index({ page: 1, createdAt: -1 });
pageViewSchema.index({ sessionId: 1, createdAt: 1 });
pageViewSchema.index({ userId: 1, createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });

// Static methods
pageViewSchema.statics.getTopPages = function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgTimeOnPage: { $avg: '$timeOnPage' },
        avgLoadTime: { $avg: '$loadTime' },
        bounces: {
          $sum: {
            $cond: ['$bounced', 1, 0]
          }
        }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgTimeOnPage: { $round: ['$avgTimeOnPage', 0] },
        avgLoadTime: { $round: ['$avgLoadTime', 0] },
        bounceRate: {
          $cond: [
            { $gt: ['$views', 0] },
            { $divide: ['$bounces', '$views'] },
            0
          ]
        }
      }
    },
    { $sort: { views: -1 } },
    { $limit: limit }
  ]);
};

pageViewSchema.statics.getTrafficSources = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        },
        referrer: { $exists: true, $ne: '' }
      }
    },
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
                    {
                      $cond: [
                        { $regexMatch: { input: '$referrer', regex: /linkedin/i } },
                        'LinkedIn',
                        'Other'
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        sessions: { $addToSet: '$sessionId' },
        users: { $addToSet: '$userId' },
        views: { $sum: 1 }
      }
    },
    {
      $project: {
        source: '$_id',
        sessions: { $size: '$sessions' },
        users: { $size: '$users' },
        views: 1
      }
    },
    { $sort: { sessions: -1 } }
  ]);
};

// Goal Conversion Schema
const goalConversionSchema = new mongoose.Schema({
  goalName: {
    type: String,
    required: true,
    index: true
  },
  goalType: {
    type: String,
    enum: ['page_view', 'event', 'duration', 'custom'],
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    default: 0
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  conversionPath: [{
    page: String,
    timestamp: Date,
    event: String
  }],
  timeToConversion: Number, // in seconds
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'goal_conversions'
});

// Compound indexes
goalConversionSchema.index({ goalName: 1, createdAt: -1 });
goalConversionSchema.index({ userId: 1, goalName: 1 });
goalConversionSchema.index({ sessionId: 1, createdAt: 1 });

// Static methods
goalConversionSchema.statics.getConversionRate = function(goalName, startDate, endDate) {
  return Promise.all([
    this.countDocuments({
      goalName,
      createdAt: {
        $gte: startDate,
        $lte: endDate || new Date()
      }
    }),
    mongoose.model('UserSession').countDocuments({
      startTime: {
        $gte: startDate,
        $lte: endDate || new Date()
      }
    })
  ]).then(([conversions, sessions]) => {
    return {
      conversions,
      sessions,
      rate: sessions > 0 ? conversions / sessions : 0
    };
  });
};

// Performance Metrics Schema
const performanceMetricSchema = new mongoose.Schema({
  metric: {
    type: String,
    required: true,
    enum: ['lcp', 'fid', 'cls', 'fcp', 'ttfb', 'tti'],
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  rating: {
    type: String,
    enum: ['good', 'needs-improvement', 'poor'],
    required: true
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  userAgent: String,
  connectionType: String,
  deviceType: String
}, {
  timestamps: true,
  collection: 'performance_metrics'
});

// Compound indexes
performanceMetricSchema.index({ metric: 1, createdAt: -1 });
performanceMetricSchema.index({ page: 1, metric: 1 });
performanceMetricSchema.index({ rating: 1, metric: 1 });

// Static methods
performanceMetricSchema.statics.getCoreWebVitals = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$metric',
        avgValue: { $avg: '$value' },
        p75Value: {
          $percentile: {
            input: '$value',
            p: [0.75],
            method: 'approximate'
          }
        },
        ratings: { $push: '$rating' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        metric: '$_id',
        avgValue: { $round: ['$avgValue', 2] },
        p75Value: { $round: [{ $arrayElemAt: ['$p75Value', 0] }, 2] },
        goodCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'good'] }
            }
          }
        },
        needsImprovementCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'needs-improvement'] }
            }
          }
        },
        poorCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'poor'] }
            }
          }
        },
        count: 1
      }
    }
  ]);
};

// Create models
const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);
const PageView = mongoose.model('PageView', pageViewSchema);
const GoalConversion = mongoose.model('GoalConversion', goalConversionSchema);
const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

// Export models
module.exports = {
  AnalyticsEvent,
  UserSession,
  PageView,
  GoalConversion,
  PerformanceMetric
};
