import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { asRouteHead, buildNoIndexHead } from '@/lib/seo/meta';
import { sanitizeRedirectPath } from '@/lib/seo/safe-redirect';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

const loginHead = asRouteHead(buildNoIndexHead('Sign in', '/login'));

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  head: () => loginHead,
  beforeLoad: ({ context, search }) => {
    const isAuthenticated =
      context.auth.isAuthenticated || useAuthStore.getState().isAuthenticated();

    if (!isAuthenticated) return;

    const safeRedirect = sanitizeRedirectPath(search.redirect);
    if (safeRedirect) {
      throw redirect({ href: safeRedirect });
    }

    throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
  },
  component: LoginForm,
});
