// SEO Constants
export const SEO_CONSTANTS = {
  SITE_NAME: 'Coldop',
  SITE_URL: 'https://coldop.in',
  SITE_DESCRIPTION: 'Transform your cold storage operations with Coldop - India\'s leading cold storage management platform. Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Streamline your operations today.',
  SITE_KEYWORDS: 'cold storage management, agriculture technology, farming solutions, inventory management, cold chain logistics, warehouse management system, agriculture ERP, farm management software, cold storage tracking, harvest management, WhatsApp integration, receipt printing, mobile app, web dashboard, India agriculture software',
  SITE_IMAGE: '/coldop-logo.png',
  SITE_IMAGE_WIDTH: '1200',
  SITE_IMAGE_HEIGHT: '630',
  SITE_IMAGE_ALT: 'Coldop - India\'s Leading Cold Storage Management Platform',
  AUTHOR: 'Coldop Team',
  TWITTER_HANDLE: '@ColdopApp',
  FACEBOOK_APP_ID: '',
  THEME_COLOR: 'oklch(0.63 0.17 149.2)',
};

// Page-specific SEO data
export const SEO_PAGES = {
  HOME: {
    title: 'Coldop - India\'s Leading Cold Storage Management Platform',
    description: 'Transform your cold storage operations with Coldop\'s comprehensive management platform. Mobile app, web dashboard, WhatsApp updates, and instant receipt printing. Perfect for Indian agriculture businesses.',
    keywords: 'cold storage management india, agriculture technology, farming solutions, inventory management software india, cold chain management system, warehouse management india, agriculture ERP software, farm management app',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Coldop',
      description: 'India\'s Leading Cold Storage Management Platform',
      url: 'https://coldop.in',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://coldop.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
  SIGNUP: {
    title: 'Sign Up - Start Managing Your Cold Storage with Coldop',
    description: 'Join hundreds of Indian farmers and storage managers using Coldop to streamline their operations. Create your account and start managing your cold storage efficiently.',
    keywords: 'coldop signup, cold storage registration, farming account india, agriculture management signup, cold storage software registration',
    noindex: true,
    nofollow: true,
  },
  STORE_ADMIN_LOGIN: {
    title: 'Store Admin Login - Access Your Cold Storage Dashboard',
    description: 'Access your Coldop store admin dashboard to manage farmers, inventory, and operations. Secure login for cold storage administrators in India.',
    keywords: 'store admin login, coldop dashboard, cold storage admin india, cold chain management portal',
    noindex: true,
    nofollow: true,
  },
  FARMER_LOGIN: {
    title: 'Farmer Login - Track Your Cold Storage Inventory',
    description: 'Farmers can login to check their cold storage status, view receipts, and track their harvest inventory with Coldop. Built for Indian farmers.',
    keywords: 'farmer login india, coldop farmer portal, harvest tracking, storage status check, agriculture inventory management',
    noindex: true,
    nofollow: true,
  },
  NOT_FOUND: {
    title: '404 Page Not Found - Coldop',
    description: 'The page you\'re looking for doesn\'t exist. Return to Coldop\'s homepage to explore our cold storage management solutions for Indian businesses.',
    keywords: 'page not found, 404 error, coldop navigation',
    noindex: true,
    nofollow: true,
  },
  ERROR: {
    title: 'Error - Coldop',
    description: 'An error occurred. Please try again or contact our support team to continue using Coldop\'s cold storage management platform.',
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
  description: 'India\'s Leading Cold Storage Management Platform',
  url: 'https://coldop.in',
  logo: 'https://coldop.in/coldop-logo.png',
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@coldop.in',
    availableLanguage: ['en', 'hi'],
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
  url: 'http://coldop.in',
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