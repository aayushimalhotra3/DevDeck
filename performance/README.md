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
