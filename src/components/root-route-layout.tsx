import { Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';

const RootRouteLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Outlet />
        {/* <Maintenance /> */}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootRouteLayout;
