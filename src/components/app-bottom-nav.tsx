import { memo, useMemo } from 'react';
import { BookOpen, Users, BarChart3, Wallet } from 'lucide-react';
import { useLocation, Link } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePaths?: string[];
};

const navigationItems: NavigationItem[] = [
  {
    name: 'Daybook',
    href: '/store-admin/daybook',
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
    name: 'Finances',
    href: '/store-admin/my-finances',
    icon: Wallet,
    activePaths: ['/store-admin/my-finances'],
  },
];

const AppBottomNav = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const navigationItemsWithState = useMemo(() => {
    return navigationItems.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.activePaths
          ? item.activePaths.some((path) => pathname.startsWith(path))
          : pathname.startsWith(item.href));

      return { ...item, isActive };
    });
  }, [pathname]);

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="dark:border-border dark:bg-background fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-around">
        {navigationItemsWithState.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'font-custom focus-visible:ring-primary flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-t px-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                item.isActive
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  item.isActive
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  item.isActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default memo(AppBottomNav);
