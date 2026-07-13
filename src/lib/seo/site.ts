/**
 * Single source of truth for public site SEO defaults.
 * Keep `index.html` baseline meta aligned with these values.
 */

export const SITE_NAME = 'Coldop';
export const SITE_LEGAL_NAME = 'ColdOp';
export const SITE_TAGLINE = 'Cold Storage Management Platform';

/** Production origin. Override with VITE_SITE_URL when needed. */
export const DEFAULT_SITE_URL = 'https://coldop.in';

export const SITE_LOCALE = 'en_IN';
export const SITE_LOCALE_OG = 'en_IN';

export const DEFAULT_DESCRIPTION =
  'Coldop is the complete cold storage management platform for Indian operators — gate passes, chamber stock, farmer ledgers, daybook, and reports in one system. Built for the warehouse floor.';

export const HOME_TITLE = 'Coldop — Cold Storage Management Software for India';

export const HOME_DESCRIPTION = DEFAULT_DESCRIPTION;

export const OG_IMAGE_PATH = '/og/og-default.png';

export const THEME_COLOR = '#1a7a4c';

export const CONTACT_EMAIL = 'support@coldop.in';
export const CONTACT_PHONE = '+919877069258';

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return DEFAULT_SITE_URL;
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
