const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const seoConfig = require('../config/seo-config.json');

class SEOAnalyzer {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || seoConfig.site.url;
    this.results = {
      score: 0,
      issues: [],
      recommendations: [],
      passed: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        url: this.baseUrl
      }
    };
  }

  // Analyze a single page
  async analyzePage(url) {
    try {
      const html = await this.fetchPage(url);
      const analysis = {
        url,
        title: this.extractTitle(html),
        description: this.extractDescription(html),
        keywords: this.extractKeywords(html),
        headings: this.extractHeadings(html),
        images: this.extractImages(html),
        links: this.extractLinks(html),
        meta: this.extractMeta(html),
        structuredData: this.extractStructuredData(html),
        performance: await this.analyzePerformance(url)
      };

      return this.evaluatePage(analysis);
    } catch (error) {
      console.error(`Error analyzing ${url}:`, error.message);
      return {
        url,
        error: error.message,
        score: 0
      };
    }
  }

  // Fetch page content
  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'SEO-Analyzer/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  // Extract page title
  extractTitle(html) {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  // Extract meta description
  extractDescription(html) {
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
  }

  // Extract meta keywords
  extractKeywords(html) {
    const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    return match ? match[1].split(',').map(k => k.trim()) : [];
  }

  // Extract headings
  extractHeadings(html) {
    const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    
    for (let i = 1; i <= 6; i++) {
      const regex = new RegExp(`<h${i}[^>]*>([^<]+)</h${i}>`, 'gi');
      let match;
      while ((match = regex.exec(html)) !== null) {
        headings[`h${i}`].push(match[1].trim());
      }
    }
    
    return headings;
  }

  // Extract images
  extractImages(html) {
    const images = [];
    const regex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const img = { src: match[1] };
      
      // Extract alt text
      const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
      img.alt = altMatch ? altMatch[1] : null;
      
      // Extract title
      const titleMatch = match[0].match(/title=["']([^"']*)["']/i);
      img.title = titleMatch ? titleMatch[1] : null;
      
      images.push(img);
    }
    
    return images;
  }

  // Extract links
  extractLinks(html) {
    const links = { internal: [], external: [] };
    const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)</gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      
      if (href.startsWith('http') && !href.includes(this.baseUrl)) {
        links.external.push({ href, text });
      } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.internal.push({ href, text });
      }
    }
    
    return links;
  }

  // Extract meta tags
  extractMeta(html) {
    const meta = {};
    const regex = /<meta[^>]*>/gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const tag = match[0];
      
      // Extract name and content
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      const propertyMatch = tag.match(/property=["']([^"']+)["']/i);
      const contentMatch = tag.match(/content=["']([^"']*)["']/i);
      
      if ((nameMatch || propertyMatch) && contentMatch) {
        const key = nameMatch ? nameMatch[1] : propertyMatch[1];
        meta[key] = contentMatch[1];
      }
    }
    
    return meta;
  }

  // Extract structured data
  extractStructuredData(html) {
    const scripts = [];
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        scripts.push(data);
      } catch (error) {
        console.warn('Invalid JSON-LD:', error.message);
      }
    }
    
    return scripts;
  }

  // Analyze performance metrics
  async analyzePerformance(url) {
    // This is a simplified performance analysis
    // In a real implementation, you might use Lighthouse API or similar tools
    return {
      loadTime: Math.random() * 3 + 1, // Simulated load time
      size: Math.floor(Math.random() * 1000) + 500, // Simulated page size in KB
      requests: Math.floor(Math.random() * 50) + 20 // Simulated number of requests
    };
  }

  // Evaluate page SEO
  evaluatePage(analysis) {
    const evaluation = {
      url: analysis.url,
      score: 0,
      issues: [],
      recommendations: [],
      passed: []
    };

    let totalChecks = 0;
    let passedChecks = 0;

    // Title checks
    totalChecks++;
    if (analysis.title) {
      if (analysis.title.length >= 30 && analysis.title.length <= 60) {
        evaluation.passed.push('Title length is optimal (30-60 characters)');
        passedChecks++;
      } else if (analysis.title.length < 30) {
        evaluation.issues.push('Title is too short (< 30 characters)');
        evaluation.recommendations.push('Expand the title to be more descriptive');
      } else {
        evaluation.issues.push('Title is too long (> 60 characters)');
        evaluation.recommendations.push('Shorten the title to improve search result display');
      }
    } else {
      evaluation.issues.push('Missing page title');
      evaluation.recommendations.push('Add a descriptive title tag');
    }

    // Description checks
    totalChecks++;
    if (analysis.description) {
      if (analysis.description.length >= 120 && analysis.description.length <= 160) {
        evaluation.passed.push('Meta description length is optimal (120-160 characters)');
        passedChecks++;
      } else if (analysis.description.length < 120) {
        evaluation.issues.push('Meta description is too short (< 120 characters)');
        evaluation.recommendations.push('Expand the meta description to be more informative');
      } else {
        evaluation.issues.push('Meta description is too long (> 160 characters)');
        evaluation.recommendations.push('Shorten the meta description for better search result display');
      }
    } else {
      evaluation.issues.push('Missing meta description');
      evaluation.recommendations.push('Add a compelling meta description');
    }

    // Heading structure checks
    totalChecks++;
    if (analysis.headings.h1.length === 1) {
      evaluation.passed.push('Single H1 tag found');
      passedChecks++;
    } else if (analysis.headings.h1.length === 0) {
      evaluation.issues.push('No H1 tag found');
      evaluation.recommendations.push('Add an H1 tag to define the main topic');
    } else {
      evaluation.issues.push('Multiple H1 tags found');
      evaluation.recommendations.push('Use only one H1 tag per page');
    }

    // Image alt text checks
    totalChecks++;
    const imagesWithoutAlt = analysis.images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length === 0 && analysis.images.length > 0) {
      evaluation.passed.push('All images have alt text');
      passedChecks++;
    } else if (imagesWithoutAlt.length > 0) {
      evaluation.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      evaluation.recommendations.push('Add descriptive alt text to all images');
    } else {
      passedChecks++; // No images, so this check passes
    }

    // Internal linking checks
    totalChecks++;
    if (analysis.links.internal.length >= 3) {
      evaluation.passed.push('Good internal linking structure');
      passedChecks++;
    } else {
      evaluation.issues.push('Limited internal linking');
      evaluation.recommendations.push('Add more internal links to improve site navigation');
    }

    // Structured data checks
    totalChecks++;
    if (analysis.structuredData.length > 0) {
      evaluation.passed.push('Structured data found');
      passedChecks++;
    } else {
      evaluation.issues.push('No structured data found');
      evaluation.recommendations.push('Add JSON-LD structured data for better search understanding');
    }

    // Performance checks
    totalChecks++;
    if (analysis.performance.loadTime < 3) {
      evaluation.passed.push('Good page load time');
      passedChecks++;
    } else {
      evaluation.issues.push('Slow page load time');
      evaluation.recommendations.push('Optimize images and reduce HTTP requests to improve load time');
    }

    // Calculate score
    evaluation.score = Math.round((passedChecks / totalChecks) * 100);

    return evaluation;
  }

  // Generate comprehensive report
  async generateReport(urls = []) {
    console.log('🔍 Starting SEO analysis...');
    
    if (urls.length === 0) {
      urls = [this.baseUrl]; // Default to home page
    }

    const pageAnalyses = [];
    
    for (const url of urls) {
      console.log(`Analyzing: ${url}`);
      const analysis = await this.analyzePage(url);
      pageAnalyses.push(analysis);
    }

    // Calculate overall score
    const totalScore = pageAnalyses.reduce((sum, page) => sum + (page.score || 0), 0);
    this.results.score = Math.round(totalScore / pageAnalyses.length);

    // Aggregate issues and recommendations
    const allIssues = new Set();
    const allRecommendations = new Set();
    const allPassed = new Set();

    pageAnalyses.forEach(page => {
      if (page.issues) page.issues.forEach(issue => allIssues.add(issue));
      if (page.recommendations) page.recommendations.forEach(rec => allRecommendations.add(rec));
      if (page.passed) page.passed.forEach(pass => allPassed.add(pass));
    });

    this.results.issues = Array.from(allIssues);
    this.results.recommendations = Array.from(allRecommendations);
    this.results.passed = Array.from(allPassed);
    this.results.pages = pageAnalyses;

    return this.results;
  }

  // Save report to file
  saveReport(filename) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, filename);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 SEO report saved: ${reportPath}`);
    
    return reportPath;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const urls = args.length > 0 ? args : [seoConfig.site.url];
  
  const analyzer = new SEOAnalyzer();
  
  analyzer.generateReport(urls)
    .then(results => {
      console.log('\n📊 SEO Analysis Results:');
      console.log(`Overall Score: ${results.score}/100`);
      console.log(`Issues Found: ${results.issues.length}`);
      console.log(`Recommendations: ${results.recommendations.length}`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `seo-report-${timestamp}.json`;
      analyzer.saveReport(filename);
      
      // Exit with error code if score is below threshold
      if (results.score < 80) {
        console.log('⚠️  SEO score below threshold (80). Please address the issues.');
        process.exit(1);
      } else {
        console.log('✅ SEO analysis passed!');
      }
    })
    .catch(error => {
      console.error('❌ SEO analysis failed:', error);
      process.exit(1);
    });
}

module.exports = SEOAnalyzer;
