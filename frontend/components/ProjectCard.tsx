'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, ExternalLink, Star, GitFork, Calendar, Eye } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count?: number;
  homepage?: string;
  topics?: string[];
  updated_at: string;
}

interface ProjectCardProps {
  repository: Repository;
  showAddButton?: boolean;
  onAddToPortfolio?: (repo: Repository) => void;
}

export function ProjectCard({
  repository,
  showAddButton = false,
  onAddToPortfolio,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'bg-yellow-500',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-orange-500',
      'C++': 'bg-pink-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      PHP: 'bg-purple-500',
      Ruby: 'bg-red-500',
      Swift: 'bg-orange-400',
      Kotlin: 'bg-purple-600',
      Dart: 'bg-blue-400',
      HTML: 'bg-orange-600',
      CSS: 'bg-blue-600',
      Shell: 'bg-gray-500',
    };
    return colors[language] || 'bg-gray-400';
  };

  return (
    <Card 
      className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform cursor-pointer group border-2 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors duration-200">
              {repository.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {repository.description || 'No description available'}
            </CardDescription>
          </div>
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Language and Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {repository.language && (
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}
                  />
                  <span className="text-muted-foreground">
                    {repository.language}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-1 text-muted-foreground">
                <Star className="w-3 h-3" />
                <span>{repository.stargazers_count}</span>
              </div>

              {repository.forks_count !== undefined && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <GitFork className="w-3 h-3" />
                  <span>{repository.forks_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Topics */}
          {repository.topics && repository.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repository.topics.slice(0, 3).map(topic => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {repository.topics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{repository.topics.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Updated Date */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(repository.updated_at)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.open(repository.html_url, '_blank')}
            >
              <Github className="w-3 h-3 mr-1" />
              Code
            </Button>

            {repository.homepage && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 transition-all duration-200 hover:scale-105 hover:bg-green-500 hover:text-white hover:border-green-500"
                onClick={() => window.open(repository.homepage, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Demo
              </Button>
            )}

            {showAddButton && onAddToPortfolio && (
              <Button
                size="sm"
                className="flex-1 transition-all duration-200 hover:scale-105"
                onClick={() => onAddToPortfolio(repository)}
              >
                Add to Portfolio
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced loading skeleton for ProjectCard
export function ProjectCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Language and Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>

          {/* Topics */}
          <div className="flex space-x-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>

          {/* Updated Date */}
          <div className="flex items-center space-x-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-8 flex-1 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid skeleton for multiple project cards
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}
