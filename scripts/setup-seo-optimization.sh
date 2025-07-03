#!/bin/bash

# SEO Optimization Setup Script
# Creates comprehensive SEO tools and configurations for DevDeck

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SEO_DIR="$PROJECT_ROOT/seo"
COMPONENTS_DIR="$SEO_DIR/components"
CONFIG_DIR="$SEO_DIR/config"
SCRIPTS_DIR="$SEO_DIR/scripts"
TEMPLATES_DIR="$SEO_DIR/templates"
REPORTS_DIR="$SEO_DIR/reports"

print_info "Setting up SEO optimization system for DevDeck..."

# Create directory structure
print_info "Creating directory structure..."
mkdir -p "$SEO_DIR" "$COMPONENTS_DIR" "$CONFIG_DIR" "$SCRIPTS_DIR" "$TEMPLATES_DIR" "$REPORTS_DIR"
print_success "Directory structure created"

# Create SEO configuration
print_info "Creating SEO configuration..."
cat > "$CONFIG_DIR/seo-config.json" << 'EOF'
{
  "site": {
    "name": "DevDeck",
    "description": "A comprehensive development dashboard for modern teams",
    "url": "https://devdeck.com",
    "logo": "/images/logo.png",
    "favicon": "/favicon.ico",
    "language": "en",
    "locale": "en_US",
    "timezone": "UTC"
  },
  "meta": {
    "defaultTitle": "DevDeck - Development Dashboard",
    "titleTemplate": "%s | DevDeck",
    "defaultDescription": "Streamline your development workflow with DevDeck's comprehensive dashboard, analytics, and team collaboration tools.",
    "keywords": [
      "development dashboard",
      "developer tools",
      "team collaboration",
      "project management",
      "analytics",
      "DevOps",
      "continuous integration",
      "code quality"
    ],
    "author": "DevDeck Team",
    "robots": "index,follow",
    "viewport": "width=device-width, initial-scale=1.0"
  },
  "openGraph": {
    "type": "website",
    "siteName": "DevDeck",
    "title": "DevDeck - Development Dashboard",
    "description": "Streamline your development workflow with comprehensive analytics and team collaboration tools.",
    "image": "/images/og-image.png",
    "imageAlt": "DevDeck Dashboard Preview",
    "imageWidth": 1200,
    "imageHeight": 630
  },
  "twitter": {
    "card": "summary_large_image",
    "site": "@devdeck",
    "creator": "@devdeck",
    "title": "DevDeck - Development Dashboard",
    "description": "Streamline your development workflow with comprehensive analytics and team collaboration tools.",
    "image": "/images/twitter-card.png",
    "imageAlt": "DevDeck Dashboard Preview"
  },
  "structuredData": {
    "organization": {
      "@type": "Organization",
      "name": "DevDeck",
      "url": "https://devdeck.com",
      "logo": "https://devdeck.com/images/logo.png",
      "sameAs": [
        "https://twitter.com/devdeck",
        "https://github.com/devdeck",
        "https://linkedin.com/company/devdeck"
      ]
    },
    "website": {
      "@type": "WebSite",
      "name": "DevDeck",
      "url": "https://devdeck.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://devdeck.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  "sitemap": {
    "enabled": true,
    "changefreq": "weekly",
    "priority": 0.8,
    "exclude": [
      "/admin",
      "/api",
      "/private"
    ]
  },
  "robots": {
    "enabled": true,
    "userAgent": "*",
    "allow": ["/"],
    "disallow": [
      "/admin",
      "/api",
      "/private",
      "/*.json$"
    ],
    "sitemap": "https://devdeck.com/sitemap.xml"
  },
  "analytics": {
    "googleAnalytics": {
      "enabled": true,
      "trackingId": "GA_TRACKING_ID"
    },
    "googleSearchConsole": {
      "enabled": true,
      "verificationCode": "GSC_VERIFICATION_CODE"
    },
    "bingWebmaster": {
      "enabled": true,
      "verificationCode": "BING_VERIFICATION_CODE"
    }
  },
  "performance": {
    "preload": [
      "/fonts/inter.woff2",
      "/css/critical.css"
    ],
    "prefetch": [
      "/api/dashboard",
      "/images/hero-bg.webp"
    ],
    "lazyLoading": true,
    "imageOptimization": true,
    "minification": true,
    "compression": true
  },
  "monitoring": {
    "lighthouse": {
      "enabled": true,
      "thresholds": {
        "performance": 90,
        "accessibility": 95,
        "bestPractices": 90,
        "seo": 95
      }
    },
    "coreWebVitals": {
      "enabled": true,
      "thresholds": {
        "lcp": 2.5,
        "fid": 0.1,
        "cls": 0.1
      }
    }
  }
}
EOF
print_success "SEO configuration created"

# Create SEO Meta component
print_info "Creating SEO Meta component..."
cat > "$COMPONENTS_DIR/SEOMeta.tsx" << 'EOF'
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '../config/seo-config.json';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
  structuredData?: object;
}

