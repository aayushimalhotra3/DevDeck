'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('github', {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to DevDeck
          </CardTitle>
          <CardDescription>
            Sign in with your GitHub account to create and manage your developer
            portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800"
            size="lg"
          >
            <Github className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>
              By signing in, you agree to our terms of service and privacy
              policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
