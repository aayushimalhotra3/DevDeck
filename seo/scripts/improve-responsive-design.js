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
