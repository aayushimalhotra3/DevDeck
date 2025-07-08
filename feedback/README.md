# DevDeck Feedback Collection System

Comprehensive user feedback collection, analysis, and automation system for DevDeck.

## 📋 Overview

This system provides:
- **Feedback Forms**: Comprehensive and compact feedback collection
- **NPS Surveys**: Net Promoter Score tracking
- **Analytics Dashboard**: Real-time feedback analytics and insights
- **Automation**: Automated processing and alerting
- **Feedback Widget**: Easy-to-integrate feedback widget

## 🚀 Quick Start

### 1. Setup

```bash
# Run the setup script
chmod +x scripts/setup-user-feedback.sh
./scripts/setup-user-feedback.sh
```

### 2. Backend Integration

```javascript
// Add to your Express.js app
const feedbackRoutes = require('./feedback/scripts/feedback-api');
app.use('/api', feedbackRoutes);

// Add feedback models to your database
const { Feedback, NPSResponse } = require('./feedback/scripts/feedback-models');
```

### 3. Frontend Integration

```tsx
// Add feedback components to your React app
import FeedbackForm from './feedback/forms/FeedbackForm';
import FeedbackModal from './feedback/forms/FeedbackModal';
import FeedbackWidget from './feedback/forms/FeedbackWidget';
import NPSurvey from './feedback/surveys/NPSurvey';
import FeedbackAnalytics from './feedback/analytics/FeedbackAnalytics';

// Use in your components
<FeedbackWidget position="bottom-right" theme="light" />
<FeedbackModal trigger={<Button>Feedback</Button>} />
<NPSurvey onComplete={(score, feedback) => console.log(score, feedback)} />
```

## 📊 Components

### Feedback Forms

#### FeedbackForm
Comprehensive feedback collection with:
- 5-star rating system
- Category selection (bug, feature, usability, performance, general)
- Detailed feedback text
- Feature usage tracking
- Improvement suggestions
- Recommendation tracking
- Optional email for follow-up

#### FeedbackModal
Modal wrapper for feedback forms with customizable triggers.

#### FeedbackWidget
Floating feedback widget for easy access:
- Configurable position (bottom-right, bottom-left, top-right, top-left)
- Light/dark theme support
- Compact quick feedback form
- Auto-hide after submission

### Surveys

#### NPSurvey
Net Promoter Score survey component:
- 0-10 scale rating
- Dynamic follow-up questions based on score
- Automatic categorization (Detractor, Passive, Promoter)

### Analytics

#### FeedbackAnalytics
Comprehensive analytics dashboard:
- **Overview**: Total feedback, average rating, NPS score, response rate
- **Rating Distribution**: Visual breakdown of ratings
- **Category Analysis**: Feedback categorization and trends
- **Time Series**: Feedback trends over time
- **Recent Feedback**: Latest user feedback with details

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
API_BASE_URL=http://localhost:5000
ADMIN_TOKEN=your-admin-jwt-token

# Webhook Alerts
FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook
FEEDBACK_EMAIL_ALERTS=true

# Database
MONGODB_URI=mongodb://localhost:27017/devdeck
```

### Automation Setup

```bash
# Add to crontab for automated processing
# Check for low ratings every hour
0 * * * * /path/to/feedback/scripts/automate-feedback.sh

