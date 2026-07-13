import { cn } from '@/lib/utils';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

export type StockSummaryAccent = 'primary' | 'destructive';

export function getStockSummaryAccent(quantityMode: StockQuantityMode): StockSummaryAccent {
  return quantityMode === 'outgoing' ? 'destructive' : 'primary';
}

export function stockSummaryAccentTextClass(quantityMode: StockQuantityMode): string {
  return getStockSummaryAccent(quantityMode) === 'destructive'
    ? 'text-destructive'
    : 'text-primary';
}

export function stockSummaryAccentBgClass(quantityMode: StockQuantityMode): string {
  return getStockSummaryAccent(quantityMode) === 'destructive'
    ? 'bg-destructive/5'
    : 'bg-primary/5';
}

export function stockSummaryAccentHoverClass(quantityMode: StockQuantityMode): string {
  return getStockSummaryAccent(quantityMode) === 'destructive'
    ? 'hover:bg-destructive/10 focus-visible:bg-destructive/10'
    : 'hover:bg-primary/10 focus-visible:bg-primary/10';
}

export const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
  '[&_tfoot_td]:border-t-2 [&_tfoot_td]:border-t-border/60',
);

type ColumnMeta = {
  align?: 'left' | 'right';
  numeric?: boolean;
  sticky?: boolean;
};

export function getColumnAlign(meta: ColumnMeta | undefined): 'left' | 'right' {
  return meta?.align ?? 'left';
}

export function getHeadClassName(meta: ColumnMeta | undefined, isHeaderScrolled: boolean) {
  const align = getColumnAlign(meta);

  return cn(
    'h-11 px-3 py-2 align-middle text-sm font-semibold transition-[background-color,color] duration-200',
    isHeaderScrolled
      ? 'bg-muted/60 text-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-muted/55'
      : 'bg-secondary text-secondary-foreground',
    'whitespace-nowrap',
    meta?.numeric === true && 'tabular-nums',
    meta?.sticky === true &&
      'sticky left-0 z-20 bg-secondary supports-[backdrop-filter]:bg-secondary/95',
    isHeaderScrolled &&
      meta?.sticky === true &&
      'bg-muted/60 supports-[backdrop-filter]:bg-muted/55',
    align === 'right' && 'text-right',
  );
}

export function getCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-3 align-middle text-sm leading-normal text-foreground',
    meta?.numeric === true && 'tabular-nums font-medium',
    meta?.sticky === true && 'sticky left-0 z-10 bg-background',
    align === 'right' && 'text-right',
  );
}

export function getFooterClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-3 align-middle text-sm font-semibold text-foreground',
    meta?.numeric === true && 'tabular-nums',
    meta?.sticky === true && 'sticky left-0 z-10 bg-muted/30',
    align === 'right' && 'text-right',
  );
}