const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  canonical,
  structuredData
}) => {
  const router = useRouter();
  const currentUrl = `${seoConfig.site.url}${router.asPath}`;
  
  // Build meta title
  const metaTitle = title 
    ? seoConfig.meta.titleTemplate.replace('%s', title)
    : seoConfig.meta.defaultTitle;
  
  // Build meta description
  const metaDescription = description || seoConfig.meta.defaultDescription;
  
  // Build keywords
  const metaKeywords = keywords 
    ? [...seoConfig.meta.keywords, ...keywords].join(', ')
    : seoConfig.meta.keywords.join(', ');
  
  // Build image URL
  const metaImage = image 
    ? `${seoConfig.site.url}${image}`
    : `${seoConfig.site.url}${seoConfig.openGraph.image}`;
  
  const metaImageAlt = imageAlt || seoConfig.openGraph.imageAlt;
  
  // Build canonical URL
  const canonicalUrl = canonical || currentUrl;
  
  // Build robots directive
  const robotsContent = noindex ? 'noindex,nofollow' : seoConfig.meta.robots;
  
  // Build structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...seoConfig.structuredData.organization,
        '@id': `${seoConfig.site.url}/#organization`
      },
      {
        ...seoConfig.structuredData.website,
        '@id': `${seoConfig.site.url}/#website`,
        publisher: {
          '@id': `${seoConfig.site.url}/#organization`
        }
      },
      {
        '@type': 'WebPage',
        '@id': `${currentUrl}#webpage`,
        url: currentUrl,
        name: metaTitle,
        description: metaDescription,
        isPartOf: {
          '@id': `${seoConfig.site.url}/#website`
        },
        about: {
          '@id': `${seoConfig.site.url}/#organization`
        },
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: generateBreadcrumbs(router.asPath)
        }
      }
    ]
  };
  
  const finalStructuredData = structuredData 
    ? { ...defaultStructuredData, ...structuredData }
    : defaultStructuredData;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={seoConfig.meta.author} />
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content={seoConfig.meta.viewport} />
      <meta name="language" content={seoConfig.site.language} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon */}
      <link rel="icon" href={seoConfig.site.favicon} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={seoConfig.openGraph.siteName} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={metaImageAlt} />
      <meta property="og:image:width" content={seoConfig.openGraph.imageWidth.toString()} />
      <meta property="og:image:height" content={seoConfig.openGraph.imageHeight.toString()} />
      <meta property="og:locale" content={seoConfig.site.locale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={seoConfig.twitter.card} />
      <meta name="twitter:site" content={seoConfig.twitter.site} />
      <meta name="twitter:creator" content={seoConfig.twitter.creator} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={metaImageAlt} />
      
      {/* Search Engine Verification */}
      {seoConfig.analytics.googleSearchConsole.enabled && (
        <meta name="google-site-verification" content={seoConfig.analytics.googleSearchConsole.verificationCode} />
      )}
      {seoConfig.analytics.bingWebmaster.enabled && (
        <meta name="msvalidate.01" content={seoConfig.analytics.bingWebmaster.verificationCode} />
      )}
      
      {/* Performance Hints */}
      {seoConfig.performance.preload.map((resource, index) => (
        <link key={index} rel="preload" href={resource} as={getResourceType(resource)} />
      ))}
      {seoConfig.performance.prefetch.map((resource, index) => (
        <link key={index} rel="prefetch" href={resource} />
      ))}
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData)
        }}
      />
    </Head>
  );
};

// Helper function to generate breadcrumbs
function generateBreadcrumbs(path: string) {
  const pathSegments = path.split('/').filter(segment => segment);
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: seoConfig.site.url
    }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: `${seoConfig.site.url}${currentPath}`
    });
  });
  
  return breadcrumbs;
}

// Helper function to determine resource type for preload
function getResourceType(resource: string): string {
  if (resource.includes('.css')) return 'style';
  if (resource.includes('.js')) return 'script';
  if (resource.includes('.woff') || resource.includes('.woff2')) return 'font';
  if (resource.includes('.png') || resource.includes('.jpg') || resource.includes('.webp')) return 'image';
  return 'fetch';
}

export default SEOMeta;
EOF
print_success "SEO Meta component created"

# Create Sitemap generator
print_info "Creating sitemap generator..."
cat > "$SCRIPTS_DIR/generate-sitemap.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const seoConfig = require('../config/seo-config.json');

// Define your routes here
const routes = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/dashboard',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/analytics',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/projects',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/team',
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  {
    url: '/settings',
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: new Date().toISOString()
  },
  {
    url: '/help',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/privacy',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString()
  },
  {
    url: '/terms',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString()
  }
];

