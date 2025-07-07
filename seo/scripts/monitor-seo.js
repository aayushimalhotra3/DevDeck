const fs = require('fs');
const path = require('path');
const SEOAnalyzer = require('./analyze-seo');
const seoConfig = require('../config/seo-config.json');

class SEOMonitor {
  constructor() {
    this.analyzer = new SEOAnalyzer();
    this.alertThresholds = {
      score: 80,
      loadTime: 3,
      titleLength: { min: 30, max: 60 },
      descriptionLength: { min: 120, max: 160 }
    };
  }

  // Monitor Core Web Vitals
  async monitorCoreWebVitals(url) {
    console.log(`🔍 Monitoring Core Web Vitals for: ${url}`);
    
    // Simulate Core Web Vitals data (in real implementation, use Lighthouse API)
    const vitals = {
      lcp: Math.random() * 4 + 1, // Largest Contentful Paint
      fid: Math.random() * 0.2,   // First Input Delay
      cls: Math.random() * 0.2,   // Cumulative Layout Shift
      fcp: Math.random() * 3 + 1, // First Contentful Paint
      ttfb: Math.random() * 1 + 0.5 // Time to First Byte
    };

    const evaluation = {
      url,
      timestamp: new Date().toISOString(),
      vitals,
      scores: {
        lcp: vitals.lcp <= 2.5 ? 'good' : vitals.lcp <= 4 ? 'needs-improvement' : 'poor',
        fid: vitals.fid <= 0.1 ? 'good' : vitals.fid <= 0.3 ? 'needs-improvement' : 'poor',
        cls: vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'needs-improvement' : 'poor'
      },
      alerts: []
    };

    // Check thresholds and generate alerts
    if (vitals.lcp > seoConfig.monitoring.coreWebVitals.thresholds.lcp) {
      evaluation.alerts.push({
        type: 'performance',
        metric: 'LCP',
        value: vitals.lcp,
        threshold: seoConfig.monitoring.coreWebVitals.thresholds.lcp,
        message: `LCP (${vitals.lcp.toFixed(2)}s) exceeds threshold (${seoConfig.monitoring.coreWebVitals.thresholds.lcp}s)`
      });
    }

    if (vitals.fid > seoConfig.monitoring.coreWebVitals.thresholds.fid) {
      evaluation.alerts.push({
        type: 'performance',
        metric: 'FID',
        value: vitals.fid,
        threshold: seoConfig.monitoring.coreWebVitals.thresholds.fid,
        message: `FID (${vitals.fid.toFixed(3)}s) exceeds threshold (${seoConfig.monitoring.coreWebVitals.thresholds.fid}s)`
      });
    }

    if (vitals.cls > seoConfig.monitoring.coreWebVitals.thresholds.cls) {
      evaluation.alerts.push({
        type: 'performance',
        metric: 'CLS',
        value: vitals.cls,
        threshold: seoConfig.monitoring.coreWebVitals.thresholds.cls,
        message: `CLS (${vitals.cls.toFixed(3)}) exceeds threshold (${seoConfig.monitoring.coreWebVitals.thresholds.cls})`
      });
    }

    return evaluation;
  }

  // Monitor search rankings (simplified)
  async monitorRankings(keywords) {
    console.log('🔍 Monitoring search rankings...');
    
    const rankings = [];
    
    for (const keyword of keywords) {
      // Simulate ranking data (in real implementation, use search API)
      const ranking = {
        keyword,
        position: Math.floor(Math.random() * 100) + 1,
        url: seoConfig.site.url,
        timestamp: new Date().toISOString(),
        searchEngine: 'google',
        change: Math.floor(Math.random() * 21) - 10 // -10 to +10
      };
      
      rankings.push(ranking);
    }
    
    return rankings;
  }

