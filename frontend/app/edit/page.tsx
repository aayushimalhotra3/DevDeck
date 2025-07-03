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
  type: 'bio' | 'projects' | 'skills' | 'blog' | 'testimonials' | 'contact' | 'resume';
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
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Add to history for undo/redo
  const addToHistory = useCallback((newBlocks: PortfolioBlock[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newBlocks]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

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

  // Autosave functionality
  const autosave = useCallback(async (blocksToSave: PortfolioBlock[]) => {
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
        toast({
          title: "Auto-saved",
          description: "Your changes have been automatically saved.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [hasUnsavedChanges, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSavePortfolio();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Autosave timer
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        autosave(blocks);
      }, 3000); // Autosave after 3 seconds of inactivity
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [blocks, hasUnsavedChanges, autosave]);

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
          title: "Error",
          description: "Failed to load your portfolio. Please try again.",
          variant: "destructive",
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
          title: "Saved!",
          description: "Your portfolio has been saved successfully.",
        });
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to save your portfolio. Please try again.",
        variant: "destructive",
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
          technologies: repo.language ? [repo.language, ...repo.topics.slice(0, 4)] : repo.topics.slice(0, 5),
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
        title: "Success!",
        description: `Imported ${repos.length} repositories as project blocks.`,
      });
    } catch (error) {
      console.error('Failed to import repositories:', error);
      toast({
        title: "Error",
        description: "Failed to import repositories. Please try again.",
        variant: "destructive",
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
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette Sidebar */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
          <BlockPalette 
            onAddBlock={(type: 'bio' | 'skills' | 'projects' | 'blog' | 'testimonials' | 'contact' | 'resume') => {
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-6 py-3">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                </TabsList>

                {/* Preview Mode Controls */}
                {activeTab === 'preview' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Preview:</span>
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
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
                        block.id === selectedBlockId ? { ...block, content } : block
                      );
                      handleBlockUpdate(updatedBlocks);
                    }}
                    onClose={() => setSelectedBlockId(null)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 p-6 overflow-y-auto">
              <div className="flex justify-center">
                <div className={`transition-all duration-300 ${getPreviewWidth()}`}>
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
            <Badge variant="outline" className="text-orange-600 border-orange-600">
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
