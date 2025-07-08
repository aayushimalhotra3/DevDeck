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
