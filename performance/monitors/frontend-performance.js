// Frontend Performance Monitor
// Tracks Core Web Vitals and other performance metrics

class PerformanceMonitor {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/performance';
    this.sampleRate = options.sampleRate || 0.1; // 10% sampling
    this.metrics = {
      navigation: {},
      vitals: {},
      resources: [],
      errors: []
    };
    
    this.init();
  }

  init() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Start monitoring when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    // Sample based on rate
    if (Math.random() > this.sampleRate) return;
    
    this.measureNavigationTiming();
    this.measureCoreWebVitals();
    this.measureResourceTiming();
    this.trackErrors();
    this.trackUserInteractions();
    
    // Send metrics after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => this.sendMetrics(), 2000);
    });
  }

  measureNavigationTiming() {
    if (!performance.getEntriesByType) return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    this.metrics.navigation = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0 ? 
           navigation.connectEnd - navigation.secureConnectionStart : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
      domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart
    };
  }

  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.vitals.lcp = lastEntry.startTime;
    });

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach(entry => {
        this.metrics.vitals.fid = entry.processingStart - entry.startTime;
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.vitals.cls = clsValue;
    });

    // First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.vitals.fcp = entry.startTime;
        }
      });
    });
  }

  observePerformanceEntry(type, callback) {
    if (!PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
    } catch (e) {
      console.warn(`Performance observer for ${type} not supported`);
    }
  }

  measureResourceTiming() {
    if (!performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource');
    
    this.metrics.resources = resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource),
      size: resource.transferSize || 0,
      duration: resource.duration,
      blocked: resource.domainLookupStart - resource.fetchStart,
      dns: resource.domainLookupEnd - resource.domainLookupStart,
      connect: resource.connectEnd - resource.connectStart,
      send: resource.responseStart - resource.requestStart,
      wait: resource.responseStart - resource.requestStart,
      receive: resource.responseEnd - resource.responseStart
    }));
  }

  getResourceType(resource) {
    if (resource.initiatorType) return resource.initiatorType;
    
    const url = resource.name;
    if (url.match(/\.(css)$/)) return 'css';
    if (url.match(/\.(js)$/)) return 'script';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'img';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  trackErrors() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now()
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        timestamp: Date.now()
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.metrics.errors.push({
          type: 'resource',
          message: `Failed to load: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          timestamp: Date.now()
        });
      }
    }, true);
  }

  trackUserInteractions() {
    let interactionCount = 0;
    const startTime = performance.now();
    
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        interactionCount++;
      }, { passive: true });
    });
    
    // Track interaction metrics
    setTimeout(() => {
      this.metrics.interactions = {
        count: interactionCount,
        rate: interactionCount / ((performance.now() - startTime) / 1000)
      };
    }, 10000); // After 10 seconds
  }

  async sendMetrics() {
    const payload = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  getConnectionInfo() {
    if (!navigator.connection) return null;
    
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }

  // Manual performance marking
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark) {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
    }
  }

  // Get current performance snapshot
  getSnapshot() {
    return {
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      timing: this.metrics.navigation,
      vitals: this.metrics.vitals
    };
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  
  // Auto-start monitoring
  new PerformanceMonitor({
    sampleRate: 0.1, // 10% of users
    apiEndpoint: '/api/performance/metrics'
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
