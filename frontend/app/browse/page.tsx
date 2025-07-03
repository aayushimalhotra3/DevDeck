'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Copy, ExternalLink, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface PublicPortfolio {
  _id: string;
  userId: {
    _id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
  blocks: any[];
  theme: {
    name: string;
    primaryColor: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  stats: {
    views: number;
    shares: number;
  };
  publishing: {
    publishedAt: string;
  };
}

export default function BrowsePortfolios() {
  const [portfolios, setPortfolios] = useState<PublicPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Portfolios' },
    { value: 'developer', label: 'Developers' },
    { value: 'designer', label: 'Designers' },
    { value: 'creative', label: 'Creative' },
    { value: 'business', label: 'Business' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' },
  ];

  useEffect(() => {
    fetchPublicPortfolios();
  }, [selectedCategory, sortBy]);

  const fetchPublicPortfolios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        search: searchTerm,
      });

      const response = await fetch(`/api/portfolios/public?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch portfolios',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPublicPortfolios();
  };

  const handleClonePortfolio = async (
    portfolioId: string,
    username: string
  ) => {
    try {
      const response = await fetch('/api/portfolios/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioId }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Portfolio cloned successfully! You can now edit it.',
        });
        // Redirect to edit page
        window.location.href = '/edit';
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to clone portfolio',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cloning portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to clone portfolio',
        variant: 'destructive',
      });
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      portfolio.userId.username.toLowerCase().includes(searchLower) ||
      portfolio.userId.name?.toLowerCase().includes(searchLower) ||
      portfolio.seo.title.toLowerCase().includes(searchLower) ||
      portfolio.seo.description.toLowerCase().includes(searchLower) ||
      portfolio.seo.keywords.some(keyword =>
        keyword.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Public Portfolios</h1>
        <p className="text-muted-foreground">
          Discover amazing portfolios and get inspired. Clone any portfolio to
          use as a starting point for your own.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search portfolios, usernames, or keywords..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <Filter className="w-4 h-4 mt-2 text-muted-foreground" />
            <span className="text-sm font-medium mt-1">Category:</span>
            {categories.map(category => (
              <Button
                key={category.value}
                variant={
                  selectedCategory === category.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium mt-1">Sort by:</span>
            {sortOptions.map(option => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPortfolios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'No portfolios found matching your search.'
              : 'No public portfolios available yet.'}
          </p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map(portfolio => (
            <Card
              key={portfolio._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {portfolio.userId.avatar ? (
                      <img
                        src={portfolio.userId.avatar}
                        alt={portfolio.userId.name || portfolio.userId.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(portfolio.userId.name || portfolio.userId.username)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {portfolio.seo.title ||
                          portfolio.userId.name ||
                          portfolio.userId.username}
                      </CardTitle>
                      <CardDescription>
                        @{portfolio.userId.username}
                      </CardDescription>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: portfolio.theme.primaryColor }}
                    title={`Theme: ${portfolio.theme.name}`}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {portfolio.seo.description || 'No description available.'}
                </p>

                {portfolio.seo.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {portfolio.seo.keywords
                      .slice(0, 3)
                      .map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    {portfolio.seo.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{portfolio.seo.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {portfolio.stats.views} views
                  </span>
                  <span>
                    {new Date(
                      portfolio.publishing.publishedAt
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/preview/${portfolio.userId.username}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleClonePortfolio(
                        portfolio._id,
                        portfolio.userId.username
                      )
                    }
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Clone
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
