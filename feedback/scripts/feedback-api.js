// Backend API routes for feedback collection
// Add these routes to your Express.js backend

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Assume you have a Feedback model
const NPSResponse = require('../models/NPSResponse'); // Assume you have an NPS model
const auth = require('../middleware/auth'); // Your auth middleware

// Submit general feedback
router.post('/feedback', async (req, res) => {
  try {
    const {
      rating,
      category,
      message,
      email,
      features,
      improvements,
      recommend,
      timestamp,
      userAgent,
      url
    } = req.body;

    const feedback = new Feedback({
      userId: req.user?.id, // Optional if user is logged in
      rating: parseInt(rating),
      category,
      message,
      email,
      features: features || [],
      improvements,
      recommend,
      metadata: {
        userAgent,
        url,
        timestamp: new Date(timestamp),
        ip: req.ip
      }
    });

    await feedback.save();

    // Optional: Send notification to team
    if (rating <= 2) {
      // Send alert for low ratings
      await sendLowRatingAlert(feedback);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      id: feedback._id
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback' 
    });
  }
});

// Submit NPS score
router.post('/feedback/nps', async (req, res) => {
  try {
    const { score, feedback, timestamp, url } = req.body;

    const npsResponse = new NPSResponse({
      userId: req.user?.id,
      score: parseInt(score),
      feedback,
      metadata: {
        url,
        timestamp: new Date(timestamp),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await npsResponse.save();

    res.status(201).json({ 
      success: true, 
      message: 'NPS score submitted successfully',
      id: npsResponse._id
    });
  } catch (error) {
    console.error('Error submitting NPS score:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit NPS score' 
    });
  }
});

// Get feedback analytics (admin only)
router.get('/feedback/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { range = '30d' } = req.query;
    const days = parseInt(range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get feedback statistics
    const totalFeedback = await Feedback.countDocuments({
      'metadata.timestamp': { $gte: startDate }
    });

    const avgRating = await Feedback.aggregate([
      { $match: { 'metadata.timestamp': { $gte: startDate } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $match: { 'metadata.timestamp': { $gte: startDate } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { rating: '$_id', count: 1, _id: 0 } }
    ]);

    const categoryBreakdown = await Feedback.aggregate([
      { $match: { 'metadata.timestamp': { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { 
        $project: { 
          category: '$_id', 
          count: 1, 
          percentage: { 
            $round: [{ $multiply: [{ $divide: ['$count', totalFeedback] }, 100] }, 1] 
          },
          _id: 0 
        } 
      }
    ]);

    // Calculate NPS score
    const npsResponses = await NPSResponse.find({
      'metadata.timestamp': { $gte: startDate }
    });
    
    const promoters = npsResponses.filter(r => r.score >= 9).length;
    const detractors = npsResponses.filter(r => r.score <= 6).length;
    const npsScore = npsResponses.length > 0 
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : 0;

    // Get recent feedback
    const recentFeedback = await Feedback.find({
      'metadata.timestamp': { $gte: startDate }
    })
    .sort({ 'metadata.timestamp': -1 })
    .limit(10)
    .select('rating category message recommend metadata.timestamp');

    // Generate time series data
    const timeSeriesData = await generateTimeSeriesData(startDate, days);

    res.json({
      totalFeedback,
      averageRating: avgRating[0]?.avgRating || 0,
      npsScore,
      responseRate: 85, // Calculate based on your user base
      ratingDistribution,
      categoryBreakdown,
      timeSeriesData,
      recentFeedback: recentFeedback.map(f => ({
        id: f._id,
        rating: f.rating,
        category: f.category,
        message: f.message,
        recommend: f.recommend,
        timestamp: f.metadata.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Helper function to generate time series data
async function generateTimeSeriesData(startDate, days) {
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const feedbackCount = await Feedback.countDocuments({
      'metadata.timestamp': { $gte: dayStart, $lte: dayEnd }
    });
    
    const avgRating = await Feedback.aggregate([
      { $match: { 'metadata.timestamp': { $gte: dayStart, $lte: dayEnd } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    data.push({
      date: date.toISOString().split('T')[0],
      feedback: feedbackCount,
      rating: avgRating[0]?.avgRating || 0
    });
  }
  
  return data;
}

// Helper function to send low rating alerts
async function sendLowRatingAlert(feedback) {
  // Implement your notification logic here
  // Could be email, Slack, Discord, etc.
  console.log(`Low rating alert: ${feedback.rating}/5 - ${feedback.message}`);
}

module.exports = router;
