import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Analytics } from '@/components/analytics';
import { NotFoundPage } from '@/components/not-found-page';
import { RouteErrorPage } from '@/components/route-error-page';
import type { RouterContext } from '../lib/router-context';
import { asRouteHead, buildPageMeta } from '../lib/seo/meta';
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, THEME_COLOR } from '../lib/seo/site';

const rootMeta = buildPageMeta({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
  robots: 'index, follow',
});

const rootHead = asRouteHead({
  meta: [
    ...rootMeta.meta,
    { name: 'theme-color', content: THEME_COLOR },
    { name: 'application-name', content: SITE_NAME },
  ],
  links: [
    ...rootMeta.links,
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/manifest.json' },
  ],
});

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => rootHead,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorPage,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <Analytics />
    </>
  );
}
