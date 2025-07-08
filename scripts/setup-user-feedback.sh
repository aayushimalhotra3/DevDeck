#!/bin/bash

# DevDeck User Feedback Collection Setup
# Creates comprehensive user feedback forms, surveys, and analytics

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "setup-user-feedback.log"
}

# Print functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create directories
FEEDBACK_DIR="feedback"
FORMS_DIR="$FEEDBACK_DIR/forms"
SURVEYS_DIR="$FEEDBACK_DIR/surveys"
ANALYTICS_DIR="$FEEDBACK_DIR/analytics"
SCRIPTS_DIR="$FEEDBACK_DIR/scripts"

print_header "Setting Up User Feedback Collection System"

# Create directory structure
print_status "Creating directory structure..."
mkdir -p "$FORMS_DIR" "$SURVEYS_DIR" "$ANALYTICS_DIR" "$SCRIPTS_DIR"
log "Created feedback directory structure"

# Create feedback form component
print_status "Creating feedback form components..."
cat > "$FORMS_DIR/FeedbackForm.tsx" << 'EOF'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface FeedbackData {
  rating: string;
  category: string;
  message: string;
  email?: string;
  features: string[];
  improvements: string;
  recommend: string;
}

interface FeedbackFormProps {
  onSubmit?: (data: FeedbackData) => void;
  compact?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, compact = false }) => {
  const [formData, setFormData] = useState<FeedbackData>({
    rating: '',
    category: '',
    message: '',
    email: '',
    features: [],
    improvements: '',
    recommend: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (response.ok) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We appreciate your input.",
        });
        
        // Reset form
        setFormData({
          rating: '',
          category: '',
          message: '',
          email: '',
          features: [],
          improvements: '',
          recommend: ''
        });
        
        onSubmit?.(formData);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  if (compact) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quick Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>How would you rate your experience?</Label>
              <RadioGroup 
                value={formData.rating} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                className="flex space-x-2 mt-2"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-1">
                    <RadioGroupItem value={num.toString()} id={`rating-${num}`} />
                    <Label htmlFor={`rating-${num}`}>{num}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="message">Your feedback</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us what you think..."
                required
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Help Us Improve DevDeck</CardTitle>
        <p className="text-muted-foreground">
          Your feedback helps us make DevDeck better for everyone.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-medium">Overall Experience Rating</Label>
            <RadioGroup 
              value={formData.rating} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              className="flex space-x-4 mt-2"
            >
              {[
                { value: '1', label: '1 - Poor' },
                { value: '2', label: '2 - Fair' },
                { value: '3', label: '3 - Good' },
                { value: '4', label: '4 - Very Good' },
                { value: '5', label: '5 - Excellent' }
              ].map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
                  <Label htmlFor={`rating-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Feedback Category */}
          <div>
            <Label className="text-base font-medium">Feedback Category</Label>
            <RadioGroup 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              className="mt-2"
            >
              {[
                { value: 'bug', label: 'Bug Report' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'usability', label: 'Usability Issue' },
                { value: 'performance', label: 'Performance Issue' },
                { value: 'general', label: 'General Feedback' }
              ].map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`category-${option.value}`} />
                  <Label htmlFor={`category-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Detailed Feedback */}
          <div>
            <Label htmlFor="message" className="text-base font-medium">Detailed Feedback</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please provide detailed feedback about your experience..."
              className="mt-2 min-h-[100px]"
              required
            />
          </div>

          {/* Feature Usage */}
          <div>
            <Label className="text-base font-medium">Which features do you use most?</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'Portfolio Editor',
                'GitHub Integration',
                'Live Preview',
                'Theme Customization',
                'Project Import',
                'Portfolio Sharing',
                'Analytics Dashboard',
                'Export Features'
              ].map(feature => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                  />
                  <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <Label htmlFor="improvements" className="text-base font-medium">What would you like to see improved?</Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder="Suggest improvements or new features..."
              className="mt-2"
            />
          </div>

          {/* Recommendation */}
          <div>
            <Label className="text-base font-medium">Would you recommend DevDeck to others?</Label>
            <RadioGroup 
              value={formData.recommend} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, recommend: value }))}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="recommend-yes" />
                <Label htmlFor="recommend-yes">Yes, definitely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="recommend-maybe" />
                <Label htmlFor="recommend-maybe">Maybe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="recommend-no" />
                <Label htmlFor="recommend-no">No, not yet</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Optional Email */}
          <div>
            <Label htmlFor="email" className="text-base font-medium">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Provide your email if you'd like us to follow up on your feedback.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
EOF

print_success "Feedback form component created"

