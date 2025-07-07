# DevDeck Analytics Dashboard

A comprehensive analytics and reporting system for DevDeck that tracks user behavior, performance metrics, and business insights.

## Overview

The analytics system provides:
- **Real-time tracking** of user interactions and page views
- **Performance monitoring** with Core Web Vitals
- **Conversion tracking** and funnel analysis
- **Automated reporting** with insights and recommendations
- **Dashboard visualization** for key metrics
- **Alert system** for critical issues

## Quick Start

### 1. Setup

```bash
# Run the setup script
./scripts/setup-analytics-dashboard.sh

# Install dependencies
npm install mongoose chart.js
```

### 2. Configuration

Update the analytics configuration in `analytics/config/analytics.json`:

```json
{
  "tracking": {
    "enabled": true,
    "sampleRate": 1.0,
    "anonymizeIp": true
  },
  "alerts": {
    "webhookUrl": "https://your-webhook-url.com",
    "email": "admin@yoursite.com"
  }
}
```

### 3. Integration

#### Frontend Integration

```tsx
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// Add to your app
<AnalyticsTracker />

// Add dashboard to admin panel
<AnalyticsDashboard />
```

#### Backend Integration

```javascript
const analyticsApi = require('./backend/analytics-api');
app.use('/api/analytics', analyticsApi);
```

## Components

### Frontend Components

#### AnalyticsTracker
Automatically tracks:
- Page views and navigation
- User sessions and interactions
- Performance metrics (Core Web Vitals)
- Custom events and conversions
- Error tracking

#### AnalyticsDashboard
Displays:
- Real-time metrics overview
- Traffic sources and user behavior
- Performance insights
- Conversion funnels
- Custom reports

### Backend Components

#### Analytics API (`analytics-api.js`)
- `/track` - Track events and page views
- `/dashboard` - Get dashboard data
- `/realtime` - Real-time analytics
- `/report` - Generate custom reports
- `/export` - Export analytics data

#### Database Models (`analytics-models.js`)
- `AnalyticsEvent` - All tracked events
- `UserSession` - User session data
- `PageView` - Page view tracking
- `GoalConversion` - Conversion tracking
- `PerformanceMetric` - Performance data

## Automation

### Scheduled Reports

```bash
# Add to crontab for automated reports
0 1 * * * /path/to/scripts/automate-analytics.sh daily
0 2 * * 1 /path/to/scripts/automate-analytics.sh weekly
0 3 1 * * /path/to/scripts/automate-analytics.sh monthly
```

### Available Commands

```bash
# Generate reports
./scripts/automate-analytics.sh daily
./scripts/automate-analytics.sh weekly
./scripts/automate-analytics.sh monthly

# Maintenance
./scripts/automate-analytics.sh cleanup
./scripts/automate-analytics.sh backup
./scripts/automate-analytics.sh optimize

# Dashboard
./scripts/automate-analytics.sh dashboard
```

## Metrics Tracked

### User Metrics
- **Users**: Unique visitors
- **Sessions**: User sessions
- **Page Views**: Total page views
- **Bounce Rate**: Single-page sessions
- **Session Duration**: Average time on site

### Performance Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Page Load Times**: Average and percentiles
- **Error Rates**: JavaScript and API errors
- **Performance Score**: Overall performance rating

### Business Metrics
- **Conversions**: Goal completions
- **Conversion Rate**: Percentage of converting users
- **Revenue**: Transaction tracking
- **Funnel Analysis**: Step-by-step conversion tracking

### Traffic Metrics
- **Traffic Sources**: Referrer analysis
- **Device Breakdown**: Desktop, mobile, tablet
- **Browser Analysis**: Browser usage statistics
- **Geographic Data**: Country and city tracking

## Reporting

### Report Types

1. **Daily Reports**
   - Key metrics summary
   - Performance alerts
   - Traffic overview

2. **Weekly Reports**
   - Trend analysis
   - User behavior insights
   - Conversion funnel performance

3. **Monthly Reports**
   - Comprehensive analytics
   - Business insights
   - Recommendations

### Report Structure

