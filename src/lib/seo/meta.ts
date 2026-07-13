import type { MetaDescriptor } from '@tanstack/react-router';
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE_PATH,
  SITE_LOCALE_OG,
  SITE_NAME,
  THEME_COLOR,
  absoluteUrl,
} from './site';

export type RobotsDirective =
  'index, follow' | 'noindex, nofollow' | 'noindex, follow' | 'index, nofollow';

export type PageMetaInput = {
  title: string;
  description?: string;
  path?: string;
  robots?: RobotsDirective;
  image?: string;
  type?: 'website' | 'article';
};

/** Loose head shape accepted by TanStack Router route `head` option. */
export type TanStackHeadResult = {
  meta: MetaDescriptor[];
  links: Array<{ rel: string; href: string; type?: string; sizes?: string }>;
};

function resolveImageUrl(image?: string): string {
  if (!image) return absoluteUrl(OG_IMAGE_PATH);
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return absoluteUrl(image);
}

/**
 * Build TanStack Router `head` fields for a page (title, description, canonical, OG, Twitter).
 */
export function buildPageMeta({
  title,
  description = HOME_DESCRIPTION,
  path = '/',
  robots = 'index, follow',
  image,
  type = 'website',
}: PageMetaInput): TanStackHeadResult {
  const url = absoluteUrl(path);
  const imageUrl = resolveImageUrl(image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      { name: 'application-name', content: SITE_NAME },
      { name: 'theme-color', content: THEME_COLOR },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: SITE_LOCALE_OG },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: imageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}

export function buildHomeHead(jsonLd?: Record<string, unknown>): TanStackHeadResult {
  const base = buildPageMeta({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
    robots: 'index, follow',
  });

  if (jsonLd) {
    base.meta.push({ 'script:ld+json': jsonLd });
  }

  return base;
}

export function buildNoIndexHead(title: string, path: string): TanStackHeadResult {
  return buildPageMeta({
    title,
    description: HOME_DESCRIPTION,
    path,
    robots: 'noindex, nofollow',
  });
}

/** Cast helper — TanStack's public `head` typings lag MetaDescriptor support in some versions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asRouteHead(head: TanStackHeadResult): any {
  return head;
}
