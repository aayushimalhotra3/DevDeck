'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, Code, Briefcase, BookOpen, Plus, Github, Download, MessageSquare, Mail, FileText, Search, Filter, SortAsc } from 'lucide-react';

type BlockType = 'bio' | 'skills' | 'projects' | 'blog' | 'testimonials' | 'contact' | 'resume';

type SortOption = 'name' | 'category' | 'recent';
type FilterOption = 'all' | 'personal' | 'professional' | 'content';

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
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900',
    category: 'personal' as FilterOption,
    tooltip: 'Add your personal bio, photo, and introduction to visitors',
  },
  {
    type: 'skills' as BlockType,
    label: 'Skills Block',
    description: 'Technical skills and expertise',
    icon: Code,
    color: 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900',
    category: 'professional' as FilterOption,
    tooltip: 'Showcase your technical skills, programming languages, and tools',
  },
  {
    type: 'projects' as BlockType,
    label: 'Projects Block',
    description: 'Portfolio projects and work',
    icon: Briefcase,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:hover:bg-purple-900',
    category: 'professional' as FilterOption,
    tooltip: 'Display your portfolio projects with links and descriptions',
  },
  {
    type: 'blog' as BlockType,
    label: 'Blog Block',
    description: 'Articles and blog posts',
    icon: BookOpen,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:hover:bg-orange-900',
    category: 'content' as FilterOption,
    tooltip: 'Link to your blog posts and articles from various platforms',
  },
  {
    type: 'testimonials' as BlockType,
    label: 'Testimonials Block',
    description: 'Client and colleague testimonials',
    icon: MessageSquare,
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100 dark:bg-pink-950 dark:border-pink-800 dark:hover:bg-pink-900',
    category: 'professional' as FilterOption,
    tooltip: 'Add testimonials and recommendations from clients or colleagues',
  },
  {
    type: 'contact' as BlockType,
    label: 'Contact Form',
    description: 'Contact form for visitors',
    icon: Mail,
    color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950 dark:border-cyan-800 dark:hover:bg-cyan-900',
    category: 'personal' as FilterOption,
    tooltip: 'Add a contact form for visitors to reach out to you',
  },
  {
    type: 'resume' as BlockType,
    label: 'Resume Block',
    description: 'Upload and display resume',
    icon: FileText,
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:border-yellow-800 dark:hover:bg-yellow-900',
    category: 'professional' as FilterOption,
    tooltip: 'Upload and display your resume or CV for download',
  },
];

export function BlockPalette({ onAddBlock, onImportFromGitHub }: BlockPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // Filter and sort blocks
  const filteredAndSortedBlocks = blockTypes
    .filter(block => {
      const matchesSearch = block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           block.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || block.category === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.label.localeCompare(b.label);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'recent':
          return 0; // Keep original order for recent
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Block Palette</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click blocks to add them to your portfolio
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="professional">Professional</option>
            <option value="content">Content</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="recent">Recently Used</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAndSortedBlocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No blocks found</p>
            <p className="text-xs">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredAndSortedBlocks.map((blockType) => {
            const Icon = blockType.icon;
            const isHovered = hoveredBlock === blockType.type;
            
            return (
              <div key={blockType.type} className="relative group">
                <Card
                  className={`cursor-pointer transition-all duration-200 ${blockType.color} hover:shadow-lg hover:scale-[1.02] transform`}
                  onClick={() => onAddBlock(blockType.type)}
                  onMouseEnter={() => setHoveredBlock(blockType.type)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={`w-5 h-5 mt-0.5 transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium truncate">
                            {blockType.label}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {blockType.category}
                            </Badge>
                            <Plus className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isHovered ? 'scale-110 rotate-90' : ''}`} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {blockType.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute z-50 left-full ml-2 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground p-2 rounded-md shadow-lg border max-w-xs">
                    <p className="text-xs">{blockType.tooltip}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
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
            <p>• Use search to find specific blocks</p>
            <p>• Filter by category for focused editing</p>
            <p>• Hover for detailed descriptions</p>
            <p>• Drag blocks in editor to reorder</p>
            <p>• Use Ctrl+S to save changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}