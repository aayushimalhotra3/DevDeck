import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Mail, Twitter, Linkedin, MapPin } from 'lucide-react';

interface PortfolioData {
  user: {
    name: string;
    username: string;
    bio: string;
    avatar_url: string;
    location?: string;
    email?: string;
    twitter?: string;
    linkedin?: string;
  };
  blocks: Array<{
    id: string;
    type: string;
    content: any;
    position: { x: number; y: number };
  }>;
}

async function getPortfolioData(
  username: string
): Promise<PortfolioData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio/${username}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const portfolioData = await getPortfolioData(params.username);

  if (!portfolioData) {
    return {
      title: 'Portfolio Not Found',
      description: 'The requested portfolio could not be found.',
    };
  }

  const { user } = portfolioData;
  const portfolioUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://devdeck.dev'}/preview/${params.username}`;

  return {
    title: `${user.name} - Developer Portfolio`,
    description: user.bio || `Check out ${user.name}'s developer portfolio on DevDeck`,
    keywords: ['developer', 'portfolio', 'github', 'projects', user.name, params.username],
    authors: [{ name: user.name }],
    creator: user.name,
    openGraph: {
      title: `${user.name} - Developer Portfolio`,
      description: user.bio || `Check out ${user.name}'s developer portfolio`,
      url: portfolioUrl,
      siteName: 'DevDeck',
      images: [
        {
          url: user.avatar_url,
          width: 400,
          height: 400,
          alt: `${user.name}'s profile picture`,
        },
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} - Developer Portfolio`,
      description: user.bio || `Check out ${user.name}'s developer portfolio`,
      images: [user.avatar_url],
      creator: user.twitter ? `@${user.twitter}` : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PreviewPortfolio({
  params,
}: {
  params: { username: string };
}) {
  const portfolioData = await getPortfolioData(params.username);

  if (!portfolioData) {
    notFound();
  }

  const { user, blocks } = portfolioData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: user.name,
            alternateName: user.username,
            description: user.bio,
            image: user.avatar_url,
            url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://devdeck.dev'}/preview/${params.username}`,
            sameAs: [
              user.twitter && `https://twitter.com/${user.twitter}`,
              user.linkedin && `https://linkedin.com/in/${user.linkedin}`,
              `https://github.com/${user.username}`,
            ].filter(Boolean),
            jobTitle: 'Developer',
            worksFor: {
              '@type': 'Organization',
              name: 'DevDeck',
            },
          }),
        }}
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="relative inline-block mb-6">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full mx-auto border-4 border-white dark:border-gray-800 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {user.name}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-4">
            @{user.username}
          </p>
          
          {user.bio && (
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Location */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
            {user.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            {user.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
            {user.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://linkedin.com/in/${user.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {blocks.map(block => {
            switch (block.type) {
              case 'projects':
                return (
                  <Card key={block.id} className="col-span-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        🚀 Featured Projects
                      </CardTitle>
                      <CardDescription className="text-base">
                        Some of my recent work and contributions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Project cards will be rendered here */}
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="group p-4 lg:p-6 border rounded-lg hover:border-primary/50 transition-colors duration-200">
                            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-4 flex items-center justify-center">
                              <Github className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                              Sample Project {index + 1}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              A description of the project goes here. This is a sample project description.
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="secondary" className="text-xs">React</Badge>
                              <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                              <Badge variant="secondary" className="text-xs">Next.js</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Live Demo
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Github className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );

              case 'skills':
                return (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">💻 Skills & Technologies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'JavaScript',
                          'TypeScript',
                          'React',
                          'Next.js',
                          'Node.js',
                          'Python',
                          'Docker',
                          'AWS',
                          'MongoDB',
                          'PostgreSQL',
                        ].map(skill => (
                          <Badge key={skill} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );

              case 'blog':
                return (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">📚 Latest Blog Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { title: 'Building Modern Web Apps', date: '2 days ago', readTime: '5 min read' },
                          { title: 'Understanding React Hooks', date: '1 week ago', readTime: '8 min read' },
                          { title: 'TypeScript Best Practices', date: '2 weeks ago', readTime: '6 min read' },
                        ].map((post, index) => (
                          <div key={index} className="group border-b last:border-b-0 pb-3 last:pb-0 hover:bg-accent/50 -mx-2 px-2 py-2 rounded transition-colors cursor-pointer">
                            <h4 className="font-medium group-hover:text-primary transition-colors mb-1">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );

              case 'experience':
                return (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">💼 Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { company: 'Tech Corp', role: 'Senior Developer', period: '2022 - Present' },
                          { company: 'StartupXYZ', role: 'Full Stack Developer', period: '2020 - 2022' },
                        ].map((job, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4">
                            <h4 className="font-medium">{job.role}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{job.period}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );

              default:
                return (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <p className="text-gray-600 dark:text-gray-400">Unknown block type: {block.type}</p>
                    </CardContent>
                  </Card>
                );
            }
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 dark:text-gray-400">
            Built with ❤️ using DevDeck
          </p>
        </div>
      </div>
    </div>
  );
}
