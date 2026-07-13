import { cn } from '@/lib/utils';

export const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type ColumnMeta = {
  align?: 'left' | 'right';
  numeric?: boolean;
  mono?: boolean;
  wrap?: boolean;
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
    meta?.wrap === true && 'min-w-[14rem] whitespace-normal',
    align === 'right' && 'text-right',
  );
}

export function getCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-3 align-top text-sm leading-normal text-foreground',
    meta?.numeric === true && 'tabular-nums font-medium',
    meta?.mono === true && 'font-mono',
    meta?.wrap === true
      ? 'min-w-[14rem] max-w-[22rem] whitespace-normal break-words leading-relaxed'
      : 'whitespace-nowrap',
    align === 'right' && 'text-right',
  );
}
