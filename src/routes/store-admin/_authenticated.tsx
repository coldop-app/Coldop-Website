import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import AppTopbar from '@/components/app-topbar';
import AppBottomNav from '@/components/app-bottom-nav';

export const Route = createFileRoute('/store-admin/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // Check if user is authenticated
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/store-admin/login',
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
        },
      });
    }
  },
  component: () => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <div className="pb-16 md:pb-0">
          <Outlet />
        </div>
        <AppBottomNav />
      </SidebarInset>
    </SidebarProvider>
  ),
});