  // Monitor technical SEO issues
  async monitorTechnicalSEO(urls) {
    console.log('🔍 Monitoring technical SEO...');
    
    const issues = [];
    
    for (const url of urls) {
      try {
        // Check if sitemap exists
        const sitemapUrl = `${seoConfig.site.url}/sitemap.xml`;
        // In real implementation, make HTTP request to check
        
        // Check if robots.txt exists
        const robotsUrl = `${seoConfig.site.url}/robots.txt`;
        // In real implementation, make HTTP request to check
        
        // Simulate technical checks
        const checks = {
          sitemap: Math.random() > 0.1, // 90% chance of existing
          robots: Math.random() > 0.1,  // 90% chance of existing
          ssl: Math.random() > 0.05,    // 95% chance of SSL
          redirects: Math.random() > 0.2, // 80% chance of proper redirects
          canonicals: Math.random() > 0.15 // 85% chance of proper canonicals
        };
        
        if (!checks.sitemap) {
          issues.push({
            type: 'technical',
            severity: 'high',
            url,
            issue: 'Missing sitemap.xml',
            recommendation: 'Generate and submit sitemap to search engines'
          });
        }
        
        if (!checks.robots) {
          issues.push({
            type: 'technical',
            severity: 'medium',
            url,
            issue: 'Missing robots.txt',
            recommendation: 'Create robots.txt file with proper directives'
          });
        }
        
        if (!checks.ssl) {
          issues.push({
            type: 'security',
            severity: 'high',
            url,
            issue: 'No SSL certificate',
            recommendation: 'Install SSL certificate and redirect HTTP to HTTPS'
          });
        }
        
        if (!checks.redirects) {
          issues.push({
            type: 'technical',
            severity: 'medium',
            url,
            issue: 'Redirect chain detected',
            recommendation: 'Fix redirect chains to improve crawl efficiency'
          });
        }
        
        if (!checks.canonicals) {
          issues.push({
            type: 'content',
            severity: 'medium',
            url,
            issue: 'Missing canonical tags',
            recommendation: 'Add canonical tags to prevent duplicate content issues'
          });
        }
        
      } catch (error) {
        issues.push({
          type: 'error',
          severity: 'high',
          url,
          issue: `Analysis failed: ${error.message}`,
          recommendation: 'Check URL accessibility and server configuration'
        });
      }
    }
    
    return issues;
  }