# Generate weekly reports every Monday at 9 AM
0 9 * * 1 /path/to/feedback/scripts/automate-feedback.sh
```

## 📈 Analytics & Reporting

### Key Metrics

1. **Overall Satisfaction**
   - Average rating (1-5 scale)
   - Rating distribution
   - Trend analysis

2. **Net Promoter Score (NPS)**
   - Promoters (9-10): Loyal enthusiasts
   - Passives (7-8): Satisfied but unenthusiastic
   - Detractors (0-6): Unhappy customers
   - NPS = (% Promoters) - (% Detractors)

3. **Feedback Categories**
   - Bug reports
   - Feature requests
   - Usability issues
   - Performance concerns
   - General feedback

4. **Response Rates**
   - Feedback submission rate
   - Survey completion rate
   - Follow-up response rate

### Automated Alerts

- **Low Rating Alert**: Triggered for ratings ≤ 2 stars
- **Negative NPS Alert**: Triggered when NPS drops below 0
- **Volume Alert**: Triggered for unusual feedback volume
- **Weekly Summary**: Automated weekly reports

## 🔄 Automation Features

### Daily Processing
- Collect and analyze new feedback
- Check for low ratings and send alerts
- Update analytics dashboards
- Clean up old temporary files

### Weekly Reports
- Comprehensive feedback summary
- Trend analysis and insights
- Action item recommendations
- Stakeholder notifications

### Real-time Alerts
- Immediate notification for critical feedback
- Slack/Discord/Email integration
- Escalation workflows
- Response tracking

## 🎨 Customization

### Styling
All components use Tailwind CSS and shadcn/ui components. Customize by:
- Modifying component props
- Overriding CSS classes
- Creating custom themes
- Adjusting color schemes

### Functionality
- Add custom feedback categories
- Implement additional survey types
- Create custom analytics views
- Integrate with external tools

## 🔒 Security & Privacy

### Data Protection
- Anonymous feedback support
- Optional email collection
- IP address logging (configurable)
- GDPR compliance features

### Access Control
- Admin-only analytics access
- JWT token authentication
- Role-based permissions
- Audit logging

## 🚀 Deployment

### Production Setup

1. **Database Indexes**
   ```javascript
   // Ensure proper indexing for performance
   db.feedbacks.createIndex({ "metadata.timestamp": -1 });
   db.feedbacks.createIndex({ "category": 1 });
   db.feedbacks.createIndex({ "rating": 1 });
   ```

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure performance monitoring
   - Implement health checks

3. **Scaling**
   - Database connection pooling
   - Redis caching for analytics
   - CDN for static assets

## 📚 API Reference

### Endpoints

#### Submit Feedback
```
POST /api/feedback
Content-Type: application/json

{
  "rating": 5,
  "category": "feature",
  "message": "Great new feature!",
  "email": "user@example.com",
  "features": ["Portfolio Editor", "GitHub Integration"],
  "improvements": "Could use better mobile support",
  "recommend": "yes"
}
```

#### Submit NPS Score
```
POST /api/feedback/nps
Content-Type: application/json

{
  "score": 9,
  "feedback": "Love the platform!"
}
```

#### Get Analytics (Admin)
```
GET /api/feedback/analytics?range=30d
Authorization: Bearer <admin-token>
```

## 🛠️ Troubleshooting

### Common Issues

1. **Feedback Not Submitting**
   - Check API endpoint configuration
   - Verify CORS settings
   - Check network connectivity
   - Review browser console for errors

2. **Analytics Not Loading**
   - Verify admin token
   - Check database connection
   - Review server logs
   - Ensure proper indexing

3. **Automation Not Working**
   - Check cron job configuration
   - Verify environment variables
   - Review automation logs
   - Test webhook connectivity

### Debug Mode

```bash
# Enable debug logging
export DEBUG=feedback:*

# Run automation with verbose output
./scripts/automate-feedback.sh --verbose
```

## 📞 Support

For issues and questions:
- Check the troubleshooting guide
- Review component documentation
- Check GitHub issues
- Contact the development team

## 🔄 Updates

### Version History
- v1.0.0: Initial release with basic feedback collection
- v1.1.0: Added NPS surveys and analytics dashboard
- v1.2.0: Implemented automation and alerting
- v1.3.0: Added feedback widget and improved UX

### Roadmap
- [ ] A/B testing for feedback forms
- [ ] Advanced sentiment analysis
- [ ] Integration with customer support tools
- [ ] Mobile app feedback collection
- [ ] Multi-language support

---

*Last updated: December 2024*
*Feedback System v1.3.0*
