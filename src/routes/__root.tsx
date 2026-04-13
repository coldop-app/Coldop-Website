import { createRootRouteWithContext } from '@tanstack/react-router';
import type { StoreAdmin } from '@/types/store-admin';
import ErrorPage from '@/components/error-page';
import RootRouteLayout from '@/components/root-route-layout';
// import { Maintenance } from '@/components/maintenance';
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
  component: RootRouteLayout,
  errorComponent: ErrorPage,
  notFoundComponent: NotFound,
});