  // Generate monitoring report
  async generateMonitoringReport(urls, keywords) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalUrls: urls.length,
        totalKeywords: keywords.length,
        criticalIssues: 0,
        warnings: 0,
        overallScore: 0
      },
      coreWebVitals: [],
      rankings: [],
      technicalIssues: [],
      recommendations: []
    };

    // Monitor Core Web Vitals
    for (const url of urls) {
      const vitals = await this.monitorCoreWebVitals(url);
      report.coreWebVitals.push(vitals);
      
      if (vitals.alerts.length > 0) {
        report.summary.criticalIssues += vitals.alerts.filter(a => a.type === 'performance').length;
      }
    }

    // Monitor rankings
    if (keywords.length > 0) {
      report.rankings = await this.monitorRankings(keywords);
    }

    // Monitor technical SEO
    report.technicalIssues = await this.monitorTechnicalSEO(urls);
    report.summary.criticalIssues += report.technicalIssues.filter(i => i.severity === 'high').length;
    report.summary.warnings += report.technicalIssues.filter(i => i.severity === 'medium').length;

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // Calculate overall score
    const maxScore = 100;
    const penalties = report.summary.criticalIssues * 10 + report.summary.warnings * 5;
    report.summary.overallScore = Math.max(0, maxScore - penalties);

    return report;
  }

  // Generate actionable recommendations
  generateRecommendations(report) {
    const recommendations = [];

    // Core Web Vitals recommendations
    const poorLCP = report.coreWebVitals.filter(v => v.scores.lcp === 'poor');
    if (poorLCP.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Improve Largest Contentful Paint (LCP)',
        description: 'Optimize images, remove unused CSS, and improve server response times',
        impact: 'High impact on user experience and search rankings',
        effort: 'Medium',
        urls: poorLCP.map(v => v.url)
      });
    }

    const poorCLS = report.coreWebVitals.filter(v => v.scores.cls === 'poor');
    if (poorCLS.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Reduce Cumulative Layout Shift (CLS)',
        description: 'Set dimensions for images and ads, avoid inserting content above existing content',
        impact: 'High impact on user experience',
        effort: 'Low',
        urls: poorCLS.map(v => v.url)
      });
    }

    // Technical SEO recommendations
    const sitemapIssues = report.technicalIssues.filter(i => i.issue.includes('sitemap'));
    if (sitemapIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'technical',
        title: 'Fix Sitemap Issues',
        description: 'Generate and submit XML sitemap to search engines',
        impact: 'High impact on crawlability and indexing',
        effort: 'Low',
        urls: sitemapIssues.map(i => i.url)
      });
    }

    const sslIssues = report.technicalIssues.filter(i => i.issue.includes('SSL'));
    if (sslIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        title: 'Implement SSL Certificate',
        description: 'Install SSL certificate and redirect all HTTP traffic to HTTPS',
        impact: 'Critical for security and search rankings',
        effort: 'Medium',
        urls: sslIssues.map(i => i.url)
      });
    }

    // Ranking recommendations
    const lowRankings = report.rankings.filter(r => r.position > 50);
    if (lowRankings.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        title: 'Improve Content for Low-Ranking Keywords',
        description: 'Optimize content, improve internal linking, and build quality backlinks',
        impact: 'Medium to high impact on organic traffic',
        effort: 'High',
        keywords: lowRankings.map(r => r.keyword)
      });
    }

    return recommendations;
  }

  // Send alerts
  async sendAlerts(report) {
    const criticalIssues = report.technicalIssues.filter(i => i.severity === 'high');
    const performanceAlerts = report.coreWebVitals.filter(v => v.alerts.length > 0);

    if (criticalIssues.length > 0 || performanceAlerts.length > 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        type: 'seo_alert',
        severity: 'high',
        summary: `${criticalIssues.length} critical SEO issues and ${performanceAlerts.length} performance alerts detected`,
        details: {
          criticalIssues: criticalIssues.slice(0, 5), // Limit to top 5
          performanceAlerts: performanceAlerts.slice(0, 3) // Limit to top 3
        },
        recommendations: report.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3)
      };

      // Send webhook alert if configured
      if (process.env.SEO_WEBHOOK_URL) {
        try {
          const https = require('https');
          const { URL } = require('url');
          
          const webhookUrl = new URL(process.env.SEO_WEBHOOK_URL);
          const postData = JSON.stringify(alertData);
          
          const options = {
            hostname: webhookUrl.hostname,
            port: webhookUrl.port || 443,
            path: webhookUrl.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          };
          
          const req = https.request(options);
          req.write(postData);
          req.end();
          
          console.log('📧 SEO alert sent via webhook');
        } catch (error) {
          console.error('Failed to send webhook alert:', error.message);
        }
      }

      // Log alert to file
      const alertsDir = path.join(__dirname, '../reports/alerts');
      if (!fs.existsSync(alertsDir)) {
        fs.mkdirSync(alertsDir, { recursive: true });
      }
      
      const alertFile = path.join(alertsDir, `seo-alert-${Date.now()}.json`);
      fs.writeFileSync(alertFile, JSON.stringify(alertData, null, 2));
      console.log(`🚨 SEO alert logged: ${alertFile}`);
    }
  }

  // Save monitoring report
  saveReport(report, filename) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, filename);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 SEO monitoring report saved: ${reportPath}`);
    
    return reportPath;
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new SEOMonitor();
  
  const urls = [
    seoConfig.site.url,
    `${seoConfig.site.url}/dashboard`,
    `${seoConfig.site.url}/analytics`
  ];
  
  const keywords = seoConfig.meta.keywords.slice(0, 5); // Monitor top 5 keywords
  
  monitor.generateMonitoringReport(urls, keywords)
    .then(async (report) => {
      console.log('\n📊 SEO Monitoring Results:');
      console.log(`Overall Score: ${report.summary.overallScore}/100`);
      console.log(`Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`Warnings: ${report.summary.warnings}`);
      console.log(`Recommendations: ${report.recommendations.length}`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `seo-monitoring-${timestamp}.json`;
      monitor.saveReport(report, filename);
      
      // Send alerts if needed
      await monitor.sendAlerts(report);
      
      // Exit with error code if critical issues found
      if (report.summary.criticalIssues > 0) {
        console.log('⚠️  Critical SEO issues detected. Please address immediately.');
        process.exit(1);
      } else {
        console.log('✅ SEO monitoring completed successfully!');
      }
    })
    .catch(error => {
      console.error('❌ SEO monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = SEOMonitor;
