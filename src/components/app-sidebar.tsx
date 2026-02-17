import { memo, useMemo } from 'react';
import { BookOpen, Users, BarChart3, Wallet } from 'lucide-react';
import { useLocation, Link } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

type NavigationItemWithChildren = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: Array<{ name: string; href: string }>;
};

type NavigationItemWithoutChildren = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePaths?: string[];
};

type NavigationItem =
  | NavigationItemWithChildren
  | NavigationItemWithoutChildren;

function hasChildren(item: NavigationItem): item is NavigationItemWithChildren {
  return 'children' in item && item.children !== undefined;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Daybook',
    href: '/store-admin/daybook',
    activePaths: ['/store-admin/incoming', '/store-admin/outgoing'],
    icon: BookOpen,
  },
  {
    name: 'People',
    href: '/store-admin/people',
    icon: Users,
    activePaths: ['/store-admin/people'],
  },
  {
    name: 'Analytics',
    href: '/store-admin/analytics',
    icon: BarChart3,
    activePaths: ['/store-admin/analytics', '/store-admin/variety-breakdown'],
  },
  {
    name: 'My Finances',
    href: '/store-admin/my-finances',
    icon: Wallet,
    activePaths: ['/store-admin/my-finances'],
  },
];

const SidebarHeaderContent = memo(() => {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 px-2 py-2">
        <h1 className="text-sidebar-foreground text-lg font-semibold group-data-[collapsible=icon]:hidden">
          Coldop
          <span className="text-muted-foreground ml-1 text-[10px] font-medium">
            BETA
          </span>
        </h1>
      </div>
    </SidebarHeader>
  );
});
SidebarHeaderContent.displayName = 'SidebarHeaderContent';

const AppSidebar = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const navigationItemsWithState = useMemo(() => {
    return navigationItems.map((item) => {
      if (hasChildren(item)) {
        const isActive =
          pathname === item.href ||
          item.children.some((c) => pathname.startsWith(c.href));

        return { ...item, isActive };
      }

      // TypeScript now knows item is NavigationItemWithoutChildren
      const isActive =
        pathname === item.href ||
        (item.activePaths
          ? item.activePaths.some((path) => pathname.startsWith(path))
          : pathname.startsWith(item.href));

      return { ...item, isActive };
    });
  }, [pathname]);

  // Hide sidebar on mobile - bottom nav will be shown instead
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderContent />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItemsWithState.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.name}
                    >
                      <Link to={item.href}>
                        <Icon className="h-4 w-4 text-current" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default memo(AppSidebar);
