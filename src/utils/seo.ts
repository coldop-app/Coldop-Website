// SEO Constants
export const SEO_CONSTANTS = {
  SITE_NAME: 'Coldop',
  SITE_URL: 'https://coldop.com',
  SITE_DESCRIPTION: 'Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Stay connected and in control. Anytime, anywhere.',
  SITE_KEYWORDS: 'cold storage, agriculture, farming, inventory management, mobile app, web dashboard, WhatsApp updates, receipt printing, harvest management',
  SITE_IMAGE: '/coldop-logo.png',
  AUTHOR: 'Coldop Team',
  TWITTER_HANDLE: '@ColdopApp',
  FACEBOOK_APP_ID: '',
  THEME_COLOR: '#3B82F6',
};

// Page-specific SEO data
export const SEO_PAGES = {
  HOME: {
    title: 'Coldop - Complete Cold Storage Management Platform',
    description: 'Transform your cold storage operations with Coldop\'s comprehensive management platform. Mobile app, web dashboard, WhatsApp updates, and instant receipt printing.',
    keywords: 'cold storage management, agriculture technology, farming solutions, inventory management, mobile app, web dashboard, WhatsApp notifications, receipt printing, harvest management, farmer management',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Coldop',
      description: 'Complete Cold Storage Management Platform',
      url: 'https://coldop.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://coldop.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
  SIGNUP: {
    title: 'Sign Up - Start Your Cold Storage Management Journey',
    description: 'Join thousands of farmers and storage managers using Coldop to streamline their operations. Create your account and start managing your cold storage efficiently.',
    keywords: 'coldop signup, cold storage registration, farming account, agriculture management signup',
    noindex: true,
    nofollow: true,
  },
  STORE_ADMIN_LOGIN: {
    title: 'Store Admin Login - Access Your Dashboard',
    description: 'Access your Coldop store admin dashboard to manage farmers, inventory, and operations. Secure login for cold storage administrators.',
    keywords: 'store admin login, coldop dashboard, cold storage admin, management portal',
    noindex: true,
    nofollow: true,
  },
  FARMER_LOGIN: {
    title: 'Farmer Login - Check Your Storage Status',
    description: 'Farmers can login to check their cold storage status, view receipts, and track their harvest inventory with Coldop.',
    keywords: 'farmer login, coldop farmer portal, harvest tracking, storage status',
    noindex: true,
    nofollow: true,
  },
  NOT_FOUND: {
    title: 'Page Not Found - Coldop',
    description: 'The page you\'re looking for doesn\'t exist. Return to Coldop\'s homepage to explore our cold storage management solutions.',
    keywords: 'page not found, 404 error, coldop navigation',
    noindex: true,
    nofollow: true,
  },
  ERROR: {
    title: 'Error - Coldop',
    description: 'An error occurred. Please try again or return to the homepage to continue using Coldop\'s cold storage management platform.',
    keywords: 'error page, system error, coldop support',
    noindex: true,
    nofollow: true,
  },
};

// Generate structured data for organization
export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coldop',
  description: 'Complete Cold Storage Management Platform',
  url: 'https://coldop.com',
  logo: 'https://coldop.com/coldop-logo.png',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@coldop.com',
  },
  sameAs: [
    'https://twitter.com/ColdopApp',
    'https://facebook.com/ColdopApp',
    'https://linkedin.com/company/coldop',
  ],
});

// Generate structured data for software application
export const getSoftwareApplicationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Coldop',
  description: 'Complete Cold Storage Management Platform with mobile app, web dashboard, WhatsApp updates, and instant receipt printing',
  url: 'https://coldop.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  author: {
    '@type': 'Organization',
    name: 'Coldop Team',
  },
});

// Generate breadcrumb structured data
export const getBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.url,
  })),
});

// Generate FAQ structured data
export const getFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Utility function to generate page URL
export const getPageUrl = (path: string) => `${SEO_CONSTANTS.SITE_URL}${path}`;

// Utility function to generate image URL
export const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${SEO_CONSTANTS.SITE_URL}${imagePath}`;
};