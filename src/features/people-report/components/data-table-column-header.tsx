import type { ReactNode } from 'react';
import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />;
  }

  if (sorted === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />;
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />;
}

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  sorted: false | 'asc' | 'desc';
  align: 'left' | 'right';
  children: ReactNode;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  sorted,
  align,
  children,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn('flex h-8 items-center', align === 'right' ? 'justify-end' : 'justify-start')}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full min-w-0 items-center gap-1.5 rounded-md text-inherit transition-colors',
        'hover:text-foreground focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none',
        align === 'right' ? 'justify-end text-right' : 'justify-between text-left',
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <span
        className={cn(
          'text-muted-foreground shrink-0 transition-opacity',
          sorted ? 'opacity-100' : 'opacity-0 group-hover/head:opacity-70',
        )}
      >
        <SortIcon sorted={sorted} />
      </span>
    </button>
  );
}
