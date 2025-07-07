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
