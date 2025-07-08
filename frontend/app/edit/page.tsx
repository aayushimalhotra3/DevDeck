'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DragEditor } from '@/components/DragEditor';
import { LivePreview } from '@/components/LivePreview';
import { BlockPalette } from '@/components/BlockPalette';
import { PropertyPanel } from '@/components/PropertyPanel';
import { EditorToolbar } from '@/components/EditorToolbar';
import { GitHubImport } from '@/components/GitHubImport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Monitor, Tablet, Smartphone, Save, Undo, Redo } from 'lucide-react';

interface PortfolioBlock {
  id: string;
  type:
    | 'bio'
    | 'projects'
    | 'skills'
    | 'blog'
    | 'testimonials'
    | 'contact'
    | 'resume';
  content: any;
  position: { x: number; y: number };
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export default function EditPortfolio() {
  const [blocks, setBlocks] = useState<PortfolioBlock[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [saving, setSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [history, setHistory] = useState<PortfolioBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [autosaveProgress, setAutosaveProgress] = useState(0);
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Add to history for undo/redo
  const addToHistory = useCallback(
    (newBlocks: PortfolioBlock[]) => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push([...newBlocks]);
        return newHistory.slice(-50); // Keep last 50 states
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setBlocks([...previousState]);
      setHistoryIndex(prev => prev - 1);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBlocks([...nextState]);
      setHistoryIndex(prev => prev + 1);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  // Enhanced autosave functionality with better visual feedback
  const autosave = useCallback(
    async (blocksToSave: PortfolioBlock[]) => {
      if (!hasUnsavedChanges) return;

      setIsAutoSaving(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ blocks: blocksToSave }),
          }
        );

        if (response.ok) {
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          // Enhanced visual feedback with subtle animation
          toast({
            title: '✅ Auto-saved',
            description: 'Your changes have been automatically saved.',
            duration: 1500,
            className: 'border-green-200 bg-green-50 text-green-800',
          });
        } else {
          throw new Error('Autosave failed');
        }
      } catch (error) {
        console.error('Autosave failed:', error);
        toast({
          title: '⚠️ Autosave failed',
          description: 'Failed to auto-save. Your changes are still preserved locally.',
          duration: 3000,
          variant: 'destructive',
        });
      } finally {
        setIsAutoSaving(false);
      }
    },
    [hasUnsavedChanges, toast]
  );

  // Enhanced keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, key, altKey } = event;
      const isCtrlOrCmd = ctrlKey || metaKey;

      // Save
      if (isCtrlOrCmd && key === 's') {
        event.preventDefault();
        handleSavePortfolio();
        return;
      }
      
