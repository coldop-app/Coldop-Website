import { Fragment } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CategoryGroup } from '@/features/finances/domain/types';
import type { LedgerType } from '@/features/finances/types';
import { TYPE_COLORS } from '@/features/finances/shared/constants';
import { formatCurrency } from '@/features/finances/shared/format-currency';
import { cn } from '@/lib/utils';

type TypeSectionTableProps = {
  type: LedgerType;
  groups: CategoryGroup[];
  displayTotal: number;
  netProfitLoss?: number;
};

export function TypeSectionTable({
  type,
  groups,
  displayTotal,
  netProfitLoss = 0,
}: TypeSectionTableProps) {
  const colors = TYPE_COLORS[type];

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div
        className={cn(
          'text-primary-foreground flex items-center justify-between px-4 py-3 text-sm font-medium',
          colors.band,
        )}
      >
        <span>{type}</span>
        <span className="tabular-nums">Total: {formatCurrency(displayTotal)}</span>
      </div>
      <Table className="w-full text-sm">
        <TableHeader className={cn('border-border border-b', colors.header)}>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">Category</TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">Sub-Type</TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
              Balance
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={`${group.type}-${group.category}`}>
              <TableRow className="border-border hover:bg-muted/50 border-b">
                <TableCell className="text-foreground px-3 py-2.5 font-medium">
                  {group.category}
                </TableCell>
                <TableCell className="text-muted-foreground px-3 py-2.5">{group.subType}</TableCell>
                <TableCell className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatCurrency(group.total)}
                </TableCell>
              </TableRow>
              {group.ledgers.map((ledger) => (
                <TableRow
                  key={ledger.id}
                  className="border-border bg-muted/20 hover:bg-muted/50 border-b"
                >
                  <TableCell className="text-muted-foreground px-3 py-2 pl-8 text-sm">
                    {ledger.name}
                  </TableCell>
                  <TableCell className="px-3 py-2" />
                  <TableCell className="text-foreground px-3 py-2 text-right text-sm tabular-nums">
                    {formatCurrency(ledger.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
          {type === 'Equity' && netProfitLoss !== 0 ? (
            <TableRow className={cn('border-border border-t-2 font-medium', colors.total)}>
              <TableCell className="px-3 py-2.5" colSpan={2}>
                {netProfitLoss > 0 ? 'Add: Net Profit' : 'Less: Net Loss'}
              </TableCell>
              <TableCell
                className={cn(
                  'px-3 py-2.5 text-right tabular-nums',
                  netProfitLoss < 0 && 'text-destructive',
                )}
              >
                {formatCurrency(Math.abs(netProfitLoss))}
              </TableCell>
            </TableRow>
          ) : null}
          <TableRow className={cn('font-medium', colors.total)}>
            <TableCell className="px-3 py-2.5" colSpan={2}>
              Total {type}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right tabular-nums">
              {formatCurrency(displayTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
