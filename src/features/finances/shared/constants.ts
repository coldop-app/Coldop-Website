import type { LedgerType } from '@/features/finances/types';

export const BALANCE_EPSILON = 0.01;

export const ASSET_SUBTYPE_ORDER = ['Fixed Assets', 'Current Assets'] as const;

export const PERIOD_FILTER_VALUES = [
  'this_month',
  'last_month',
  'this_quarter',
  'this_year',
] as const;

export type PeriodFilter = (typeof PERIOD_FILTER_VALUES)[number];

export const DEFAULT_FINANCES_PERIOD: PeriodFilter = 'this_year';

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  this_quarter: 'This quarter',
  this_year: 'This year',
};

export type TypeColorVariant = {
  band: string;
  header: string;
  total: string;
};

export const TYPE_COLORS: Record<LedgerType, TypeColorVariant> = {
  Asset: {
    band: 'bg-primary',
    header: 'bg-primary/10',
    total: 'bg-primary/15',
  },
  Liability: {
    band: 'bg-destructive',
    header: 'bg-destructive/10',
    total: 'bg-destructive/15',
  },
  Equity: {
    band: 'bg-primary/80',
    header: 'bg-primary/10',
    total: 'bg-primary/15',
  },
  Income: {
    band: 'bg-secondary text-secondary-foreground',
    header: 'bg-secondary/50',
    total: 'bg-secondary/70',
  },
  Expense: {
    band: 'bg-muted-foreground',
    header: 'bg-muted/50',
    total: 'bg-muted/70',
  },
};
