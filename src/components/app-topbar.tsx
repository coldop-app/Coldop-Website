import { memo, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { History, User } from 'lucide-react';
import { LogoutButton } from './logout-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';

// TanStack Router
import { useLocation } from '@tanstack/react-router';

// Zustand store
import { useStore } from '@/stores/store';

import { UserAvatar } from './user-avatar';
import type { StoreAdmin } from '@/types/store-admin';
import type { ColdStorage } from '@/types/cold-storage';
import { ModeToggle } from './mode-toggle';

interface UserMenuProps {
  admin: Omit<StoreAdmin, 'password'>;
  coldStorage: ColdStorage | null;
}

const UserMenuComponent = ({ admin, coldStorage }: UserMenuProps) => {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex items-center gap-3 py-2">
          <UserAvatar
            name={admin.name}
            imageUrl={coldStorage?.imageUrl ?? null}
          />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{admin.name}</p>
            <p className="text-muted-foreground text-xs">{admin.role}</p>
            <p className="text-muted-foreground text-xs">
              🇮🇳 +91 {admin.mobileNumber}
            </p>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link
          to="/store-admin/edit-history"
          className="focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center"
        >
          <History className="mr-2 h-4 w-4" />
          <span>Edit history</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <LogoutButton variant="dropdown" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

const UserMenu = memo(UserMenuComponent);

// Static navbar parts that don't need to re-render on route changes
const NavbarStaticContentComponent = ({
  admin,
  coldStorage,
}: {
  admin: Omit<StoreAdmin, 'password'>;
  coldStorage: ColdStorage | null;
}) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center space-x-4 md:flex">
        <span className="text-muted-foreground text-sm">
          Welcome, {admin.name}
        </span>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserAvatar
                name={admin.name}
                imageUrl={coldStorage?.imageUrl ?? null}
              />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>

          <UserMenu admin={admin} coldStorage={coldStorage} />
        </DropdownMenu>
      </div>

      {/* Mobile */}
      <div className="flex items-center space-x-2 md:hidden">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserAvatar
                name={admin.name}
                imageUrl={coldStorage?.imageUrl ?? null}
              />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>

          <UserMenu admin={admin} coldStorage={coldStorage} />
        </DropdownMenu>
      </div>
    </>
  );
};

const NavbarStaticContent = memo(NavbarStaticContentComponent);

// Dynamic page title that updates on route changes
const PageTitleComponent = () => {
  const pathname = useLocation().pathname;

  const formatted = useMemo(() => {
    if (pathname.match(/^\/store-admin\/people\/[^/]+$/)) {
      return 'Farmer Profile';
    }
    if (pathname.match(/^\/store-admin\/incoming\/edit\/[^/]+$/)) {
      return 'Edit Incoming';
    }
    if (pathname.match(/^\/store-admin\/outgoing\/edit\/[^/]+$/)) {
      return 'Edit Outgoing';
    }

    const segments = pathname.split('/').filter(Boolean);
    const last = segments.at(-1) ?? '';

    return last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [pathname]);

  return (
    <div className="border-border md:ml-6 md:border-l md:pl-6">
      <h1 className="text-foreground text-2xl font-bold tracking-tight">
        {formatted}
      </h1>
    </div>
  );
};

const PageTitle = memo(PageTitleComponent);

function Navbar() {
  // Zustand store - only subscribe to what we need
  const admin = useStore((state) => state.admin);
  const coldStorage = useStore((state) => state.coldStorage);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Skeleton while hydration is incomplete
  if (!hasHydrated || !admin) {
    return (
      <nav className="bg-background border-border sticky top-0 z-40 border-b shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <SidebarTrigger className="hidden md:flex" />
            <div className="border-border md:ml-6 md:border-l md:pl-6">
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background border-border sticky top-0 z-40 border-b shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Sidebar + page title */}
        <div className="flex items-center">
          <SidebarTrigger className="hidden md:flex" />
          <PageTitle />
        </div>

        <NavbarStaticContent admin={admin} coldStorage={coldStorage} />
      </div>
    </nav>
  );
}

const NavbarComponent = Navbar;

export default memo(NavbarComponent);
