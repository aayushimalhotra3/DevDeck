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