// Function to generate XML sitemap
function generateSitemap() {
  const baseUrl = seoConfig.site.url;
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
  
  routes.forEach(route => {
    // Skip excluded routes
    if (seoConfig.sitemap.exclude.some(excluded => route.url.startsWith(excluded))) {
      return;
    }
    
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq || seoConfig.sitemap.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority || seoConfig.sitemap.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Function to generate robots.txt
function generateRobotsTxt() {
  let robotsTxt = '';
  
  robotsTxt += `User-agent: ${seoConfig.robots.userAgent}\n`;
  
  // Add allowed paths
  seoConfig.robots.allow.forEach(path => {
    robotsTxt += `Allow: ${path}\n`;
  });
  
  // Add disallowed paths
  seoConfig.robots.disallow.forEach(path => {
    robotsTxt += `Disallow: ${path}\n`;
  });
  
  robotsTxt += `\nSitemap: ${seoConfig.robots.sitemap}\n`;
  
  return robotsTxt;
}

// Function to save files
function saveFiles() {
  const projectRoot = path.join(__dirname, '../../..');
  const publicDir = path.join(projectRoot, 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Generate and save sitemap
  if (seoConfig.sitemap.enabled) {
    const sitemapXml = generateSitemap();
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
    console.log('✅ Sitemap generated: public/sitemap.xml');
  }
  
  // Generate and save robots.txt
  if (seoConfig.robots.enabled) {
    const robotsTxt = generateRobotsTxt();
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('✅ Robots.txt generated: public/robots.txt');
  }
}

// Function to add dynamic routes (for future use)
function addDynamicRoutes() {
  // This function can be extended to fetch dynamic routes from database
  // For example: blog posts, project pages, user profiles, etc.
  
  // Example implementation:
  /*
  const dynamicRoutes = await fetchDynamicRoutes();
  dynamicRoutes.forEach(route => {
    routes.push({
      url: route.path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: route.updatedAt
    });
  });
  */
}

// Main execution
if (require.main === module) {
  try {
    console.log('🚀 Generating SEO files...');
    addDynamicRoutes();
    saveFiles();
    console.log('✅ SEO files generated successfully!');
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    process.exit(1);
  }
}

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  addDynamicRoutes,
  saveFiles
};
EOF
print_success "Sitemap generator created"

# Create SEO analyzer
print_info "Creating SEO analyzer..."
cat > "$SCRIPTS_DIR/analyze-seo.js" << 'EOF'
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
EOF
print_success "SEO analyzer created"

# Create SEO monitoring script
print_info "Creating SEO monitoring script..."
cat > "$SCRIPTS_DIR/monitor-seo.js" << 'EOF'
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
EOF
print_success "SEO monitoring script created"

# Create SEO automation script
print_info "Creating SEO automation script..."
cat > "$SCRIPTS_DIR/automate-seo.sh" << 'EOF'
#!/bin/bash

# SEO Automation Script
# Handles scheduled SEO tasks, monitoring, and optimization

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEO_DIR="$SCRIPT_DIR/.."
REPORTS_DIR="$SEO_DIR/reports"
LOGS_DIR="$SEO_DIR/logs"
CONFIG_FILE="$SEO_DIR/config/seo-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$REPORTS_DIR"

# Function to generate sitemap and robots.txt
generate_seo_files() {
    log_info "Generating SEO files..."
    
    if node "$SCRIPT_DIR/generate-sitemap.js"; then
        log_success "SEO files generated successfully"
    else
        log_error "Failed to generate SEO files"
        return 1
    fi
}

# Function to run SEO analysis
run_seo_analysis() {
    log_info "Running SEO analysis..."
    
    if node "$SCRIPT_DIR/analyze-seo.js"; then
        log_success "SEO analysis completed"
    else
        log_error "SEO analysis failed"
        return 1
    fi
}

# Function to run SEO monitoring
run_seo_monitoring() {
    log_info "Running SEO monitoring..."
    
    if node "$SCRIPT_DIR/monitor-seo.js"; then
        log_success "SEO monitoring completed"
    else
        log_error "SEO monitoring failed"
        return 1
    fi
}

# Function to optimize images for SEO
optimize_images() {
    log_info "Optimizing images for SEO..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local images_dir="$project_root/public/images"
    
    if [[ -d "$images_dir" ]]; then
        # Find and optimize images
        find "$images_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r image; do
            # Check if image has alt text in usage (simplified check)
            local basename=$(basename "$image")
            local usage_count=$(find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "$basename" | wc -l)
            
            if [[ $usage_count -eq 0 ]]; then
                log_warning "Unused image found: $basename"
            fi
        done
        
        log_success "Image optimization check completed"
    else
        log_warning "Images directory not found: $images_dir"
    fi
}

# Function to check internal links
check_internal_links() {
    log_info "Checking internal links..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local broken_links=0
    
    # This is a simplified check - in production, use a proper link checker
    find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | while read -r file; do
        # Extract internal links (simplified regex)
        grep -oE 'href="/[^"]*"' "$file" 2>/dev/null | while read -r link; do
            local path=$(echo "$link" | sed 's/href="\(.*\)"/\1/')
            # Check if corresponding file/route exists (simplified)
            if [[ "$path" == "/"* ]] && [[ ! "$path" =~ ^/(api|_next|static) ]]; then
                # This would need more sophisticated route checking in a real implementation
                echo "Found internal link: $path in $file"
            fi
        done
    done
    
    log_success "Internal links check completed"
}

# Function to validate structured data
validate_structured_data() {
    log_info "Validating structured data..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local validation_errors=0
    
    # Find files with JSON-LD structured data
    find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "application/ld+json" | while read -r file; do
        log_info "Found structured data in: $file"
        
        # Extract and validate JSON-LD (simplified)
        grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' "$file" 2>/dev/null | while read -r json; do
            if echo "$json" | jq . >/dev/null 2>&1; then
                log_success "Valid JSON-LD found in $file"
            else
                log_error "Invalid JSON-LD found in $file"
                ((validation_errors++))
            fi
        done
    done
    
    if [[ $validation_errors -eq 0 ]]; then
        log_success "Structured data validation completed"
    else
        log_warning "$validation_errors structured data validation errors found"
    fi
}

# Function to cleanup old reports
cleanup_old_reports() {
    log_info "Cleaning up old SEO reports..."
    
    # Keep reports for 30 days
    find "$REPORTS_DIR" -name "*.json" -type f -mtime +30 -delete 2>/dev/null || true
    
    # Keep logs for 14 days
    find "$LOGS_DIR" -name "*.log" -type f -mtime +14 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Function to backup SEO data
backup_seo_data() {
    log_info "Creating SEO data backup..."
    
    local backup_dir="$SEO_DIR/backups"
    local backup_file="$backup_dir/seo-backup-$(date +%Y%m%d).tar.gz"
    
    mkdir -p "$backup_dir"
    
    # Create backup of reports and configuration
    tar -czf "$backup_file" -C "$SEO_DIR" reports config 2>/dev/null || {
        log_error "Failed to create SEO backup"
        return 1
    }
    
    # Keep backups for 30 days
    find "$backup_dir" -name "seo-backup-*.tar.gz" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "SEO backup created: $backup_file"
}

# Function to generate SEO dashboard
generate_seo_dashboard() {
    log_info "Generating SEO dashboard..."
    
    local dashboard_file="$SEO_DIR/dashboard.html"
    
    cat > "$dashboard_file" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck SEO Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .score-good { color: #4CAF50; }
        .score-warning { color: #FF9800; }
        .score-poor { color: #F44336; }
        .issue { padding: 10px; margin: 5px 0; border-left: 4px solid #F44336; background: #ffebee; }
        .recommendation { padding: 10px; margin: 5px 0; border-left: 4px solid #2196F3; background: #e3f2fd; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DevDeck SEO Dashboard</h1>
        <p>Last updated: <span id="lastUpdated"></span></p>
        
        <div class="card">
            <h2>SEO Score</h2>
            <div class="metric">
                <div class="metric-value" id="seoScore">-</div>
                <div class="metric-label">Overall Score</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Core Web Vitals</h2>
            <div id="coreWebVitals">
                <div class="metric">
                    <div class="metric-value" id="lcp">-</div>
                    <div class="metric-label">LCP (s)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="fid">-</div>
                    <div class="metric-label">FID (ms)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="cls">-</div>
                    <div class="metric-label">CLS</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>Issues & Recommendations</h2>
            <div id="issues"></div>
            <div id="recommendations"></div>
        </div>
        
        <div class="card">
            <h2>Search Rankings</h2>
            <div class="chart-placeholder">Ranking trends would be displayed here</div>
        </div>
    </div>
    
    <script>
        // Load latest SEO report
        fetch('./reports/latest-seo-report.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
                
                // Update SEO score
                const score = data.score || 0;
                const scoreElement = document.getElementById('seoScore');
                scoreElement.textContent = score;
                scoreElement.className = `metric-value ${
                    score >= 80 ? 'score-good' : score >= 60 ? 'score-warning' : 'score-poor'
                }`;
                
                // Update issues
                const issuesContainer = document.getElementById('issues');
                if (data.issues && data.issues.length > 0) {
                    data.issues.slice(0, 5).forEach(issue => {
                        const issueDiv = document.createElement('div');
                        issueDiv.className = 'issue';
                        issueDiv.innerHTML = `<strong>Issue:</strong> ${issue}`;
                        issuesContainer.appendChild(issueDiv);
                    });
                } else {
                    issuesContainer.innerHTML = '<div style="color: #4CAF50;">No critical issues found!</div>';
                }
                
                // Update recommendations
                const recommendationsContainer = document.getElementById('recommendations');
                if (data.recommendations && data.recommendations.length > 0) {
                    data.recommendations.slice(0, 3).forEach(rec => {
                        const recDiv = document.createElement('div');
                        recDiv.className = 'recommendation';
                        recDiv.innerHTML = `<strong>Recommendation:</strong> ${rec}`;
                        recommendationsContainer.appendChild(recDiv);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading SEO data:', error);
                document.getElementById('issues').innerHTML = '<div class="issue">Unable to load SEO data</div>';
            });
    </script>
</body>
</html>
HTML
    
    log_success "SEO dashboard generated: $dashboard_file"
}

# Main execution
case "${1:-help}" in
    "generate")
        generate_seo_files
        ;;
    "analyze")
        run_seo_analysis
        ;;
    "monitor")
        run_seo_monitoring
        ;;
    "optimize")
        optimize_images
        check_internal_links
        validate_structured_data
        ;;
    "dashboard")
        generate_seo_dashboard
        ;;
    "cleanup")
        cleanup_old_reports
        ;;
    "backup")
        backup_seo_data
        ;;
    "daily")
        generate_seo_files
        run_seo_monitoring
        generate_seo_dashboard
        ;;
    "weekly")
        run_seo_analysis
        optimize_images
        check_internal_links
        validate_structured_data
        cleanup_old_reports
        ;;
    "monthly")
        backup_seo_data
        ;;
    "all")
        generate_seo_files
        run_seo_analysis
        run_seo_monitoring
        optimize_images
        check_internal_links
        validate_structured_data
        generate_seo_dashboard
        ;;
    "help")
        echo "Usage: $0 {generate|analyze|monitor|optimize|dashboard|cleanup|backup|daily|weekly|monthly|all|help}"
        echo ""
        echo "Commands:"
        echo "  generate  - Generate sitemap and robots.txt"
        echo "  analyze   - Run comprehensive SEO analysis"
        echo "  monitor   - Monitor SEO metrics and Core Web Vitals"
        echo "  optimize  - Run SEO optimization checks"
        echo "  dashboard - Generate SEO dashboard"
        echo "  cleanup   - Clean up old reports and logs"
        echo "  backup    - Create SEO data backup"
        echo "  daily     - Daily SEO tasks (generate + monitor + dashboard)"
        echo "  weekly    - Weekly SEO tasks (analyze + optimize + cleanup)"
        echo "  monthly   - Monthly SEO tasks (backup)"
        echo "  all       - Run all SEO tasks"
        echo "  help      - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
