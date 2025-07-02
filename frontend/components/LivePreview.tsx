'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Globe } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface PortfolioBlock {
  id: string;
  type: 'bio' | 'projects' | 'skills' | 'blog';
  content: any;
  position: { x: number; y: number };
}

interface LivePreviewProps {
  blocks: PortfolioBlock[];
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function LivePreview({ blocks, previewMode = 'desktop' }: LivePreviewProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection for live updates
    const socketInstance = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:5000'
    );

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });

    socketInstance.on('portfolio-updated', data => {
      console.log('Portfolio updated via WebSocket:', data);
      // Handle real-time updates from other sessions
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    // Emit portfolio changes to WebSocket
    if (socket && isConnected) {
      socket.emit('portfolio-change', { blocks });
    }
  }, [blocks, socket, isConnected]);

  const renderBlock = (block: PortfolioBlock) => {
    switch (block.type) {
      case 'bio':
        return (
          <Card key={block.id} className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {block.content?.name?.charAt(0) || 'U'}
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {block.content?.name || 'Your Name'}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {block.content?.bio || 'Your bio will appear here...'}
                </p>
                {block.content?.location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {block.content.location}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'skills':
        return (
          <Card key={block.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                💻 Skills & Technologies
              </CardTitle>
              <CardDescription>Technologies I work with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {block.content?.skills?.length > 0 ? (
                  block.content.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Add your skills to see them here...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card key={block.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                🚀 Featured Project
              </CardTitle>
              <CardDescription>
                {block.content?.title || 'Project Title'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {block.content?.description ||
                  'Project description will appear here...'}
              </p>
              <div className="flex space-x-2">
                {block.content?.githubUrl && (
                  <Button variant="outline" size="sm">
                    <Github className="w-4 h-4 mr-2" />
                    Code
                  </Button>
                )}
                {block.content?.demoUrl && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'blog':
        return (
          <Card key={block.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                📚 Latest Blog Posts
              </CardTitle>
              <CardDescription>
                {block.content?.platform
                  ? `From ${block.content.platform}`
                  : 'My writing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {block.content?.url ? (
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h4 className="font-medium">Sample Blog Post</h4>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    View All Posts
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Add your blog URL to display your latest posts...
                </p>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getPreviewContainerClass = () => {
    const baseClass = "mx-auto transition-all duration-300";
    switch (previewMode) {
      case 'mobile':
        return `${baseClass} max-w-sm`;
      case 'tablet':
        return `${baseClass} max-w-2xl`;
      case 'desktop':
      default:
        return `${baseClass} max-w-4xl`;
    }
  };

  const getPreviewModeLabel = () => {
    switch (previewMode) {
      case 'mobile':
        return '📱 Mobile View (375px)';
      case 'tablet':
        return '📱 Tablet View (768px)';
      case 'desktop':
      default:
        return '🖥️ Desktop View (1024px)';
    }
  };

  return (
    <div className={getPreviewContainerClass()}>
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <Badge variant="outline" className="text-xs">
            {getPreviewModeLabel()}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg min-h-96 ${
        previewMode === 'mobile' ? 'p-4' : previewMode === 'tablet' ? 'p-6' : 'p-8'
      }`}>
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className={`mb-4 ${
              previewMode === 'mobile' ? 'text-4xl' : 'text-6xl'
            }`}>🎨</div>
            <h3 className={`font-semibold mb-2 ${
              previewMode === 'mobile' ? 'text-lg' : 'text-xl'
            }`}>
              Your Portfolio Preview
            </h3>
            <p className={`text-muted-foreground ${
              previewMode === 'mobile' ? 'text-sm' : 'text-base'
            }`}>
              Add blocks in the editor to see your portfolio come to life!
            </p>
          </div>
        ) : (
          <div className={`space-y-6 ${
            previewMode === 'mobile' ? 'space-y-4' : 'space-y-6'
          }`}>{blocks.map(renderBlock)}</div>
        )}
      </div>

      {/* Preview Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className={`text-blue-700 dark:text-blue-300 ${
          previewMode === 'mobile' ? 'text-xs' : 'text-sm'
        }`}>
          💡 This is how your portfolio will look to visitors in {previewMode} view. Changes are
          updated in real-time!
        </p>
      </div>
    </div>
  );
}
