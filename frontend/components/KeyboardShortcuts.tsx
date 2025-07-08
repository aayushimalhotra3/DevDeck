'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Editor shortcuts
  { keys: ['Ctrl', 'S'], description: 'Save portfolio', category: 'Editor' },
  { keys: ['Cmd', 'S'], description: 'Save portfolio (Mac)', category: 'Editor' },
  { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Editor' },
  { keys: ['Cmd', 'Z'], description: 'Undo last action (Mac)', category: 'Editor' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo last action', category: 'Editor' },
  { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo last action (Mac)', category: 'Editor' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last action (Alt)', category: 'Editor' },
  { keys: ['Cmd', 'Y'], description: 'Redo last action (Mac Alt)', category: 'Editor' },
  
  // Navigation shortcuts
  { keys: ['Ctrl', 'P'], description: 'Toggle preview mode', category: 'Navigation' },
  { keys: ['Cmd', 'P'], description: 'Toggle preview mode (Mac)', category: 'Navigation' },
  { keys: ['Escape'], description: 'Deselect current block', category: 'Navigation' },
  { keys: ['↑'], description: 'Select previous block', category: 'Navigation' },
  { keys: ['↓'], description: 'Select next block', category: 'Navigation' },
  { keys: ['Ctrl', 'A'], description: 'Select first block', category: 'Navigation' },
  { keys: ['Cmd', 'A'], description: 'Select first block (Mac)', category: 'Navigation' },
  
  // Block shortcuts
  { keys: ['Ctrl', 'D'], description: 'Duplicate selected block', category: 'Blocks' },
  { keys: ['Cmd', 'D'], description: 'Duplicate selected block (Mac)', category: 'Blocks' },
  { keys: ['Delete'], description: 'Delete selected block', category: 'Blocks' },
  { keys: ['Backspace'], description: 'Delete selected block (Alt)', category: 'Blocks' },
  
  // General shortcuts
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', category: 'General' },
  { keys: ['Cmd', '/'], description: 'Show keyboard shortcuts (Mac)', category: 'General' },
  { keys: ['F11'], description: 'Toggle fullscreen', category: 'General' },
];

const categories = Array.from(new Set(shortcuts.map(s => s.category)));

function KeyboardKey({ children }: { children: string }) {
  return (
    <Badge 
      variant="outline" 
      className="px-2 py-1 text-xs font-mono bg-muted border-2 border-border shadow-sm"
    >
      {children}
    </Badge>
  );
}

function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <div key={index} className="flex items-center gap-1">
            <KeyboardKey>{key}</KeyboardKey>
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs text-muted-foreground">+</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredShortcuts = selectedCategory
    ? shortcuts.filter(s => s.category === selectedCategory)
    : shortcuts;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Shortcuts List */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            <AnimatePresence mode="wait">
              {categories.map(category => {
                const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
                if (categoryShortcuts.length === 0) return null;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-1"
                  >
                    {(!selectedCategory || selectedCategory === category) && (
                      <>
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mt-4 mb-2">
                          {category}
                        </h3>
                        {categoryShortcuts.map((shortcut, index) => (
                          <ShortcutItem key={`${category}-${index}`} shortcut={shortcut} />
                        ))}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Press <KeyboardKey>Ctrl</KeyboardKey> + <KeyboardKey>/</KeyboardKey> to toggle this dialog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to handle global keyboard shortcuts
export function useKeyboardShortcuts(callbacks: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTogglePreview?: () => void;
  onToggleSettings?: () => void;
  onShowShortcuts?: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, key } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;
    
    // Prevent default browser shortcuts when our shortcuts are triggered
    if (isCtrlOrCmd) {
      switch (key.toLowerCase()) {
        case 's':
          event.preventDefault();
          callbacks.onSave?.();
          break;
        case 'z':
          event.preventDefault();
          if (shiftKey) {
            callbacks.onRedo?.();
          } else {
            callbacks.onUndo?.();
          }
          break;
        case 'y':
          event.preventDefault();
          callbacks.onRedo?.();
          break;
        case 'p':
          event.preventDefault();
          callbacks.onTogglePreview?.();
          break;
        case ',':
          event.preventDefault();
          callbacks.onToggleSettings?.();
          break;
        case '/':
          event.preventDefault();
          callbacks.onShowShortcuts?.();
          break;
      }
    }
  };
  
  return { handleKeyDown };
}