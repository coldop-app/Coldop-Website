import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  FileInput,
  FileOutput,
  Menu,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

export type NavItem = {
  name: string;
  icon: LucideIcon;
  to?: string;
  disabled?: boolean;
};

export const coreNavItems: NavItem[] = [
  { name: 'Daybook', icon: BookOpen, to: '/daybook' },
  { name: 'People', icon: Users, to: '/people' },
  { name: 'Analytics', icon: BarChart3, to: '/analytics' },
  { name: 'Finances', icon: Wallet, to: '/finances' },
];

export const defaultReportRoute = '/reports/incoming' as const;

export const reportNavItems = [
  { name: 'Incoming', to: defaultReportRoute },
  { name: 'Outgoing', to: '/reports/outgoing' },
  { name: 'Transfer Stock', to: '/reports/transfer-stock' },
] as const;

export const settingsNavItem: NavItem = {
  name: 'Settings',
  icon: Settings,
  to: '/settings',
};

export const moreNavItem: NavItem = {
  name: 'More',
  icon: Menu,
  to: '/more',
};

export const morePageLinks = [
  {
    label: 'Reports',
    title: 'Incoming Report',
    description: 'View and export incoming gate pass reports',
    icon: FileInput,
    status: 'Open report',
    to: '/reports/incoming' as const,
  },
  {
    label: 'Reports',
    title: 'Outgoing Report',
    description: 'View and export outgoing gate pass reports',
    icon: FileOutput,
    status: 'Open report',
    to: '/reports/outgoing' as const,
  },
  {
    label: 'Reports',
    title: 'Transfer Stock Report',
    description: 'View and export transfer stock reports',
    icon: ArrowLeftRight,
    status: 'Open report',
    to: '/reports/transfer-stock' as const,
  },
  {
    label: 'Application',
    title: 'Settings',
    description: 'Profile, preferences, and account options',
    icon: Settings,
    status: 'Manage settings',
    to: '/settings' as const,
  },
] as const;

const REPORTS_ROUTE_PREFIXES = [
  '/reports/incoming',
  '/reports/outgoing',
  '/reports/transfer-stock',
] as const;

const DAYBOOK_ACTIVE_ROUTE_PREFIXES = ['/daybook', '/incoming', '/outgoing', '/transfer'] as const;

export function isDaybookNavActive(pathname: string) {
  return DAYBOOK_ACTIVE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isReportsNavActive(pathname: string) {
  return REPORTS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isSettingsNavActive(pathname: string) {
  return pathname === '/settings' || pathname.startsWith('/settings/');
}

export function isReportSubItemActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function isPeopleNavActive(pathname: string) {
  return pathname === '/people' || pathname.startsWith('/people/');
}

export function isAnalyticsNavActive(pathname: string) {
  return pathname === '/analytics' || pathname.startsWith('/analytics/');
}

export function isFinancesNavActive(pathname: string) {
  return pathname === '/finances' || pathname.startsWith('/finances/');
}

export function isMoreNavActive(pathname: string) {
  return (
    pathname === '/more' ||
    pathname.startsWith('/more/') ||
    isReportsNavActive(pathname) ||
    isSettingsNavActive(pathname)
  );
}

export function isNavItemActive(item: NavItem, pathname: string) {
  if (!item.to) return false;
  if (item.to === '/daybook') return isDaybookNavActive(pathname);
  if (item.to === '/people') return isPeopleNavActive(pathname);
  if (item.to === '/analytics') return isAnalyticsNavActive(pathname);
  if (item.to === '/finances') return isFinancesNavActive(pathname);
  if (item.to === '/settings') return isSettingsNavActive(pathname);
  if (item.to === '/more') return isMoreNavActive(pathname);
  return pathname === item.to;
}
