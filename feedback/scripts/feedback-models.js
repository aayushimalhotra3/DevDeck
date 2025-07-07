// MongoDB models for feedback collection
// Add these to your models directory

const mongoose = require('mongoose');

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    required: true,
    enum: ['bug', 'feature', 'usability', 'performance', 'general']
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  email: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  features: [{
    type: String,
    enum: [
      'Portfolio Editor',
      'GitHub Integration', 
      'Live Preview',
      'Theme Customization',
      'Project Import',
      'Portfolio Sharing',
      'Analytics Dashboard',
      'Export Features'
    ]
  }],
  improvements: {
    type: String,
    maxlength: 1000
  },
  recommend: {
    type: String,
    enum: ['yes', 'maybe', 'no']
  },
  metadata: {
    userAgent: String,
    url: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    tags: [String]
  }
}, {
  timestamps: true
});

// NPS Response Schema
const npsResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  metadata: {
    url: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Survey Response Schema (for future surveys)
const surveyResponseSchema = new mongoose.Schema({
  surveyId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    ip: String,
    userAgent: String,
    duration: Number // Time taken to complete survey in seconds
  }
}, {
  timestamps: true
});

// Indexes for better performance
feedbackSchema.index({ 'metadata.timestamp': -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ userId: 1 });

npsResponseSchema.index({ 'metadata.timestamp': -1 });
npsResponseSchema.index({ score: 1 });
npsResponseSchema.index({ userId: 1 });

surveyResponseSchema.index({ surveyId: 1 });
surveyResponseSchema.index({ userId: 1 });
surveyResponseSchema.index({ completedAt: -1 });

// Virtual for NPS category
npsResponseSchema.virtual('category').get(function() {
  if (this.score <= 6) return 'detractor';
  if (this.score <= 8) return 'passive';
  return 'promoter';
});

// Static methods for analytics
feedbackSchema.statics.getAverageRating = function(startDate, endDate) {
  return this.aggregate([
    { 
      $match: { 
        'metadata.timestamp': { 
          $gte: startDate, 
          $lte: endDate 
        } 
      } 
    },
    { 
      $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      } 
    }
  ]);
};

npsResponseSchema.statics.calculateNPS = function(startDate, endDate) {
  return this.aggregate([
    { 
      $match: { 
        'metadata.timestamp': { 
          $gte: startDate, 
          $lte: endDate 
        } 
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        promoters: {
          $sum: {
            $cond: [{ $gte: ['$score', 9] }, 1, 0]
          }
        },
        detractors: {
          $sum: {
            $cond: [{ $lte: ['$score', 6] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        nps: {
          $multiply: [
            {
              $divide: [
                { $subtract: ['$promoters', '$detractors'] },
                '$total'
              ]
            },
            100
          ]
        },
        total: 1,
        promoters: 1,
        detractors: 1
      }
    }
  ]);
};

const Feedback = mongoose.model('Feedback', feedbackSchema);
const NPSResponse = mongoose.model('NPSResponse', npsResponseSchema);
const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = {
  Feedback,
  NPSResponse,
  SurveyResponse
};
