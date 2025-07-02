'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCard } from '@/components/ProjectCard';
import Navigation from '@/components/Navigation';
import { Github, ExternalLink, Calendar } from 'lucide-react';

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    followers: 0,
    following: 0,
    publicRepos: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchGitHubData = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      // Fetch user repositories
      const reposResponse = await fetch(
        'https://api.github.com/user/repos?sort=updated&per_page=12',
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData);
      }

      // Fetch user stats
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserStats({
          followers: userData.followers,
          following: userData.following,
          publicRepos: userData.public_repos,
        });
      }
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchGitHubData();
    }
  }, [session, fetchGitHubData]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white">
              <AvatarImage
                src={session.user?.image || ''}
                alt={session.user?.name || 'User'}
              />
              <AvatarFallback className="text-2xl">
                {session.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{session.user?.name}</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Github className="h-4 w-4" />@{session.user?.username}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>{userStats.followers} followers</span>
                <span>{userStats.following} following</span>
                <span>{userStats.publicRepos} repositories</span>
              </div>
            </div>
            <div className="space-x-4">
              <Link href="/edit">
                <Button variant="secondary">Edit Portfolio</Button>
              </Link>
              <Link href={`/preview/${session.user?.username}`}>
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Views</CardTitle>
              <CardDescription>Total views this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GitHub Repos</CardTitle>
              <CardDescription>Public repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.publicRepos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
              <CardDescription>GitHub followers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.followers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Score</CardTitle>
              <CardDescription>Completeness rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
            </CardContent>
          </Card>
        </div>

        {/* Repositories Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Repositories</h2>
            <Button variant="outline" asChild>
              <a
                href={`https://github.com/${session.user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : repositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.map(repo => (
                <ProjectCard key={repo.id} repository={repo} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No repositories found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first repository on GitHub to get started.
                </p>
                <Button asChild>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Create Repository
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
