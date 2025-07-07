const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { AnalyticsEvent, UserSession, PageView, GoalConversion, PerformanceMetric } = require('../backend/analytics-models');

// Report configuration
const REPORT_CONFIG = {
  daily: {
    timeRange: 24 * 60 * 60 * 1000, // 24 hours
    schedule: '0 1 * * *' // Daily at 1 AM
  },
  weekly: {
    timeRange: 7 * 24 * 60 * 60 * 1000, // 7 days
    schedule: '0 2 * * 1' // Weekly on Monday at 2 AM
  },
  monthly: {
    timeRange: 30 * 24 * 60 * 60 * 1000, // 30 days
    schedule: '0 3 1 * *' // Monthly on 1st at 3 AM
  }
};

class AnalyticsReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../analytics/reports');
  }

  async generateReport(type = 'daily', customTimeRange = null) {
    try {
      console.log(`Generating ${type} analytics report...`);
      
      const timeRange = customTimeRange || REPORT_CONFIG[type]?.timeRange || REPORT_CONFIG.daily.timeRange;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange);
      
      // Gather all analytics data
      const [overview, traffic, performance, userBehavior, conversions, trends] = await Promise.all([
        this.getOverviewData(startDate, endDate),
        this.getTrafficData(startDate, endDate),
        this.getPerformanceData(startDate, endDate),
        this.getUserBehaviorData(startDate, endDate),
        this.getConversionData(startDate, endDate),
        this.getTrendData(startDate, endDate)
      ]);
      
      const report = {
        metadata: {
          type,
          generatedAt: new Date().toISOString(),
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          version: '1.0.0'
        },
        summary: this.generateSummary(overview, traffic, performance, conversions),
        data: {
          overview,
          traffic,
          performance,
          userBehavior,
          conversions,
          trends
        },
        insights: this.generateInsights(overview, traffic, performance, userBehavior, conversions),
        recommendations: this.generateRecommendations(overview, traffic, performance, userBehavior, conversions)
      };
      
      // Save report
      await this.saveReport(report, type);
      
      console.log(`${type} report generated successfully`);
      return report;
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      throw error;
    }
  }

  async getOverviewData(startDate, endDate) {
    const [totalUsers, totalSessions, totalPageViews, sessionStats] = await Promise.all([
      AnalyticsEvent.distinct('properties.userId', {
        createdAt: { $gte: startDate, $lte: endDate },
        'properties.userId': { $exists: true, $ne: null }
      }),
      UserSession.countDocuments({ startTime: { $gte: startDate, $lte: endDate } }),
      PageView.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      UserSession.getSessionStats(startDate, endDate)
    ]);
    
    const sessionStatsData = sessionStats[0] || { totalSessions: 0, avgDuration: 0, bounceRate: 0 };
    
    return {
      totalUsers: totalUsers.length,
      totalSessions,
      totalPageViews,
      averageSessionDuration: sessionStatsData.avgDuration || 0,
      bounceRate: sessionStatsData.bounceRate || 0,
      pagesPerSession: totalSessions > 0 ? totalPageViews / totalSessions : 0
    };
  }

  async getTrafficData(startDate, endDate) {
    const [sources, devices, browsers, countries] = await Promise.all([
      PageView.getTrafficSources(startDate, endDate),
      this.getDeviceBreakdown(startDate, endDate),
      this.getBrowserBreakdown(startDate, endDate),
      this.getCountryBreakdown(startDate, endDate)
    ]);
    
    return {
      sources,
      devices,
      browsers,
      countries
    };
  }

  async getPerformanceData(startDate, endDate) {
    const [coreWebVitals, pageLoadTimes, errorRates] = await Promise.all([
      PerformanceMetric.getCoreWebVitals(startDate, endDate),
      this.getPageLoadTimes(startDate, endDate),
      this.getErrorRates(startDate, endDate)
    ]);
    
    return {
      coreWebVitals,
      pageLoadTimes,
      errorRates
    };
  }

  async getUserBehaviorData(startDate, endDate) {
    const [topPages, userFlow, events, searchTerms] = await Promise.all([
      PageView.getTopPages(startDate, endDate),
      this.getUserFlow(startDate, endDate),
      this.getTopEvents(startDate, endDate),
      this.getSearchTerms(startDate, endDate)
    ]);
    
    return {
      topPages,
      userFlow,
      events,
      searchTerms
    };
  }

  async getConversionData(startDate, endDate) {
    const [goals, funnels, revenue] = await Promise.all([
      this.getGoalCompletions(startDate, endDate),
      this.getConversionFunnels(startDate, endDate),
      this.getRevenueData(startDate, endDate)
    ]);
    
    return {
      goals,
      funnels,
      revenue
    };
  }

  async getTrendData(startDate, endDate) {
    // Get daily trends for the time period
    const dailyTrends = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
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
    
    return {
      daily: dailyTrends
    };
  }

  async getDeviceBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          device: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$device',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          device: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } }
    ]);
  }

  async getBrowserBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          browser: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$browser',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          browser: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } },
      { $limit: 10 }
    ]);
  }

  async getCountryBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          country: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$country',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          country: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } },
      { $limit: 15 }
    ]);
  }

  async getPageLoadTimes(startDate, endDate) {
    return PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          loadTime: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgLoadTime: { $avg: '$loadTime' },
          medianLoadTime: {
            $percentile: {
              input: '$loadTime',
              p: [0.5],
              method: 'approximate'
            }
          },
          p95LoadTime: {
            $percentile: {
              input: '$loadTime',
              p: [0.95],
              method: 'approximate'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getErrorRates(startDate, endDate) {
    const [totalEvents, errorEvents] = await Promise.all([
      AnalyticsEvent.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      AnalyticsEvent.countDocuments({
        event: 'error',
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);
    
    return {
      totalEvents,
      errorEvents,
      errorRate: totalEvents > 0 ? errorEvents / totalEvents : 0
    };
  }

  async getUserFlow(startDate, endDate) {
    return PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
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
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          from: '$_id.from',
          to: '$_id.to',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  async getTopEvents(startDate, endDate) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          event: { $nin: ['page_view', 'session_start'] }
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
      { $limit: 15 }
    ]);
  }

  async getSearchTerms(startDate, endDate) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          event: 'search',
          createdAt: { $gte: startDate, $lte: endDate },
          'properties.query': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$properties.query',
          count: { $sum: 1 },
          users: { $addToSet: '$properties.userId' }
        }
      },
      {
        $project: {
          query: '$_id',
          count: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  async getGoalCompletions(startDate, endDate) {
    return GoalConversion.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$goalName',
          completions: { $sum: 1 },
          totalValue: { $sum: '$value' },
          totalRevenue: { $sum: '$revenue' },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          goal: '$_id',
          completions: 1,
          totalValue: 1,
          totalRevenue: 1,
          uniqueUsers: { $size: '$users' }
        }
      },
      { $sort: { completions: -1 } }
    ]);
  }

  async getConversionFunnels(startDate, endDate) {
    // Simplified funnel analysis
    const funnelSteps = [
      { step: 'Landing', event: 'page_view' },
      { step: 'Signup', event: 'signup_started' },
      { step: 'Profile', event: 'profile_created' },
      { step: 'First Action', event: 'first_action' },
      { step: 'Conversion', event: 'goal_completed' }
    ];
    
    const funnelData = [];
    let previousUsers = null;
    
    for (const step of funnelSteps) {
      const users = await AnalyticsEvent.distinct('properties.userId', {
        event: step.event,
        createdAt: { $gte: startDate, $lte: endDate },
        'properties.userId': { $exists: true, $ne: null }
      });
      
      const conversionRate = previousUsers ? users.length / previousUsers : 1;
      
      funnelData.push({
        step: step.step,
        users: users.length,
        conversionRate,
        dropoffRate: 1 - conversionRate
      });
      
      previousUsers = users.length;
    }
    
    return funnelData;
  }

  async getRevenueData(startDate, endDate) {
    const revenueData = await GoalConversion.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          revenue: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          avgRevenue: { $avg: '$revenue' },
          transactions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          avgRevenue: { $round: ['$avgRevenue', 2] },
          transactions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          revenuePerUser: {
            $cond: [
              { $gt: [{ $size: '$uniqueUsers' }, 0] },
              { $divide: ['$totalRevenue', { $size: '$uniqueUsers' }] },
              0
            ]
          }
        }
      }
    ]);
    
    return revenueData[0] || {
      totalRevenue: 0,
      avgRevenue: 0,
      transactions: 0,
      uniqueUsers: 0,
      revenuePerUser: 0
    };
  }

  generateSummary(overview, traffic, performance, conversions) {
    return {
      keyMetrics: {
        users: overview.totalUsers,
        sessions: overview.totalSessions,
        pageViews: overview.totalPageViews,
        bounceRate: Math.round(overview.bounceRate * 100),
        avgSessionDuration: Math.round(overview.averageSessionDuration)
      },
      topTrafficSource: traffic.sources[0]?.source || 'Direct',
      topDevice: traffic.devices[0]?.device || 'Unknown',
      performanceScore: this.calculatePerformanceScore(performance),
      totalConversions: conversions.goals.reduce((sum, goal) => sum + goal.completions, 0)
    };
  }

  generateInsights(overview, traffic, performance, userBehavior, conversions) {
    const insights = [];
    
    // Traffic insights
    if (overview.bounceRate > 0.7) {
      insights.push({
        type: 'warning',
        category: 'traffic',
        message: `High bounce rate (${Math.round(overview.bounceRate * 100)}%) indicates users are leaving quickly`,
        recommendation: 'Improve landing page content and loading speed'
      });
    }
    
    // Performance insights
    const avgLoadTime = performance.pageLoadTimes[0]?.avgLoadTime;
    if (avgLoadTime && avgLoadTime > 3000) {
      insights.push({
        type: 'warning',
        category: 'performance',
        message: `Average page load time is ${Math.round(avgLoadTime)}ms, which is above recommended 3 seconds`,
        recommendation: 'Optimize images, minify CSS/JS, and consider CDN implementation'
      });
    }
    
    // User behavior insights
    if (userBehavior.topPages.length > 0) {
      const topPage = userBehavior.topPages[0];
      insights.push({
        type: 'info',
        category: 'behavior',
        message: `Most popular page is "${topPage.page}" with ${topPage.views} views`,
        recommendation: 'Consider optimizing this page for conversions'
      });
    }
    
    // Conversion insights
    if (conversions.goals.length > 0) {
      const totalConversions = conversions.goals.reduce((sum, goal) => sum + goal.completions, 0);
      const conversionRate = overview.totalSessions > 0 ? totalConversions / overview.totalSessions : 0;
      
      if (conversionRate < 0.02) {
        insights.push({
          type: 'warning',
          category: 'conversion',
          message: `Low conversion rate (${Math.round(conversionRate * 100)}%)`,
          recommendation: 'Review conversion funnel and optimize call-to-action elements'
        });
      }
    }
    
    return insights;
  }

  generateRecommendations(overview, traffic, performance, userBehavior, conversions) {
    const recommendations = [];
    
    // Performance recommendations
    if (performance.coreWebVitals.some(vital => vital.rating === 'poor')) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Improve Core Web Vitals',
        description: 'Some Core Web Vitals metrics are in the "poor" range',
        actions: [
          'Optimize Largest Contentful Paint (LCP)',
          'Reduce First Input Delay (FID)',
          'Minimize Cumulative Layout Shift (CLS)'
        ]
      });
    }
    
    // Traffic recommendations
    if (traffic.sources.length < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'traffic',
        title: 'Diversify Traffic Sources',
        description: 'Limited traffic sources increase dependency risk',
        actions: [
          'Implement SEO strategy',
          'Start social media marketing',
          'Consider paid advertising'
        ]
      });
    }
    
    // User experience recommendations
    if (overview.pagesPerSession < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'ux',
        title: 'Improve User Engagement',
        description: 'Users are viewing fewer pages per session',
        actions: [
          'Add related content suggestions',
          'Improve internal linking',
          'Create more engaging content'
        ]
      });
    }
    
    return recommendations;
  }

  calculatePerformanceScore(performance) {
    // Simplified performance score calculation
    let score = 100;
    
    performance.coreWebVitals.forEach(vital => {
      if (vital.rating === 'poor') score -= 20;
      else if (vital.rating === 'needs-improvement') score -= 10;
    });
    
    if (performance.errorRates.errorRate > 0.01) score -= 15;
    
    return Math.max(0, score);
  }

  async saveReport(report, type) {
    // Ensure reports directory exists
    await fs.mkdir(this.reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-report-${timestamp}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also save as latest
    const latestFilepath = path.join(this.reportsDir, `latest-${type}-report.json`);
    await fs.writeFile(latestFilepath, JSON.stringify(report, null, 2));
    
    console.log(`Report saved to ${filepath}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const reportType = args[0] || 'daily';
  const customTimeRange = args[1] ? parseInt(args[1]) : null;
  
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devdeck')
    .then(async () => {
      console.log('Connected to MongoDB');
      
      const generator = new AnalyticsReportGenerator();
      await generator.generateReport(reportType, customTimeRange);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsReportGenerator;
