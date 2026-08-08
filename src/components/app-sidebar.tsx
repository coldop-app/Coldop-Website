import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRight, FileBarChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  coreNavItems,
  defaultReportRoute,
  isNavItemActive,
  isReportsNavActive,
  isReportSubItemActive,
  reportNavItems,
  settingsNavItem,
} from '@/components/nav-config';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

function ReportsNavMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(() => isReportsNavActive(pathname));
  const reportsActive = isReportsNavActive(pathname);

  useEffect(() => {
    if (reportsActive) {
      setOpen(true);
    }
  }, [reportsActive]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip="Reports"
        isActive={reportsActive}
        data-state={open ? 'open' : 'closed'}
      >
        <Link to={defaultReportRoute} onClick={() => setOpen(true)}>
          <FileBarChart />
          <span>Reports</span>
          <ChevronRight
            className={`ml-auto size-4 shrink-0 transition-transform duration-200${open ? 'rotate-90' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen((current) => !current);
            }}
          />
        </Link>
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub>
          {reportNavItems.map((item) => (
            <SidebarMenuSubItem key={item.to}>
              <SidebarMenuSubButton asChild isActive={isReportSubItemActive(pathname, item.to)}>
                <Link to={item.to}>
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function NavMain() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);
  const visibleNavItems = coreNavItems.filter((item) => item.to !== '/finances' || showFinances);
  const SettingsIcon = settingsNavItem.icon;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Core Operations
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.name}>
                {item.to && !item.disabled ? (
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(item, pathname)}
                    tooltip={item.name}
                  >
                    <Link
                      to={item.to}
                      {...(item.to === '/daybook' ? { search: DEFAULT_DAYBOOK_SEARCH } : {})}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton disabled tooltip={item.name}>
                    <Icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
          <ReportsNavMenu pathname={pathname} />
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isNavItemActive(settingsNavItem, pathname)}
              tooltip={settingsNavItem.name}
            >
              <Link to={settingsNavItem.to!}>
                <SettingsIcon />
                <span>{settingsNavItem.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const coldStorageName = useColdStorageStore((s) => s.coldStorage?.name ?? 'Cold Storage');

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/daybook" search={DEFAULT_DAYBOOK_SEARCH}>
                <img src="/icon-192x192.webp" alt="Coldop" className="size-8 shrink-0 rounded-md" />
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="font-heading truncate text-sm tracking-tight">
                    <span className="text-sidebar-foreground font-semibold">Coldop</span>
                    <span className="text-muted-foreground ml-1 text-xs font-normal">1.0.0</span>
                  </span>
                  {coldStorageName ? (
                    <span
                      className="text-muted-foreground truncate text-xs"
                      title={coldStorageName}
                    >
                      {coldStorageName}
                    </span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
