import { Link, useRouterState } from '@tanstack/react-router';
import { Loader2, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLogout } from '@/features/auth/api/use-logout';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { useStoreAdminStore } from '@/features/auth/store/use-store-admin-store';
import { Route as settingsProfileRoute } from '@/routes/_authenticated/settings.profile';
import { cn } from '@/lib/utils';

const routeTitles: Record<string, string> = {
  '/daybook': 'Daybook',
  '/incoming': 'Incoming Gate Pass',
  '/outgoing': 'Outgoing Gate Pass',
  '/outgoing/': 'Outgoing Gate Pass',
  '/people': 'People',
  '/analytics': 'Analytics',
  '/analytics/advanced': 'Location Wise Analytics',
  '/finances': 'Finances',
  '/settings': 'Settings',
  '/settings/': 'Settings',
  '/settings/preferences': 'Preferences',
  '/settings/profile': 'Profile',
  '/reports/incoming': 'Incoming Report',
  '/reports/outgoing': 'Outgoing Report',
  '/reports/transfer-stock': 'Transfer Stock Reports',
};

function resolvePageTitle(pathname: string, coldStorageName?: string, personName?: string) {
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }
  if (pathname.startsWith('/people/') && pathname !== '/people') {
    if (pathname.endsWith('/report')) {
      const farmerName = personName?.trim();
      return farmerName ? `Stock Ledger — ${farmerName}` : 'Stock Ledger';
    }

    return personName?.trim() || 'Farmer';
  }
  if (pathname === '/incoming/edit-history') {
    return 'Incoming Edit History';
  }
  if (pathname === '/outgoing/edit-history') {
    return 'Outgoing Edit History';
  }
  if (pathname.startsWith('/incoming/') && pathname !== '/incoming') {
    return 'Edit Incoming Gate Pass';
  }
  if (
    pathname.startsWith('/outgoing/') &&
    pathname !== '/outgoing' &&
    pathname !== '/outgoing/edit-history'
  ) {
    return 'Edit Outgoing Gate Pass';
  }
  if (pathname.startsWith('/finances/ledgers/')) {
    return 'Ledger Statement';
  }
  if (pathname === '/analytics/variety-breakdown') {
    const varietyName = personName?.trim();
    return varietyName ? `Variety Breakdown — ${varietyName}` : 'Variety Breakdown';
  }
  if (pathname.startsWith('/settings')) {
    return 'Settings';
  }
  return coldStorageName ?? 'Dashboard';
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useResolvedThemeMode() {
  const { theme, resolvedTheme } = useTheme();

  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const isClient = useIsClient();
  const resolvedMode = useResolvedThemeMode();

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Theme">
        <Sun className="text-muted-foreground h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedMode === 'dark';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Change theme"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={resolvedMode} onValueChange={(value) => setTheme(value)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopbar() {
  const user = useStoreAdminStore((s) => s.storeAdmin);
  const coldStorageName = useColdStorageStore((s) => s.coldStorage?.name);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const personName = useRouterState({
    select: (s) => {
      if (s.location.pathname === '/analytics/variety-breakdown') {
        const search = s.location.search as { variety?: string };
        return search.variety;
      }

      if (!s.location.pathname.startsWith('/people/') || s.location.pathname === '/people') {
        return undefined;
      }

      const search = s.location.search as { name?: string };
      return search.name;
    },
  });
  const pageTitle = resolvePageTitle(pathname, coldStorageName, personName);

  return (
    <header className={cn('bg-background flex h-14 shrink-0 items-center border-b px-4')}>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <SidebarTrigger className="-ml-1" />
        <div
          role="separator"
          aria-orientation="vertical"
          className="bg-muted-foreground/25 mx-2 h-6 w-px shrink-0 rounded-full"
        />
        <h1 className="truncate text-lg font-semibold tracking-tight" title={pageTitle}>
          {pageTitle}
        </h1>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-accent hover:text-accent-foreground h-9 gap-2 rounded-md px-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-sm font-medium lg:inline">
                {user?.name ?? 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
                <p className="text-muted-foreground text-xs tabular-nums">{user?.mobileNumber}</p>
                <Badge variant="secondary" className="mt-1 w-fit">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to={settingsProfileRoute.to}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? 'Signing out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
