import { createRouter } from '@tanstack/react-router';
import { queryClient } from '@/lib/queryClient';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  scrollToTopSelectors: ['[data-main-scroll]'],
  context: {
    queryClient,
    auth: {
      isAuthenticated: false,
      user: null,
      accessToken: null,
    },
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
