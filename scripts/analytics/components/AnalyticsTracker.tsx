import React, { useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  apiEndpoint: string;
  debug?: boolean;
}

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name?: string, properties?: Record<string, any>) => void;
  setUserProperties: (properties: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  config: AnalyticsConfig;
}

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private userProperties: Record<string, any> = {};
  private queue: any[] = [];
  private isOnline: boolean = true;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
      }
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    // Track performance metrics
    if ('PerformanceObserver' in window) {
      this.setupPerformanceTracking();
    }
  }

  private setupPerformanceTracking(): void {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.track('core_web_vital', {
            metric: 'LCP',
            value: entry.startTime,
            rating: entry.startTime > 2500 ? 'poor' : entry.startTime > 1200 ? 'needs-improvement' : 'good'
          });
        }
        
        if (entry.entryType === 'first-input') {
          this.track('core_web_vital', {
            metric: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            rating: (entry as any).processingStart - entry.startTime > 100 ? 'poor' : 
                   (entry as any).processingStart - entry.startTime > 25 ? 'needs-improvement' : 'good'
          });
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.track('core_web_vital', {
            metric: 'CLS',
            value: (entry as any).value,
            rating: (entry as any).value > 0.25 ? 'poor' : (entry as any).value > 0.1 ? 'needs-improvement' : 'good'
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }

  private startSession(): void {
    this.track('session_start', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  public track(event: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled) return;
    if (Math.random() > this.config.sampleRate) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        ...this.userProperties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
    };

    if (this.config.debug) {
      console.log('Analytics Event:', eventData);
    }

    if (this.isOnline) {
      this.sendEvent(eventData);
    } else {
      this.queue.push(eventData);
    }
  }

  public identify(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...traits };
    
    this.track('user_identified', {
      userId,
      traits
    });
  }

  public page(name?: string, properties: Record<string, any> = {}): void {
    this.track('page_view', {
      pageName: name || document.title,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      ...properties
    });
  }

  public setUserProperties(properties: Record<string, any>): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  private async sendEvent(eventData: any): Promise<void> {
    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      this.queue.push(eventData);
    }
  }

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this.sendEvent(event);
    }
  }
}

let trackerInstance: AnalyticsTracker | null = null;

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children, config }) => {
  const router = useRouter();

  useEffect(() => {
    if (!trackerInstance) {
      trackerInstance = new AnalyticsTracker(config);
    }
  }, [config]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackerInstance?.page(undefined, { route: url });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const contextValue: AnalyticsContextType = {
    track: (event, properties) => trackerInstance?.track(event, properties),
    identify: (userId, traits) => trackerInstance?.identify(userId, traits),
    page: (name, properties) => trackerInstance?.page(name, properties),
    setUserProperties: (properties) => trackerInstance?.setUserProperties(properties)
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsTracker;
