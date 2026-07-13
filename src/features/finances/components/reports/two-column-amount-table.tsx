import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/features/finances/shared/format-currency';
import type { ReportRow } from '@/features/finances/shared/report-types';
import { cn } from '@/lib/utils';

type TwoColumnAmountTableProps = {
  leftTitle: string;
  rightTitle: string;
  leftRows: ReportRow[];
  rightRows: ReportRow[];
  leftTotalLabel?: string;
  rightTotalLabel?: string;
  leftTotal?: number;
  rightTotal?: number;
  className?: string;
};

function AmountCell({ row, className }: { row?: ReportRow; className?: string }) {
  return (
    <TableCell
      className={cn(
        'px-3 py-2.5 text-right tabular-nums',
        row?.isTotal && 'text-foreground font-medium',
        row?.isProfit === true && 'text-primary font-medium',
        row?.isProfit === false && 'text-destructive font-medium',
        className,
      )}
    >
      {row?.amount != null ? formatCurrency(row.amount) : '\u00A0'}
    </TableCell>
  );
}

function LabelCell({ row, className }: { row?: ReportRow; className?: string }) {
  return (
    <TableCell
      className={cn(
        'px-3 py-2.5',
        row?.isHeader && 'text-foreground font-medium',
        !row?.isHeader && 'text-muted-foreground',
        className,
      )}
    >
      {row?.label ?? '\u00A0'}
    </TableCell>
  );
}

export function TwoColumnAmountTable({
  leftTitle,
  rightTitle,
  leftRows,
  rightRows,
  leftTotalLabel = 'Total',
  rightTotalLabel = 'Total',
  leftTotal,
  rightTotal,
  className,
}: TwoColumnAmountTableProps) {
  const maxRows = Math.max(leftRows.length, rightRows.length);

  return (
    <div className={cn('border-border relative w-full overflow-auto rounded-lg border', className)}>
      <Table className="w-full text-sm">
        <TableHeader className="border-border bg-muted/50 border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">
              {leftTitle}
            </TableHead>
            <TableHead className="border-border text-muted-foreground h-10 border-l border-dashed px-3 text-right font-medium">
              Amount
            </TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">
              {rightTitle}
            </TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: maxRows }).map((_, index) => {
            const left = leftRows[index];
            const right = rightRows[index];
            return (
              <TableRow
                key={`${left?.label ?? 'left'}-${right?.label ?? 'right'}-${index}`}
                className="border-border hover:bg-muted/50 border-b"
              >
                <LabelCell row={left} />
                <AmountCell row={left} className="border-border border-l border-dashed" />
                <LabelCell row={right} />
                <AmountCell row={right} />
              </TableRow>
            );
          })}
          {leftTotal != null && rightTotal != null ? (
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-t-2 font-medium">
              <TableCell className="px-3 py-3">{leftTotalLabel}</TableCell>
              <TableCell className="border-border border-l border-dashed px-3 py-3 text-right tabular-nums">
                {formatCurrency(leftTotal)}
              </TableCell>
              <TableCell className="px-3 py-3">{rightTotalLabel}</TableCell>
              <TableCell className="px-3 py-3 text-right tabular-nums">
                {formatCurrency(rightTotal)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
