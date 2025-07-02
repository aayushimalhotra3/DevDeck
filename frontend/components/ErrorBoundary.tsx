'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    this.logErrorToService(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you would send this to an error tracking service like Sentry
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Example: Send to error tracking service
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Create GitHub issue or send to support
    const githubUrl = `https://github.com/your-username/devdeck/issues/new?title=Error%20Report&body=${encodeURIComponent(
      `**Error Message:** ${error?.message}\n\n**Stack Trace:**\n\`\`\`\n${error?.stack}\n\`\`\`\n\n**Component Stack:**\n\`\`\`\n${errorInfo?.componentStack}\n\`\`\`\n\n**Additional Info:**\n- Timestamp: ${bugReport.timestamp}\n- URL: ${bugReport.url}\n- User Agent: ${bugReport.userAgent}`
    )}`;

    window.open(githubUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Don't worry, we're on it!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">
                    Error Details (Development Mode)
                  </h4>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                <Button variant="outline" onClick={this.handleReportBug} className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Report Bug
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>If this problem persists, please contact our support team.</p>
                <p className="mt-1">
                  <a 
                    href="mailto:support@devdeck.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    support@devdeck.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = React.useCallback(
    (error: Error, context?: string) => {
      console.error(`Error in ${context || 'component'}:`, error);
      
      toast({
        title: "Something went wrong",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });

      // Log to external service in production
      if (process.env.NODE_ENV === 'production') {
        // logErrorToService(error, context);
      }
    },
    [toast]
  );

  return { handleError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;