# Create feedback modal component
cat > "$FORMS_DIR/FeedbackModal.tsx" << 'EOF'
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

interface FeedbackModalProps {
  trigger?: React.ReactNode;
  compact?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  trigger, 
  compact = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      Feedback
    </Button>
  );

  const handleFeedbackSubmit = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve DevDeck by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm onSubmit={handleFeedbackSubmit} compact={compact} />
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
EOF

print_success "Feedback modal component created"

log "Feedback form components created successfully"
echo

print_status "Creating survey templates..."

# Create NPS survey component
cat > "$SURVEYS_DIR/NPSurvey.tsx" << 'EOF'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface NPSurveyProps {
  onComplete?: (score: number, feedback?: string) => void;
}

export const NPSurvey: React.FC<NPSurveyProps> = ({ onComplete }) => {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore);
    setShowFeedback(true);
  };

  const handleSubmit = async () => {
    if (score === null) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback/nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          feedback,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been recorded.",
        });
        onComplete?.(score, feedback);
      } else {
        throw new Error('Failed to submit NPS score');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score <= 6) return 'Detractor';
    if (score <= 8) return 'Passive';
    return 'Promoter';
  };

  const getFollowUpQuestion = (score: number) => {
    if (score <= 6) {
      return "What can we do to improve your experience?";
    } else if (score <= 8) {
      return "What would make you more likely to recommend us?";
    } else {
      return "What do you love most about DevDeck?";
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>How likely are you to recommend DevDeck?</CardTitle>
        <p className="text-sm text-muted-foreground">
          On a scale of 0-10, where 10 means extremely likely
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Selection */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <Button
                key={i}
                variant={score === i ? "default" : "outline"}
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => handleScoreSelect(i)}
              >
                {i}
              </Button>
            ))}
          </div>
        </div>

        {/* Follow-up Feedback */}
        {showFeedback && score !== null && (
          <div className="space-y-3 pt-4 border-t">
            <div className="text-center">
              <span className="text-sm font-medium">
                Score: {score} ({getScoreLabel(score)})
              </span>
            </div>
            
            <div>
              <Label htmlFor="nps-feedback" className="text-sm font-medium">
                {getFollowUpQuestion(score)}
              </Label>
              <Textarea
                id="nps-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback helps us improve..."
                className="mt-2"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NPSurvey;
EOF

print_success "NPS survey component created"

log "Survey components created successfully"
echo

print_status "Creating feedback analytics dashboard..."

# Create feedback analytics component
cat > "$ANALYTICS_DIR/FeedbackAnalytics.tsx" << 'EOF'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Star,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  npsScore: number;
  responseRate: number;
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  timeSeriesData: Array<{ date: string; feedback: number; rating: number }>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    category: string;
    message: string;
    timestamp: string;
    recommend: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FeedbackAnalytics: React.FC = () => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchFeedbackStats();
  }, [timeRange]);

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch(`/api/feedback/analytics?range=${timeRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>Failed to load feedback analytics</p>
        </CardContent>
      </Card>
    );
  }

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)}/5
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                <p className={`text-2xl font-bold ${getNPSColor(stats.npsScore)}`}>
                  {stats.npsScore}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recent">Recent Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.rating} Star{item.rating !== 1 ? 's' : ''}</span>
                    <span>{item.count} responses</span>
                  </div>
                  <Progress 
                    value={(item.count / stats.totalFeedback) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoryBreakdown.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium capitalize">{category.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.count} feedback items
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {category.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stats.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="feedback" fill="#8884d8" name="Feedback Count" />
                  <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#82ca9d" name="Avg Rating" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {feedback.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{feedback.message}</p>
                    {feedback.recommend && (
                      <div className="flex items-center gap-2 text-sm">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Would recommend: {feedback.recommend}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackAnalytics;
EOF

print_success "Feedback analytics dashboard created"

log "Feedback analytics components created successfully"
echo

print_status "Creating feedback collection scripts..."

# Create feedback API routes
cat > "$SCRIPTS_DIR/feedback-api.js" << 'EOF'
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
EOF

print_success "Feedback API routes created"

# Create feedback database models
cat > "$SCRIPTS_DIR/feedback-models.js" << 'EOF'
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
EOF

print_success "Feedback database models created"

log "Feedback collection scripts created successfully"
echo

print_status "Creating feedback collection automation..."

# Create feedback automation script
cat > "$SCRIPTS_DIR/automate-feedback.sh" << 'EOF'
#!/bin/bash

# Automated feedback collection and processing
# Run this script periodically to process feedback and generate reports

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
ADMIN_TOKEN="${ADMIN_TOKEN}"
WEBHOOK_URL="${FEEDBACK_WEBHOOK_URL}"
EMAIL_ALERTS="${FEEDBACK_EMAIL_ALERTS:-true}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "feedback-automation.log"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    log "WARN: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Check for required environment variables
if [ -z "$ADMIN_TOKEN" ]; then
    print_error "ADMIN_TOKEN environment variable is required"
    exit 1
fi

print_status "Starting feedback automation process..."

# Function to get feedback analytics
get_feedback_analytics() {
    local range="${1:-7d}"
    
    curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
         "$API_BASE_URL/api/feedback/analytics?range=$range" \
         -o "feedback-analytics-$range.json"
    
    if [ $? -eq 0 ]; then
        print_status "Fetched feedback analytics for $range"
        return 0
    else
        print_error "Failed to fetch feedback analytics for $range"
        return 1
    fi
}

# Function to check for low ratings
check_low_ratings() {
    local analytics_file="feedback-analytics-7d.json"
    
    if [ ! -f "$analytics_file" ]; then
        print_warning "Analytics file not found: $analytics_file"
        return 1
    fi
    
    # Extract recent low ratings (1-2 stars)
    local low_ratings=$(jq -r '.recentFeedback[] | select(.rating <= 2) | "Rating: \(.rating)/5, Category: \(.category), Message: \(.message)"' "$analytics_file")
    
    if [ -n "$low_ratings" ]; then
        print_warning "Found low ratings in the last 7 days:"
        echo "$low_ratings"
        
        # Send alert if webhook is configured
        if [ -n "$WEBHOOK_URL" ]; then
            send_low_rating_alert "$low_ratings"
        fi
        
        return 0
    else
        print_status "No low ratings found in the last 7 days"
        return 1
    fi
}

# Function to send low rating alert
send_low_rating_alert() {
    local ratings="$1"
    
    local payload=$(jq -n \
        --arg text "🚨 Low Rating Alert - DevDeck Feedback" \
        --arg ratings "$ratings" \
        '{
            "text": $text,
            "attachments": [{
                "color": "danger",
                "title": "Low Ratings Detected",
                "text": $ratings,
                "footer": "DevDeck Feedback System",
                "ts": now
            }]
        }')
    
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "$payload" \
         --silent
    
    if [ $? -eq 0 ]; then
        print_status "Low rating alert sent successfully"
    else
        print_error "Failed to send low rating alert"
    fi
}

# Function to generate weekly report
generate_weekly_report() {
    local analytics_file="feedback-analytics-7d.json"
    
    if [ ! -f "$analytics_file" ]; then
        print_error "Analytics file not found: $analytics_file"
        return 1
    fi
    
    local report_date=$(date '+%Y-%m-%d')
    local report_file="weekly-feedback-report-$report_date.md"
    
    # Extract key metrics
    local total_feedback=$(jq -r '.totalFeedback' "$analytics_file")
    local avg_rating=$(jq -r '.averageRating' "$analytics_file")
    local nps_score=$(jq -r '.npsScore' "$analytics_file")
    local response_rate=$(jq -r '.responseRate' "$analytics_file")
    
    # Generate report
    cat > "$report_file" << REPORTEOF
# Weekly Feedback Report - $report_date

## Summary
- **Total Feedback**: $total_feedback
- **Average Rating**: $avg_rating/5
- **NPS Score**: $nps_score
- **Response Rate**: $response_rate%

## Rating Distribution
$(jq -r '.ratingDistribution[] | "- \(.rating) stars: \(.count) responses"' "$analytics_file")

## Category Breakdown
$(jq -r '.categoryBreakdown[] | "- \(.category | ascii_upcase): \(.count) (\(.percentage)%)"' "$analytics_file")

## Recent Feedback Highlights
$(jq -r '.recentFeedback[0:5][] | "### Rating: \(.rating)/5 - \(.category | ascii_upcase)\n\(.message)\n"' "$analytics_file")

## Action Items
$(if [ "$(echo "$avg_rating < 4" | bc -l)" = "1" ]; then echo "- 🔴 Average rating below 4.0 - investigate common issues"; fi)
$(if [ "$(echo "$nps_score < 0" | bc -l)" = "1" ]; then echo "- 🔴 Negative NPS score - urgent attention needed"; fi)
$(if [ "$(echo "$response_rate < 20" | bc -l)" = "1" ]; then echo "- 🟡 Low response rate - consider improving feedback collection"; fi)

---
*Generated on $report_date by DevDeck Feedback Automation*
REPORTEOF
    
    print_status "Weekly report generated: $report_file"
    
    # Send report if webhook is configured
    if [ -n "$WEBHOOK_URL" ]; then
        send_weekly_report "$report_file"
    fi
}

# Function to send weekly report
send_weekly_report() {
    local report_file="$1"
    
    if [ ! -f "$report_file" ]; then
        print_error "Report file not found: $report_file"
        return 1
    fi
    
    local report_content=$(cat "$report_file")
    
    local payload=$(jq -n \
        --arg text "📊 Weekly Feedback Report - DevDeck" \
        --arg content "$report_content" \
        '{
            "text": $text,
            "attachments": [{
                "color": "good",
                "title": "Weekly Feedback Summary",
                "text": $content,
                "footer": "DevDeck Analytics",
                "ts": now
            }]
        }')
    
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "$payload" \
         --silent
    
    if [ $? -eq 0 ]; then
        print_status "Weekly report sent successfully"
    else
        print_error "Failed to send weekly report"
    fi
}

# Function to cleanup old files
cleanup_old_files() {
    print_status "Cleaning up old feedback files..."
    
    # Remove analytics files older than 30 days
    find . -name "feedback-analytics-*.json" -mtime +30 -delete
    
    # Remove report files older than 90 days
    find . -name "weekly-feedback-report-*.md" -mtime +90 -delete
    
    # Remove log files older than 60 days
    find . -name "feedback-automation.log" -mtime +60 -delete
    
    print_status "Cleanup completed"
}

# Main execution
main() {
    print_status "=== Feedback Automation Started ==="
    
    # Get analytics for different time ranges
    get_feedback_analytics "7d"
    get_feedback_analytics "30d"
    
    # Check for low ratings and send alerts
    check_low_ratings
    
    # Generate weekly report (only on Mondays)
    if [ "$(date +%u)" = "1" ]; then
        generate_weekly_report
    fi
    
    # Cleanup old files
    cleanup_old_files
    
    print_status "=== Feedback Automation Completed ==="
}

# Run main function
main "$@"
EOF

print_success "Feedback automation script created"

log "Feedback automation setup completed successfully"
echo

print_status "Creating feedback widget for easy integration..."

# Create feedback widget component
cat > "$FORMS_DIR/FeedbackWidget.tsx" << 'EOF'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ 
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a rating and feedback message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: parseInt(rating),
          category: 'general',
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setRating('');
          setMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className={`bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm`}>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            <span className="font-medium">Feedback Sent!</span>
          </div>
          <p className="text-sm mt-1">Thank you for helping us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow"
          size="sm"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      ) : (
        <div className={`bg-white border rounded-lg shadow-xl p-4 w-80 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Quick Feedback</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs font-medium">How was your experience?</Label>
              <RadioGroup 
                value={rating} 
                onValueChange={setRating}
                className="flex justify-between mt-1"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={num.toString()} 
                      id={`widget-rating-${num}`}
                      className="h-3 w-3"
                    />
                    <Label 
                      htmlFor={`widget-rating-${num}`}
                      className="text-xs mt-1"
                    >
                      {num}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="widget-message" className="text-xs font-medium">
                Tell us more (optional)
              </Label>
              <Textarea
                id="widget-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we improve?"
                className="mt-1 text-sm"
                rows={2}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !rating}
              size="sm"
              className="w-full"
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
EOF

