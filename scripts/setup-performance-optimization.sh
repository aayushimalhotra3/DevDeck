#!/bin/bash

# DevDeck Performance Optimization Setup Script
# Creates automated performance optimization tools and monitoring

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> setup-performance-optimization.log
}

# Print functions
print_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}\n"
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

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header "DevDeck Performance Optimization Setup"

# Create directory structure
PERF_DIR="performance"
SCRIPTS_DIR="$PERF_DIR/scripts"
MONITORS_DIR="$PERF_DIR/monitors"
OPTIMIZERS_DIR="$PERF_DIR/optimizers"
REPORTS_DIR="$PERF_DIR/reports"
CONFIG_DIR="$PERF_DIR/config"

print_status "Creating performance optimization directory structure..."

# Create directories
mkdir -p "$SCRIPTS_DIR" "$MONITORS_DIR" "$OPTIMIZERS_DIR" "$REPORTS_DIR" "$CONFIG_DIR"

print_success "Directory structure created"
log "Performance optimization directories created"

print_status "Creating performance monitoring scripts..."

# Create frontend performance monitor
cat > "$MONITORS_DIR/frontend-performance.js" << 'EOF'
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
EOF

print_success "Frontend performance monitor created"

# Create backend performance monitor
cat > "$MONITORS_DIR/backend-performance.js" << 'EOF'
// Backend Performance Monitor
// Express.js middleware for monitoring API performance

const os = require('os');
const process = require('process');
const mongoose = require('mongoose');

class BackendPerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      sampleRate: options.sampleRate || 0.1,
      slowThreshold: options.slowThreshold || 1000, // 1 second
      memoryThreshold: options.memoryThreshold || 0.8, // 80%
      ...options
    };
    
    this.metrics = {
      requests: [],
      system: {},
      database: {},
      errors: []
    };
    
    this.startSystemMonitoring();
  }

  // Express middleware for request monitoring
  middleware() {
    return (req, res, next) => {
      // Sample requests based on rate
      if (Math.random() > this.options.sampleRate) {
        return next();
      }
      
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();
      
      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Collect request metrics
        const metrics = {
          timestamp: new Date(),
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          memoryDelta: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal
          },
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          contentLength: res.get('Content-Length') || 0
        };
        
        // Store metrics
        this.metrics.requests.push(metrics);
        
        // Alert on slow requests
        if (duration > this.options.slowThreshold) {
          this.alertSlowRequest(metrics);
        }
        
        // Cleanup old metrics (keep last 1000)
        if (this.metrics.requests.length > 1000) {
          this.metrics.requests = this.metrics.requests.slice(-1000);
        }
        
        originalEnd.call(this, chunk, encoding);
      }.bind(this);
      
      next();
    };
  }

  startSystemMonitoring() {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
      this.collectDatabaseMetrics();
    }, 30000);
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.system = {
      timestamp: new Date(),
      memory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        usage: memUsage.heapUsed / memUsage.heapTotal
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: os.loadavg()
      },
      uptime: process.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    };
    
    // Alert on high memory usage
    if (this.metrics.system.memory.usage > this.options.memoryThreshold) {
      this.alertHighMemoryUsage(this.metrics.system.memory);
    }
  }

  async collectDatabaseMetrics() {
    if (!mongoose.connection.readyState) return;
    
    try {
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      
      this.metrics.database = {
        timestamp: new Date(),
        connections: serverStatus.connections,
        opcounters: serverStatus.opcounters,
        memory: serverStatus.mem,
        uptime: serverStatus.uptime,
        version: serverStatus.version
      };
    } catch (error) {
      console.warn('Failed to collect database metrics:', error.message);
    }
  }

  alertSlowRequest(metrics) {
    console.warn(`Slow request detected: ${metrics.method} ${metrics.url} - ${metrics.duration}ms`);
    
    // You can integrate with alerting services here
    // Example: send to Slack, email, etc.
  }

  alertHighMemoryUsage(memory) {
    console.warn(`High memory usage detected: ${(memory.usage * 100).toFixed(2)}%`);
    
    // You can integrate with alerting services here
  }

  getMetrics() {
    return {
      summary: this.getSummaryMetrics(),
      recent: this.getRecentMetrics(),
      system: this.metrics.system,
      database: this.metrics.database
    };
  }

  getSummaryMetrics() {
    const requests = this.metrics.requests;
    if (requests.length === 0) return null;
    
    const durations = requests.map(r => r.duration);
    const statusCodes = requests.reduce((acc, r) => {
      acc[r.statusCode] = (acc[r.statusCode] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalRequests: requests.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      medianResponseTime: this.median(durations),
      p95ResponseTime: this.percentile(durations, 95),
      p99ResponseTime: this.percentile(durations, 99),
      statusCodes,
      errorRate: (statusCodes['4'] + statusCodes['5'] || 0) / requests.length,
      slowRequests: requests.filter(r => r.duration > this.options.slowThreshold).length
    };
  }

  getRecentMetrics(minutes = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.requests.filter(r => r.timestamp > cutoff);
  }

  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
           (sorted[mid - 1] + sorted[mid]) / 2 : 
           sorted[mid];
  }

  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  reset() {
    this.metrics.requests = [];
    this.metrics.errors = [];
  }
}

module.exports = BackendPerformanceMonitor;
EOF

print_success "Backend performance monitor created"

# Create performance optimization script
cat > "$OPTIMIZERS_DIR/auto-optimizer.js" << 'EOF'
// Automated Performance Optimizer
// Analyzes performance data and applies optimizations

const fs = require('fs').promises;
const path = require('path');

class AutoOptimizer {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || './performance/config/optimization.json',
      reportPath: options.reportPath || './performance/reports',
      ...options
    };
    
    this.optimizations = {
      frontend: [],
      backend: [],
      database: [],
      infrastructure: []
    };
  }

  async analyze(performanceData) {
    console.log('🔍 Analyzing performance data...');
    
    await this.analyzeFrontendPerformance(performanceData.frontend);
    await this.analyzeBackendPerformance(performanceData.backend);
    await this.analyzeDatabasePerformance(performanceData.database);
    
    return this.generateOptimizationReport();
  }

  async analyzeFrontendPerformance(data) {
    if (!data) return;
    
    // Analyze Core Web Vitals
    if (data.vitals) {
      if (data.vitals.lcp > 2500) {
        this.optimizations.frontend.push({
          type: 'lcp',
          severity: 'high',
          issue: `LCP is ${data.vitals.lcp}ms (should be < 2.5s)`,
          recommendations: [
            'Optimize largest contentful element',
            'Implement image lazy loading',
            'Use WebP format for images',
            'Minimize render-blocking resources',
            'Use CDN for static assets'
          ]
        });
      }
      
      if (data.vitals.fid > 100) {
        this.optimizations.frontend.push({
          type: 'fid',
          severity: 'high',
          issue: `FID is ${data.vitals.fid}ms (should be < 100ms)`,
          recommendations: [
            'Reduce JavaScript execution time',
            'Split large bundles',
            'Use web workers for heavy computations',
            'Implement code splitting',
            'Defer non-critical JavaScript'
          ]
        });
      }
      
      if (data.vitals.cls > 0.1) {
        this.optimizations.frontend.push({
          type: 'cls',
          severity: 'medium',
          issue: `CLS is ${data.vitals.cls} (should be < 0.1)`,
          recommendations: [
            'Set explicit dimensions for images and videos',
            'Reserve space for dynamic content',
            'Avoid inserting content above existing content',
            'Use CSS transforms instead of changing layout properties'
          ]
        });
      }
    }
    
    // Analyze resource loading
    if (data.resources) {
      const largeResources = data.resources.filter(r => r.size > 1000000); // > 1MB
      if (largeResources.length > 0) {
        this.optimizations.frontend.push({
          type: 'resource-size',
          severity: 'medium',
          issue: `${largeResources.length} resources are larger than 1MB`,
          recommendations: [
            'Compress large assets',
            'Implement progressive loading',
            'Use appropriate image formats',
            'Minify CSS and JavaScript',
            'Enable gzip/brotli compression'
          ],
          details: largeResources.map(r => ({ name: r.name, size: r.size }))
        });
      }
      
      const slowResources = data.resources.filter(r => r.duration > 3000); // > 3s
      if (slowResources.length > 0) {
        this.optimizations.frontend.push({
          type: 'resource-speed',
          severity: 'high',
          issue: `${slowResources.length} resources take longer than 3s to load`,
          recommendations: [
            'Use CDN for static assets',
            'Optimize server response times',
            'Implement resource preloading',
            'Use HTTP/2 server push',
            'Reduce DNS lookups'
          ],
          details: slowResources.map(r => ({ name: r.name, duration: r.duration }))
        });
      }
    }
  }

  async analyzeBackendPerformance(data) {
    if (!data || !data.summary) return;
    
    const summary = data.summary;
    
    // Analyze response times
    if (summary.averageResponseTime > 500) {
      this.optimizations.backend.push({
        type: 'response-time',
        severity: summary.averageResponseTime > 1000 ? 'high' : 'medium',
        issue: `Average response time is ${summary.averageResponseTime}ms`,
        recommendations: [
          'Implement database query optimization',
          'Add response caching',
          'Use database connection pooling',
          'Optimize API endpoints',
          'Implement request rate limiting'
        ]
      });
    }
    
    if (summary.p95ResponseTime > 2000) {
      this.optimizations.backend.push({
        type: 'p95-response-time',
        severity: 'high',
        issue: `95th percentile response time is ${summary.p95ResponseTime}ms`,
        recommendations: [
          'Identify and optimize slow endpoints',
          'Implement background job processing',
          'Add database indexing',
          'Use async processing for heavy operations',
          'Implement circuit breakers'
        ]
      });
    }
    
    // Analyze error rates
    if (summary.errorRate > 0.05) { // > 5%
      this.optimizations.backend.push({
        type: 'error-rate',
        severity: 'high',
        issue: `Error rate is ${(summary.errorRate * 100).toFixed(2)}%`,
        recommendations: [
          'Implement better error handling',
          'Add request validation',
          'Monitor and fix failing endpoints',
          'Implement retry mechanisms',
          'Add comprehensive logging'
        ]
      });
    }
    
    // Analyze system resources
    if (data.system) {
      if (data.system.memory.usage > 0.8) {
        this.optimizations.backend.push({
          type: 'memory-usage',
          severity: 'high',
          issue: `Memory usage is ${(data.system.memory.usage * 100).toFixed(2)}%`,
          recommendations: [
            'Implement memory leak detection',
            'Optimize data structures',
            'Add garbage collection tuning',
            'Implement object pooling',
            'Scale horizontally'
          ]
        });
      }
    }
  }

  async analyzeDatabasePerformance(data) {
    if (!data) return;
    
    // Analyze connection usage
    if (data.connections && data.connections.current > data.connections.available * 0.8) {
      this.optimizations.database.push({
        type: 'connection-pool',
        severity: 'medium',
        issue: 'Database connection pool is near capacity',
        recommendations: [
          'Increase connection pool size',
          'Optimize query execution time',
          'Implement connection pooling',
          'Add read replicas',
          'Optimize database queries'
        ]
      });
    }
    
    // Analyze operation counters
    if (data.opcounters) {
      const totalOps = Object.values(data.opcounters).reduce((a, b) => a + b, 0);
      if (totalOps > 10000) { // High operation volume
        this.optimizations.database.push({
          type: 'operation-volume',
          severity: 'medium',
          issue: `High database operation volume: ${totalOps} ops`,
          recommendations: [
            'Implement query result caching',
            'Add database indexing',
            'Optimize frequent queries',
            'Implement read replicas',
            'Use aggregation pipelines'
          ]
        });
      }
    }
  }

  generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.getTotalIssues(),
        highSeverity: this.getIssuesBySeverity('high').length,
        mediumSeverity: this.getIssuesBySeverity('medium').length,
        lowSeverity: this.getIssuesBySeverity('low').length
      },
      optimizations: this.optimizations,
      prioritizedActions: this.getPrioritizedActions(),
      automatedFixes: this.getAutomatedFixes()
    };
    
    return report;
  }

  getTotalIssues() {
    return Object.values(this.optimizations)
      .reduce((total, category) => total + category.length, 0);
  }

  getIssuesBySeverity(severity) {
    return Object.values(this.optimizations)
      .flat()
      .filter(issue => issue.severity === severity);
  }

  getPrioritizedActions() {
    const allIssues = Object.values(this.optimizations).flat();
    
    // Sort by severity (high > medium > low)
    const severityOrder = { high: 3, medium: 2, low: 1 };
    
    return allIssues
      .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
      .slice(0, 10) // Top 10 priority items
      .map(issue => ({
        category: this.getCategoryForIssue(issue),
        type: issue.type,
        severity: issue.severity,
        issue: issue.issue,
        topRecommendation: issue.recommendations[0]
      }));
  }

  getCategoryForIssue(issue) {
    for (const [category, issues] of Object.entries(this.optimizations)) {
      if (issues.includes(issue)) return category;
    }
    return 'unknown';
  }

  getAutomatedFixes() {
    const fixes = [];
    
    // Frontend automated fixes
    this.optimizations.frontend.forEach(issue => {
      if (issue.type === 'resource-size') {
        fixes.push({
          category: 'frontend',
          action: 'compress-assets',
          description: 'Automatically compress images and assets',
          script: 'npm run optimize:images'
        });
      }
    });
    
    // Backend automated fixes
    this.optimizations.backend.forEach(issue => {
      if (issue.type === 'response-time') {
        fixes.push({
          category: 'backend',
          action: 'enable-caching',
          description: 'Enable response caching for static endpoints',
          script: 'node scripts/enable-caching.js'
        });
      }
    });
    
    return fixes;
  }

  async saveReport(report) {
    const filename = `optimization-report-${Date.now()}.json`;
    const filepath = path.join(this.options.reportPath, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`📊 Optimization report saved: ${filepath}`);
    
    return filepath;
  }

  async applyAutomatedFixes(report) {
    console.log('🔧 Applying automated fixes...');
    
    for (const fix of report.automatedFixes) {
      try {
        console.log(`Applying: ${fix.description}`);
        // Here you would implement the actual fix logic
        // For now, just log what would be done
        console.log(`Would run: ${fix.script}`);
      } catch (error) {
        console.error(`Failed to apply fix ${fix.action}:`, error.message);
      }
    }
  }
}

