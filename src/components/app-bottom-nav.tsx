import { Link, useRouterState } from '@tanstack/react-router';
import {
  coreNavItems,
  isNavItemActive,
  moreNavItem,
  type NavItem,
} from '@/components/nav-config';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { cn } from '@/lib/utils';

type AppBottomNavProps = {
  className?: string;
};

export function AppBottomNav({ className }: AppBottomNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);

  const tabs: NavItem[] = [
    ...coreNavItems.filter((item) => item.to !== '/finances' || showFinances),
    moreNavItem,
  ];

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'bg-background border-border shrink-0 border-t pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="flex items-stretch">
        {tabs.map((item) => {
          if (!item.to) return null;

          const Icon = item.icon;
          const isActive = isNavItemActive(item, pathname);

          return (
            <li key={item.name} className="min-w-0 flex-1">
              <Link
                to={item.to}
                {...(item.to === '/daybook' ? { search: DEFAULT_DAYBOOK_SEARCH } : {})}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.name}
                className={cn(
                  'text-muted-foreground flex h-14 flex-col items-center justify-center gap-0.5 px-1',
                  'transition-colors',
                  isActive && 'text-primary',
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate text-[10px] leading-tight font-medium">
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
