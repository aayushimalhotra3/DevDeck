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