      // Undo
      if (isCtrlOrCmd && key === 'z' && !shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      
      // Redo
      if ((isCtrlOrCmd && key === 'z' && shiftKey) || (isCtrlOrCmd && key === 'y')) {
        event.preventDefault();
        redo();
        return;
      }
      
      // Toggle preview
      if (isCtrlOrCmd && key === 'p') {
        event.preventDefault();
        setActiveTab(activeTab === 'preview' ? 'editor' : 'preview');
        toast({
          title: activeTab === 'preview' ? 'Edit Mode' : 'Preview Mode',
          description: activeTab === 'preview' ? 'Switched to edit mode' : 'Switched to preview mode',
          duration: 1000,
        });
        return;
      }
      
      // Duplicate selected block
      if (isCtrlOrCmd && key === 'd' && selectedBlockId) {
        event.preventDefault();
        const selectedBlock = blocks.find(b => b.id === selectedBlockId);
        if (selectedBlock) {
          const duplicatedBlock = {
            ...selectedBlock,
            id: Date.now().toString(),
            position: {
              x: selectedBlock.position.x + 20,
              y: selectedBlock.position.y + 20,
            },
          };
          const newBlocks = [...blocks, duplicatedBlock];
          handleBlockUpdate(newBlocks);
          setSelectedBlockId(duplicatedBlock.id);
          toast({
            title: '📋 Block duplicated',
            description: 'Block has been duplicated and selected',
            duration: 1500,
          });
        }
        return;
      }
      
      // Delete selected block
      if ((key === 'Delete' || key === 'Backspace') && selectedBlockId && !(event.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) {
        event.preventDefault();
        const newBlocks = blocks.filter(b => b.id !== selectedBlockId);
        handleBlockUpdate(newBlocks);
        setSelectedBlockId(null);
        toast({
          title: '🗑️ Block deleted',
          description: 'Selected block has been removed',
          duration: 1500,
        });
        return;
      }
      
      // Navigate between blocks with arrow keys
      if ((key === 'ArrowUp' || key === 'ArrowDown') && !(event.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) {
        event.preventDefault();
        const currentIndex = blocks.findIndex(b => b.id === selectedBlockId);
        if (currentIndex !== -1) {
          const nextIndex = key === 'ArrowUp' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(blocks.length - 1, currentIndex + 1);
          setSelectedBlockId(blocks[nextIndex]?.id || null);
        } else if (blocks.length > 0) {
          setSelectedBlockId(blocks[0].id);
        }
        return;
      }
      
      // Escape to deselect
      if (key === 'Escape') {
        setSelectedBlockId(null);
        return;
      }
      
      // Select all blocks
      if (isCtrlOrCmd && key === 'a' && !(event.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) {
        event.preventDefault();
        // For now, just select the first block, but this could be enhanced for multi-selection
        if (blocks.length > 0) {
          setSelectedBlockId(blocks[0].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, activeTab, selectedBlockId, blocks, toast, handleBlockUpdate, handleSavePortfolio]);

  // Enhanced autosave timer with progress tracking
  useEffect(() => {
    if (hasUnsavedChanges && !isAutoSaving) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      // Reset progress and start countdown
      setAutosaveProgress(0);
      const startTime = Date.now();
      const duration = 3000; // 3 seconds
      
      // Update progress every 100ms
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setAutosaveProgress(progress);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      autosaveTimeoutRef.current = setTimeout(() => {
        clearInterval(progressInterval);
        setAutosaveProgress(0);
        autosave(blocks);
      }, duration);
      
      return () => {
        clearInterval(progressInterval);
      };
    } else {
      setAutosaveProgress(0);
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [blocks, hasUnsavedChanges, isAutoSaving, autosave]);

  useEffect(() => {
    // Load existing portfolio data
    const loadPortfolio = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`,
          {
            credentials: 'include',
          }
        );
        if (response.ok) {
          const data = await response.json();
          const loadedBlocks = data.blocks || [];
          setBlocks(loadedBlocks);
          setHistory([loadedBlocks]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your portfolio. Please try again.',
          variant: 'destructive',
        });
      }
    };

    loadPortfolio();
  }, [toast]);

  const handleSavePortfolio = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ blocks }),
        }
      );

      if (response.ok) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast({
          title: 'Saved!',
          description: 'Your portfolio has been saved successfully.',
        });
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your portfolio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUpdate = (updatedBlocks: PortfolioBlock[]) => {
    setBlocks(updatedBlocks);
    addToHistory(updatedBlocks);
    setHasUnsavedChanges(true);
  };

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlockId(blockId);
  };

  const handleGitHubImport = async (repos: any[]) => {
    try {
      // Convert GitHub repos to project blocks
      const projectBlocks: PortfolioBlock[] = repos.map((repo, index) => ({
        id: `github-project-${repo.id}`,
        type: 'projects' as const,
        content: {
          title: repo.name,
          description: repo.description || 'No description available',
          technologies: repo.language
            ? [repo.language, ...repo.topics.slice(0, 4)]
            : repo.topics.slice(0, 5),
          githubUrl: repo.html_url,
          demoUrl: repo.homepage || undefined,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastUpdated: repo.updated_at,
          featured: repo.stargazers_count > 10, // Auto-feature popular repos
        },
        position: { x: 0, y: (blocks.length + index) * 120 },
      }));

      const updatedBlocks = [...blocks, ...projectBlocks];
      handleBlockUpdate(updatedBlocks);

      toast({
        title: 'Success!',
        description: `Imported ${repos.length} repositories as project blocks.`,
      });
    } catch (error) {
      console.error('Failed to import repositories:', error);
      toast({
        title: 'Error',
        description: 'Failed to import repositories. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      case 'desktop':
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Enhanced Toolbar */}
      <EditorToolbar
        onSave={handleSavePortfolio}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
        isAutoSaving={isAutoSaving}
        lastSaved={lastSaved}
        autosaveProgress={autosaveProgress}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette Sidebar */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
          <BlockPalette
            onAddBlock={(
              type:
                | 'bio'
                | 'skills'
                | 'projects'
                | 'blog'
                | 'testimonials'
                | 'contact'
                | 'resume'
            ) => {
              const newBlock: PortfolioBlock = {
                id: `block-${Date.now()}`,
                type,
                content: {},
                position: { x: 0, y: blocks.length * 100 },
              };
              const updatedBlocks = [...blocks, newBlock];
              handleBlockUpdate(updatedBlocks);
            }}
            onImportFromGitHub={() => setShowGitHubImport(true)}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="border-b px-6 py-3">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                </TabsList>

                {/* Preview Mode Controls */}
                {activeTab === 'preview' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Preview:
                    </span>
                    <Button
                      variant={
                        previewMode === 'desktop' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <TabsContent value="editor" className="flex-1 flex m-0 p-0">
              <div className="flex-1 p-6 overflow-y-auto">
                <DragEditor
                  blocks={blocks}
                  onBlocksUpdate={handleBlockUpdate}
                  selectedBlockId={selectedBlockId || undefined}
                  onBlockSelect={handleBlockSelect}
                />
              </div>

              {/* Property Panel */}
              {selectedBlockId && (
                <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
                  <PropertyPanel
                    block={blocks.find(b => b.id === selectedBlockId)}
                    onUpdateBlock={(content: Record<string, any>) => {
                      const updatedBlocks = blocks.map(block =>
                        block.id === selectedBlockId
                          ? { ...block, content }
                          : block
                      );
                      handleBlockUpdate(updatedBlocks);
                    }}
                    onClose={() => setSelectedBlockId(null)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="preview"
              className="flex-1 m-0 p-6 overflow-y-auto"
            >
              <div className="flex justify-center">
                <div
                  className={`transition-all duration-300 ${getPreviewWidth()}`}
                >
                  <LivePreview blocks={blocks} previewMode={previewMode} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* GitHub Import Modal */}
      {showGitHubImport && (
        <GitHubImport
          onImport={handleGitHubImport}
          onClose={() => setShowGitHubImport(false)}
        />
      )}

      {/* Status Bar */}
      <div className="border-t px-6 py-2 bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{blocks.length} blocks</span>
          {hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              Unsaved changes
            </Badge>
          )}
          {isAutoSaving && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Auto-saving...
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Ctrl+S to save • Ctrl+Z to undo • Ctrl+Y to redo</span>
        </div>
      </div>
    </div>
  );
}
