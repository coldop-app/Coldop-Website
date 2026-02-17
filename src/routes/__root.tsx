import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import type { StoreAdmin } from '@/types/store-admin';
import ErrorPage from '@/components/error-page';
import NotFound from '@/components/not-found';

// Define the router context type
interface MyRouterContext {
  auth: {
    isAuthenticated: boolean;
    admin: Omit<StoreAdmin, 'password'> | null;
    token: string | null;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  ),
  errorComponent: ErrorPage,
  notFoundComponent: NotFound,
});
