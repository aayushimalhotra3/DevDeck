'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Code, Github, Zap, Eye } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Code className="h-16 w-16 text-blue-600 mr-4" />
              <h1 className="text-4xl sm:text-6xl font-bold">
                Welcome to <span className="text-blue-600">DevDeck</span>
              </h1>
            </div>

            <p className="mt-3 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Build and share your developer portfolio with real-time editing
              and GitHub integration
            </p>

            <div className="flex flex-col sm:flex-row mt-8 space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  <Github className="mr-2 h-5 w-5" />
                  Get Started with GitHub
                </Button>
              </Link>
              <Link href="/preview/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
            <div className="p-6 text-left border rounded-xl hover:shadow-lg transition-shadow duration-300 hover:border-blue-300">
              <div className="flex items-center mb-4">
                <Github className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold">GitHub Integration</h3>
              </div>
              <p className="text-muted-foreground">
                Automatically sync your repositories and showcase your best work
                with real-time data
              </p>
            </div>

            <div className="p-6 text-left border rounded-xl hover:shadow-lg transition-shadow duration-300 hover:border-blue-300">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold">Drag & Drop Editor</h3>
              </div>
              <p className="text-muted-foreground">
                Build your portfolio with an intuitive block-based editor
                that&apos;s easy to use
              </p>
            </div>

            <div className="p-6 text-left border rounded-xl hover:shadow-lg transition-shadow duration-300 hover:border-blue-300">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold">Real-time Preview</h3>
              </div>
              <p className="text-muted-foreground">
                See changes instantly with live WebSocket updates and responsive
                design
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
