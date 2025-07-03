'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import {
  Code,
  Github,
  Zap,
  Eye,
  Star,
  Users,
  Rocket,
  Shield,
  Palette,
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Developer Portfolios
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Build Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                Dream Portfolio
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
              Create stunning developer portfolios with real-time editing,
              seamless GitHub integration, and professional templates that
              showcase your best work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Browse Portfolios
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Portfolios Created
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">50K+</div>
                <div className="text-sm text-muted-foreground">
                  GitHub Repos Synced
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-blue-600">Stand Out</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to help developers create professional
              portfolios that impress recruiters and clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Github className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  GitHub Integration
                </h3>
                <p className="text-muted-foreground mb-4">
                  Automatically sync repositories, display contribution graphs,
                  and showcase your coding activity in real-time.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Auto-sync enabled
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Drag & Drop Editor
                </h3>
                <p className="text-muted-foreground mb-4">
                  Build beautiful portfolios with our intuitive block-based
                  editor. No coding required, just drag and drop.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Visual editor
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Real-time Preview
                </h3>
                <p className="text-muted-foreground mb-4">
                  See changes instantly with live WebSocket updates. What you
                  see is exactly what your visitors get.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Live updates
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Custom Domains</h3>
                <p className="text-muted-foreground mb-4">
                  Use your own domain name to create a professional web presence
                  that reflects your personal brand.
                </p>
                <div className="flex items-center text-orange-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Professional URLs
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Fast</h3>
                <p className="text-muted-foreground mb-4">
                  Built with security in mind. Fast loading times and reliable
                  hosting ensure your portfolio is always accessible.
                </p>
                <div className="flex items-center text-red-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enterprise security
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">SEO Optimized</h3>
                <p className="text-muted-foreground mb-4">
                  Get discovered by recruiters and clients with built-in SEO
                  optimization and social media integration.
                </p>
                <div className="flex items-center text-indigo-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Search optimized
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="text-blue-600">Developers</span>{' '}
              Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of developers who have built amazing portfolios
              with DevDeck.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "DevDeck made it incredibly easy to showcase my projects. The
                  GitHub integration is seamless and the templates are
                  beautiful."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    A
                  </div>
                  <div>
                    <div className="font-semibold">Alex Chen</div>
                    <div className="text-sm text-muted-foreground">
                      Full Stack Developer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "I landed my dream job thanks to my DevDeck portfolio. The
                  real-time editing feature saved me hours of work."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    S
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">
                      Frontend Developer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "The drag-and-drop editor is intuitive and powerful. I created
                  a professional portfolio in minutes, not hours."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Mike Rodriguez</div>
                    <div className="text-sm text-muted-foreground">
                      Backend Developer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of developers who have already created stunning
            portfolios with DevDeck.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
              >
                <Github className="mr-2 h-5 w-5" />
                Start Building Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
