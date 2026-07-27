import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { asRouteHead, buildNoIndexHead } from '@/lib/seo/meta';

const homeHead = asRouteHead(buildNoIndexHead('Coldop', '/'));

export const Route = createFileRoute('/')({
  head: () => homeHead,
  beforeLoad: ({ context }) => {
    const isAuthenticated =
      context.auth.isAuthenticated || useAuthStore.getState().isAuthenticated();

    if (isAuthenticated) {
      throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
    }

    throw redirect({ to: '/login' });
  },
});
