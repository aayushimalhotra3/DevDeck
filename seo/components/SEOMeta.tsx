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