module.exports = AutoOptimizer;
EOF

print_success "Auto-optimizer created"

log "Performance optimization scripts created successfully"
echo

print_status "Creating performance optimization runner script..."

# Create main optimization runner
cat > "$SCRIPTS_DIR/run-optimization.sh" << 'EOF'
#!/bin/bash

# Performance Optimization Runner
# Collects performance data and runs optimization analysis

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
REPORT_DIR="./performance/reports"
CONFIG_DIR="./performance/config"

# Ensure directories exist
mkdir -p "$REPORT_DIR" "$CONFIG_DIR"

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

print_status "Starting performance optimization analysis..."

# Function to collect backend performance data
collect_backend_metrics() {
    print_status "Collecting backend performance metrics..."
    
    local metrics_file="$REPORT_DIR/backend-metrics-$(date +%s).json"
    
    # Try to get metrics from API
    if curl -s "$API_BASE_URL/api/performance/metrics" > "$metrics_file" 2>/dev/null; then
        print_success "Backend metrics collected"
        echo "$metrics_file"
    else
        print_warning "Could not collect backend metrics from API"
        echo ""
    fi
}

# Function to run frontend performance test
run_frontend_performance_test() {
    print_status "Running frontend performance test..."
    
    local lighthouse_report="$REPORT_DIR/lighthouse-$(date +%s).json"
    
    # Check if Lighthouse is available
    if command -v lighthouse >/dev/null 2>&1; then
        print_status "Running Lighthouse audit..."
        
        lighthouse "$FRONTEND_URL" \
            --output=json \
            --output-path="$lighthouse_report" \
            --chrome-flags="--headless --no-sandbox" \
            --quiet 2>/dev/null
        
        if [ -f "$lighthouse_report" ]; then
            print_success "Lighthouse audit completed"
            echo "$lighthouse_report"
        else
            print_warning "Lighthouse audit failed"
            echo ""
        fi
    else
        print_warning "Lighthouse not installed. Install with: npm install -g lighthouse"
        echo ""
    fi
}