```json
{
  "metadata": {
    "type": "daily",
    "generatedAt": "2024-01-15T10:00:00Z",
    "timeRange": { "start": "...", "end": "..." }
  },
  "summary": {
    "keyMetrics": { "users": 1250, "sessions": 1800 },
    "performanceScore": 85,
    "totalConversions": 45
  },
  "data": {
    "overview": { /* detailed metrics */ },
    "traffic": { /* traffic analysis */ },
    "performance": { /* performance data */ },
    "userBehavior": { /* behavior insights */ },
    "conversions": { /* conversion data */ }
  },
  "insights": [ /* automated insights */ ],
  "recommendations": [ /* actionable recommendations */ ]
}
```

## Alerts

### Alert Conditions
- Bounce rate > 70%
- Conversion rate < 2%
- Performance score < 70
- Error rate > 1%
- Page load time > 3 seconds

### Alert Channels
- **Webhook**: POST to configured URL
- **Email**: Send to admin email
- **Dashboard**: Visual alerts in UI
- **Logs**: Written to analytics logs

## Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/devdeck

# Alerts
ANALYTICS_WEBHOOK_URL=https://hooks.slack.com/...
ANALYTICS_EMAIL=admin@yoursite.com

# Tracking
ANALYTICS_SAMPLE_RATE=1.0
ANALYTICS_ANONYMIZE_IP=true
```

### Analytics Configuration

Edit `analytics/config/analytics.json`:

```json
{
  "tracking": {
    "enabled": true,
    "sampleRate": 1.0,
    "anonymizeIp": true,
    "trackErrors": true,
    "trackPerformance": true
  },
  "privacy": {
    "respectDnt": true,
    "cookieConsent": true,
    "dataRetention": 365
  },
  "metrics": {
    "coreWebVitals": true,
    "customEvents": true,
    "userTiming": true
  },
  "reporting": {
    "daily": true,
    "weekly": true,
    "monthly": true,
    "realtime": true
  },
  "alerts": {
    "enabled": true,
    "webhookUrl": "",
    "email": "",
    "thresholds": {
      "bounceRate": 0.7,
      "conversionRate": 0.02,
      "performanceScore": 70,
      "errorRate": 0.01
    }
  }
}
```

## API Reference

### Track Event

```javascript
POST /api/analytics/track
{
  "event": "button_click",
  "properties": {
    "buttonId": "signup",
    "userId": "user123",
    "sessionId": "session456"
  }
}
```

### Get Dashboard Data

```javascript
GET /api/analytics/dashboard?timeRange=7d
```

### Export Data

```javascript
GET /api/analytics/export?format=csv&timeRange=30d
```

## Troubleshooting

### Common Issues

1. **No data appearing**
   - Check MongoDB connection
   - Verify analytics tracker is loaded
   - Check browser console for errors

2. **Reports not generating**
   - Check cron job configuration
   - Verify script permissions
   - Check logs in `analytics/logs/`

3. **Performance issues**
   - Review database indexes
   - Check sample rate configuration
   - Monitor memory usage

### Debug Mode

```bash
# Enable debug logging
export DEBUG=analytics:*

# Run with verbose output
./scripts/automate-analytics.sh daily --verbose
```

### Log Files

- `analytics/logs/analytics.log` - Main analytics log
- `analytics/logs/errors.log` - Error tracking
- `analytics/logs/performance.log` - Performance monitoring

## Security & Privacy

### Data Protection
- IP address anonymization
- GDPR compliance features
- Cookie consent integration
- Data retention policies

### Security Measures
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure data transmission
- Access control for sensitive data

## Performance

### Optimization
- Database indexing for fast queries
- Aggregation pipelines for reports
- Caching for frequently accessed data
- Sampling for high-traffic sites

### Scaling
- Horizontal database scaling
- Read replicas for reporting
- CDN for static assets
- Load balancing for API endpoints

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review log files for errors
3. Consult the API documentation
4. Contact the development team

## Version History

### v1.0.0
- Initial analytics system
- Basic tracking and reporting
- Dashboard visualization
- Automated alerts

### Roadmap
- A/B testing integration
- Advanced segmentation
- Machine learning insights
- Real-time dashboard updates
