'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import {
  Search,
  Book,
  Video,
  Code,
  Github,
  Palette,
  Settings,
  Share2,
  Zap,
  Users,
  ArrowRight,
  ExternalLink,
  Clock,
  Star,
  PlayCircle,
  FileText,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const DocsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of DevDeck',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-500',
      articles: [
        {
          title: 'Quick Start Guide',
          description: 'Get up and running with DevDeck in 5 minutes',
          type: 'guide',
          readTime: '5 min',
          difficulty: 'Beginner',
          link: '/docs/quick-start'
        },
        {
          title: 'Creating Your First Portfolio',
          description: 'Step-by-step tutorial for building your portfolio',
          type: 'tutorial',
          readTime: '10 min',
          difficulty: 'Beginner',
          link: '/docs/first-portfolio'
        },
        {
          title: 'Understanding the Editor',
          description: 'Learn how to use the drag-and-drop editor',
          type: 'guide',
          readTime: '8 min',
          difficulty: 'Beginner',
          link: '/docs/editor-basics'
        }
      ]
    },
    {
      title: 'GitHub Integration',
      description: 'Connect and sync your repositories',
      icon: <Github className="w-6 h-6" />,
      color: 'bg-gray-800',
      articles: [
        {
          title: 'Connecting Your GitHub Account',
          description: 'How to link your GitHub profile to DevDeck',
          type: 'guide',
          readTime: '3 min',
          difficulty: 'Beginner',
          link: '/docs/github-connect'
        },
        {
          title: 'Importing Projects',
          description: 'Automatically import and showcase your repositories',
          type: 'tutorial',
          readTime: '7 min',
          difficulty: 'Intermediate',
          link: '/docs/import-projects'
        },
        {
          title: 'Managing Repository Visibility',
          description: 'Control which repos appear on your portfolio',
          type: 'guide',
          readTime: '5 min',
          difficulty: 'Intermediate',
          link: '/docs/repo-visibility'
        }
      ]
    },
    {
      title: 'Customization',
      description: 'Make your portfolio unique',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-purple-500',
      articles: [
        {
          title: 'Choosing and Customizing Themes',
          description: 'Select and personalize your portfolio theme',
          type: 'guide',
          readTime: '6 min',
          difficulty: 'Beginner',
          link: '/docs/themes'
        },
        {
          title: 'Adding Custom Blocks',
          description: 'Use testimonials, contact forms, and more',
          type: 'tutorial',
          readTime: '12 min',
          difficulty: 'Intermediate',
          link: '/docs/custom-blocks'
        },
        {
          title: 'Advanced Styling Options',
          description: 'CSS customization and advanced theming',
          type: 'guide',
          readTime: '15 min',
          difficulty: 'Advanced',
          link: '/docs/advanced-styling'
        }
      ]
    },
    {
      title: 'Publishing & Sharing',
      description: 'Make your portfolio live',
      icon: <Share2 className="w-6 h-6" />,
      color: 'bg-green-500',
      articles: [
        {
          title: 'Publishing Your Portfolio',
          description: 'Make your portfolio live and accessible',
          type: 'guide',
          readTime: '4 min',
          difficulty: 'Beginner',
          link: '/docs/publishing'
        },
        {
          title: 'Custom Domain Setup',
          description: 'Use your own domain for your portfolio',
          type: 'tutorial',
          readTime: '10 min',
          difficulty: 'Intermediate',
          link: '/docs/custom-domain'
        },
        {
          title: 'SEO Optimization',
          description: 'Optimize your portfolio for search engines',
          type: 'guide',
          readTime: '8 min',
          difficulty: 'Intermediate',
          link: '/docs/seo'
        }
      ]
    },
    {
      title: 'Analytics & Settings',
      description: 'Track performance and manage settings',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-orange-500',
      articles: [
        {
          title: 'Understanding Analytics',
          description: 'Track visitors and portfolio performance',
          type: 'guide',
          readTime: '6 min',
          difficulty: 'Beginner',
          link: '/docs/analytics'
        },
        {
          title: 'Account Settings',
          description: 'Manage your DevDeck account preferences',
          type: 'guide',
          readTime: '4 min',
          difficulty: 'Beginner',
          link: '/docs/account-settings'
        },
        {
          title: 'Privacy and Security',
          description: 'Control who can see your portfolio',
          type: 'guide',
          readTime: '5 min',
          difficulty: 'Beginner',
          link: '/docs/privacy'
        }
      ]
    },
    {
      title: 'Team Features',
      description: 'Collaborate with your team',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-red-500',
      articles: [
        {
          title: 'Team Collaboration',
          description: 'Work together on portfolio projects',
          type: 'guide',
          readTime: '8 min',
          difficulty: 'Intermediate',
          link: '/docs/team-collaboration'
        },
        {
          title: 'Managing Team Members',
          description: 'Add and manage team member permissions',
          type: 'tutorial',
          readTime: '6 min',
          difficulty: 'Intermediate',
          link: '/docs/team-management'
        },
        {
          title: 'White-label Solutions',
          description: 'Brand DevDeck with your company identity',
          type: 'guide',
          readTime: '10 min',
          difficulty: 'Advanced',
          link: '/docs/white-label'
        }
      ]
    }
  ];

  const quickLinks = [
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: <PlayCircle className="w-8 h-8" />,
      link: '/docs/videos',
      color: 'bg-red-500'
    },
    {
      title: 'API Documentation',
      description: 'Integrate with DevDeck programmatically',
      icon: <Code className="w-8 h-8" />,
      link: '/docs/api',
      color: 'bg-blue-500'
    },
    {
      title: 'Community Forum',
      description: 'Get help from the community',
      icon: <Users className="w-8 h-8" />,
      link: '/community',
      color: 'bg-green-500'
    },
    {
      title: 'Contact Support',
      description: 'Get direct help from our team',
      icon: <HelpCircle className="w-8 h-8" />,
      link: '/support',
      color: 'bg-purple-500'
    }
  ];

  const popularArticles = [
    {
      title: 'How to Create a Stunning Developer Portfolio',
      readTime: '12 min',
      views: '15.2k',
      rating: 4.9,
      link: '/docs/stunning-portfolio'
    },
    {
      title: 'Best Practices for Showcasing Projects',
      readTime: '8 min',
      views: '12.8k',
      rating: 4.8,
      link: '/docs/project-showcase'
    },
    {
      title: 'GitHub Integration Complete Guide',
      readTime: '15 min',
      views: '11.5k',
      rating: 4.9,
      link: '/docs/github-complete'
    },
    {
      title: 'SEO Tips for Developer Portfolios',
      readTime: '10 min',
      views: '9.3k',
      rating: 4.7,
      link: '/docs/seo-tips'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return <PlayCircle className="w-4 h-4" />;
      case 'guide':
        return <FileText className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          className="container mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Book className="w-3 h-3 mr-1" />
              Documentation & Tutorials
            </Badge>
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            DevDeck Documentation
          </motion.h1>
          
          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Everything you need to know about creating amazing developer portfolios.
            From getting started to advanced customization.
          </motion.p>
          
          <motion.div
            className="max-w-md mx-auto relative"
            variants={itemVariants}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {quickLinks.map((link, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link href={link.link}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${link.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        {link.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{link.title}</h3>
                      <p className="text-muted-foreground text-sm">{link.description}</p>
                      <ArrowRight className="w-4 h-4 mx-auto mt-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
              variants={itemVariants}
            >
              Popular Articles
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Most read guides and tutorials from our community.
            </motion.p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {popularArticles.map((article, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link href={article.link}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-foreground flex-1">{article.title}</h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {article.rating}
                        </div>
                        <div>{article.views} views</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
              variants={itemVariants}
            >
              Browse by Category
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Find exactly what you're looking for with our organized documentation.
            </motion.p>
          </motion.div>
          
          <motion.div
            className="space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {categories.map((category, categoryIndex) => (
              <motion.div key={categoryIndex} variants={itemVariants}>
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.articles.map((article, articleIndex) => (
                    <Link key={articleIndex} href={article.link}>
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(article.type)}
                              <span className="text-sm text-muted-foreground capitalize">{article.type}</span>
                            </div>
                            <Badge className={getDifficultyColor(article.difficulty)}>
                              {article.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="mb-4">
                            {article.description}
                          </CardDescription>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime}
                            </div>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div
          className="container mx-auto text-center text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={itemVariants}
          >
            Still Need Help?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Can't find what you're looking for? Our support team is here to help you succeed.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <Link href="/support">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default DocsPage;