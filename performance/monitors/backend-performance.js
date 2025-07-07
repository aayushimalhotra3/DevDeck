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
