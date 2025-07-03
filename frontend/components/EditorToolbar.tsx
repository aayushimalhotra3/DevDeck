'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Undo, Redo, Loader2, Check, Clock, AlertCircle, Eye, Settings, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { KeyboardTooltip, FeatureTooltip } from './Tooltip';

interface EditorToolbarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastSaved?: Date;
}

export function EditorToolbar({
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saving,
  hasUnsavedChanges,
  isAutoSaving,
  lastSaved
}: EditorToolbarProps) {
  const getSaveStatus = () => {
    if (saving || isAutoSaving) {
      return {
        icon: Clock,
        text: isAutoSaving ? 'Auto-saving...' : 'Saving...',
        variant: 'secondary' as const,
        className: 'text-blue-600'
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        icon: AlertCircle,
        text: 'Unsaved changes',
        variant: 'destructive' as const,
        className: 'text-orange-600'
      };
    }
    
    return {
      icon: Check,
      text: lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'All changes saved',
      variant: 'secondary' as const,
      className: 'text-green-600'
    };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const saveStatus = getSaveStatus();
  return (
    <div className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <h1 className="text-xl font-semibold">Portfolio Editor</h1>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
              Unsaved
            </Badge>
          )}
          {isAutoSaving && (
            <Badge variant="outline" className="ml-2 text-blue-600 border-blue-600">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Auto-saving
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <KeyboardTooltip
            shortcut={['Ctrl', 'Z']}
            description="Undo last action"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "transition-all",
                !canUndo && "opacity-50 cursor-not-allowed"
              )}
            >
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
          </KeyboardTooltip>
          
          <KeyboardTooltip
            shortcut={['Ctrl', 'Shift', 'Z']}
            description="Redo last action"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "transition-all",
                !canRedo && "opacity-50 cursor-not-allowed"
              )}
            >
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
          </KeyboardTooltip>

          {/* Save Button */}
          <div className="flex items-center gap-2">
            <KeyboardShortcuts />
            <KeyboardTooltip
              shortcut={['Ctrl', 'S']}
              description="Save portfolio changes"
            >
              <Button
                onClick={onSave}
                disabled={saving || !hasUnsavedChanges}
                size="sm"
                className={cn(
                  "transition-all gap-2",
                  hasUnsavedChanges && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </KeyboardTooltip>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={saveStatus.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge variant={saveStatus.variant} className={`gap-1 ${saveStatus.className}`}>
                  <saveStatus.icon className="h-3 w-3" />
                  {saveStatus.text}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}