# Function to analyze database performance
analyze_database_performance() {
    print_status "Analyzing database performance..."
    
    local db_report="$REPORT_DIR/database-analysis-$(date +%s).json"
    
    # Create a simple database analysis script
    cat > "/tmp/db-analysis.js" << 'DBEOF'
const mongoose = require('mongoose');

async function analyzeDatabasePerformance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devdeck');
        
        const admin = mongoose.connection.db.admin();
        const serverStatus = await admin.serverStatus();
        const dbStats = await mongoose.connection.db.stats();
        
        const analysis = {
            timestamp: new Date().toISOString(),
            serverStatus: {
                connections: serverStatus.connections,
                opcounters: serverStatus.opcounters,
                memory: serverStatus.mem,
                uptime: serverStatus.uptime
            },
            dbStats: {
                collections: dbStats.collections,
                dataSize: dbStats.dataSize,
                indexSize: dbStats.indexSize,
                storageSize: dbStats.storageSize
            }
        };
        
        console.log(JSON.stringify(analysis, null, 2));
        
    } catch (error) {
        console.error('Database analysis failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

analyzeDatabasePerformance();
DBEOF
    
    # Run database analysis if Node.js and mongoose are available
    if command -v node >/dev/null 2>&1 && [ -f "package.json" ]; then
        if node "/tmp/db-analysis.js" > "$db_report" 2>/dev/null; then
            print_success "Database analysis completed"
            echo "$db_report"
        else
            print_warning "Database analysis failed"
            echo ""
        fi
    else
        print_warning "Node.js not available for database analysis"
        echo ""
    fi
    
    # Cleanup
    rm -f "/tmp/db-analysis.js"
}

# Function to run optimization analysis
run_optimization_analysis() {
    local backend_metrics="$1"
    local frontend_metrics="$2"
    local database_metrics="$3"
    
    print_status "Running optimization analysis..."
    
    local analysis_script="/tmp/run-analysis.js"
    local optimization_report="$REPORT_DIR/optimization-report-$(date +%s).json"
    
    # Create analysis script
    cat > "$analysis_script" << 'ANALYSISEOF'
const AutoOptimizer = require('./performance/optimizers/auto-optimizer');
const fs = require('fs');

async function runAnalysis() {
    const optimizer = new AutoOptimizer();
    
    const performanceData = {
        frontend: null,
        backend: null,
        database: null
    };
    
    // Load backend metrics
    if (process.argv[2] && fs.existsSync(process.argv[2])) {
        try {
            performanceData.backend = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
        } catch (error) {
            console.warn('Failed to load backend metrics:', error.message);
        }
    }
    
    // Load frontend metrics (Lighthouse report)
    if (process.argv[3] && fs.existsSync(process.argv[3])) {
        try {
            const lighthouse = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
            performanceData.frontend = {
                vitals: {
                    lcp: lighthouse.audits['largest-contentful-paint']?.numericValue,
                    fid: lighthouse.audits['max-potential-fid']?.numericValue,
                    cls: lighthouse.audits['cumulative-layout-shift']?.numericValue,
                    fcp: lighthouse.audits['first-contentful-paint']?.numericValue
                },
                performance: lighthouse.categories.performance?.score * 100,
                opportunities: lighthouse.audits
            };
        } catch (error) {
            console.warn('Failed to load frontend metrics:', error.message);
        }
    }
    
    // Load database metrics
    if (process.argv[4] && fs.existsSync(process.argv[4])) {
        try {
            performanceData.database = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
        } catch (error) {
            console.warn('Failed to load database metrics:', error.message);
        }
    }
    
    // Run analysis
    const report = await optimizer.analyze(performanceData);
    
    // Save report
    const reportPath = process.argv[5] || './optimization-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('Optimization analysis completed!');
    console.log(`Report saved: ${reportPath}`);
    
    // Print summary
    console.log('\n=== OPTIMIZATION SUMMARY ===');
    console.log(`Total issues found: ${report.summary.totalIssues}`);
    console.log(`High severity: ${report.summary.highSeverity}`);
    console.log(`Medium severity: ${report.summary.mediumSeverity}`);
    console.log(`Low severity: ${report.summary.lowSeverity}`);
    
    if (report.prioritizedActions.length > 0) {
        console.log('\n=== TOP PRIORITY ACTIONS ===');
        report.prioritizedActions.slice(0, 5).forEach((action, index) => {
            console.log(`${index + 1}. [${action.severity.toUpperCase()}] ${action.issue}`);
            console.log(`   Recommendation: ${action.topRecommendation}`);
        });
    }
    
    if (report.automatedFixes.length > 0) {
        console.log('\n=== AUTOMATED FIXES AVAILABLE ===');
        report.automatedFixes.forEach(fix => {
            console.log(`- ${fix.description}`);
            console.log(`  Command: ${fix.script}`);
        });
    }
}

runAnalysis().catch(console.error);
ANALYSISEOF
    
    # Run analysis if the optimizer exists
    if [ -f "./performance/optimizers/auto-optimizer.js" ] && command -v node >/dev/null 2>&1; then
        if node "$analysis_script" "$backend_metrics" "$frontend_metrics" "$database_metrics" "$optimization_report" 2>/dev/null; then
            print_success "Optimization analysis completed"
            echo "$optimization_report"
        else
            print_warning "Optimization analysis failed"
            echo ""
        fi
    else
        print_warning "Auto-optimizer not available"
        echo ""
    fi
    
    # Cleanup
    rm -f "$analysis_script"
}

# Function to generate performance report
generate_performance_report() {
    local optimization_report="$1"
    
    print_status "Generating performance report..."
    
    local html_report="$REPORT_DIR/performance-report-$(date +%s).html"
    
    cat > "$html_report" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric.warning { border-left-color: #ffc107; }
        .metric.error { border-left-color: #dc3545; }
        .metric.success { border-left-color: #28a745; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge.high { background: #dc3545; color: white; }
        .badge.medium { background: #ffc107; color: black; }
        .badge.low { background: #28a745; color: white; }
        .recommendations { list-style: none; padding: 0; }
        .recommendations li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .recommendations li:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DevDeck Performance Report</h1>
            <p>Generated on: <span id="timestamp"></span></p>
        </div>
        <div class="content">
            <div id="report-content">
                <p>Loading performance data...</p>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // This would be populated with actual report data
        const reportData = {
            summary: { totalIssues: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 },
            optimizations: { frontend: [], backend: [], database: [], infrastructure: [] },
            prioritizedActions: []
        };
        
        function renderReport(data) {
            const content = document.getElementById('report-content');
            
            content.innerHTML = `
                <div class="grid">
                    <div class="card">
                        <h3>📊 Summary</h3>
                        <div class="metric ${data.summary.totalIssues > 0 ? 'warning' : 'success'}">
                            <strong>Total Issues: ${data.summary.totalIssues}</strong>
                        </div>
                        <div class="metric error">
                            <strong>High Severity: ${data.summary.highSeverity}</strong>
                        </div>
                        <div class="metric warning">
                            <strong>Medium Severity: ${data.summary.mediumSeverity}</strong>
                        </div>
                        <div class="metric success">
                            <strong>Low Severity: ${data.summary.lowSeverity}</strong>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🎯 Priority Actions</h3>
                        ${data.prioritizedActions.length > 0 ? 
                            data.prioritizedActions.slice(0, 5).map(action => `
                                <div class="metric">
                                    <span class="badge ${action.severity}">${action.severity.toUpperCase()}</span>
                                    <strong>${action.issue}</strong>
                                    <p>${action.topRecommendation}</p>
                                </div>
                            `).join('') : 
                            '<p>No priority actions needed. Great job! 🎉</p>'
                        }
                    </div>
                </div>
                
                <div class="grid">
                    ${Object.entries(data.optimizations).map(([category, issues]) => `
                        <div class="card">
                            <h3>🔧 ${category.charAt(0).toUpperCase() + category.slice(1)} Optimizations</h3>
                            ${issues.length > 0 ? 
                                issues.map(issue => `
                                    <div class="metric">
                                        <span class="badge ${issue.severity}">${issue.severity.toUpperCase()}</span>
                                        <strong>${issue.issue}</strong>
                                        <ul class="recommendations">
                                            ${issue.recommendations.slice(0, 3).map(rec => `<li>• ${rec}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('') : 
                                '<p>No issues found in this category. ✅</p>'
                            }
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        renderReport(reportData);
    </script>
</body>
</html>
HTMLEOF
    
    print_success "Performance report generated: $html_report"
    echo "$html_report"
}

# Main execution
main() {
    echo "🚀 DevDeck Performance Optimization"
    echo "===================================="
    echo
    
    # Collect performance data
    backend_metrics=$(collect_backend_metrics)
    frontend_metrics=$(run_frontend_performance_test)
    database_metrics=$(analyze_database_performance)
    
    echo
    print_status "Performance data collection completed"
    
    # Run optimization analysis
    optimization_report=$(run_optimization_analysis "$backend_metrics" "$frontend_metrics" "$database_metrics")
    
    # Generate HTML report
    if [ -n "$optimization_report" ]; then
        html_report=$(generate_performance_report "$optimization_report")
        
        echo
        print_success "Performance optimization analysis completed!"
        echo
        print_status "Reports generated:"
        [ -n "$optimization_report" ] && echo "  📊 Optimization Report: $optimization_report"
        [ -n "$html_report" ] && echo "  📄 HTML Report: $html_report"
        [ -n "$backend_metrics" ] && echo "  🔧 Backend Metrics: $backend_metrics"
        [ -n "$frontend_metrics" ] && echo "  🎨 Frontend Metrics: $frontend_metrics"
        [ -n "$database_metrics" ] && echo "  🗄️  Database Metrics: $database_metrics"
        
        echo
        print_status "Next steps:"
        echo "  1. Review the optimization report"
        echo "  2. Implement high-priority recommendations"
        echo "  3. Run automated fixes if available"
        echo "  4. Schedule regular performance monitoring"
        
        # Open HTML report if possible
        if command -v open >/dev/null 2>&1 && [ -n "$html_report" ]; then
            echo
            print_status "Opening performance report in browser..."
            open "$html_report"
        fi
    else
        print_warning "No optimization report generated"
    fi
}

# Run main function
main "$@"
EOF

chmod +x "$SCRIPTS_DIR/run-optimization.sh"

print_success "Performance optimization runner created"

log "Performance optimization runner script created successfully"
echo

print_status "Creating performance configuration files..."

# Create optimization configuration
cat > "$CONFIG_DIR/optimization.json" << 'EOF'
{
  "thresholds": {
    "frontend": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "fcp": 1800,
      "resourceSize": 1000000,
      "resourceDuration": 3000
    },
    "backend": {
      "averageResponseTime": 500,
      "p95ResponseTime": 2000,
      "errorRate": 0.05,
      "memoryUsage": 0.8,
      "cpuUsage": 0.8
    },
    "database": {
      "connectionUsage": 0.8,
      "operationVolume": 10000,
      "queryDuration": 1000
    }
  },
  "monitoring": {
    "sampleRate": 0.1,
    "reportInterval": 3600,
    "alertThresholds": {
      "criticalResponseTime": 5000,
      "criticalErrorRate": 0.1,
      "criticalMemoryUsage": 0.9
    }
  },
  "optimization": {
    "autoFix": {
      "enabled": true,
      "safeMode": true,
      "allowedFixes": [
        "compress-assets",
        "enable-caching",
        "optimize-images",
        "minify-resources"
      ]
    },
    "scheduling": {
      "dailyAnalysis": "02:00",
      "weeklyReport": "MON 09:00",
      "monthlyOptimization": "1 03:00"
    }
  }
}
EOF

print_success "Optimization configuration created"

# Create performance budget configuration
cat > "$CONFIG_DIR/performance-budget.json" << 'EOF'
{
  "budgets": {
    "timing": {
      "firstContentfulPaint": 1800,
      "largestContentfulPaint": 2500,
      "firstInputDelay": 100,
      "cumulativeLayoutShift": 0.1,
      "timeToInteractive": 3800,
      "speedIndex": 3000
    },
    "resources": {
      "totalSize": 5000000,
      "imageSize": 2000000,
      "scriptSize": 1000000,
      "stylesheetSize": 500000,
      "fontSize": 300000,
      "documentSize": 100000,
      "mediaSize": 1000000,
      "thirdPartySize": 500000
    },
    "counts": {
      "totalRequests": 100,
      "imageRequests": 30,
      "scriptRequests": 20,
      "stylesheetRequests": 10,
      "fontRequests": 5,
      "thirdPartyRequests": 10
    }
  },
  "alerts": {
    "warningThreshold": 0.8,
    "errorThreshold": 1.2,
    "notifications": {
      "email": true,
      "slack": true,
      "webhook": true
    }
  }
}
EOF

print_success "Performance budget configuration created"

# Create automated optimization scripts
print_status "Creating automated optimization scripts..."

# Create image optimization script
cat > "$OPTIMIZERS_DIR/optimize-images.sh" << 'EOF'
#!/bin/bash

# Automated Image Optimization Script
# Optimizes images for better performance

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Configuration
SOURCE_DIR="${1:-./public/images}"
OUTPUT_DIR="${2:-./public/images/optimized}"
QUALITY="${3:-80}"
MAX_WIDTH="${4:-1920}"
MAX_HEIGHT="${5:-1080}"

print_status "Starting image optimization..."
print_status "Source: $SOURCE_DIR"
print_status "Output: $OUTPUT_DIR"
print_status "Quality: $QUALITY%"
print_status "Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Statistics
total_files=0
optimized_files=0
total_original_size=0
total_optimized_size=0

# Function to optimize image
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local file_ext="${input_file##*.}"
    
    case "${file_ext,,}" in
        jpg|jpeg)
            if command -v jpegoptim >/dev/null 2>&1; then
                jpegoptim --max="$QUALITY" --strip-all --overwrite "$input_file"
                cp "$input_file" "$output_file"
            elif command -v convert >/dev/null 2>&1; then
                convert "$input_file" -quality "$QUALITY" -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "No JPEG optimizer available, copied original"
            fi
            ;;
        png)
            if command -v optipng >/dev/null 2>&1; then
                optipng -o2 "$input_file"
                cp "$input_file" "$output_file"
            elif command -v convert >/dev/null 2>&1; then
                convert "$input_file" -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "No PNG optimizer available, copied original"
            fi
            ;;
        webp)
            if command -v cwebp >/dev/null 2>&1; then
                cwebp -q "$QUALITY" "$input_file" -o "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "WebP optimizer not available, copied original"
            fi
            ;;
        svg)
            if command -v svgo >/dev/null 2>&1; then
                svgo "$input_file" -o "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "SVG optimizer not available, copied original"
            fi
            ;;
        *)
            cp "$input_file" "$output_file"
            print_warning "Unsupported format: $file_ext"
            ;;
    esac
}

# Process images
if [ -d "$SOURCE_DIR" ]; then
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        output_file="$OUTPUT_DIR/$filename"
        
        # Get file sizes
        if [ -f "$file" ]; then
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            total_original_size=$((total_original_size + original_size))
            total_files=$((total_files + 1))
            
            print_status "Optimizing: $filename"
            optimize_image "$file" "$output_file"
            
            if [ -f "$output_file" ]; then
                optimized_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo 0)
                total_optimized_size=$((total_optimized_size + optimized_size))
                optimized_files=$((optimized_files + 1))
                
                # Calculate savings
                if [ "$original_size" -gt 0 ]; then
                    savings=$((100 - (optimized_size * 100 / original_size)))
                    print_success "Optimized $filename (${savings}% smaller)"
                fi
            fi
        fi
    done < <(find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.svg" \) -print0)
else
    print_warning "Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Generate report
print_status "Optimization completed!"
echo
print_status "Summary:"
echo "  📁 Total files processed: $total_files"
echo "  ✅ Successfully optimized: $optimized_files"

if [ "$total_original_size" -gt 0 ] && [ "$total_optimized_size" -gt 0 ]; then
    total_savings=$((100 - (total_optimized_size * 100 / total_original_size)))
    original_mb=$((total_original_size / 1024 / 1024))
    optimized_mb=$((total_optimized_size / 1024 / 1024))
    saved_mb=$((original_mb - optimized_mb))
    
    echo "  📊 Original size: ${original_mb}MB"
    echo "  📉 Optimized size: ${optimized_mb}MB"
    echo "  💾 Space saved: ${saved_mb}MB (${total_savings}%)"
fi

echo
print_status "Optimized images saved to: $OUTPUT_DIR"

# Generate optimization report
report_file="./performance/reports/image-optimization-$(date +%s).json"
cat > "$report_file" << REPORTEOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "$SOURCE_DIR",
  "output": "$OUTPUT_DIR",
  "settings": {
    "quality": $QUALITY,
    "maxWidth": $MAX_WIDTH,
    "maxHeight": $MAX_HEIGHT
  },
  "results": {
    "totalFiles": $total_files,
    "optimizedFiles": $optimized_files,
    "originalSize": $total_original_size,
    "optimizedSize": $total_optimized_size,
    "spaceSaved": $((total_original_size - total_optimized_size)),
    "percentageSaved": $total_savings
  }
}
REPORTEOF

