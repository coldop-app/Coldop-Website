/**
 * Public, indexable paths. Keep in sync with the router and sitemap generator.
 * Add a path here when introducing a new marketing page.
 */
export const PUBLIC_PATHS = ['/'] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

/** App path prefixes that must never be indexed. */
export const DISALLOW_PATH_PREFIXES = [
  '/login',
  '/daybook',
  '/people',
  '/incoming',
  '/outgoing',
  '/transfer',
  '/analytics',
  '/finances',
  '/reports',
  '/settings',
  '/api',
] as const;
