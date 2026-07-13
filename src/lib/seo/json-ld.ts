import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  HOME_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from './site';

export function organizationSchema(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${getSiteUrl()}/#organization`,
    name: SITE_LEGAL_NAME,
    legalName: SITE_LEGAL_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl('/icon-512x512.webp'),
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    foundingDate: '2023',
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: [
      'https://www.youtube.com/watch?v=aCQ3rb-K_m0',
      'https://www.instagram.com/reel/DRrlfr1CfB5/',
    ],
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${getSiteUrl()}/#website`,
    name: SITE_NAME,
    url: getSiteUrl(),
    description: HOME_DESCRIPTION,
    publisher: { '@id': `${getSiteUrl()}/#organization` },
    inLanguage: 'en-IN',
  };
}

export function softwareApplicationSchema(): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${getSiteUrl()}/#software`,
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Cold Storage Management / ERP',
    operatingSystem: 'Web',
    description: HOME_DESCRIPTION,
    url: getSiteUrl(),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Contact Coldop for pricing and onboarding',
    },
    featureList: [
      'Gate pass management',
      'Chamber and floor inventory',
      'Farmer ledgers and stock reports',
      'Daybook operations',
      'Incoming and outgoing stock',
      'Bilingual English and Punjabi support',
    ],
    provider: { '@id': `${getSiteUrl()}/#organization` },
    slogan: SITE_TAGLINE,
  };
}

/** Combined JSON-LD graph for the homepage. */
export function homeJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema(), softwareApplicationSchema()],
  };
}