print_success "Optimization report saved: $report_file"
EOF

chmod +x "$OPTIMIZERS_DIR/optimize-images.sh"

print_success "Image optimization script created"

# Create bundle analyzer script
cat > "$OPTIMIZERS_DIR/analyze-bundles.js" << 'EOF'
// Bundle Analyzer Script
// Analyzes JavaScript and CSS bundles for optimization opportunities

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor(options = {}) {
    this.options = {
      buildDir: options.buildDir || './build',
      distDir: options.distDir || './dist',
      reportDir: options.reportDir || './performance/reports',
      ...options
    };
    
    this.analysis = {
      bundles: [],
      recommendations: [],
      metrics: {}
    };
  }

  async analyze() {
    console.log('🔍 Analyzing JavaScript and CSS bundles...');
    
    await this.analyzeBuildDirectory();
    await this.analyzeChunks();
    await this.analyzeDependencies();
    await this.generateRecommendations();
    
    return this.generateReport();
  }

  async analyzeBuildDirectory() {
    const buildDirs = [this.options.buildDir, this.options.distDir].filter(dir => 
      fs.existsSync(dir)
    );
    
    for (const dir of buildDirs) {
      await this.scanDirectory(dir);
    }
  }

  async scanDirectory(directory) {
    const files = this.getAllFiles(directory);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const stats = fs.statSync(file);
      
      if (['.js', '.css', '.map'].includes(ext)) {
        const bundle = {
          path: file,
          name: path.basename(file),
          type: ext.slice(1),
          size: stats.size,
          gzipSize: await this.getGzipSize(file),
          isChunk: this.isChunkFile(file),
          isVendor: this.isVendorFile(file),
          analysis: await this.analyzeFile(file)
        };
        
        this.analysis.bundles.push(bundle);
      }
    }
  }

  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async getGzipSize(filePath) {
    try {
      const gzipCommand = `gzip -c "${filePath}" | wc -c`;
      const result = execSync(gzipCommand, { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      return 0;
    }
  }

  isChunkFile(filePath) {
    const filename = path.basename(filePath);
    return /\.(chunk|[0-9a-f]{8})\.(js|css)$/.test(filename);
  }

  isVendorFile(filePath) {
    const filename = path.basename(filePath);
    return /vendor|node_modules/.test(filename) || /vendors~/.test(filename);
  }

  async analyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      lines: content.split('\n').length,
      minified: this.isMinified(content),
      sourceMap: fs.existsSync(filePath + '.map')
    };
    
    if (ext === '.js') {
      analysis.dependencies = this.extractJSDependencies(content);
      analysis.duplicates = this.findDuplicateCode(content);
    } else if (ext === '.css') {
      analysis.rules = this.countCSSRules(content);
      analysis.unused = this.findUnusedCSS(content);
    }
    
    return analysis;
  }

  isMinified(content) {
    const lines = content.split('\n');
    const avgLineLength = content.length / lines.length;
    return avgLineLength > 100 && lines.length < 50;
  }

  extractJSDependencies(content) {
    const imports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    
    return {
      imports: imports.length,
      requires: requires.length,
      external: [...imports, ...requires].filter(dep => 
        !dep.includes('./') && !dep.includes('../')
      ).length
    };
  }

  findDuplicateCode(content) {
    // Simple duplicate detection - look for repeated function patterns
    const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g) || [];
    const duplicates = [];
    
    for (let i = 0; i < functions.length; i++) {
      for (let j = i + 1; j < functions.length; j++) {
        if (functions[i] === functions[j]) {
          duplicates.push(functions[i]);
        }
      }
    }
    
    return duplicates.length;
  }

  countCSSRules(content) {
    const rules = content.match(/[^{}]+\{[^}]*\}/g) || [];
    return rules.length;
  }

  findUnusedCSS(content) {
    // Basic unused CSS detection - this would need more sophisticated analysis
    const selectors = content.match(/[^{}]+(?=\{)/g) || [];
    return {
      totalSelectors: selectors.length,
      potentiallyUnused: selectors.filter(sel => 
        sel.includes(':hover') || sel.includes(':focus')
      ).length
    };
  }

  async analyzeChunks() {
    const jsChunks = this.analysis.bundles.filter(b => b.type === 'js' && b.isChunk);
    const cssChunks = this.analysis.bundles.filter(b => b.type === 'css' && b.isChunk);
    
    this.analysis.metrics.chunks = {
      total: jsChunks.length + cssChunks.length,
      js: jsChunks.length,
      css: cssChunks.length,
      averageSize: this.calculateAverageSize(jsChunks.concat(cssChunks)),
      largestChunk: this.findLargestBundle(jsChunks.concat(cssChunks))
    };
  }

  async analyzeDependencies() {
    const packageJsonPath = './package.json';
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      
      this.analysis.metrics.dependencies = {
        total: dependencies.length + devDependencies.length,
        production: dependencies.length,
        development: devDependencies.length,
        heavyDependencies: this.identifyHeavyDependencies(dependencies)
      };
    }
  }

  identifyHeavyDependencies(dependencies) {
    // List of known heavy dependencies
    const heavyDeps = [
      'moment', 'lodash', 'jquery', 'bootstrap', 'material-ui',
      'antd', 'react-router-dom', 'axios', 'chart.js'
    ];
    
    return dependencies.filter(dep => heavyDeps.includes(dep));
  }

  calculateAverageSize(bundles) {
    if (bundles.length === 0) return 0;
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    return Math.round(totalSize / bundles.length);
  }

  findLargestBundle(bundles) {
    return bundles.reduce((largest, current) => 
      current.size > (largest?.size || 0) ? current : largest, null
    );
  }

  async generateRecommendations() {
    const recommendations = [];
    
    // Large bundle recommendations
    const largeBundles = this.analysis.bundles.filter(b => b.size > 1000000); // > 1MB
    if (largeBundles.length > 0) {
      recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        title: 'Large Bundle Detected',
        description: `${largeBundles.length} bundles are larger than 1MB`,
        suggestions: [
          'Implement code splitting',
          'Use dynamic imports for large components',
          'Remove unused dependencies',
          'Enable tree shaking',
          'Use bundle analyzer to identify heavy modules'
        ],
        bundles: largeBundles.map(b => ({ name: b.name, size: b.size }))
      });
    }
    
    // Unminified code recommendations
    const unminified = this.analysis.bundles.filter(b => !b.analysis.minified);
    if (unminified.length > 0) {
      recommendations.push({
        type: 'minification',
        severity: 'medium',
        title: 'Unminified Code Detected',
        description: `${unminified.length} files are not minified`,
        suggestions: [
          'Enable minification in build process',
          'Use Terser for JavaScript minification',
          'Use cssnano for CSS minification',
          'Remove console.log statements',
          'Enable dead code elimination'
        ]
      });
    }
    
    // Too many chunks
    if (this.analysis.metrics.chunks?.total > 20) {
      recommendations.push({
        type: 'chunk-count',
        severity: 'medium',
        title: 'Too Many Chunks',
        description: `${this.analysis.metrics.chunks.total} chunks detected`,
        suggestions: [
          'Optimize chunk splitting strategy',
          'Combine small chunks',
          'Use vendor chunk for common dependencies',
          'Implement intelligent code splitting',
          'Review webpack/bundler configuration'
        ]
      });
    }
    
    // Heavy dependencies
    const heavyDeps = this.analysis.metrics.dependencies?.heavyDependencies || [];
    if (heavyDeps.length > 0) {
      recommendations.push({
        type: 'dependencies',
        severity: 'medium',
        title: 'Heavy Dependencies Detected',
        description: `Found ${heavyDeps.length} potentially heavy dependencies`,
        suggestions: [
          'Consider lighter alternatives',
          'Use tree shaking to reduce bundle size',
          'Import only needed modules',
          'Evaluate if all dependencies are necessary',
          'Use dynamic imports for heavy libraries'
        ],
        dependencies: heavyDeps
      });
    }
    
    this.analysis.recommendations = recommendations;
  }

  generateReport() {
    const totalSize = this.analysis.bundles.reduce((sum, b) => sum + b.size, 0);
    const totalGzipSize = this.analysis.bundles.reduce((sum, b) => sum + b.gzipSize, 0);
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalBundles: this.analysis.bundles.length,
        totalSize,
        totalGzipSize,
        compressionRatio: totalSize > 0 ? (totalGzipSize / totalSize) : 0,
        averageBundleSize: this.calculateAverageSize(this.analysis.bundles),
        largestBundle: this.findLargestBundle(this.analysis.bundles)
      },
      bundles: this.analysis.bundles,
      metrics: this.analysis.metrics,
      recommendations: this.analysis.recommendations,
      optimizationPotential: this.calculateOptimizationPotential()
    };
  }

  calculateOptimizationPotential() {
    const unminifiedSize = this.analysis.bundles
      .filter(b => !b.analysis.minified)
      .reduce((sum, b) => sum + b.size, 0);
    
    const largeChunkSize = this.analysis.bundles
      .filter(b => b.size > 500000) // > 500KB
      .reduce((sum, b) => sum + b.size, 0);
    
    return {
      minificationSavings: Math.round(unminifiedSize * 0.3), // Estimate 30% savings
      chunkOptimizationSavings: Math.round(largeChunkSize * 0.2), // Estimate 20% savings
      totalPotentialSavings: Math.round((unminifiedSize * 0.3) + (largeChunkSize * 0.2))
    };
  }

  async saveReport(report) {
    const filename = `bundle-analysis-${Date.now()}.json`;
    const filepath = path.join(this.options.reportDir, filename);
    
    // Ensure report directory exists
    if (!fs.existsSync(this.options.reportDir)) {
      fs.mkdirSync(this.options.reportDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📊 Bundle analysis report saved: ${filepath}`);
    
    return filepath;
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer({
    buildDir: process.argv[2] || './build',
    distDir: process.argv[3] || './dist'
  });
  
  analyzer.analyze()
    .then(report => {
      console.log('\n=== BUNDLE ANALYSIS SUMMARY ===');
      console.log(`Total bundles: ${report.summary.totalBundles}`);
      console.log(`Total size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Gzipped size: ${(report.summary.totalGzipSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compression ratio: ${(report.summary.compressionRatio * 100).toFixed(1)}%`);
      
      if (report.recommendations.length > 0) {
        console.log('\n=== RECOMMENDATIONS ===');
        report.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.severity.toUpperCase()}] ${rec.title}`);
          console.log(`   ${rec.description}`);
          console.log(`   Top suggestion: ${rec.suggestions[0]}`);
        });
      }
      
      console.log('\n=== OPTIMIZATION POTENTIAL ===');
      const potential = report.optimizationPotential;
      console.log(`Minification savings: ${(potential.minificationSavings / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Chunk optimization savings: ${(potential.chunkOptimizationSavings / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Total potential savings: ${(potential.totalPotentialSavings / 1024 / 1024).toFixed(2)}MB`);
      
      return analyzer.saveReport(report);
    })
    .catch(console.error);
}

module.exports = BundleAnalyzer;
EOF

print_success "Bundle analyzer script created"

# Create caching optimization script
cat > "$OPTIMIZERS_DIR/optimize-caching.js" << 'EOF'
// Caching Optimization Script
// Analyzes and optimizes caching strategies

const fs = require('fs');
const path = require('path');

class CachingOptimizer {
  constructor(options = {}) {
    this.options = {
      staticDir: options.staticDir || './public',
      buildDir: options.buildDir || './build',
      configFile: options.configFile || './performance/config/caching.json',
      ...options
    };
    
    this.cacheStrategies = {
      immutable: [], // Files with hash in name
      longTerm: [], // Rarely changing files
      shortTerm: [], // Frequently changing files
      noCache: [] // Files that shouldn't be cached
    };
  }

  async optimize() {
    console.log('🔧 Optimizing caching strategies...');
    
    await this.analyzeFiles();
    await this.generateCacheHeaders();
    await this.createServiceWorker();
    await this.generateNginxConfig();
    
    return this.generateReport();
  }

  async analyzeFiles() {
    const directories = [this.options.staticDir, this.options.buildDir]
      .filter(dir => fs.existsSync(dir));
    
    for (const dir of directories) {
      await this.scanDirectory(dir);
    }
  }

  async scanDirectory(directory) {
    const files = this.getAllFiles(directory);
    
    for (const file of files) {
      const relativePath = path.relative(directory, file);
      const ext = path.extname(file).toLowerCase();
      const filename = path.basename(file);
      const stats = fs.statSync(file);
      
      const fileInfo = {
        path: relativePath,
        fullPath: file,
        name: filename,
        ext,
        size: stats.size,
        mtime: stats.mtime,
        hasHash: this.hasHashInFilename(filename)
      };
      
      this.categorizeFile(fileInfo);
    }
  }

  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  hasHashInFilename(filename) {
    // Check for hash patterns in filename
    return /\.[a-f0-9]{8,}\./i.test(filename) || 
           /\.(chunk|[0-9a-f]{8})\./i.test(filename);
  }

  categorizeFile(fileInfo) {
    const { ext, hasHash, name, path: filePath } = fileInfo;
    
    // Files with hash - can be cached indefinitely
    if (hasHash) {
      this.cacheStrategies.immutable.push({
        ...fileInfo,
        cacheControl: 'public, max-age=31536000, immutable', // 1 year
        reason: 'File has hash in name, content-based versioning'
      });
      return;
    }
    
    // Static assets - long-term caching
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', 
         '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
      this.cacheStrategies.longTerm.push({
        ...fileInfo,
        cacheControl: 'public, max-age=2592000', // 30 days
        reason: 'Static asset, rarely changes'
      });
      return;
    }
    
    // CSS and JS without hash - medium-term caching
    if (['.css', '.js'].includes(ext)) {
      this.cacheStrategies.shortTerm.push({
        ...fileInfo,
        cacheControl: 'public, max-age=86400', // 1 day
        reason: 'CSS/JS without hash, may change with deployments'
      });
      return;
    }
    
    // HTML files - short caching with revalidation
    if (ext === '.html' || name === 'index.html') {
      this.cacheStrategies.shortTerm.push({
        ...fileInfo,
        cacheControl: 'public, max-age=3600, must-revalidate', // 1 hour
        reason: 'HTML file, needs frequent updates'
      });
      return;
    }
    
    // API responses and dynamic content - no cache
    if (filePath.includes('/api/') || ext === '.json') {
      this.cacheStrategies.noCache.push({
        ...fileInfo,
        cacheControl: 'no-cache, no-store, must-revalidate',
        reason: 'Dynamic content or API response'
      });
      return;
    }
    
