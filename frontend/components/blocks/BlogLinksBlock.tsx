'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ExternalLink, Calendar, Eye, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  readTime?: string;
  tags: string[];
  views?: number;
  thumbnail?: string;
}

interface BlogLinksBlockProps {
  blogPosts: BlogPost[];
  isEditing?: boolean;
  onUpdate?: (blogPosts: BlogPost[]) => void;
}

const BlogLinksBlock: React.FC<BlogLinksBlockProps> = ({
  blogPosts = [],
  isEditing = false,
  onUpdate
}) => {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPost = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      publishedDate: new Date().toISOString().split('T')[0],
      tags: []
    };
    setEditingPost(newPost);
    setShowAddForm(true);
  };

  const handleSavePost = (post: BlogPost) => {
    if (!post.title || !post.url) return;

    const updatedPosts = blogPosts.find(p => p.id === post.id)
      ? blogPosts.map(p => p.id === post.id ? post : p)
      : [...blogPosts, post];

    onUpdate?.(updatedPosts);
    setEditingPost(null);
    setShowAddForm(false);
  };

  const handleDeletePost = (id: string) => {
    const updatedPosts = blogPosts.filter(p => p.id !== id);
    onUpdate?.(updatedPosts);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const BlogPostForm = ({ post, onSave, onCancel }: {
    post: BlogPost;
    onSave: (post: BlogPost) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(post);
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
        setTagInput('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      setFormData({
        ...formData,
        tags: formData.tags.filter(tag => tag !== tagToRemove)
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="space-y-4">
          <Input
            placeholder="Blog post title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            placeholder="Blog post URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <Textarea
            placeholder="Brief description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Published Date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            />
            <Input
              placeholder="Read time (e.g., 5 min)"
              value={formData.readTime || ''}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
            />
          </div>
          <Input
            placeholder="Thumbnail URL (optional)"
            value={formData.thumbnail || ''}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          />
          
          {/* Tags */}
          <div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} disabled={!formData.title || !formData.url}>
              Save
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Blog Posts
          </CardTitle>
          {isEditing && (
            <Button onClick={handleAddPost} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Blog Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnimatePresence>
            {showAddForm && editingPost && (
              <BlogPostForm
                post={editingPost}
                onSave={handleSavePost}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingPost(null);
                }}
              />
            )}
          </AnimatePresence>

          {blogPosts.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No blog posts yet.</p>
              {isEditing && (
                <p className="text-sm mt-2">Click "Add Blog Post" to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {blogPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        {isEditing && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPost(post);
                                  setShowAddForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-4">
                          {post.thumbnail && (
                            <div className="flex-shrink-0">
                              <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                                {post.title}
                              </h3>
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            
                            {post.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {post.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.publishedDate)}
                              </div>
                              {post.readTime && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {post.readTime}
                                </div>
                              )}
                              {post.views && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {post.views.toLocaleString()} views
                                </div>
                              )}
                            </div>
                            
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogLinksBlock;