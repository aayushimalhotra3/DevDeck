'use client';

import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, GripVertical } from 'lucide-react';

interface PortfolioBlock {
  id: string;
  type: 'bio' | 'projects' | 'skills' | 'blog';
  content: any;
  position: { x: number; y: number };
}

interface DragEditorProps {
  blocks: PortfolioBlock[];
  onBlocksUpdate: (blocks: PortfolioBlock[]) => void;
  selectedBlockId?: string;
  onBlockSelect?: (blockId: string | null) => void;
}

const ItemTypes = {
  BLOCK: 'block',
};

interface DraggableBlockProps {
  block: PortfolioBlock;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onUpdateBlock: (id: string, content: any) => void;
  onDeleteBlock: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (blockId: string) => void;
}

function DraggableBlock({
  block,
  index,
  moveBlock,
  onUpdateBlock,
  onDeleteBlock,
  isSelected = false,
  onSelect,
}: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveBlock(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor: DropTargetMonitor) => ({}),
  });

  const renderBlockContent = () => {
    switch (block.type) {
      case 'bio':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={block.content?.name || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  name: e.target.value,
                })
              }
            />
            <Textarea
              placeholder="Tell us about yourself..."
              value={block.content?.bio || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  bio: e.target.value,
                })
              }
              rows={3}
            />
            <Input
              placeholder="Location (optional)"
              value={block.content?.location || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  location: e.target.value,
                })
              }
            />
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Add skills (comma separated)"
              value={block.content?.skills?.join(', ') || ''}
              onChange={e => {
                const skills = e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s);
                onUpdateBlock(block.id, { ...block.content, skills });
              }}
            />
            <div className="flex flex-wrap gap-2">
              {block.content?.skills?.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Project title"
              value={block.content?.title || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  title: e.target.value,
                })
              }
            />
            <Textarea
              placeholder="Project description"
              value={block.content?.description || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  description: e.target.value,
                })
              }
              rows={2}
            />
            <Input
              placeholder="GitHub URL"
              value={block.content?.githubUrl || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  githubUrl: e.target.value,
                })
              }
            />
            <Input
              placeholder="Live demo URL"
              value={block.content?.demoUrl || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  demoUrl: e.target.value,
                })
              }
            />
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Blog platform (e.g., Dev.to, Medium)"
              value={block.content?.platform || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  platform: e.target.value,
                })
              }
            />
            <Input
              placeholder="Blog URL or RSS feed"
              value={block.content?.url || ''}
              onChange={e =>
                onUpdateBlock(block.id, {
                  ...block.content,
                  url: e.target.value,
                })
              }
            />
          </div>
        );

      default:
        return <div>Unknown block type</div>;
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'bio':
        return '📝';
      case 'projects':
        return '🚀';
      case 'skills':
        return '💻';
      case 'blog':
        return '📚';
      default:
        return '📄';
    }
  };

  return (
    <div
      ref={node => {
        drag(node);
        drop(node);
      }}
      className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
        }`}
        onClick={() => onSelect?.(block.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <GripVertical className="w-4 h-4 mr-2 cursor-move" />
            {getBlockIcon()}{' '}
            {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
            {isSelected && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Selected
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>{renderBlockContent()}</CardContent>
      </Card>
    </div>
  );
}

export function DragEditor({ 
  blocks, 
  onBlocksUpdate, 
  selectedBlockId, 
  onBlockSelect 
}: DragEditorProps) {
  const moveBlock = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newBlocks = [...blocks];
      const draggedBlock = newBlocks[dragIndex];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      onBlocksUpdate(newBlocks);
    },
    [blocks, onBlocksUpdate]
  );

  const addBlock = (type: PortfolioBlock['type']) => {
    const newBlock: PortfolioBlock = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      position: { x: 0, y: blocks.length * 100 },
    };
    onBlocksUpdate([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    onBlocksUpdate(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    onBlocksUpdate(newBlocks);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-6">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No blocks added yet. Start building your portfolio!
            </p>
            <div className="space-x-2">
              <Button onClick={() => addBlock('bio')} variant="outline">
                📝 Add Bio
              </Button>
              <Button onClick={() => addBlock('projects')} variant="outline">
                🚀 Add Projects
              </Button>
              <Button onClick={() => addBlock('skills')} variant="outline">
                💻 Add Skills
              </Button>
              <Button onClick={() => addBlock('blog')} variant="outline">
                📚 Add Blog
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {blocks.map((block, index) => (
              <DraggableBlock
                key={block.id}
                block={block}
                index={index}
                moveBlock={moveBlock}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                isSelected={selectedBlockId === block.id}
                onSelect={onBlockSelect}
              />
            ))}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Add more blocks:</p>
              <div className="space-x-2">
                <Button
                  onClick={() => addBlock('bio')}
                  variant="outline"
                  size="sm"
                >
                  📝 Bio
                </Button>
                <Button
                  onClick={() => addBlock('projects')}
                  variant="outline"
                  size="sm"
                >
                  🚀 Projects
                </Button>
                <Button
                  onClick={() => addBlock('skills')}
                  variant="outline"
                  size="sm"
                >
                  💻 Skills
                </Button>
                <Button
                  onClick={() => addBlock('blog')}
                  variant="outline"
                  size="sm"
                >
                  📚 Blog
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