    // Default to short-term caching
    this.cacheStrategies.shortTerm.push({
      ...fileInfo,
      cacheControl: 'public, max-age=3600', // 1 hour
      reason: 'Default caching strategy'
    });
  }

  async generateCacheHeaders() {
    const headers = {
      timestamp: new Date().toISOString(),
      strategies: {}
    };
    
    // Generate headers for each strategy
    Object.entries(this.cacheStrategies).forEach(([strategy, files]) => {
      headers.strategies[strategy] = {
        count: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        patterns: this.generatePatterns(files),
        headers: files.length > 0 ? files[0].cacheControl : null
      };
    });
    
    // Save cache headers configuration
    const headersFile = path.join(path.dirname(this.options.configFile), 'cache-headers.json');
    fs.writeFileSync(headersFile, JSON.stringify(headers, null, 2));
    
    console.log(`📄 Cache headers configuration saved: ${headersFile}`);
    return headersFile;
  }

  generatePatterns(files) {
    const extensions = [...new Set(files.map(f => f.ext))];
    const patterns = [];
    
    extensions.forEach(ext => {
      const extFiles = files.filter(f => f.ext === ext);
      if (extFiles.length > 0) {
        patterns.push(`*${ext}`);
      }
    });
    
    return patterns;
  }

  async createServiceWorker() {
    const swContent = `
// Service Worker for DevDeck
// Auto-generated caching strategies

const CACHE_NAME = 'devdeck-v1';
const STATIC_CACHE = 'devdeck-static-v1';
const DYNAMIC_CACHE = 'devdeck-dynamic-v1';

// Files to cache immediately
const PRECACHE_URLS = [
${this.cacheStrategies.immutable.concat(this.cacheStrategies.longTerm)
  .slice(0, 20) // Limit precache to 20 files
  .map(f => `  '/${f.path}'`)
  .join(',\n')}
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Immutable files - cache first
  immutable: {
    patterns: [${this.generatePatterns(this.cacheStrategies.immutable).map(p => `'${p}'`).join(', ')}],
    strategy: 'CacheFirst',
    maxAge: 31536000 // 1 year
  },
  
  // Static assets - stale while revalidate
  static: {
    patterns: [${this.generatePatterns(this.cacheStrategies.longTerm).map(p => `'${p}'`).join(', ')}],
    strategy: 'StaleWhileRevalidate',
    maxAge: 2592000 // 30 days
  },
  
  // Dynamic content - network first
  dynamic: {
    patterns: [${this.generatePatterns(this.cacheStrategies.shortTerm).map(p => `'${p}'`).join(', ')}],
    strategy: 'NetworkFirst',
    maxAge: 86400 // 1 day
  }
};

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) return;
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);
  
  switch (strategy.name) {
    case 'CacheFirst':
      event.respondWith(cacheFirst(request, strategy));
      break;
    case 'NetworkFirst':
      event.respondWith(networkFirst(request, strategy));
      break;
    case 'StaleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request, strategy));
      break;
    default:
      // Let browser handle
      break;
  }
});

// Cache strategy implementations
async function cacheFirst(request, strategy) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, strategy) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, strategy) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Determine cache strategy for a given path
function getCacheStrategy(pathname) {
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of config.patterns) {
      if (matchPattern(pathname, pattern)) {
        return { name: config.strategy, ...config };
      }
    }
  }
  
  return { name: 'NetworkOnly' };
}

// Simple pattern matching
function matchPattern(path, pattern) {
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(path);
  }
  return path.includes(pattern);
}
`;
    
    const swFile = path.join(this.options.staticDir, 'sw.js');
    fs.writeFileSync(swFile, swContent);
    
    console.log(`🔧 Service worker created: ${swFile}`);
    return swFile;
  }

  async generateNginxConfig() {
    const nginxConfig = `
# Nginx caching configuration for DevDeck
# Auto-generated cache headers

# Immutable files (with hash)
location ~* \\.(js|css)$ {
    if ($args ~ "^v=[a-f0-9]+") {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# Static assets
location ~* \\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, max-age=2592000";
    add_header Vary "Accept-Encoding";
}

# CSS and JS files (without hash)
location ~* \\.(css|js)$ {
    add_header Cache-Control "public, max-age=86400";
    add_header Vary "Accept-Encoding";
}

# HTML files
location ~* \\.(html)$ {
    add_header Cache-Control "public, max-age=3600, must-revalidate";
    add_header Vary "Accept-Encoding";
}

# API endpoints
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
`;
    
    const nginxFile = path.join(path.dirname(this.options.configFile), 'nginx-cache.conf');
    fs.writeFileSync(nginxFile, nginxConfig);
    
    console.log(`🔧 Nginx configuration created: ${nginxFile}`);
    return nginxFile;
  }

  generateReport() {
    const totalFiles = Object.values(this.cacheStrategies)
      .reduce((sum, files) => sum + files.length, 0);
    
    const totalSize = Object.values(this.cacheStrategies)
      .flat()
      .reduce((sum, file) => sum + file.size, 0);
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles,
        totalSize,
        strategies: Object.entries(this.cacheStrategies).map(([name, files]) => ({
          name,
          count: files.length,
          size: files.reduce((sum, f) => sum + f.size, 0),
          percentage: totalFiles > 0 ? (files.length / totalFiles * 100).toFixed(1) : 0
        }))
      },
      strategies: this.cacheStrategies,
      recommendations: this.generateCacheRecommendations()
    };
  }

  generateCacheRecommendations() {
    const recommendations = [];
    
    // Check for files without proper versioning
    const unversionedAssets = this.cacheStrategies.shortTerm
      .filter(f => ['.css', '.js'].includes(f.ext));
    
    if (unversionedAssets.length > 0) {
      recommendations.push({
        type: 'versioning',
        severity: 'medium',
        title: 'Add File Versioning',
        description: `${unversionedAssets.length} CSS/JS files lack proper versioning`,
        suggestions: [
          'Add content hash to filenames',
          'Use webpack or similar bundler for automatic versioning',
          'Implement cache busting strategy',
          'Use query parameters for versioning'
        ]
      });
    }
    
    // Check for large files without compression
    const largeFiles = Object.values(this.cacheStrategies)
      .flat()
      .filter(f => f.size > 100000); // > 100KB
    
    if (largeFiles.length > 0) {
      recommendations.push({
        type: 'compression',
        severity: 'high',
        title: 'Enable Compression',
        description: `${largeFiles.length} files larger than 100KB should be compressed`,
        suggestions: [
          'Enable gzip compression on server',
          'Use Brotli compression for better results',
          'Compress images before serving',
          'Minify CSS and JavaScript files'
        ]
      });
    }
    
    return recommendations;
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new CachingOptimizer({
    staticDir: process.argv[2] || './public',
    buildDir: process.argv[3] || './build'
  });
  
  optimizer.optimize()
    .then(report => {
      console.log('\n=== CACHING OPTIMIZATION SUMMARY ===');
      console.log(`Total files analyzed: ${report.summary.totalFiles}`);
      console.log(`Total size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      console.log('\n=== CACHE STRATEGIES ===');
      report.summary.strategies.forEach(strategy => {
        console.log(`${strategy.name}: ${strategy.count} files (${strategy.percentage}%)`);
      });
      
      if (report.recommendations.length > 0) {
        console.log('\n=== RECOMMENDATIONS ===');
        report.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.severity.toUpperCase()}] ${rec.title}`);
          console.log(`   ${rec.description}`);
        });
      }
    })
    .catch(console.error);
}

module.exports = CachingOptimizer;
EOF

print_success "Caching optimizer script created"

log "Performance optimization configuration and scripts created successfully"
echo

print_status "Creating performance dashboard and reporting..."

