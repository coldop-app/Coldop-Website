import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
  lang?: string;
  structuredData?: object;
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Coldop - Complete Cold Storage Management Platform',
  description = 'Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Stay connected and in control. Anytime, anywhere.',
  keywords = 'cold storage, agriculture, farming, inventory management, mobile app, web dashboard, WhatsApp updates, receipt printing, harvest management',
  image = '/coldop-logo.png',
  url = 'https://coldop.com',
  type = 'website',
  siteName = 'Coldop',
  author = 'Coldop Team',
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  canonicalUrl,
  lang = 'en',
  structuredData,
  imageWidth = '1200',
  imageHeight = '630',
  imageAlt = 'Coldop Logo - Complete Cold Storage Management Platform',
}) => {
  const fullTitle = title.includes('Coldop') ? title : `${title} | Coldop`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const fullUrl = canonicalUrl || url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Robots Meta Tags */}
      <meta
        name="robots"
        content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`}
      />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content={imageWidth} />
      <meta property="og:image:height" content={imageHeight} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'hi_IN'} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content="@ColdopApp" />
      <meta name="twitter:creator" content="@ColdopApp" />

      {/* LinkedIn specific meta tags */}
      <meta property="og:image:user_generated" content="false" />

      {/* Additional image meta tags for better compatibility */}
      <meta name="image" content={fullImageUrl} />
      <meta itemProp="image" content={fullImageUrl} />

      {/* Article Meta Tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="oklch(0.63 0.17 149.2)" />
      <meta name="msapplication-TileColor" content="oklch(0.63 0.17 149.2)" />
      <meta name="msapplication-TileImage" content={fullImageUrl} />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Favicon and Apple Touch Icon Links */}
      <link rel="icon" type="image/png" sizes="32x32" href="/coldop-logo.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/coldop-logo.png" />
      <link rel="apple-touch-icon" href="/coldop-logo.png" />
      <link rel="mask-icon" href="/coldop-logo.png" color="oklch(0.63 0.17 149.2)" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;