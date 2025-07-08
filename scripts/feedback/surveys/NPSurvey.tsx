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
