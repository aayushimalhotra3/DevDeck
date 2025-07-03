#!/bin/bash

# DevDeck Analytics Dashboard Setup
# Creates comprehensive analytics and reporting system

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> setup.log
}

echo "🚀 Setting up DevDeck Analytics Dashboard System"
echo "================================================"
echo

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANALYTICS_DIR="$BASE_DIR/analytics"
COMPONENTS_DIR="$ANALYTICS_DIR/components"
DASHBOARDS_DIR="$ANALYTICS_DIR/dashboards"
REPORTS_DIR="$ANALYTICS_DIR/reports"
CONFIG_DIR="$ANALYTICS_DIR/config"
SCRIPTS_DIR="$ANALYTICS_DIR/scripts"
BACKEND_DIR="$ANALYTICS_DIR/backend"

print_status "Creating analytics directory structure..."

# Create directory structure
mkdir -p "$ANALYTICS_DIR"
mkdir -p "$COMPONENTS_DIR"
mkdir -p "$DASHBOARDS_DIR"
mkdir -p "$REPORTS_DIR"
mkdir -p "$CONFIG_DIR"
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$BACKEND_DIR"

print_success "Directory structure created"

print_status "Creating analytics configuration..."

# Create analytics configuration
cat > "$CONFIG_DIR/analytics.json" << 'EOF'
{
  "tracking": {
    "enabled": true,
    "sampleRate": 1.0,
    "sessionTimeout": 1800000,
    "trackPageViews": true,
    "trackUserInteractions": true,
    "trackPerformance": true,
    "trackErrors": true
  },
  "privacy": {
    "anonymizeIPs": true,
    "respectDNT": true,
    "cookieConsent": true,
    "dataRetention": 365
  },
  "metrics": {
    "pageViews": {
      "enabled": true,
      "trackReferrer": true,
      "trackUserAgent": true
    },
    "userEngagement": {
      "enabled": true,
      "trackScrollDepth": true,
      "trackTimeOnPage": true,
      "trackClicks": true
    },
    "performance": {
      "enabled": true,
      "trackLoadTimes": true,
      "trackCoreWebVitals": true,
      "trackResourceTiming": true
    },
    "conversion": {
      "enabled": true,
      "trackGoals": true,
      "trackFunnels": true,
      "trackEvents": true
    }
  },
  "reporting": {
    "realTime": {
      "enabled": true,
      "updateInterval": 30000
    },
    "scheduled": {
      "enabled": true,
      "dailyReport": "09:00",
      "weeklyReport": "MON 10:00",
      "monthlyReport": "1 11:00"
    },
    "alerts": {
      "enabled": true,
      "thresholds": {
        "errorRate": 0.05,
        "responseTime": 2000,
        "bounceRate": 0.7,
        "conversionDrop": 0.2
      }
    }
  },
  "integrations": {
    "googleAnalytics": {
      "enabled": false,
      "trackingId": ""
    },
    "mixpanel": {
      "enabled": false,
      "projectToken": ""
    },
    "amplitude": {
      "enabled": false,
      "apiKey": ""
    },
    "hotjar": {
      "enabled": false,
      "siteId": ""
    }
  }
}
EOF

print_success "Analytics configuration created"

print_status "Creating analytics tracking components..."

# Create analytics tracker component
cat > "$COMPONENTS_DIR/AnalyticsTracker.tsx" << 'EOF'
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
EOF

print_success "Analytics tracker component created"

