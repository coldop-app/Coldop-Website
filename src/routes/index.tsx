import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { LandingPage } from '@/features/landing';
import { homeJsonLd } from '@/lib/seo/json-ld';
import { asRouteHead, buildHomeHead } from '@/lib/seo/meta';

const homeHead = asRouteHead(buildHomeHead(homeJsonLd()));

export const Route = createFileRoute('/')({
  head: () => homeHead,
  beforeLoad: ({ context }) => {
    const isAuthenticated =
      context.auth.isAuthenticated || useAuthStore.getState().isAuthenticated();

    if (!isAuthenticated) return;

    throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
  },
  component: LandingPage,
});
