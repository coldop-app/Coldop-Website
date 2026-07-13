import type { ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { StockSummaryAccent } from '@/features/people/components/farmer-stock-summary-table-styles';

function getTabTriggerClassName(accent: StockSummaryAccent) {
  const isDestructive = accent === 'destructive';

  return cn(
    'relative flex-none shrink-0 rounded-none border-0 bg-transparent px-3 py-2.5 text-sm font-medium shadow-none',
    'text-muted-foreground transition-colors hover:text-foreground',
    isDestructive
      ? 'data-active:bg-transparent data-active:text-destructive data-active:font-semibold'
      : 'data-active:bg-transparent data-active:text-primary data-active:font-semibold',
    isDestructive
      ? 'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-destructive after:opacity-0 after:transition-opacity data-active:after:opacity-100'
      : 'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-active:after:opacity-100',
    isDestructive
      ? '[&_[data-count]]:text-muted-foreground data-active:[&_[data-count]]:font-medium data-active:[&_[data-count]]:text-destructive/80'
      : '[&_[data-count]]:text-muted-foreground data-active:[&_[data-count]]:font-medium data-active:[&_[data-count]]:text-primary/80',
    'focus-visible:ring-0 focus-visible:outline-none',
  );
}

type StockSummaryTabItem = {
  value: string;
  label: ReactNode;
};

type StockSummaryTabBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: StockSummaryTabItem[];
  ariaLabel: string;
  className?: string;
  accent?: StockSummaryAccent;
};

export function StockSummaryTabBar({
  value,
  onValueChange,
  items,
  ariaLabel,
  className,
  accent = 'primary',
}: StockSummaryTabBarProps) {
  const tabTriggerClassName = getTabTriggerClassName(accent);

  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('min-w-0', className)}>
      <div className="-mx-3 scrollbar-none overflow-x-auto px-3 sm:-mx-4 sm:px-4">
        <TabsList
          variant="line"
          aria-label={ariaLabel}
          className="inline-flex h-auto min-h-10 w-max min-w-full justify-start gap-0 border-0 bg-transparent p-0"
        >
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className={tabTriggerClassName}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}

type QuantityModeTabLabelProps = {
  label: string;
  count: number;
};

export function QuantityModeTabLabel({ label, count }: QuantityModeTabLabelProps) {
  const formattedCount = new Intl.NumberFormat('en-IN').format(count);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span>{label}</span>
      <span data-count className="text-xs font-normal tabular-nums">
        ({formattedCount})
      </span>
    </span>
  );
}