# Create analytics dashboard component
cat > "$COMPONENTS_DIR/AnalyticsDashboard.tsx" << 'EOF'
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  traffic: {
    daily: Array<{ date: string; users: number; sessions: number; pageViews: number }>;
    sources: Array<{ source: string; users: number; percentage: number }>;
    devices: Array<{ device: string; users: number; percentage: number }>;
  };
  performance: {
    coreWebVitals: {
      lcp: { value: number; rating: string };
      fid: { value: number; rating: string };
      cls: { value: number; rating: string };
    };
    pageLoadTimes: Array<{ page: string; averageTime: number; p95Time: number }>;
  };
  userBehavior: {
    topPages: Array<{ page: string; views: number; avgTime: number }>;
    userFlow: Array<{ from: string; to: string; users: number }>;
    events: Array<{ event: string; count: number; uniqueUsers: number }>;
  };
  conversion: {
    funnels: Array<{ step: string; users: number; conversionRate: number }>;
    goals: Array<{ goal: string; completions: number; value: number }>;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const changeIcon = change && change > 0 ? '↗' : change && change < 0 ? '↘' : '→';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center mt-1`}>
              <span className="mr-1">{changeIcon}</span>
              {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">DevDeck performance and user insights</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={formatNumber(data.overview.totalUsers)}
          icon="👥"
          color="#667eea"
        />
        <MetricCard
          title="Sessions"
          value={formatNumber(data.overview.totalSessions)}
          icon="📱"
          color="#764ba2"
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(data.overview.totalPageViews)}
          icon="👁️"
          color="#f093fb"
        />
        <MetricCard
          title="Avg Session"
          value={formatDuration(data.overview.averageSessionDuration)}
          icon="⏱️"
          color="#f5576c"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${(data.overview.bounceRate * 100).toFixed(1)}%`}
          icon="🚪"
          color="#4facfe"
        />
        <MetricCard
          title="Conversion"
          value={`${(data.overview.conversionRate * 100).toFixed(1)}%`}
          icon="🎯"
          color="#00f2fe"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Traffic Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.traffic.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
              <Area type="monotone" dataKey="sessions" stackId="1" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🌐 Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.traffic.sources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {data.traffic.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">⚡ Core Web Vitals</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Largest Contentful Paint</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.lcp.value}ms</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.lcp.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.lcp.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.lcp.rating}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">First Input Delay</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.fid.value}ms</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.fid.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.fid.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.fid.rating}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Cumulative Layout Shift</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.cls.value.toFixed(3)}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.cls.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.cls.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.cls.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📄 Top Pages</h3>
          <div className="space-y-3">
            {data.userBehavior.topPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{page.page}</p>
                  <p className="text-xs text-gray-500">Avg time: {formatDuration(page.avgTime)}</p>
                </div>
                <span className="font-bold text-blue-600">{formatNumber(page.views)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device and Conversion Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📱 Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.traffic.devices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Conversion Funnel</h3>
          <div className="space-y-3">
            {data.conversion.funnels.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{step.step}</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(step.users)} users ({(step.conversionRate * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.conversionRate * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
EOF

print_success "Analytics dashboard component created"

print_status "Creating analytics backend components..."

# Create analytics API routes
cat > "$BACKEND_DIR/analytics-api.js" << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Analytics Models
const AnalyticsEvent = require('./analytics-models').AnalyticsEvent;
const UserSession = require('./analytics-models').UserSession;
const PageView = require('./analytics-models').PageView;

// Middleware for analytics data validation
const validateAnalyticsData = (req, res, next) => {
  const { event, properties } = req.body;
  
  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'Event name is required and must be a string' });
  }
  
  if (properties && typeof properties !== 'object') {
    return res.status(400).json({ error: 'Properties must be an object' });
  }
  
  next();
};

// Track analytics event
router.post('/track', validateAnalyticsData, async (req, res) => {
  try {
    const { event, properties } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Create analytics event
    const analyticsEvent = new AnalyticsEvent({
      event,
      properties: {
        ...properties,
        clientIP: req.headers['x-anonymize-ip'] ? 'anonymized' : clientIP,
        userAgent,
        timestamp: new Date()
      },
      sessionId: properties.sessionId,
      userId: properties.userId,
      createdAt: new Date()
    });
    
    await analyticsEvent.save();
    
    // Handle specific event types
    if (event === 'page_view') {
      await handlePageView(properties);
    } else if (event === 'session_start') {
      await handleSessionStart(properties);
    }
    
    res.status(200).json({ success: true, eventId: analyticsEvent._id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeRangeMs = parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - timeRangeMs);
    
    // Parallel data fetching for better performance
    const [overview, traffic, performance, userBehavior, conversion] = await Promise.all([
      getOverviewData(startDate),
      getTrafficData(startDate),
      getPerformanceData(startDate),
      getUserBehaviorData(startDate),
      getConversionData(startDate)
    ]);
    
    res.json({
      overview,
      traffic,
      performance,
      userBehavior,
      conversion,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    
    const [activeUsers, recentEvents, currentPageViews] = await Promise.all([
      UserSession.countDocuments({
        lastActivity: { $gte: last5Minutes },
        isActive: true
      }),
      AnalyticsEvent.find({
        createdAt: { $gte: last5Minutes }
      }).sort({ createdAt: -1 }).limit(50),
      PageView.aggregate([
        { $match: { createdAt: { $gte: last5Minutes } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      activeUsers,
      recentEvents,
      currentPageViews,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time data error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time data' });
  }
});

// Get custom report
router.post('/report', async (req, res) => {
  try {
    const { metrics, filters, groupBy, timeRange } = req.body;
    
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Metrics array is required' });
    }
    
    const report = await generateCustomReport({
      metrics,
      filters: filters || {},
      groupBy: groupBy || 'day',
      timeRange: timeRange || '30d'
    });
    
    res.json(report);
  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    const timeRangeMs = parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - timeRangeMs);
    
    const events = await AnalyticsEvent.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    if (format === 'csv') {
      const csv = convertToCSV(events);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.json`);
      res.json(events);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Helper functions
async function handlePageView(properties) {
  const pageView = new PageView({
    page: properties.pageName || properties.path,
    path: properties.path,
    referrer: properties.referrer,
    sessionId: properties.sessionId,
    userId: properties.userId,
    loadTime: properties.loadTime,
    createdAt: new Date()
  });
  
  await pageView.save();
}

async function handleSessionStart(properties) {
  const session = new UserSession({
    sessionId: properties.sessionId,
    userId: properties.userId,
    userAgent: properties.userAgent,
    language: properties.language,
    timezone: properties.timezone,
    screen: properties.screen,
    viewport: properties.viewport,
    startTime: new Date(),
    lastActivity: new Date(),
    isActive: true
  });
  
  await session.save();
}

async function getOverviewData(startDate) {
  const [totalUsers, totalSessions, totalPageViews, sessionStats] = await Promise.all([
    AnalyticsEvent.distinct('properties.userId', {
      createdAt: { $gte: startDate },
      'properties.userId': { $exists: true, $ne: null }
    }),
    UserSession.countDocuments({ startTime: { $gte: startDate } }),
    PageView.countDocuments({ createdAt: { $gte: startDate } }),
    UserSession.aggregate([
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          totalBounces: {
            $sum: {
              $cond: [{ $lte: ['$pageViews', 1] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);
  
  const sessionStatsData = sessionStats[0] || { avgDuration: 0, totalBounces: 0 };
  const bounceRate = totalSessions > 0 ? sessionStatsData.totalBounces / totalSessions : 0;
  
  // Calculate conversion rate (example: users who completed a goal)
  const conversions = await AnalyticsEvent.countDocuments({
    event: 'goal_completed',
    createdAt: { $gte: startDate }
  });
  const conversionRate = totalUsers.length > 0 ? conversions / totalUsers.length : 0;
  
  return {
    totalUsers: totalUsers.length,
    totalSessions,
    totalPageViews,
    averageSessionDuration: Math.round(sessionStatsData.avgDuration || 0),
    bounceRate,
    conversionRate
  };
}

async function getTrafficData(startDate) {
  // Daily traffic data
  const daily = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        pageViews: { $sum: 1 },
        users: { $addToSet: '$userId' },
        sessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        date: '$_id',
        pageViews: 1,
        users: { $size: '$users' },
        sessions: { $size: '$sessions' }
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  // Traffic sources
  const sources = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate }, referrer: { $exists: true, $ne: '' } } },
    {
      $group: {
        _id: {
          $cond: [
            { $regexMatch: { input: '$referrer', regex: /google/i } },
            'Google',
            {
              $cond: [
                { $regexMatch: { input: '$referrer', regex: /facebook/i } },
                'Facebook',
                {
                  $cond: [
                    { $regexMatch: { input: '$referrer', regex: /twitter/i } },
                    'Twitter',
                    'Other'
                  ]
                }
              ]
            }
          ]
        },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        source: '$_id',
        users: { $size: '$users' }
      }
    }
  ]);
  
  const totalSourceUsers = sources.reduce((sum, source) => sum + source.users, 0);
  const sourcesWithPercentage = sources.map(source => ({
    source: source.source,
    users: source.users,
    percentage: totalSourceUsers > 0 ? (source.users / totalSourceUsers) * 100 : 0
  }));
  
  // Device breakdown
  const devices = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'session_start',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $regexMatch: { input: '$properties.userAgent', regex: /Mobile/i } },
            'Mobile',
            {
              $cond: [
                { $regexMatch: { input: '$properties.userAgent', regex: /Tablet/i } },
                'Tablet',
                'Desktop'
              ]
            }
          ]
        },
        users: { $addToSet: '$properties.userId' }
      }
    },
    {
      $project: {
        device: '$_id',
        users: { $size: '$users' }
      }
    }
  ]);
  
  const totalDeviceUsers = devices.reduce((sum, device) => sum + device.users, 0);
  const devicesWithPercentage = devices.map(device => ({
    device: device.device,
    users: device.users,
    percentage: totalDeviceUsers > 0 ? (device.users / totalDeviceUsers) * 100 : 0
  }));
  
  return {
    daily,
    sources: sourcesWithPercentage,
    devices: devicesWithPercentage
  };
}

async function getPerformanceData(startDate) {
  // Core Web Vitals
  const coreWebVitals = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'core_web_vital',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$properties.metric',
        avgValue: { $avg: '$properties.value' },
        ratings: { $push: '$properties.rating' }
      }
    }
  ]);
  
  const webVitalsData = {
    lcp: { value: 0, rating: 'good' },
    fid: { value: 0, rating: 'good' },
    cls: { value: 0, rating: 'good' }
  };
  
  coreWebVitals.forEach(vital => {
    if (vital._id && webVitalsData[vital._id.toLowerCase()]) {
      webVitalsData[vital._id.toLowerCase()] = {
        value: Math.round(vital.avgValue),
        rating: getMostCommonRating(vital.ratings)
      };
    }
  });
  
  // Page load times
  const pageLoadTimes = await PageView.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        loadTime: { $exists: true, $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$page',
        averageTime: { $avg: '$loadTime' },
        loadTimes: { $push: '$loadTime' }
      }
    },
    {
      $project: {
        page: '$_id',
        averageTime: { $round: ['$averageTime', 0] },
        p95Time: {
          $arrayElemAt: [
            {
              $slice: [
                { $sortArray: { input: '$loadTimes', sortBy: 1 } },
                { $round: [{ $multiply: [{ $size: '$loadTimes' }, 0.95] }, 0] },
                1
              ]
            },
            0
          ]
        }
      }
    },
    { $sort: { averageTime: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    coreWebVitals: webVitalsData,
    pageLoadTimes
  };
}

async function getUserBehaviorData(startDate) {
  // Top pages
  const topPages = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        avgTime: { $avg: '$timeOnPage' }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        avgTime: { $round: ['$avgTime', 0] }
      }
    },
    { $sort: { views: -1 } },
    { $limit: 10 }
  ]);
  
  // User flow (simplified)
  const userFlow = await PageView.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $sort: { sessionId: 1, createdAt: 1 } },
    {
      $group: {
        _id: '$sessionId',
        pages: { $push: '$page' }
      }
    },
    {
      $project: {
        transitions: {
          $map: {
            input: { $range: [0, { $subtract: [{ $size: '$pages' }, 1] }] },
            as: 'index',
            in: {
              from: { $arrayElemAt: ['$pages', '$$index'] },
              to: { $arrayElemAt: ['$pages', { $add: ['$$index', 1] }] }
            }
          }
        }
      }
    },
    { $unwind: '$transitions' },
    {
      $group: {
        _id: {
          from: '$transitions.from',
          to: '$transitions.to'
        },
        users: { $sum: 1 }
      }
    },
    {
      $project: {
        from: '$_id.from',
        to: '$_id.to',
        users: 1
      }
    },
    { $sort: { users: -1 } },
    { $limit: 10 }
  ]);
  
  // Top events
  const events = await AnalyticsEvent.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        event: { $nin: ['page_view', 'session_start', 'core_web_vital'] }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$properties.userId' }
      }
    },
    {
      $project: {
        event: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    topPages,
    userFlow,
    events
  };
}

async function getConversionData(startDate) {
  // Conversion funnel (example)
  const funnelSteps = [
    { step: 'Landing', event: 'page_view' },
    { step: 'Sign Up', event: 'signup_started' },
    { step: 'Profile Created', event: 'profile_created' },
    { step: 'First Project', event: 'project_created' },
    { step: 'Deployed', event: 'project_deployed' }
  ];
  
  const funnels = [];
  let previousUsers = null;
  
  for (const step of funnelSteps) {
    const users = await AnalyticsEvent.distinct('properties.userId', {
      event: step.event,
      createdAt: { $gte: startDate },
      'properties.userId': { $exists: true, $ne: null }
    });
    
    const conversionRate = previousUsers ? users.length / previousUsers : 1;
    
    funnels.push({
      step: step.step,
      users: users.length,
      conversionRate
    });
    
    previousUsers = users.length;
  }
  
  // Goals
  const goals = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: 'goal_completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$properties.goalName',
        completions: { $sum: 1 },
        value: { $sum: { $ifNull: ['$properties.value', 0] } }
      }
    },
    {
      $project: {
        goal: '$_id',
        completions: 1,
        value: { $round: ['$value', 2] }
      }
    },
    { $sort: { completions: -1 } }
  ]);
  
  return {
    funnels,
    goals
  };
}

function parseTimeRange(timeRange) {
  const ranges = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };
  
  return ranges[timeRange] || ranges['7d'];
}

function getMostCommonRating(ratings) {
  const counts = ratings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'good');
}

function convertToCSV(events) {
  if (events.length === 0) return '';
  
  const headers = ['timestamp', 'event', 'userId', 'sessionId', 'properties'];
  const csvRows = [headers.join(',')];
  
  events.forEach(event => {
    const row = [
      event.createdAt.toISOString(),
      event.event,
      event.userId || '',
      event.sessionId || '',
      JSON.stringify(event.properties).replace(/"/g, '""')
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

async function generateCustomReport(options) {
  // Implementation for custom reports
  // This would be expanded based on specific requirements
  return {
    message: 'Custom report generation not yet implemented',
    options
  };
}

module.exports = router;
EOF

print_success "Analytics API routes created"

# Create analytics database models
cat > "$BACKEND_DIR/analytics-models.js" << 'EOF'
const mongoose = require('mongoose');

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'analytics_events'
});

// Compound indexes for better query performance
analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });
analyticsEventSchema.index({ 'properties.userId': 1, createdAt: -1 });

// Static methods for analytics
analyticsEventSchema.statics.getEventCounts = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        event: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsEventSchema.statics.getUserActivity = function(userId, startDate, endDate) {
  return this.find({
    userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate || new Date()
    }
  }).sort({ createdAt: -1 });
};

// User Session Schema
const userSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  userAgent: String,
  language: String,
  timezone: String,
  screen: {
    width: Number,
    height: Number
  },
  viewport: {
    width: Number,
    height: Number
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: Date,
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  events: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  referrer: String,
  landingPage: String,
  exitPage: String,
  country: String,
  city: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    index: true
  },
  browser: String,
  os: String
}, {
  timestamps: true,
  collection: 'user_sessions'
});

// Compound indexes
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ isActive: 1, lastActivity: -1 });
userSessionSchema.index({ startTime: -1, endTime: -1 });

// Pre-save middleware to calculate duration
userSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  } else if (this.lastActivity && this.startTime) {
    this.duration = Math.round((this.lastActivity - this.startTime) / 1000);
  }
  next();
});

// Static methods
userSessionSchema.statics.getActiveUsers = function(timeWindow = 5) {
  const cutoff = new Date(Date.now() - timeWindow * 60 * 1000);
  return this.countDocuments({
    lastActivity: { $gte: cutoff },
    isActive: true
  });
};

userSessionSchema.statics.getSessionStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        startTime: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgPageViews: { $avg: '$pageViews' },
        totalBounces: {
          $sum: {
            $cond: [{ $lte: ['$pageViews', 1] }, 1, 0]
          }
        },
        deviceBreakdown: {
          $push: '$device'
        }
      }
    },
    {
      $project: {
        totalSessions: 1,
        avgDuration: { $round: ['$avgDuration', 0] },
        avgPageViews: { $round: ['$avgPageViews', 2] },
        bounceRate: {
          $cond: [
            { $gt: ['$totalSessions', 0] },
            { $divide: ['$totalBounces', '$totalSessions'] },
            0
          ]
        },
        deviceBreakdown: 1
      }
    }
  ]);
};

// Page View Schema
const pageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  title: String,
  referrer: String,
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  loadTime: Number, // in milliseconds
  timeOnPage: Number, // in seconds
  scrollDepth: {
    type: Number,
    min: 0,
    max: 100
  },
  exitPage: {
    type: Boolean,
    default: false
  },
  bounced: {
    type: Boolean,
    default: false
  },
  converted: {
    type: Boolean,
    default: false
  },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String
}, {
  timestamps: true,
  collection: 'page_views'
});

// Compound indexes
pageViewSchema.index({ page: 1, createdAt: -1 });
pageViewSchema.index({ sessionId: 1, createdAt: 1 });
pageViewSchema.index({ userId: 1, createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });

// Static methods
pageViewSchema.statics.getTopPages = function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgTimeOnPage: { $avg: '$timeOnPage' },
        avgLoadTime: { $avg: '$loadTime' },
        bounces: {
          $sum: {
            $cond: ['$bounced', 1, 0]
          }
        }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgTimeOnPage: { $round: ['$avgTimeOnPage', 0] },
        avgLoadTime: { $round: ['$avgLoadTime', 0] },
        bounceRate: {
          $cond: [
            { $gt: ['$views', 0] },
            { $divide: ['$bounces', '$views'] },
            0
          ]
        }
      }
    },
    { $sort: { views: -1 } },
    { $limit: limit }
  ]);
};

pageViewSchema.statics.getTrafficSources = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        },
        referrer: { $exists: true, $ne: '' }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $regexMatch: { input: '$referrer', regex: /google/i } },
            'Google',
            {
              $cond: [
                { $regexMatch: { input: '$referrer', regex: /facebook/i } },
                'Facebook',
                {
                  $cond: [
                    { $regexMatch: { input: '$referrer', regex: /twitter/i } },
                    'Twitter',
                    {
                      $cond: [
                        { $regexMatch: { input: '$referrer', regex: /linkedin/i } },
                        'LinkedIn',
                        'Other'
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        sessions: { $addToSet: '$sessionId' },
        users: { $addToSet: '$userId' },
        views: { $sum: 1 }
      }
    },
    {
      $project: {
        source: '$_id',
        sessions: { $size: '$sessions' },
        users: { $size: '$users' },
        views: 1
      }
    },
    { $sort: { sessions: -1 } }
  ]);
};

// Goal Conversion Schema
const goalConversionSchema = new mongoose.Schema({
  goalName: {
    type: String,
    required: true,
    index: true
  },
  goalType: {
    type: String,
    enum: ['page_view', 'event', 'duration', 'custom'],
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    default: 0
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  conversionPath: [{
    page: String,
    timestamp: Date,
    event: String
  }],
  timeToConversion: Number, // in seconds
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'goal_conversions'
});

// Compound indexes
goalConversionSchema.index({ goalName: 1, createdAt: -1 });
goalConversionSchema.index({ userId: 1, goalName: 1 });
goalConversionSchema.index({ sessionId: 1, createdAt: 1 });

// Static methods
goalConversionSchema.statics.getConversionRate = function(goalName, startDate, endDate) {
  return Promise.all([
    this.countDocuments({
      goalName,
      createdAt: {
        $gte: startDate,
        $lte: endDate || new Date()
      }
    }),
    mongoose.model('UserSession').countDocuments({
      startTime: {
        $gte: startDate,
        $lte: endDate || new Date()
      }
    })
  ]).then(([conversions, sessions]) => {
    return {
      conversions,
      sessions,
      rate: sessions > 0 ? conversions / sessions : 0
    };
  });
};

// Performance Metrics Schema
const performanceMetricSchema = new mongoose.Schema({
  metric: {
    type: String,
    required: true,
    enum: ['lcp', 'fid', 'cls', 'fcp', 'ttfb', 'tti'],
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  rating: {
    type: String,
    enum: ['good', 'needs-improvement', 'poor'],
    required: true
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  userAgent: String,
  connectionType: String,
  deviceType: String
}, {
  timestamps: true,
  collection: 'performance_metrics'
});

// Compound indexes
performanceMetricSchema.index({ metric: 1, createdAt: -1 });
performanceMetricSchema.index({ page: 1, metric: 1 });
performanceMetricSchema.index({ rating: 1, metric: 1 });

// Static methods
performanceMetricSchema.statics.getCoreWebVitals = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$metric',
        avgValue: { $avg: '$value' },
        p75Value: {
          $percentile: {
            input: '$value',
            p: [0.75],
            method: 'approximate'
          }
        },
        ratings: { $push: '$rating' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        metric: '$_id',
        avgValue: { $round: ['$avgValue', 2] },
        p75Value: { $round: [{ $arrayElemAt: ['$p75Value', 0] }, 2] },
        goodCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'good'] }
            }
          }
        },
        needsImprovementCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'needs-improvement'] }
            }
          }
        },
        poorCount: {
          $size: {
            $filter: {
              input: '$ratings',
              cond: { $eq: ['$$this', 'poor'] }
            }
          }
        },
        count: 1
      }
    }
  ]);
};

// Create models
const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);
const PageView = mongoose.model('PageView', pageViewSchema);
const GoalConversion = mongoose.model('GoalConversion', goalConversionSchema);
const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

// Export models
module.exports = {
  AnalyticsEvent,
  UserSession,
  PageView,
  GoalConversion,
  PerformanceMetric
};
EOF

print_success "Analytics database models created"

print_status "Creating analytics reporting components..."

# Create analytics reports generator
cat > "$SCRIPTS_DIR/generate-analytics-reports.js" << 'EOF'
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { AnalyticsEvent, UserSession, PageView, GoalConversion, PerformanceMetric } = require('../backend/analytics-models');

// Report configuration
const REPORT_CONFIG = {
  daily: {
    timeRange: 24 * 60 * 60 * 1000, // 24 hours
    schedule: '0 1 * * *' // Daily at 1 AM
  },
  weekly: {
    timeRange: 7 * 24 * 60 * 60 * 1000, // 7 days
    schedule: '0 2 * * 1' // Weekly on Monday at 2 AM
  },
  monthly: {
    timeRange: 30 * 24 * 60 * 60 * 1000, // 30 days
    schedule: '0 3 1 * *' // Monthly on 1st at 3 AM
  }
};

class AnalyticsReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../analytics/reports');
  }

  async generateReport(type = 'daily', customTimeRange = null) {
    try {
      console.log(`Generating ${type} analytics report...`);
      
      const timeRange = customTimeRange || REPORT_CONFIG[type]?.timeRange || REPORT_CONFIG.daily.timeRange;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange);
      
      // Gather all analytics data
      const [overview, traffic, performance, userBehavior, conversions, trends] = await Promise.all([
        this.getOverviewData(startDate, endDate),
        this.getTrafficData(startDate, endDate),
        this.getPerformanceData(startDate, endDate),
        this.getUserBehaviorData(startDate, endDate),
        this.getConversionData(startDate, endDate),
        this.getTrendData(startDate, endDate)
      ]);
      
      const report = {
        metadata: {
          type,
          generatedAt: new Date().toISOString(),
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          version: '1.0.0'
        },
        summary: this.generateSummary(overview, traffic, performance, conversions),
        data: {
          overview,
          traffic,
          performance,
          userBehavior,
          conversions,
          trends
        },
        insights: this.generateInsights(overview, traffic, performance, userBehavior, conversions),
        recommendations: this.generateRecommendations(overview, traffic, performance, userBehavior, conversions)
      };
      
      // Save report
      await this.saveReport(report, type);
      
      console.log(`${type} report generated successfully`);
      return report;
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      throw error;
    }
  }

  async getOverviewData(startDate, endDate) {
    const [totalUsers, totalSessions, totalPageViews, sessionStats] = await Promise.all([
      AnalyticsEvent.distinct('properties.userId', {
        createdAt: { $gte: startDate, $lte: endDate },
        'properties.userId': { $exists: true, $ne: null }
      }),
      UserSession.countDocuments({ startTime: { $gte: startDate, $lte: endDate } }),
      PageView.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      UserSession.getSessionStats(startDate, endDate)
    ]);
    
    const sessionStatsData = sessionStats[0] || { totalSessions: 0, avgDuration: 0, bounceRate: 0 };
    
    return {
      totalUsers: totalUsers.length,
      totalSessions,
      totalPageViews,
      averageSessionDuration: sessionStatsData.avgDuration || 0,
      bounceRate: sessionStatsData.bounceRate || 0,
      pagesPerSession: totalSessions > 0 ? totalPageViews / totalSessions : 0
    };
  }

  async getTrafficData(startDate, endDate) {
    const [sources, devices, browsers, countries] = await Promise.all([
      PageView.getTrafficSources(startDate, endDate),
      this.getDeviceBreakdown(startDate, endDate),
      this.getBrowserBreakdown(startDate, endDate),
      this.getCountryBreakdown(startDate, endDate)
    ]);
    
    return {
      sources,
      devices,
      browsers,
      countries
    };
  }

  async getPerformanceData(startDate, endDate) {
    const [coreWebVitals, pageLoadTimes, errorRates] = await Promise.all([
      PerformanceMetric.getCoreWebVitals(startDate, endDate),
      this.getPageLoadTimes(startDate, endDate),
      this.getErrorRates(startDate, endDate)
    ]);
    
    return {
      coreWebVitals,
      pageLoadTimes,
      errorRates
    };
  }

  async getUserBehaviorData(startDate, endDate) {
    const [topPages, userFlow, events, searchTerms] = await Promise.all([
      PageView.getTopPages(startDate, endDate),
      this.getUserFlow(startDate, endDate),
      this.getTopEvents(startDate, endDate),
      this.getSearchTerms(startDate, endDate)
    ]);
    
    return {
      topPages,
      userFlow,
      events,
      searchTerms
    };
  }

  async getConversionData(startDate, endDate) {
    const [goals, funnels, revenue] = await Promise.all([
      this.getGoalCompletions(startDate, endDate),
      this.getConversionFunnels(startDate, endDate),
      this.getRevenueData(startDate, endDate)
    ]);
    
    return {
      goals,
      funnels,
      revenue
    };
  }

  async getTrendData(startDate, endDate) {
    // Get daily trends for the time period
    const dailyTrends = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          pageViews: { $sum: 1 },
          users: { $addToSet: '$userId' },
          sessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          date: '$_id',
          pageViews: 1,
          users: { $size: '$users' },
          sessions: { $size: '$sessions' }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    return {
      daily: dailyTrends
    };
  }

  async getDeviceBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          device: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$device',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          device: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } }
    ]);
  }

  async getBrowserBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          browser: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$browser',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          browser: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } },
      { $limit: 10 }
    ]);
  }

  async getCountryBreakdown(startDate, endDate) {
    return UserSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          country: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$country',
          sessions: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          country: '$_id',
          sessions: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { sessions: -1 } },
      { $limit: 15 }
    ]);
  }

  async getPageLoadTimes(startDate, endDate) {
    return PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          loadTime: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgLoadTime: { $avg: '$loadTime' },
          medianLoadTime: {
            $percentile: {
              input: '$loadTime',
              p: [0.5],
              method: 'approximate'
            }
          },
          p95LoadTime: {
            $percentile: {
              input: '$loadTime',
              p: [0.95],
              method: 'approximate'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getErrorRates(startDate, endDate) {
    const [totalEvents, errorEvents] = await Promise.all([
      AnalyticsEvent.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      AnalyticsEvent.countDocuments({
        event: 'error',
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);
    
    return {
      totalEvents,
      errorEvents,
      errorRate: totalEvents > 0 ? errorEvents / totalEvents : 0
    };
  }

  async getUserFlow(startDate, endDate) {
    return PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $sort: { sessionId: 1, createdAt: 1 } },
      {
        $group: {
          _id: '$sessionId',
          pages: { $push: '$page' }
        }
      },
      {
        $project: {
          transitions: {
            $map: {
              input: { $range: [0, { $subtract: [{ $size: '$pages' }, 1] }] },
              as: 'index',
              in: {
                from: { $arrayElemAt: ['$pages', '$$index'] },
                to: { $arrayElemAt: ['$pages', { $add: ['$$index', 1] }] }
              }
            }
          }
        }
      },
      { $unwind: '$transitions' },
      {
        $group: {
          _id: {
            from: '$transitions.from',
            to: '$transitions.to'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          from: '$_id.from',
          to: '$_id.to',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  async getTopEvents(startDate, endDate) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          event: { $nin: ['page_view', 'session_start'] }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$properties.userId' }
        }
      },
      {
        $project: {
          event: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
  }

  async getSearchTerms(startDate, endDate) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          event: 'search',
          createdAt: { $gte: startDate, $lte: endDate },
          'properties.query': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$properties.query',
          count: { $sum: 1 },
          users: { $addToSet: '$properties.userId' }
        }
      },
      {
        $project: {
          query: '$_id',
          count: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  async getGoalCompletions(startDate, endDate) {
    return GoalConversion.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$goalName',
          completions: { $sum: 1 },
          totalValue: { $sum: '$value' },
          totalRevenue: { $sum: '$revenue' },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          goal: '$_id',
          completions: 1,
          totalValue: 1,
          totalRevenue: 1,
          uniqueUsers: { $size: '$users' }
        }
      },
      { $sort: { completions: -1 } }
    ]);
  }

  async getConversionFunnels(startDate, endDate) {
    // Simplified funnel analysis
    const funnelSteps = [
      { step: 'Landing', event: 'page_view' },
      { step: 'Signup', event: 'signup_started' },
      { step: 'Profile', event: 'profile_created' },
      { step: 'First Action', event: 'first_action' },
      { step: 'Conversion', event: 'goal_completed' }
    ];
    
    const funnelData = [];
    let previousUsers = null;
    
    for (const step of funnelSteps) {
      const users = await AnalyticsEvent.distinct('properties.userId', {
        event: step.event,
        createdAt: { $gte: startDate, $lte: endDate },
        'properties.userId': { $exists: true, $ne: null }
      });
      
      const conversionRate = previousUsers ? users.length / previousUsers : 1;
      
      funnelData.push({
        step: step.step,
        users: users.length,
        conversionRate,
        dropoffRate: 1 - conversionRate
      });
      
      previousUsers = users.length;
    }
    
    return funnelData;
  }

  async getRevenueData(startDate, endDate) {
    const revenueData = await GoalConversion.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          revenue: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          avgRevenue: { $avg: '$revenue' },
          transactions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          avgRevenue: { $round: ['$avgRevenue', 2] },
          transactions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          revenuePerUser: {
            $cond: [
              { $gt: [{ $size: '$uniqueUsers' }, 0] },
              { $divide: ['$totalRevenue', { $size: '$uniqueUsers' }] },
              0
            ]
          }
        }
      }
    ]);
    
    return revenueData[0] || {
      totalRevenue: 0,
      avgRevenue: 0,
      transactions: 0,
      uniqueUsers: 0,
      revenuePerUser: 0
    };
  }

  generateSummary(overview, traffic, performance, conversions) {
    return {
      keyMetrics: {
        users: overview.totalUsers,
        sessions: overview.totalSessions,
        pageViews: overview.totalPageViews,
        bounceRate: Math.round(overview.bounceRate * 100),
        avgSessionDuration: Math.round(overview.averageSessionDuration)
      },
      topTrafficSource: traffic.sources[0]?.source || 'Direct',
      topDevice: traffic.devices[0]?.device || 'Unknown',
      performanceScore: this.calculatePerformanceScore(performance),
      totalConversions: conversions.goals.reduce((sum, goal) => sum + goal.completions, 0)
    };
  }

  generateInsights(overview, traffic, performance, userBehavior, conversions) {
    const insights = [];
    
    // Traffic insights
    if (overview.bounceRate > 0.7) {
      insights.push({
        type: 'warning',
        category: 'traffic',
        message: `High bounce rate (${Math.round(overview.bounceRate * 100)}%) indicates users are leaving quickly`,
        recommendation: 'Improve landing page content and loading speed'
      });
    }
    
    // Performance insights
    const avgLoadTime = performance.pageLoadTimes[0]?.avgLoadTime;
    if (avgLoadTime && avgLoadTime > 3000) {
      insights.push({
        type: 'warning',
        category: 'performance',
        message: `Average page load time is ${Math.round(avgLoadTime)}ms, which is above recommended 3 seconds`,
        recommendation: 'Optimize images, minify CSS/JS, and consider CDN implementation'
      });
    }
    
    // User behavior insights
    if (userBehavior.topPages.length > 0) {
      const topPage = userBehavior.topPages[0];
      insights.push({
        type: 'info',
        category: 'behavior',
        message: `Most popular page is "${topPage.page}" with ${topPage.views} views`,
        recommendation: 'Consider optimizing this page for conversions'
      });
    }
    
    // Conversion insights
    if (conversions.goals.length > 0) {
      const totalConversions = conversions.goals.reduce((sum, goal) => sum + goal.completions, 0);
      const conversionRate = overview.totalSessions > 0 ? totalConversions / overview.totalSessions : 0;
      
      if (conversionRate < 0.02) {
        insights.push({
          type: 'warning',
          category: 'conversion',
          message: `Low conversion rate (${Math.round(conversionRate * 100)}%)`,
          recommendation: 'Review conversion funnel and optimize call-to-action elements'
        });
      }
    }
    
    return insights;
  }

  generateRecommendations(overview, traffic, performance, userBehavior, conversions) {
    const recommendations = [];
    
    // Performance recommendations
    if (performance.coreWebVitals.some(vital => vital.rating === 'poor')) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Improve Core Web Vitals',
        description: 'Some Core Web Vitals metrics are in the "poor" range',
        actions: [
          'Optimize Largest Contentful Paint (LCP)',
          'Reduce First Input Delay (FID)',
          'Minimize Cumulative Layout Shift (CLS)'
        ]
      });
    }
    
    // Traffic recommendations
    if (traffic.sources.length < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'traffic',
        title: 'Diversify Traffic Sources',
        description: 'Limited traffic sources increase dependency risk',
        actions: [
          'Implement SEO strategy',
          'Start social media marketing',
          'Consider paid advertising'
        ]
      });
    }
    
    // User experience recommendations
    if (overview.pagesPerSession < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'ux',
        title: 'Improve User Engagement',
        description: 'Users are viewing fewer pages per session',
        actions: [
          'Add related content suggestions',
          'Improve internal linking',
          'Create more engaging content'
        ]
      });
    }
    
    return recommendations;
  }

  calculatePerformanceScore(performance) {
    // Simplified performance score calculation
    let score = 100;
    
    performance.coreWebVitals.forEach(vital => {
      if (vital.rating === 'poor') score -= 20;
      else if (vital.rating === 'needs-improvement') score -= 10;
    });
    
    if (performance.errorRates.errorRate > 0.01) score -= 15;
    
    return Math.max(0, score);
  }

  async saveReport(report, type) {
    // Ensure reports directory exists
    await fs.mkdir(this.reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-report-${timestamp}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also save as latest
    const latestFilepath = path.join(this.reportsDir, `latest-${type}-report.json`);
    await fs.writeFile(latestFilepath, JSON.stringify(report, null, 2));
    
    console.log(`Report saved to ${filepath}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const reportType = args[0] || 'daily';
  const customTimeRange = args[1] ? parseInt(args[1]) : null;
  
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devdeck')
    .then(async () => {
      console.log('Connected to MongoDB');
      
      const generator = new AnalyticsReportGenerator();
      await generator.generateReport(reportType, customTimeRange);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsReportGenerator;
EOF

print_success "Analytics reports generator created"

# Create analytics automation script
cat > "$SCRIPTS_DIR/automate-analytics.sh" << 'EOF'
#!/bin/bash

# Analytics Automation Script
# Handles scheduled report generation, data cleanup, and alerting

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANALYTICS_DIR="$SCRIPT_DIR/../analytics"
REPORTS_DIR="$ANALYTICS_DIR/reports"
LOGS_DIR="$ANALYTICS_DIR/logs"
CONFIG_FILE="$ANALYTICS_DIR/config/analytics.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

# Ensure directories exist
mkdir -p "$LOGS_DIR"

# Function to generate reports
generate_reports() {
    local report_type="$1"
    
    log_info "Generating $report_type analytics report..."
    
    if node "$SCRIPT_DIR/generate-analytics-reports.js" "$report_type"; then
        log_success "$report_type report generated successfully"
        
        # Check for alerts in the report
        check_report_alerts "$report_type"
    else
        log_error "Failed to generate $report_type report"
        send_alert "Report Generation Failed" "Failed to generate $report_type analytics report"
        return 1
    fi
}

# Function to check report alerts
check_report_alerts() {
    local report_type="$1"
    local report_file="$REPORTS_DIR/latest-$report_type-report.json"
    
    if [[ -f "$report_file" ]]; then
        # Check for high bounce rate
        local bounce_rate=$(jq -r '.data.overview.bounceRate // 0' "$report_file")
        if (( $(echo "$bounce_rate > 0.7" | bc -l) )); then
            send_alert "High Bounce Rate Alert" "Bounce rate is ${bounce_rate}% (>70%)"
        fi
        
        # Check for low conversion rate
        local total_conversions=$(jq -r '.summary.totalConversions // 0' "$report_file")
        local total_sessions=$(jq -r '.data.overview.totalSessions // 1' "$report_file")
        local conversion_rate=$(echo "scale=4; $total_conversions / $total_sessions" | bc)
        
        if (( $(echo "$conversion_rate < 0.02" | bc -l) )); then
            send_alert "Low Conversion Rate Alert" "Conversion rate is ${conversion_rate}% (<2%)"
        fi
        
        # Check for performance issues
        local performance_score=$(jq -r '.summary.performanceScore // 100' "$report_file")
        if (( $(echo "$performance_score < 70" | bc -l) )); then
            send_alert "Performance Alert" "Performance score is $performance_score (<70)"
        fi
        
        # Check for error rate
        local error_rate=$(jq -r '.data.performance.errorRates.errorRate // 0' "$report_file")
        if (( $(echo "$error_rate > 0.01" | bc -l) )); then
            send_alert "High Error Rate Alert" "Error rate is ${error_rate}% (>1%)"
        fi
    fi
}

# Function to send alerts
send_alert() {
    local title="$1"
    local message="$2"
    
    log_warning "ALERT: $title - $message"
    
    # Send webhook notification if configured
    if [[ -n "$ANALYTICS_WEBHOOK_URL" ]]; then
        curl -X POST "$ANALYTICS_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"title\": \"$title\",
                \"message\": \"$message\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
                \"source\": \"DevDeck Analytics\"
            }" 2>/dev/null || log_error "Failed to send webhook alert"
    fi
    
    # Send email if configured
    if [[ -n "$ANALYTICS_EMAIL" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "DevDeck Analytics Alert: $title" "$ANALYTICS_EMAIL" || log_error "Failed to send email alert"
    fi
}

# Function to cleanup old reports
cleanup_old_reports() {
    log_info "Cleaning up old reports..."
    
    # Keep reports for 90 days
    find "$REPORTS_DIR" -name "*.json" -type f -mtime +90 -delete 2>/dev/null || true
    
    # Keep logs for 30 days
    find "$LOGS_DIR" -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Function to backup analytics data
backup_analytics_data() {
    log_info "Creating analytics data backup..."
    
    local backup_dir="$ANALYTICS_DIR/backups"
    local backup_file="$backup_dir/analytics-backup-$(date +%Y%m%d).tar.gz"
    
    mkdir -p "$backup_dir"
    
    # Create backup of reports and configuration
    tar -czf "$backup_file" -C "$ANALYTICS_DIR" reports config 2>/dev/null || {
        log_error "Failed to create analytics backup"
        return 1
    }
    
    # Keep backups for 30 days
    find "$backup_dir" -name "analytics-backup-*.tar.gz" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "Analytics backup created: $backup_file"
}

# Function to optimize analytics database
optimize_database() {
    log_info "Optimizing analytics database..."
    
    # Run database optimization script if it exists
    if [[ -f "$SCRIPT_DIR/optimize-analytics-db.js" ]]; then
        if node "$SCRIPT_DIR/optimize-analytics-db.js"; then
            log_success "Database optimization completed"
        else
            log_error "Database optimization failed"
        fi
    fi
}

# Function to generate summary dashboard
generate_dashboard() {
    log_info "Generating analytics dashboard..."
    
    # Create a simple HTML dashboard from latest reports
    local dashboard_file="$ANALYTICS_DIR/dashboard.html"
    
    cat > "$dashboard_file" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Analytics Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .alert { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DevDeck Analytics Dashboard</h1>
        <p>Last updated: <span id="lastUpdated"></span></p>
        
        <div class="card">
            <h2>Key Metrics</h2>
            <div id="keyMetrics">
                <div class="metric">
                    <div class="metric-value" id="totalUsers">-</div>
                    <div class="metric-label">Total Users</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="totalSessions">-</div>
                    <div class="metric-label">Sessions</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="totalPageViews">-</div>
                    <div class="metric-label">Page Views</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="bounceRate">-</div>
                    <div class="metric-label">Bounce Rate</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>Performance Score</h2>
            <div class="metric">
                <div class="metric-value" id="performanceScore">-</div>
                <div class="metric-label">Overall Score</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Alerts & Insights</h2>
            <div id="alerts"></div>
        </div>
        
        <div class="card">
            <h2>Traffic Trends</h2>
            <div class="chart-placeholder">Traffic chart would be displayed here</div>
        </div>
    </div>
    
    <script>
        // Load latest daily report
        fetch('./reports/latest-daily-report.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('lastUpdated').textContent = new Date(data.metadata.generatedAt).toLocaleString();
                
                // Update key metrics
                document.getElementById('totalUsers').textContent = data.summary.keyMetrics.users.toLocaleString();
                document.getElementById('totalSessions').textContent = data.summary.keyMetrics.sessions.toLocaleString();
                document.getElementById('totalPageViews').textContent = data.summary.keyMetrics.pageViews.toLocaleString();
                document.getElementById('bounceRate').textContent = data.summary.keyMetrics.bounceRate + '%';
                document.getElementById('performanceScore').textContent = data.summary.performanceScore;
                
                // Update alerts
                const alertsContainer = document.getElementById('alerts');
                if (data.insights && data.insights.length > 0) {
                    data.insights.forEach(insight => {
                        const alertDiv = document.createElement('div');
                        alertDiv.className = `alert alert-${insight.type === 'warning' ? 'warning' : 'success'}`;
                        alertDiv.innerHTML = `<strong>${insight.category.toUpperCase()}:</strong> ${insight.message}`;
                        alertsContainer.appendChild(alertDiv);
                    });
                } else {
                    alertsContainer.innerHTML = '<div class="alert alert-success">No alerts - everything looks good!</div>';
                }
            })
            .catch(error => {
                console.error('Error loading analytics data:', error);
                document.getElementById('alerts').innerHTML = '<div class="alert alert-warning">Unable to load analytics data</div>';
            });
    </script>
</body>
</html>
HTML
    
    log_success "Analytics dashboard generated: $dashboard_file"
}

# Main execution
case "${1:-help}" in
    "daily")
        generate_reports "daily"
        ;;
    "weekly")
        generate_reports "weekly"
        cleanup_old_reports
        backup_analytics_data
        ;;
    "monthly")
        generate_reports "monthly"
        optimize_database
        ;;
    "cleanup")
        cleanup_old_reports
        ;;
    "backup")
        backup_analytics_data
        ;;
    "dashboard")
        generate_dashboard
        ;;
    "optimize")
        optimize_database
        ;;
    "all")
        generate_reports "daily"
        generate_dashboard
        cleanup_old_reports
        ;;
    "help")
        echo "Usage: $0 {daily|weekly|monthly|cleanup|backup|dashboard|optimize|all|help}"
        echo ""
        echo "Commands:"
        echo "  daily     - Generate daily analytics report"
        echo "  weekly    - Generate weekly report + cleanup"
        echo "  monthly   - Generate monthly report + optimize DB"
        echo "  cleanup   - Clean up old reports and logs"
        echo "  backup    - Create analytics data backup"
        echo "  dashboard - Generate HTML dashboard"
        echo "  optimize  - Optimize analytics database"
        echo "  all       - Generate daily report + dashboard + cleanup"
        echo "  help      - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
EOF

chmod +x "$SCRIPTS_DIR/automate-analytics.sh"
print_success "Analytics automation script created"

# Create analytics README
cat > "$ANALYTICS_DIR/README.md" << 'EOF'
# DevDeck Analytics Dashboard

A comprehensive analytics and reporting system for DevDeck that tracks user behavior, performance metrics, and business insights.

## Overview

The analytics system provides:
- **Real-time tracking** of user interactions and page views
- **Performance monitoring** with Core Web Vitals
- **Conversion tracking** and funnel analysis
- **Automated reporting** with insights and recommendations
- **Dashboard visualization** for key metrics
- **Alert system** for critical issues

## Quick Start

### 1. Setup

```bash
# Run the setup script
./scripts/setup-analytics-dashboard.sh

# Install dependencies
npm install mongoose chart.js
```

### 2. Configuration

Update the analytics configuration in `analytics/config/analytics.json`:

```json
{
  "tracking": {
    "enabled": true,
    "sampleRate": 1.0,
    "anonymizeIp": true
  },
  "alerts": {
    "webhookUrl": "https://your-webhook-url.com",
    "email": "admin@yoursite.com"
  }
}
```

### 3. Integration

#### Frontend Integration

```tsx
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// Add to your app
<AnalyticsTracker />

// Add dashboard to admin panel
<AnalyticsDashboard />
```

#### Backend Integration

```javascript
const analyticsApi = require('./backend/analytics-api');
app.use('/api/analytics', analyticsApi);
```

## Components

### Frontend Components

#### AnalyticsTracker
Automatically tracks:
- Page views and navigation
- User sessions and interactions
- Performance metrics (Core Web Vitals)
- Custom events and conversions
- Error tracking

#### AnalyticsDashboard
Displays:
- Real-time metrics overview
- Traffic sources and user behavior
- Performance insights
- Conversion funnels
- Custom reports

### Backend Components

#### Analytics API (`analytics-api.js`)
- `/track` - Track events and page views
- `/dashboard` - Get dashboard data
- `/realtime` - Real-time analytics
- `/report` - Generate custom reports
- `/export` - Export analytics data

#### Database Models (`analytics-models.js`)
- `AnalyticsEvent` - All tracked events
- `UserSession` - User session data
- `PageView` - Page view tracking
- `GoalConversion` - Conversion tracking
- `PerformanceMetric` - Performance data

## Automation

### Scheduled Reports

```bash
# Add to crontab for automated reports
0 1 * * * /path/to/scripts/automate-analytics.sh daily
0 2 * * 1 /path/to/scripts/automate-analytics.sh weekly
0 3 1 * * /path/to/scripts/automate-analytics.sh monthly
```

### Available Commands

```bash
# Generate reports
./scripts/automate-analytics.sh daily
./scripts/automate-analytics.sh weekly
./scripts/automate-analytics.sh monthly

# Maintenance
./scripts/automate-analytics.sh cleanup
./scripts/automate-analytics.sh backup
./scripts/automate-analytics.sh optimize

# Dashboard
./scripts/automate-analytics.sh dashboard
```

## Metrics Tracked

### User Metrics
- **Users**: Unique visitors
- **Sessions**: User sessions
- **Page Views**: Total page views
- **Bounce Rate**: Single-page sessions
- **Session Duration**: Average time on site

### Performance Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Page Load Times**: Average and percentiles
- **Error Rates**: JavaScript and API errors
- **Performance Score**: Overall performance rating

### Business Metrics
- **Conversions**: Goal completions
- **Conversion Rate**: Percentage of converting users
- **Revenue**: Transaction tracking
- **Funnel Analysis**: Step-by-step conversion tracking

### Traffic Metrics
- **Traffic Sources**: Referrer analysis
- **Device Breakdown**: Desktop, mobile, tablet
- **Browser Analysis**: Browser usage statistics
- **Geographic Data**: Country and city tracking

## Reporting

### Report Types

1. **Daily Reports**
   - Key metrics summary
   - Performance alerts
   - Traffic overview

2. **Weekly Reports**
   - Trend analysis
   - User behavior insights
   - Conversion funnel performance

3. **Monthly Reports**
   - Comprehensive analytics
   - Business insights
   - Recommendations

### Report Structure

```json
{
  "metadata": {
    "type": "daily",
    "generatedAt": "2024-01-15T10:00:00Z",
    "timeRange": { "start": "...", "end": "..." }
  },
  "summary": {
    "keyMetrics": { "users": 1250, "sessions": 1800 },
    "performanceScore": 85,
    "totalConversions": 45
  },
  "data": {
    "overview": { /* detailed metrics */ },
    "traffic": { /* traffic analysis */ },
    "performance": { /* performance data */ },
    "userBehavior": { /* behavior insights */ },
    "conversions": { /* conversion data */ }
  },
  "insights": [ /* automated insights */ ],
  "recommendations": [ /* actionable recommendations */ ]
}
```

## Alerts

### Alert Conditions
- Bounce rate > 70%
- Conversion rate < 2%
- Performance score < 70
- Error rate > 1%
- Page load time > 3 seconds

### Alert Channels
- **Webhook**: POST to configured URL
- **Email**: Send to admin email
- **Dashboard**: Visual alerts in UI
- **Logs**: Written to analytics logs

## Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/devdeck

# Alerts
ANALYTICS_WEBHOOK_URL=https://hooks.slack.com/...
ANALYTICS_EMAIL=admin@yoursite.com

# Tracking
ANALYTICS_SAMPLE_RATE=1.0
ANALYTICS_ANONYMIZE_IP=true
```

### Analytics Configuration

Edit `analytics/config/analytics.json`:

```json
{
  "tracking": {
    "enabled": true,
    "sampleRate": 1.0,
    "anonymizeIp": true,
    "trackErrors": true,
    "trackPerformance": true
  },
  "privacy": {
    "respectDnt": true,
    "cookieConsent": true,
    "dataRetention": 365
  },
  "metrics": {
    "coreWebVitals": true,
    "customEvents": true,
    "userTiming": true
  },
  "reporting": {
    "daily": true,
    "weekly": true,
    "monthly": true,
    "realtime": true
  },
  "alerts": {
    "enabled": true,
    "webhookUrl": "",
    "email": "",
    "thresholds": {
      "bounceRate": 0.7,
      "conversionRate": 0.02,
      "performanceScore": 70,
      "errorRate": 0.01
    }
  }
}
```

## API Reference

### Track Event

```javascript
POST /api/analytics/track
{
  "event": "button_click",
  "properties": {
    "buttonId": "signup",
    "userId": "user123",
    "sessionId": "session456"
  }
}
```

### Get Dashboard Data

```javascript
GET /api/analytics/dashboard?timeRange=7d
```

### Export Data

```javascript
GET /api/analytics/export?format=csv&timeRange=30d
```

## Troubleshooting

### Common Issues

1. **No data appearing**
   - Check MongoDB connection
   - Verify analytics tracker is loaded
   - Check browser console for errors

2. **Reports not generating**
   - Check cron job configuration
   - Verify script permissions
   - Check logs in `analytics/logs/`

3. **Performance issues**
   - Review database indexes
   - Check sample rate configuration
   - Monitor memory usage

### Debug Mode

```bash
# Enable debug logging
export DEBUG=analytics:*

# Run with verbose output
./scripts/automate-analytics.sh daily --verbose
```

### Log Files

- `analytics/logs/analytics.log` - Main analytics log
- `analytics/logs/errors.log` - Error tracking
- `analytics/logs/performance.log` - Performance monitoring

## Security & Privacy

### Data Protection
- IP address anonymization
- GDPR compliance features
- Cookie consent integration
- Data retention policies

### Security Measures
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure data transmission
- Access control for sensitive data

## Performance

### Optimization
- Database indexing for fast queries
- Aggregation pipelines for reports
- Caching for frequently accessed data
- Sampling for high-traffic sites

### Scaling
- Horizontal database scaling
- Read replicas for reporting
- CDN for static assets
- Load balancing for API endpoints

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review log files for errors
3. Consult the API documentation
4. Contact the development team

## Version History

### v1.0.0
- Initial analytics system
- Basic tracking and reporting
- Dashboard visualization
- Automated alerts

### Roadmap
- A/B testing integration
- Advanced segmentation
- Machine learning insights
- Real-time dashboard updates
EOF

print_success "Analytics README created"