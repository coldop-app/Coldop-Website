import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!mt-0 md:!mt-0 md:rounded-t-none">
        <AppTopbar />
        <section
          data-main-scroll
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6"
        >
          <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-4 sm:gap-6">
            <Outlet />
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