# Create performance dashboard HTML
cat > "$REPORTS_DIR/dashboard.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Performance Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            text-align: center;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .card:hover {
            transform: translateY(-2px);
        }
        
        .card h3 {
            color: #667eea;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-value {
            font-weight: bold;
            color: #333;
        }
        
        .status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .status.good {
            background: #d4edda;
            color: #155724;
        }
        
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .status.critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .chart-container {
            height: 200px;
            margin: 1rem 0;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
        }
        
        .recommendations {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 2rem 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .recommendation {
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 4px solid #667eea;
            background: #f8f9fa;
            border-radius: 0 4px 4px 0;
        }
        
        .recommendation.high {
            border-left-color: #dc3545;
        }
        
        .recommendation.medium {
            border-left-color: #ffc107;
        }
        
        .recommendation.low {
            border-left-color: #28a745;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            border-top: 1px solid #eee;
            margin-top: 2rem;
        }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin: 1rem 0;
        }
        
        .refresh-btn:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🚀 DevDeck Performance Dashboard</h1>
            <p>Real-time performance monitoring and optimization insights</p>
            <button class="refresh-btn" onclick="loadData()">🔄 Refresh Data</button>
        </div>
    </div>
    
    <div class="container">
        <div class="dashboard" id="dashboard">
            <!-- Dashboard content will be loaded here -->
        </div>
        
        <div class="recommendations" id="recommendations">
            <h3>🎯 Performance Recommendations</h3>
            <div id="recommendations-list">
                <!-- Recommendations will be loaded here -->
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Last updated: <span id="last-updated">Loading...</span></p>
        <p>DevDeck Performance Optimization System</p>
    </div>
    
    <script>
        async function loadData() {
            try {
                // Load performance data
                const response = await fetch('/api/performance/dashboard');
                const data = await response.json();
                
                renderDashboard(data);
                renderRecommendations(data.recommendations || []);
                
                document.getElementById('last-updated').textContent = new Date().toLocaleString();
            } catch (error) {
                console.error('Failed to load performance data:', error);
                renderError();
            }
        }
        
        function renderDashboard(data) {
            const dashboard = document.getElementById('dashboard');
            
            dashboard.innerHTML = `
                <div class="card">
                    <h3>⚡ Core Web Vitals</h3>
                    <div class="metric">
                        <span>Largest Contentful Paint</span>
                        <span class="metric-value">${data.frontend?.lcp || 'N/A'}ms</span>
                    </div>
                    <div class="metric">
                        <span>First Input Delay</span>
                        <span class="metric-value">${data.frontend?.fid || 'N/A'}ms</span>
                    </div>
                    <div class="metric">
                        <span>Cumulative Layout Shift</span>
                        <span class="metric-value">${data.frontend?.cls || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span>First Contentful Paint</span>
                        <span class="metric-value">${data.frontend?.fcp || 'N/A'}ms</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🖥️ Backend Performance</h3>
                    <div class="metric">
                        <span>Average Response Time</span>
                        <span class="metric-value">${data.backend?.avgResponseTime || 'N/A'}ms</span>
                    </div>
                    <div class="metric">
                        <span>95th Percentile</span>
                        <span class="metric-value">${data.backend?.p95ResponseTime || 'N/A'}ms</span>
                    </div>
                    <div class="metric">
                        <span>Error Rate</span>
                        <span class="metric-value">${((data.backend?.errorRate || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="metric">
                        <span>Memory Usage</span>
                        <span class="metric-value">${((data.backend?.memoryUsage || 0) * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>💾 Database Metrics</h3>
                    <div class="metric">
                        <span>Connection Usage</span>
                        <span class="metric-value">${((data.database?.connectionUsage || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Query Volume</span>
                        <span class="metric-value">${data.database?.queryVolume || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span>Avg Query Time</span>
                        <span class="metric-value">${data.database?.avgQueryTime || 'N/A'}ms</span>
                    </div>
                    <div class="metric">
                        <span>Slow Queries</span>
                        <span class="metric-value">${data.database?.slowQueries || 0}</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>📊 Bundle Analysis</h3>
                    <div class="metric">
                        <span>Total Bundle Size</span>
                        <span class="metric-value">${formatBytes(data.bundles?.totalSize || 0)}</span>
                    </div>
                    <div class="metric">
                        <span>Gzipped Size</span>
                        <span class="metric-value">${formatBytes(data.bundles?.gzippedSize || 0)}</span>
                    </div>
                    <div class="metric">
                        <span>Compression Ratio</span>
                        <span class="metric-value">${((data.bundles?.compressionRatio || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Bundle Count</span>
                        <span class="metric-value">${data.bundles?.count || 0}</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🗄️ Cache Performance</h3>
                    <div class="metric">
                        <span>Cache Hit Rate</span>
                        <span class="metric-value">${((data.cache?.hitRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Cached Files</span>
                        <span class="metric-value">${data.cache?.cachedFiles || 0}</span>
                    </div>
                    <div class="metric">
                        <span>Cache Size</span>
                        <span class="metric-value">${formatBytes(data.cache?.totalSize || 0)}</span>
                    </div>
                    <div class="metric">
                        <span>Cache Efficiency</span>
                        <span class="status ${getCacheStatus(data.cache?.hitRate)}">${getCacheStatusText(data.cache?.hitRate)}</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🎯 Performance Score</h3>
                    <div class="chart-container">
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; font-weight: bold; color: ${getScoreColor(data.overallScore)};">
                                ${data.overallScore || 0}
                            </div>
                            <div>Overall Performance Score</div>
                        </div>
                    </div>
                    <div class="metric">
                        <span>Lighthouse Score</span>
                        <span class="metric-value">${data.lighthouse?.performance || 'N/A'}</span>
                    </div>
                </div>
            `;
        }
        
        function renderRecommendations(recommendations) {
            const container = document.getElementById('recommendations-list');
            
            if (recommendations.length === 0) {
                container.innerHTML = '<p>🎉 No performance issues detected! Your application is running optimally.</p>';
                return;
            }
            
            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation ${rec.severity}">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.suggestions.slice(0, 3).map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
        
        function renderError() {
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; color: #dc3545;">
                    <h3>⚠️ Unable to Load Performance Data</h3>
                    <p>Please check if the performance monitoring service is running.</p>
                    <button class="refresh-btn" onclick="loadData()">Try Again</button>
                </div>
            `;
        }
        
        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        function getCacheStatus(hitRate) {
            if (hitRate >= 0.8) return 'good';
            if (hitRate >= 0.6) return 'warning';
            return 'critical';
        }
        
        function getCacheStatusText(hitRate) {
            if (hitRate >= 0.8) return 'Excellent';
            if (hitRate >= 0.6) return 'Good';
            return 'Needs Improvement';
        }
        
        function getScoreColor(score) {
            if (score >= 90) return '#28a745';
            if (score >= 70) return '#ffc107';
            return '#dc3545';
        }
        
        // Load data on page load
        document.addEventListener('DOMContentLoaded', loadData);
        
        // Auto-refresh every 5 minutes
        setInterval(loadData, 5 * 60 * 1000);
    </script>
</body>
</html>
EOF

print_success "Performance dashboard created"

# Create main performance optimization runner
cat > "run-performance-optimization.sh" << 'EOF'
#!/bin/bash

# Main Performance Optimization Runner
# Orchestrates all performance optimization tasks

set -e

# Color codes
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

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERF_DIR="$BASE_DIR/performance"
REPORTS_DIR="$PREF_DIR/reports"
CONFIG_DIR="$PERF_DIR/config"
OPTIMIZERS_DIR="$PERF_DIR/optimizers"
MONITORS_DIR="$PERF_DIR/monitors"

# Options
RUN_FRONTEND_ANALYSIS=${1:-true}
RUN_BACKEND_ANALYSIS=${2:-true}
RUN_BUNDLE_ANALYSIS=${3:-true}
RUN_IMAGE_OPTIMIZATION=${4:-false}
RUN_CACHE_OPTIMIZATION=${5:-true}
GENERATE_REPORT=${6:-true}

echo "🚀 Starting DevDeck Performance Optimization"
echo "================================================"
echo

print_status "Configuration:"
echo "  Frontend Analysis: $RUN_FRONTEND_ANALYSIS"
echo "  Backend Analysis: $RUN_BACKEND_ANALYSIS"
echo "  Bundle Analysis: $RUN_BUNDLE_ANALYSIS"
echo "  Image Optimization: $RUN_IMAGE_OPTIMIZATION"
echo "  Cache Optimization: $RUN_CACHE_OPTIMIZATION"
echo "  Generate Report: $GENERATE_REPORT"
echo

# Create timestamp for this run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR="$REPORTS_DIR/run_$TIMESTAMP"
mkdir -p "$RUN_DIR"

print_status "Created run directory: $RUN_DIR"

# Initialize results
RESULTS_FILE="$RUN_DIR/optimization_results.json"
cat > "$RESULTS_FILE" << JSONEOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "runId": "$TIMESTAMP",
  "configuration": {
    "frontendAnalysis": $RUN_FRONTEND_ANALYSIS,
    "backendAnalysis": $RUN_BACKEND_ANALYSIS,
    "bundleAnalysis": $RUN_BUNDLE_ANALYSIS,
    "imageOptimization": $RUN_IMAGE_OPTIMIZATION,
    "cacheOptimization": $RUN_CACHE_OPTIMIZATION
  },
  "results": {},
  "recommendations": [],
  "summary": {}
}
JSONEOF

# Function to update results
update_results() {
    local section="$1"
    local data="$2"
    
    # Use jq to update the results file if available, otherwise use basic approach
    if command -v jq >/dev/null 2>&1; then
        echo "$data" | jq ".results.$section = ." "$RESULTS_FILE" > "$RESULTS_FILE.tmp" && mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"
    else
        print_warning "jq not available, using basic JSON handling"
    fi
}

# Frontend Performance Analysis
if [ "$RUN_FRONTEND_ANALYSIS" = "true" ]; then
    print_status "Running frontend performance analysis..."
    
    if [ -f "$MONITORS_DIR/frontend-performance.js" ]; then
        cd "$BASE_DIR"
        
        # Run Lighthouse audit if available
        if command -v lighthouse >/dev/null 2>&1; then
            print_status "Running Lighthouse audit..."
            lighthouse http://localhost:3000 --output=json --output-path="$RUN_DIR/lighthouse.json" --quiet || true
            
            if [ -f "$RUN_DIR/lighthouse.json" ]; then
                print_success "Lighthouse audit completed"
            else
                print_warning "Lighthouse audit failed or server not running"
            fi
        else
            print_warning "Lighthouse not installed, skipping audit"
        fi
        
        # Analyze frontend metrics
        node "$MONITORS_DIR/frontend-performance.js" > "$RUN_DIR/frontend_analysis.json" 2>/dev/null || {
            print_warning "Frontend analysis failed, creating placeholder"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/frontend_analysis.json"
        }
        
        print_success "Frontend analysis completed"
    else
        print_warning "Frontend performance monitor not found"
    fi
fi

# Backend Performance Analysis
if [ "$RUN_BACKEND_ANALYSIS" = "true" ]; then
    print_status "Running backend performance analysis..."
    
    if [ -f "$MONITORS_DIR/backend-performance.js" ]; then
        # Check if backend is running
        if curl -s http://localhost:5000/health >/dev/null 2>&1; then
            node "$MONITORS_DIR/backend-performance.js" > "$RUN_DIR/backend_analysis.json" 2>/dev/null || {
                print_warning "Backend analysis failed"
                echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/backend_analysis.json"
            }
            print_success "Backend analysis completed"
        else
            print_warning "Backend server not running, skipping analysis"
            echo '{"status": "skipped", "reason": "server_not_running"}' > "$RUN_DIR/backend_analysis.json"
        fi
    else
        print_warning "Backend performance monitor not found"
    fi
fi

# Bundle Analysis
if [ "$RUN_BUNDLE_ANALYSIS" = "true" ]; then
    print_status "Running bundle analysis..."
    
    if [ -f "$OPTIMIZERS_DIR/analyze-bundles.js" ]; then
        node "$OPTIMIZERS_DIR/analyze-bundles.js" > "$RUN_DIR/bundle_analysis.json" 2>/dev/null || {
            print_warning "Bundle analysis failed"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/bundle_analysis.json"
        }
        print_success "Bundle analysis completed"
    else
        print_warning "Bundle analyzer not found"
    fi
fi

# Image Optimization
if [ "$RUN_IMAGE_OPTIMIZATION" = "true" ]; then
    print_status "Running image optimization..."
    
    if [ -f "$OPTIMIZERS_DIR/optimize-images.sh" ]; then
        bash "$OPTIMIZERS_DIR/optimize-images.sh" ./public/images ./public/images/optimized 80 > "$RUN_DIR/image_optimization.log" 2>&1 || {
            print_warning "Image optimization failed"
        }
        print_success "Image optimization completed"
    else
        print_warning "Image optimizer not found"
    fi
fi

# Cache Optimization
if [ "$RUN_CACHE_OPTIMIZATION" = "true" ]; then
    print_status "Running cache optimization..."
    
    if [ -f "$OPTIMIZERS_DIR/optimize-caching.js" ]; then
        node "$OPTIMIZERS_DIR/optimize-caching.js" > "$RUN_DIR/cache_optimization.json" 2>/dev/null || {
            print_warning "Cache optimization failed"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/cache_optimization.json"
        }
        print_success "Cache optimization completed"
    else
        print_warning "Cache optimizer not found"
    fi
fi

# Generate comprehensive report
if [ "$GENERATE_REPORT" = "true" ]; then
    print_status "Generating comprehensive performance report..."
    
    # Run the auto-optimizer to generate recommendations
    if [ -f "$OPTIMIZERS_DIR/auto-optimizer.js" ]; then
        node "$OPTIMIZERS_DIR/auto-optimizer.js" "$RUN_DIR" > "$RUN_DIR/optimization_recommendations.json" 2>/dev/null || {
            print_warning "Auto-optimizer failed"
        }
    fi
    
    # Generate HTML report
    cat > "$RUN_DIR/performance_report.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .metric:last-child { border-bottom: none; }
        .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
        .status.good { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.critical { background: #f8d7da; color: #721c24; }
        .recommendation { padding: 1rem; margin: 0.5rem 0; border-left: 4px solid #667eea; background: #f8f9fa; border-radius: 0 4px 4px 0; }
        .recommendation.high { border-left-color: #dc3545; }
        .recommendation.medium { border-left-color: #ffc107; }
        .recommendation.low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 DevDeck Performance Report</h1>
            <p>Generated on: $(date)</p>
            <p>Run ID: $TIMESTAMP</p>
        </div>
        
        <div class="card">
            <h2>📈 Performance Summary</h2>
            <div id="summary-content">
                <p>This report contains detailed performance analysis and optimization recommendations for DevDeck.</p>
                <p>Review the sections below for specific insights and actionable recommendations.</p>
            </div>
        </div>
        
        <div class="card">
            <h2>📁 Generated Files</h2>
            <ul>
                <li><strong>Frontend Analysis:</strong> frontend_analysis.json</li>
                <li><strong>Backend Analysis:</strong> backend_analysis.json</li>
                <li><strong>Bundle Analysis:</strong> bundle_analysis.json</li>
                <li><strong>Cache Optimization:</strong> cache_optimization.json</li>
                <li><strong>Optimization Recommendations:</strong> optimization_recommendations.json</li>
                <li><strong>Lighthouse Report:</strong> lighthouse.json (if available)</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>🎯 Next Steps</h2>
            <ol>
                <li>Review the generated JSON files for detailed metrics</li>
                <li>Implement the recommended optimizations</li>
                <li>Re-run the performance analysis to measure improvements</li>
                <li>Set up automated monitoring for continuous optimization</li>
            </ol>
        </div>
    </div>
</body>
</html>
HHTMLEOF
    
    print_success "Performance report generated: $RUN_DIR/performance_report.html"
fi

# Summary
echo
print_status "Performance optimization completed!"
echo "================================================"
echo "📁 Results directory: $RUN_DIR"
echo "📊 View report: $RUN_DIR/performance_report.html"
echo "📈 Dashboard: $REPORTS_DIR/dashboard.html"
echo

print_status "Generated files:"
ls -la "$RUN_DIR" | grep -E '\.(json|html|log)$' | awk '{print "  " $9}'

echo
print_success "Performance optimization run completed successfully!"
print_status "Run ID: $TIMESTAMP"
EOF

chmod +x "run-performance-optimization.sh"

print_success "Main performance optimization runner created"

# Create README for performance optimization
cat > "performance/README.md" << 'EOF'
# DevDeck Performance Optimization System

Comprehensive performance monitoring, analysis, and optimization toolkit for DevDeck.

## 🚀 Quick Start

### Run Complete Performance Analysis
```bash
# Run all optimizations
./run-performance-optimization.sh

# Run specific optimizations
./run-performance-optimization.sh true true true false true true
# Args: frontend backend bundle images cache report
```

### View Performance Dashboard
Open `performance/reports/dashboard.html` in your browser for real-time metrics.

## 📊 Components

### Monitors
- **Frontend Performance** (`monitors/frontend-performance.js`)
  - Core Web Vitals tracking
  - Resource timing analysis
  - User interaction metrics
  - Error monitoring

- **Backend Performance** (`monitors/backend-performance.js`)
  - Response time tracking
  - Memory and CPU monitoring
  - Database performance
  - Error rate analysis

### Optimizers
- **Bundle Analyzer** (`optimizers/analyze-bundles.js`)
  - JavaScript/CSS bundle analysis
  - Dependency tracking
  - Code splitting recommendations
  - Minification analysis

- **Image Optimizer** (`optimizers/optimize-images.sh`)
  - Automatic image compression
  - Format optimization
  - Size reduction analysis
  - Batch processing

- **Cache Optimizer** (`optimizers/optimize-caching.js`)
  - Cache strategy analysis
  - Service worker generation
  - Nginx configuration
  - Cache performance metrics

- **Auto Optimizer** (`optimizers/auto-optimizer.js`)
  - Automated optimization recommendations
  - Performance issue detection
  - Priority-based suggestions
  - Automated fixes (safe mode)

### Configuration
- **Optimization Settings** (`config/optimization.json`)
  - Performance thresholds
  - Monitoring configuration
  - Auto-fix settings
  - Scheduling options

- **Performance Budget** (`config/performance-budget.json`)
  - Resource size limits
  - Timing budgets
  - Request count limits
  - Alert thresholds

## 🔧 Usage Examples

### Individual Component Usage

#### Frontend Monitoring
```javascript
// Include in your React app
import { PerformanceMonitor } from './performance/monitors/frontend-performance.js';

const monitor = new PerformanceMonitor({
  apiEndpoint: '/api/performance/frontend',
  sampleRate: 0.1
});

monitor.start();
```

#### Backend Monitoring
```javascript
// Add to Express app
const { BackendMonitor } = require('./performance/monitors/backend-performance.js');

app.use(new BackendMonitor({
  alertThresholds: {
    responseTime: 1000,
    memoryUsage: 0.8
  }
}).middleware());
```

#### Bundle Analysis
```bash
# Analyze build directory
node performance/optimizers/analyze-bundles.js ./build ./dist

# View results
cat performance/reports/bundle-analysis-*.json
```

#### Image Optimization
```bash
# Optimize images with custom settings
./performance/optimizers/optimize-images.sh ./src/images ./public/images/optimized 75 1600 900

# Arguments: source_dir output_dir quality max_width max_height
```

#### Cache Optimization
```bash
# Analyze and optimize caching
node performance/optimizers/optimize-caching.js ./public ./build

# Generated files:
# - Service worker (public/sw.js)
# - Nginx config (performance/config/nginx-cache.conf)
# - Cache headers (performance/config/cache-headers.json)
```

## 📈 Performance Metrics

### Frontend Metrics
- **Core Web Vitals**
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - First Contentful Paint (FCP)

- **Resource Performance**
  - Bundle sizes and load times
  - Image optimization opportunities
  - Third-party script impact
  - Cache hit rates

### Backend Metrics
- **Response Times**
  - Average response time
  - 95th percentile response time
  - Endpoint-specific performance
  - Database query performance

- **System Resources**
  - Memory usage
  - CPU utilization
  - Database connections
  - Error rates

### Bundle Metrics
- **Size Analysis**
  - Total bundle size
  - Gzipped size
  - Compression ratios
  - Chunk distribution

- **Optimization Opportunities**
  - Unused code detection
  - Duplicate dependency analysis
  - Code splitting recommendations
  - Tree shaking effectiveness

## 🎯 Optimization Recommendations

The system automatically generates prioritized recommendations:

### High Priority
- Large bundle sizes (>1MB)
- Poor Core Web Vitals scores
- High error rates
- Memory leaks

### Medium Priority
- Unminified code
- Missing compression
- Inefficient caching
- Too many HTTP requests

### Low Priority
- Image optimization opportunities
- Minor performance improvements
- Code organization suggestions

## 🔄 Automation

### Scheduled Analysis
Set up automated performance analysis:

```bash
# Add to crontab for daily analysis
0 2 * * * /path/to/devdeck/run-performance-optimization.sh

# Weekly comprehensive analysis
0 3 * * 1 /path/to/devdeck/run-performance-optimization.sh true true true true true true
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Performance Analysis
  run: |
    ./run-performance-optimization.sh
    # Upload results to artifacts or performance monitoring service
```

## 📊 Reporting

### Dashboard
- Real-time performance metrics
- Historical trend analysis
- Alert notifications
- Optimization progress tracking

### Reports
- Detailed JSON reports for each component
- HTML summary reports
- Lighthouse integration
- Custom metric tracking

## 🛠️ Configuration

### Environment Variables
```bash
# Performance monitoring
PERF_SAMPLE_RATE=0.1
PERF_API_ENDPOINT=/api/performance
PERF_ALERT_WEBHOOK=https://hooks.slack.com/...

# Optimization settings
PERF_AUTO_FIX=true
PERF_SAFE_MODE=true
PERF_IMAGE_QUALITY=80
PERF_CACHE_STRATEGY=aggressive
```

### Custom Thresholds
Edit `config/optimization.json` to customize performance thresholds:

```json
{
  "thresholds": {
    "frontend": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1
    },
    "backend": {
      "averageResponseTime": 500,
      "errorRate": 0.05
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Lighthouse fails to run**
   - Ensure the development server is running
   - Install Lighthouse: `npm install -g lighthouse`
   - Check firewall settings

2. **Backend monitoring not working**
   - Verify backend server is accessible
   - Check API endpoint configuration
   - Review error logs in reports directory

3. **Image optimization fails**
   - Install required tools: `jpegoptim`, `optipng`, `cwebp`
   - Check file permissions
   - Verify source directory exists

4. **Bundle analysis incomplete**
   - Ensure build directory exists
   - Check Node.js version compatibility
   - Review build configuration

### Debug Mode
```bash
# Run with verbose output
DEBUG=true ./run-performance-optimization.sh

# Check individual components
node performance/optimizers/analyze-bundles.js --debug
```

## 📚 Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Performance Audits](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analysis Best Practices](https://webpack.js.org/guides/bundle-analysis/)
- [Caching Strategies](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)

## 🤝 Contributing

To add new performance optimizations:

1. Create new optimizer in `optimizers/` directory
2. Add configuration options to `config/optimization.json`
3. Update the main runner script
4. Add tests and documentation
5. Submit pull request

## 📄 License

Part of the DevDeck project. See main project license for details.
EOF

print_success "Performance optimization README created"

log "Performance optimization system setup completed successfully"