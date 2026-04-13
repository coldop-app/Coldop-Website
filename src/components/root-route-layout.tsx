import { Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import InactiveColdStorageScreen from '@/components/inactive-cold-storage-screen';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { useStore } from '@/stores/store';

const RootRouteLayout = () => {
  const { admin, token, coldStorage } = useStore();
  const isAuthenticated = !!(admin && token);

  const shouldShowInactiveScreen =
    isAuthenticated && coldStorage?.isActive === false;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        {shouldShowInactiveScreen ? <InactiveColdStorageScreen /> : <Outlet />}
        {/* <Maintenance /> */}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootRouteLayout;
