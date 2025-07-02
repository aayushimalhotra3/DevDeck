'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Undo, Redo, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
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
}: EditorToolbarProps) {
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

          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={saving || !hasUnsavedChanges}
            className={cn(
              "transition-all",
              hasUnsavedChanges && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}