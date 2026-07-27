/**
 * Single source of truth for app SEO defaults (app.coldop.in).
 * Marketing site (coldop.in) lives in the separate Next.js app.
 */

export const SITE_NAME = 'Coldop';
export const SITE_LEGAL_NAME = 'ColdOp';
export const SITE_TAGLINE = 'Cold Storage Management Platform';

/** Production app origin. Override with VITE_SITE_URL when needed. */
export const DEFAULT_SITE_URL = 'https://app.coldop.in';

export const SITE_LOCALE = 'en_IN';
export const SITE_LOCALE_OG = 'en_IN';

export const DEFAULT_DESCRIPTION =
  'Coldop workspace — gate passes, chamber stock, farmer ledgers, daybook, and reports for cold storage operators.';

export const HOME_TITLE = 'Coldop';

export const HOME_DESCRIPTION = DEFAULT_DESCRIPTION;

export const OG_IMAGE_PATH = '/og/og-default.png';

export const THEME_COLOR = '#1a7a4c';

export const CONTACT_EMAIL = 'support@coldop.in';
export const CONTACT_PHONE = '+919877069258';

/** Public marketing site origin (coldop.in). */
export const MARKETING_SITE_URL = 'https://coldop.in';

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
