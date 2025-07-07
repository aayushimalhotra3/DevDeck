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