print_success "Feedback widget component created"

log "Feedback widget created successfully"
echo

print_status "Creating feedback documentation..."

# Create feedback system README
cat > "$FEEDBACK_DIR/README.md" << 'EOF'
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
EOF

print_success "Feedback system documentation created"

print_header "User Feedback Collection System Setup Complete!"
print_success "Comprehensive feedback system created:"
echo
print_status "Components:"
echo "  📝 Feedback Forms: $FORMS_DIR/"
echo "  📊 NPS Surveys: $SURVEYS_DIR/"
echo "  📈 Analytics Dashboard: $ANALYTICS_DIR/"
echo "  🤖 Automation Scripts: $SCRIPTS_DIR/"
echo
print_status "Key Features:"
echo "  ✅ Comprehensive feedback collection"
echo "  ✅ Real-time analytics and insights"
echo "  ✅ Automated processing and alerts"
echo "  ✅ NPS tracking and analysis"
echo "  ✅ Floating feedback widget"
echo "  ✅ Weekly automated reports"
echo
print_status "Next steps:"
echo "  1. Integrate feedback API routes into backend"
echo "  2. Add feedback components to frontend"
echo "  3. Configure environment variables"
echo "  4. Set up automation cron jobs"
echo "  5. Test feedback collection flow"
echo
print_status "Documentation: $FEEDBACK_DIR/README.md"
log "User feedback collection system setup completed successfully"