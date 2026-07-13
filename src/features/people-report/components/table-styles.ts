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
  compact?: boolean;
  groupable?: boolean;
  groupStart?: boolean;
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
    meta?.numeric === true && 'tabular-nums',
    meta?.wrap === true
      ? 'min-w-[14rem] !whitespace-normal'
      : meta?.groupable === true
        ? 'min-w-[12rem] max-w-[20rem] whitespace-nowrap'
        : meta?.compact === true
          ? 'w-[1%] max-w-[9rem] whitespace-nowrap'
          : 'whitespace-nowrap',
    meta?.groupStart === true && 'border-l-2 border-l-border/60',
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
      ? 'min-w-[14rem] max-w-[22rem] !whitespace-normal break-words leading-relaxed [overflow-wrap:anywhere]'
      : meta?.groupable === true
        ? 'min-w-[12rem] max-w-[20rem] whitespace-nowrap'
        : meta?.compact === true
          ? 'w-[1%] max-w-[9rem] whitespace-nowrap'
          : 'whitespace-nowrap',
    meta?.groupStart === true && 'border-l-2 border-l-border/60',
    align === 'right' && 'text-right',
  );
}

export function getFooterClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-2.5 align-middle text-sm font-semibold text-foreground',
    meta?.numeric === true && 'tabular-nums',
    meta?.mono === true && 'font-mono',
    meta?.groupStart === true && 'border-l-2 border-l-border/60',
    align === 'right' && 'text-right',
  );
}

/** Opening balance row in the outgoing ledger table */
export const OPENING_BALANCE_ROW_CLASS = cn(
  'border-0 font-semibold',
  'bg-primary/5 hover:bg-primary/5',
  'shadow-[inset_3px_0_0_0] shadow-primary/70',
);

/** Closing balance footer in the outgoing ledger table */
export const CLOSING_BALANCE_ROW_CLASS = cn(
  'border-0 font-semibold hover:bg-transparent',
  'bg-primary/5',
  'shadow-[inset_3px_0_0_0] shadow-primary/70',
);

/** Total footer in the incoming ledger table — matches closing balance highlight */
export const INCOMING_TOTAL_ROW_CLASS = CLOSING_BALANCE_ROW_CLASS;