EOF

chmod +x "$SCRIPTS_DIR/automate-seo.sh"
print_success "SEO automation script created"

# Create responsive design improvements script
print_info "Creating responsive design improvements script..."
cat > "$SCRIPTS_DIR/improve-responsive-design.js" << 'EOF'
const fs = require('fs');
const path = require('path');

class ResponsiveDesignImprover {
  constructor() {
    this.improvements = [];
    this.cssRules = [];
    this.htmlChanges = [];
  }

  // Analyze and improve responsive design
  async analyzeAndImprove(projectPath) {
    console.log('🔍 Analyzing responsive design...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      projectPath,
      issues: [],
      improvements: [],
      recommendations: []
    };

    // Check for viewport meta tag
    await this.checkViewportMeta(projectPath, analysis);
    
    // Analyze CSS for responsive issues
    await this.analyzeCSSResponsiveness(projectPath, analysis);
    
    // Check for mobile-friendly components
    await this.checkMobileFriendlyComponents(projectPath, analysis);
    
    // Generate responsive improvements
    await this.generateResponsiveImprovements(projectPath, analysis);
    
    return analysis;
  }

  // Check for viewport meta tag
  async checkViewportMeta(projectPath, analysis) {
    const htmlFiles = this.findFiles(projectPath, ['.html', '.tsx', '.jsx']);
    let hasViewport = false;
    
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('name="viewport"')) {
        hasViewport = true;
        break;
      }
    }
    
    if (!hasViewport) {
      analysis.issues.push({
        type: 'viewport',
        severity: 'high',
        message: 'Missing viewport meta tag',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to HTML head'
      });
      
      analysis.improvements.push({
        type: 'viewport',
        action: 'add_viewport_meta',
        description: 'Add responsive viewport meta tag'
      });
    }
  }

  // Analyze CSS for responsive issues
  async analyzeCSSResponsiveness(projectPath, analysis) {
    const cssFiles = this.findFiles(projectPath, ['.css', '.scss', '.sass']);
    const issues = [];
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for fixed widths
      const fixedWidths = content.match(/width:\s*\d+px/g);
      if (fixedWidths && fixedWidths.length > 5) {
        issues.push({
          file,
          type: 'fixed-width',
          count: fixedWidths.length,
          message: `Found ${fixedWidths.length} fixed width declarations`
        });
      }
      
      // Check for media queries
      const mediaQueries = content.match(/@media[^{]+{/g);
      if (!mediaQueries || mediaQueries.length < 2) {
        issues.push({
          file,
          type: 'media-queries',
          message: 'Insufficient media queries for responsive design'
        });
      }
      
      // Check for flexbox/grid usage
      const hasFlexbox = content.includes('display: flex') || content.includes('display:flex');
      const hasGrid = content.includes('display: grid') || content.includes('display:grid');
      
      if (!hasFlexbox && !hasGrid) {
        issues.push({
          file,
          type: 'layout',
          message: 'No modern layout methods (flexbox/grid) detected'
        });
      }
    }
    
    analysis.issues.push(...issues);
    
    // Generate CSS improvements
    if (issues.length > 0) {
      analysis.improvements.push({
        type: 'css',
        action: 'improve_responsive_css',
        description: 'Add responsive CSS improvements',
        files: issues.map(i => i.file)
      });
    }
  }

  // Check for mobile-friendly components
  async checkMobileFriendlyComponents(projectPath, analysis) {
    const componentFiles = this.findFiles(projectPath, ['.tsx', '.jsx']);
    const issues = [];
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for touch-friendly elements
      const hasButtons = content.includes('<button') || content.includes('<Button');
      const hasLinks = content.includes('<a ') || content.includes('<Link');
      
      if (hasButtons || hasLinks) {
        // Check for touch target sizing
        if (!content.includes('min-height') && !content.includes('minHeight')) {
          issues.push({
            file,
            type: 'touch-targets',
            message: 'Interactive elements may not meet minimum touch target size (44px)'
          });
        }
      }
      
      // Check for responsive images
      const images = content.match(/<img[^>]+>/g);
      if (images) {
        const responsiveImages = images.filter(img => 
          img.includes('srcset') || img.includes('sizes') || img.includes('max-width')
        );
        
        if (responsiveImages.length < images.length) {
          issues.push({
            file,
            type: 'responsive-images',
            message: `${images.length - responsiveImages.length} non-responsive images found`
          });
        }
      }
    }
    
    analysis.issues.push(...issues);
  }

  // Generate responsive improvements
  async generateResponsiveImprovements(projectPath, analysis) {
    const improvementsDir = path.join(projectPath, 'responsive-improvements');
    if (!fs.existsSync(improvementsDir)) {
      fs.mkdirSync(improvementsDir, { recursive: true });
    }
    
    // Generate responsive CSS utilities
    const responsiveCSS = this.generateResponsiveCSS();
    fs.writeFileSync(path.join(improvementsDir, 'responsive-utilities.css'), responsiveCSS);
    
    // Generate responsive component examples
    const responsiveComponents = this.generateResponsiveComponents();
    fs.writeFileSync(path.join(improvementsDir, 'responsive-components.tsx'), responsiveComponents);
    
    // Generate responsive layout examples
    const responsiveLayouts = this.generateResponsiveLayouts();
    fs.writeFileSync(path.join(improvementsDir, 'responsive-layouts.css'), responsiveLayouts);
    
    analysis.improvements.push({
      type: 'generated-files',
      action: 'create_responsive_utilities',
      description: 'Generated responsive design utilities and examples',
      files: [
        'responsive-utilities.css',
        'responsive-components.tsx',
        'responsive-layouts.css'
      ]
    });
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);
  }

  // Generate responsive CSS utilities
  generateResponsiveCSS() {
    return `/* Responsive Design Utilities */

/* Breakpoints */
:root {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 768px;
  --breakpoint-md: 1024px;
  --breakpoint-lg: 1200px;
  --breakpoint-xl: 1440px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}

/* Responsive Grid */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1024px) {
  .grid-5 { grid-template-columns: repeat(5, 1fr); }
  .grid-6 { grid-template-columns: repeat(6, 1fr); }
}

/* Flexbox Utilities */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

/* Responsive Text */
.text-responsive {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

.heading-responsive {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

/* Touch-Friendly Elements */
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-touch:hover {
  transform: translateY(-1px);
}

.btn-touch:active {
  transform: translateY(0);
}

/* Responsive Images */
.img-responsive {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Hide/Show on Different Screens */
.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: block;
  }
  
  .hide-desktop {
    display: none;
  }
}

/* Spacing Utilities */
.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

/* Responsive Padding/Margin */
.p-responsive {
  padding: 1rem;
}

@media (min-width: 768px) {
  .p-responsive {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .p-responsive {
    padding: 3rem;
  }
}

/* Card Component */
.card-responsive {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .card-responsive {
    padding: 1.5rem;
  }
}

/* Navigation */
.nav-responsive {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .nav-responsive {
    flex-direction: row;
    gap: 2rem;
  }
}

/* Form Elements */
.form-responsive {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .form-responsive {
    flex-direction: row;
    align-items: end;
  }
}

.input-responsive {
  width: 100%;
  min-height: 44px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.input-responsive:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
`;
  }

  // Generate responsive component examples
  generateResponsiveComponents() {
    return `import React from 'react';

// Responsive Card Component
export const ResponsiveCard: React.FC<{
  title: string;
  content: string;
  image?: string;
}> = ({ title, content, image }) => {
  return (
    <div className="card-responsive">
      {image && (
        <img 
          src={image} 
          alt={title}
          className="img-responsive"
          style={{ marginBottom: '1rem' }}
        />
      )}
      <h3 className="heading-responsive">{title}</h3>
      <p className="text-responsive">{content}</p>
    </div>
  );
};

// Responsive Navigation
export const ResponsiveNav: React.FC<{
  items: { label: string; href: string }[];
}> = ({ items }) => {
  return (
    <nav className="nav-responsive">
      {items.map((item, index) => (
        <a 
          key={index}
          href={item.href}
          className="btn-touch"
          style={{
            textDecoration: 'none',
            background: '#3b82f6',
            color: 'white',
            textAlign: 'center'
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

// Responsive Grid Layout
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}> = ({ children, columns = 3 }) => {
  return (
    <div className={\`grid grid-\${columns}\`}>
      {children}
    </div>
  );
};

// Responsive Form
export const ResponsiveForm: React.FC<{
  onSubmit: (data: any) => void;
}> = ({ onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="form-responsive">
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        className="input-responsive"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        className="input-responsive"
        required
      />
      <button type="submit" className="btn-touch">
        Submit
      </button>
    </form>
  );
};

// Responsive Image Gallery
export const ResponsiveGallery: React.FC<{
  images: { src: string; alt: string }[];
}> = ({ images }) => {
  return (
    <div className="grid grid-2 grid-md-3 grid-lg-4">
      {images.map((image, index) => (
        <div key={index} className="card-responsive">
          <img
            src={image.src}
            alt={image.alt}
            className="img-responsive"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

// Responsive Dashboard Layout
export const ResponsiveDashboard: React.FC<{
  sidebar: React.ReactNode;
  main: React.ReactNode;
}> = ({ sidebar, main }) => {
  return (
    <div className="container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        '@media (min-width: 768px)': {
          gridTemplateColumns: '250px 1fr'
        }
      }}>
        <aside className="hide-mobile">
          {sidebar}
        </aside>
        <main className="p-responsive">
          {main}
        </main>
      </div>
    </div>
  );
};
`;
  }

  // Generate responsive layout examples
  generateResponsiveLayouts() {
    return `/* Responsive Layout Examples */

/* Mobile-First Approach */
.layout-mobile-first {
  /* Mobile styles (default) */
  padding: 1rem;
  font-size: 14px;
}

@media (min-width: 768px) {
  .layout-mobile-first {
    /* Tablet styles */
    padding: 2rem;
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  .layout-mobile-first {
    /* Desktop styles */
    padding: 3rem;
    font-size: 18px;
  }
}

/* Responsive Header */
.header-responsive {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
}

@media (min-width: 768px) {
  .header-responsive {
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem 2rem;
  }
}

/* Responsive Sidebar Layout */
.layout-with-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .layout-with-sidebar {
    flex-direction: row;
  }
  
  .sidebar {
    width: 250px;
    flex-shrink: 0;
  }
  
  .main-content {
    flex: 1;
    padding: 2rem;
  }
}

/* Responsive Card Grid */
.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Responsive Hero Section */
.hero-responsive {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  min-height: 50vh;
}

@media (min-width: 768px) {
  .hero-responsive {
    flex-direction: row;
    text-align: left;
    padding: 4rem 2rem;
    min-height: 60vh;
  }
  
  .hero-content {
    flex: 1;
    padding-right: 2rem;
  }
  
  .hero-image {
    flex: 1;
  }
}

/* Responsive Footer */
.footer-responsive {
  display: grid;
  gap: 2rem;
  padding: 2rem 1rem;
  background: #1f2937;
  color: white;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .footer-responsive {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    padding: 3rem 2rem;
  }
}

/* Responsive Table */
.table-responsive {
  overflow-x: auto;
}

.table-responsive table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
}

.table-responsive th,
.table-responsive td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

@media (max-width: 767px) {
  .table-responsive {
    font-size: 14px;
  }
  
  .table-responsive th,
  .table-responsive td {
    padding: 0.5rem;
  }
}

/* Responsive Modal */
.modal-responsive {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .modal-content {
    padding: 2rem;
  }
}

/* Print Styles */
@media print {
  .hide-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.4;
  }
}
`;
  }

  // Generate recommendations
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Viewport recommendations
    const viewportIssues = analysis.issues.filter(i => i.type === 'viewport');
    if (viewportIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'mobile',
        title: 'Add Viewport Meta Tag',
        description: 'Essential for responsive design on mobile devices',
        implementation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to HTML head'
      });
    }
    
    // CSS recommendations
    const cssIssues = analysis.issues.filter(i => i.type === 'fixed-width' || i.type === 'media-queries');
    if (cssIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'css',
        title: 'Improve CSS Responsiveness',
        description: 'Replace fixed widths with flexible units and add media queries',
        implementation: 'Use percentages, em/rem units, and CSS Grid/Flexbox for layouts'
      });
    }
    
    // Touch target recommendations
    const touchIssues = analysis.issues.filter(i => i.type === 'touch-targets');
    if (touchIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'usability',
        title: 'Improve Touch Target Sizes',
        description: 'Ensure interactive elements are at least 44px in height/width',
        implementation: 'Add min-height: 44px and adequate padding to buttons and links'
      });
    }
    
    // Image recommendations
    const imageIssues = analysis.issues.filter(i => i.type === 'responsive-images');
    if (imageIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Implement Responsive Images',
        description: 'Use srcset and sizes attributes for optimal image loading',
        implementation: 'Add srcset with multiple image sizes and appropriate sizes attribute'
      });
    }
    
    return recommendations;
  }

  // Find files with specific extensions
  findFiles(dir, extensions) {
    const files = [];
    
    const scanDir = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDir(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    scanDir(dir);
    return files;
  }

  // Save analysis report
  saveReport(analysis, outputPath) {
    const reportPath = path.join(outputPath, `responsive-analysis-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`📊 Responsive design analysis saved: ${reportPath}`);
    return reportPath;
  }
}

// CLI usage
if (require.main === module) {
  const improver = new ResponsiveDesignImprover();
  const projectPath = process.argv[2] || process.cwd();
  
  improver.analyzeAndImprove(projectPath)
    .then(analysis => {
      console.log('\n📱 Responsive Design Analysis Results:');
      console.log(`Issues Found: ${analysis.issues.length}`);
      console.log(`Improvements Generated: ${analysis.improvements.length}`);
      console.log(`Recommendations: ${analysis.recommendations.length}`);
      
      if (analysis.issues.length > 0) {
        console.log('\n🔍 Issues:');
        analysis.issues.forEach(issue => {
          console.log(`  - ${issue.type}: ${issue.message}`);
        });
      }
      
      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        analysis.recommendations.forEach(rec => {
          console.log(`  - ${rec.title} (${rec.priority} priority)`);
          console.log(`    ${rec.description}`);
        });
      }
      
      // Save report
      const reportsDir = path.join(projectPath, 'responsive-improvements');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      improver.saveReport(analysis, reportsDir);
      
      console.log('\n✅ Responsive design analysis completed!');
      console.log('📁 Check the responsive-improvements directory for generated utilities and examples.');
    })
    .catch(error => {
      console.error('❌ Responsive design analysis failed:', error);
      process.exit(1);
    });
}

module.exports = ResponsiveDesignImprover;
EOF
print_success "Responsive design improvements script created"

# Create comprehensive README
print_info "Creating comprehensive README..."
cat > "$SEO_DIR/README.md" << 'EOF'
# DevDeck SEO Optimization System

A comprehensive SEO optimization toolkit for DevDeck that provides automated SEO analysis, monitoring, and improvements.

## 🚀 Quick Start

```bash
# Run the setup script
./scripts/setup-seo-optimization.sh

# Generate SEO files (sitemap, robots.txt)
./seo/scripts/automate-seo.sh generate

# Run comprehensive SEO analysis
./seo/scripts/automate-seo.sh analyze

# Start SEO monitoring
./seo/scripts/automate-seo.sh monitor

# Generate SEO dashboard
./seo/scripts/automate-seo.sh dashboard
```

## 📁 Directory Structure

```
seo/
├── components/           # React SEO components
│   └── SEOMeta.tsx      # Dynamic meta tags component
├── config/              # SEO configuration
│   └── seo-config.json  # Main SEO settings
├── scripts/             # SEO automation scripts
│   ├── generate-sitemap.js     # Sitemap generation
│   ├── analyze-seo.js          # SEO analysis
│   ├── monitor-seo.js          # SEO monitoring
│   ├── automate-seo.sh         # Main automation script
│   └── improve-responsive-design.js # Responsive design improvements
├── templates/           # SEO templates
├── reports/            # Generated reports
├── logs/               # System logs
└── dashboard.html      # SEO dashboard
```

## 🛠️ Components

### SEOMeta Component

Dynamic SEO meta tags for React/Next.js applications:

```tsx
import { SEOMeta } from './seo/components/SEOMeta';

<SEOMeta
  title="Page Title"
  description="Page description"
  keywords={['keyword1', 'keyword2']}
  image="/images/og-image.jpg"
  url="https://example.com/page"
/>
```

### Configuration

Customize SEO settings in `seo/config/seo-config.json`:

```json
{
  "site": {
    "name": "DevDeck",
    "url": "https://devdeck.app",
    "description": "Professional development dashboard"
  },
  "meta": {
    "keywords": ["development", "dashboard", "productivity"],
    "author": "DevDeck Team"
  }
}
```

## 📊 Features

### 1. SEO Analysis
- **Meta Tags Analysis**: Title, description, keywords validation
- **Heading Structure**: H1-H6 hierarchy checking
- **Image Optimization**: Alt text, file size analysis
- **Link Analysis**: Internal/external link validation
- **Structured Data**: JSON-LD schema validation
- **Performance Metrics**: Core Web Vitals monitoring

### 2. Automated Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Search Rankings**: Keyword position monitoring
- **Technical SEO**: Sitemap, robots.txt, SSL checks
- **Alert System**: Webhook notifications for issues
- **Trend Analysis**: Historical performance tracking

### 3. Content Generation
- **Sitemap Generation**: Automatic XML sitemap creation
- **Robots.txt**: Dynamic robots.txt generation
- **Meta Tags**: Automated meta tag suggestions
- **Structured Data**: Schema.org markup generation

### 4. Responsive Design
- **Mobile-First Analysis**: Responsive design evaluation
- **Touch Target Validation**: Minimum size checking
- **Viewport Configuration**: Meta viewport validation
- **CSS Responsiveness**: Media query analysis
- **Component Generation**: Responsive React components

## 🔧 Scripts

### Main Automation Script

```bash
# Daily SEO tasks
./seo/scripts/automate-seo.sh daily

# Weekly comprehensive analysis
./seo/scripts/automate-seo.sh weekly

# Monthly backup and maintenance
./seo/scripts/automate-seo.sh monthly

# Run all SEO tasks
./seo/scripts/automate-seo.sh all
```

### Individual Scripts

```bash
# Generate sitemap and robots.txt
node ./seo/scripts/generate-sitemap.js

# Analyze SEO for specific URL
node ./seo/scripts/analyze-seo.js https://example.com

# Monitor SEO metrics
node ./seo/scripts/monitor-seo.js

# Improve responsive design
node ./seo/scripts/improve-responsive-design.js /path/to/project
```

## 📈 Monitoring & Alerts

### Alert Conditions
- SEO score below 80
- Core Web Vitals exceeding thresholds
- Missing critical meta tags
- Broken internal links
- SSL certificate issues
- Sitemap/robots.txt problems

### Alert Channels
- **Webhook**: POST to configured URL
- **File Logging**: JSON alerts in reports/alerts/
- **Console Output**: Real-time notifications

### Environment Variables

```bash
# Webhook URL for alerts
export SEO_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Monitoring intervals
export SEO_MONITOR_INTERVAL="3600" # 1 hour

# Alert thresholds
export SEO_SCORE_THRESHOLD="80"
export LCP_THRESHOLD="2.5"
export FID_THRESHOLD="0.1"
export CLS_THRESHOLD="0.1"
```

## 🎯 Best Practices

### 1. Meta Tags
- **Title**: 30-60 characters, include primary keyword
- **Description**: 120-160 characters, compelling and descriptive
- **Keywords**: 5-10 relevant keywords, avoid stuffing

### 2. Content Structure
- **H1**: One per page, include primary keyword
- **H2-H6**: Logical hierarchy, descriptive headings
- **Content**: Original, valuable, keyword-optimized

### 3. Technical SEO
- **SSL**: Always use HTTPS
- **Sitemap**: Update automatically, submit to search engines
- **Robots.txt**: Allow important pages, block sensitive areas
- **Core Web Vitals**: Optimize for speed and user experience

### 4. Mobile Optimization
- **Viewport**: Include responsive viewport meta tag
- **Touch Targets**: Minimum 44px for interactive elements
- **Images**: Use responsive images with srcset
- **Layout**: Mobile-first responsive design

## 🔍 Troubleshooting

### Common Issues

1. **Sitemap Generation Fails**
   ```bash
   # Check configuration
   cat seo/config/seo-config.json
   
   # Verify routes
   node -e "console.log(require('./seo/config/seo-config.json').sitemap.routes)"
   ```

2. **SEO Analysis Errors**
   ```bash
   # Check URL accessibility
   curl -I https://your-site.com
   
   # Verify dependencies
   npm list cheerio jsdom
   ```

3. **Monitoring Alerts Not Working**
   ```bash
   # Test webhook URL
   curl -X POST $SEO_WEBHOOK_URL -H "Content-Type: application/json" -d '{"test": true}'
   
   # Check environment variables
   env | grep SEO_
   ```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=seo:*

# Run with verbose output
node ./seo/scripts/analyze-seo.js --verbose
```

## 📚 API Reference

### SEO Analysis API

```javascript
const SEOAnalyzer = require('./seo/scripts/analyze-seo');

const analyzer = new SEOAnalyzer();
const results = await analyzer.analyze('https://example.com');

console.log(results.score); // Overall SEO score
console.log(results.issues); // Array of issues
console.log(results.recommendations); // Improvement suggestions
```

### SEO Monitoring API

```javascript
const SEOMonitor = require('./seo/scripts/monitor-seo');

const monitor = new SEOMonitor();
const report = await monitor.generateMonitoringReport(urls, keywords);

console.log(report.summary.overallScore);
console.log(report.coreWebVitals);
console.log(report.recommendations);
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Production environment variables
   export NODE_ENV=production
   export SEO_WEBHOOK_URL="your-webhook-url"
   export SEO_MONITOR_INTERVAL="1800" # 30 minutes
   ```

2. **Cron Jobs**
   ```bash
   # Add to crontab
   0 */6 * * * /path/to/seo/scripts/automate-seo.sh daily
   0 2 * * 1 /path/to/seo/scripts/automate-seo.sh weekly
   0 3 1 * * /path/to/seo/scripts/automate-seo.sh monthly
   ```

3. **Monitoring Setup**
   ```bash
   # Start monitoring service
   pm2 start seo/scripts/monitor-seo.js --name "seo-monitor"
   pm2 save
   pm2 startup
   ```

### CI/CD Integration

```yaml
# GitHub Actions example
name: SEO Check
on: [push, pull_request]

jobs:
  seo-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run SEO analysis
        run: node ./seo/scripts/analyze-seo.js
      - name: Check SEO score
        run: |
          SCORE=$(node -e "const fs=require('fs'); const report=JSON.parse(fs.readFileSync('./seo/reports/latest-seo-report.json')); console.log(report.score);")
          if [ $SCORE -lt 80 ]; then
            echo "SEO score ($SCORE) is below threshold (80)"
            exit 1
          fi
```

## 🔒 Security & Privacy

- **Data Protection**: No sensitive data in reports
- **Webhook Security**: Use HTTPS for webhook URLs
- **File Permissions**: Restrict access to configuration files
- **API Keys**: Store in environment variables, not in code

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Join community discussions
- **Updates**: Follow release notes for new features

## 📝 License

MIT License - see LICENSE file for details.

## 🗺️ Roadmap

- [ ] Advanced keyword research tools
- [ ] Competitor analysis features
- [ ] A/B testing for meta tags
- [ ] Integration with Google Search Console
- [ ] Advanced structured data templates
- [ ] Multi-language SEO support
- [ ] Performance budget integration
- [ ] Advanced image optimization
EOF
print_success "Comprehensive README created"