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
