import type { QueryClient } from '@tanstack/react-query';
import type { StoreAdmin } from '@/features/auth/types';

export interface AuthRouterContext {
  isAuthenticated: boolean;
  user: StoreAdmin | null;
  accessToken: string | null;
}

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthRouterContext;
}
