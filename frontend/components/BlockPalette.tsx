'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Code,
  Briefcase,
  BookOpen,
  Plus,
  Github,
  Download,
  MessageSquare,
  Mail,
  FileText,
} from 'lucide-react';

type BlockType =
  | 'bio'
  | 'skills'
  | 'projects'
  | 'blog'
  | 'testimonials'
  | 'contact'
  | 'resume';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  onImportFromGitHub?: () => void;
}

const blockTypes = [
  {
    type: 'bio' as BlockType,
    label: 'Bio Block',
    description: 'Personal information and introduction',
    icon: User,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    type: 'skills' as BlockType,
    label: 'Skills Block',
    description: 'Technical skills and expertise',
    icon: Code,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    type: 'projects' as BlockType,
    label: 'Projects Block',
    description: 'Portfolio projects and work',
    icon: Briefcase,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
  {
    type: 'blog' as BlockType,
    label: 'Blog Block',
    description: 'Articles and blog posts',
    icon: BookOpen,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  },
  {
    type: 'testimonials' as BlockType,
    label: 'Testimonials Block',
    description: 'Client and colleague testimonials',
    icon: MessageSquare,
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
  },
  {
    type: 'contact' as BlockType,
    label: 'Contact Form',
    description: 'Contact form for visitors',
    icon: Mail,
    color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
  },
  {
    type: 'resume' as BlockType,
    label: 'Resume Block',
    description: 'Upload and display resume',
    icon: FileText,
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  },
];

export function BlockPalette({
  onAddBlock,
  onImportFromGitHub,
}: BlockPaletteProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Block Palette</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Drag blocks to add them to your portfolio
        </p>
      </div>

      <div className="space-y-3">
        {blockTypes.map(blockType => {
          const Icon = blockType.icon;
          return (
            <Card
              key={blockType.type}
              className={`cursor-pointer transition-all duration-200 ${blockType.color} hover:shadow-md`}
              onClick={() => onAddBlock(blockType.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium truncate">
                        {blockType.label}
                      </h3>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {blockType.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* GitHub Import Section */}
      {onImportFromGitHub && (
        <div className="pt-4 border-t">
          <Button
            onClick={onImportFromGitHub}
            className="w-full mb-4"
            variant="outline"
          >
            <Github className="w-4 h-4 mr-2" />
            Import from GitHub
          </Button>
          <p className="text-xs text-muted-foreground mb-4">
            Import your repositories as project blocks
          </p>
        </div>
      )}

      <div className="pt-4 border-t">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Quick Tips</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Click blocks to add them</p>
            <p>• Drag blocks in editor to reorder</p>
            <p>• Select blocks to edit properties</p>
            <p>• Use Ctrl+S to save changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
