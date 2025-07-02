import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Mail, Twitter, Linkedin } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {user.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            @{user.username}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            {user.bio}
          </p>

          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            {user.email && (
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            {user.twitter && (
              <Button variant="outline" size="sm">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            )}
            {user.linkedin && (
              <Button variant="outline" size="sm">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map(block => {
            switch (block.type) {
              case 'projects':
                return (
                  <Card key={block.id} className="col-span-full">
                    <CardHeader>
                      <CardTitle>🚀 Featured Projects</CardTitle>
                      <CardDescription>
                        Some of my recent work and contributions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Project cards will be rendered here */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Sample Project</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            A description of the project goes here.
                          </p>
                          <div className="flex space-x-2 mb-3">
                            <Badge variant="secondary">React</Badge>
                            <Badge variant="secondary">TypeScript</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Project
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );

              case 'skills':
                return (
                  <Card key={block.id}>
                    <CardHeader>
                      <CardTitle>💻 Skills & Technologies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'JavaScript',
                          'TypeScript',
                          'React',
                          'Node.js',
                          'Python',
                          'Docker',
                        ].map(skill => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );

              case 'blog':
                return (
                  <Card key={block.id}>
                    <CardHeader>
                      <CardTitle>📚 Latest Blog Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border-b pb-2">
                          <h4 className="font-medium">
                            Building Modern Web Apps
                          </h4>
                          <p className="text-sm text-gray-600">2 days ago</p>
                        </div>
                        <div className="border-b pb-2">
                          <h4 className="font-medium">
                            Understanding React Hooks
                          </h4>
                          <p className="text-sm text-gray-600">1 week ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );

              default:
                return (
                  <Card key={block.id}>
                    <CardContent className="p-6">
                      <p>Unknown block type: {block.type}</p>
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
