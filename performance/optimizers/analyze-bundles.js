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
