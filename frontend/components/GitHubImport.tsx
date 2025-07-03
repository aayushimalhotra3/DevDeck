'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  Calendar, 
  Code, 
  Download,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  private: boolean;
}

interface GitHubImportProps {
  onImport: (repos: GitHubRepo[]) => void;
  onClose: () => void;
}

const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#239120',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#1572B6',
  Vue: '#4FC08D',
  React: '#61DAFB',
  Angular: '#DD0031',
};

export function GitHubImport({ onImport, onClose }: GitHubImportProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'updated'>('updated');
  const { toast } = useToast();

  // Automatically fetch repositories when component mounts
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      // Use the backend API endpoint instead of direct GitHub API
      const response = await fetch('/api/github/repos?per_page=100&sort=updated', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch repositories');
      }

      const data = await response.json();
      if (data.success) {
        setRepos(data.repos.filter((repo: GitHubRepo) => !repo.private)); // Only show public repos
        
        toast({
          title: "Success",
          description: `Found ${data.repos.length} repositories`,
        });
      } else {
        throw new Error(data.message || 'Failed to fetch repositories');
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch repositories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRepoToggle = (repoId: number) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRepos.size === filteredRepos.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(filteredRepos.map(repo => repo.id)));
    }
  };

  const handleImport = async () => {
    if (selectedRepos.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one repository",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      const selectedRepoData = repos.filter(repo => selectedRepos.has(repo.id));
      await onImport(selectedRepoData);
      
      toast({
        title: "Success",
        description: `Imported ${selectedRepos.size} repositories`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error importing repositories:', error);
      toast({
        title: "Error",
        description: "Failed to import repositories",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'updated':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6" />
              <CardTitle>Import from GitHub</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Loading State or Refresh Button */}
          {loading && repos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-8"
            >
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              <span className="text-muted-foreground">Loading your repositories...</span>
            </motion.div>
          ) : (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <span className="text-sm text-muted-foreground">
                  Your GitHub repositories ({repos.length} found)
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRepositories} 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Refresh
              </Button>
            </div>
          )}

          {repos.length > 0 && (
            <>
              {/* Controls */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-4"
              >
                <div className="flex items-center space-x-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedRepos.size === filteredRepos.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={selectedRepos.size}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-muted-foreground"
                    >
                      {selectedRepos.size} of {filteredRepos.length} selected
                    </motion.span>
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search repositories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'stars' | 'updated')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="updated">Last Updated</option>
                    <option value="stars">Stars</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </motion.div>

              {/* Repository List */}
              <div className="max-h-96 overflow-y-auto">
                <motion.div className="space-y-3">
                  <AnimatePresence>
                    {filteredRepos.map((repo, index) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                            selectedRepos.has(repo.id) ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'hover:border-blue-200'
                          }`}
                          onClick={() => handleRepoToggle(repo.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Checkbox
                                  checked={selectedRepos.has(repo.id)}
                                  onChange={() => handleRepoToggle(repo.id)}
                                  className="mt-1"
                                />
                              </motion.div>
                        
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                                    {repo.name}
                                    {selectedRepos.has(repo.id) && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </motion.div>
                                    )}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    <motion.div 
                                      className="flex items-center space-x-1 text-sm text-muted-foreground"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Star className="w-3 h-3" />
                                      <span>{repo.stargazers_count}</span>
                                    </motion.div>
                                    <motion.div 
                                      className="flex items-center space-x-1 text-sm text-muted-foreground"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <GitFork className="w-3 h-3" />
                                      <span>{repo.forks_count}</span>
                                    </motion.div>
                                  </div>
                                </div>
                                
                                {repo.description && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {repo.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    {repo.language && (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{ 
                                          backgroundColor: languageColors[repo.language] + '20',
                                          color: languageColors[repo.language] || '#666'
                                        }}
                                      >
                                        <Code className="w-3 h-3 mr-1" />
                                        {repo.language}
                                      </Badge>
                                    )}
                                    {repo.topics.slice(0, 3).map((topic) => (
                                      <Badge key={topic} variant="outline" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                    {repo.topics.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{repo.topics.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(repo.updated_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Import Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-between items-center mt-6 pt-4 border-t"
              >
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={selectedRepos.size}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-muted-foreground"
                  >
                    {selectedRepos.size} repositories selected
                  </motion.p>
                </AnimatePresence>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: selectedRepos.size > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: selectedRepos.size > 0 ? 0.95 : 1 }}
                  >
                    <Button 
                      onClick={handleImport} 
                      disabled={selectedRepos.size === 0 || importing}
                      className="min-w-[200px]"
                      size="lg"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Import {selectedRepos.size} Repositories
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}