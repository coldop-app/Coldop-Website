import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { asRouteHead, buildNoIndexHead } from '@/lib/seo/meta';
import { AuthenticatedLayout } from './_authenticated/-layout';

const appHead = asRouteHead(buildNoIndexHead('Coldop App', '/daybook'));

export const Route = createFileRoute('/_authenticated')({
  head: () => appHead,
  beforeLoad: ({ context, location }) => {
    const isAuthenticated =
      context.auth.isAuthenticated || useAuthStore.getState().isAuthenticated();

    if (!isAuthenticated) {
      const href = location.href;
      const redirectPath = href.startsWith('/') ? href : `${location.pathname}${location.hash}`;

      throw redirect({
        to: '/login',
        search: {
          redirect: redirectPath,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});
