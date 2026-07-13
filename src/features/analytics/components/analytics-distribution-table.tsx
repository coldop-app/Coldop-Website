import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { AnalyticsDistribution } from '@/features/analytics/utils/build-analytics-distribution';
import { cn } from '@/lib/utils';

type AnalyticsDistributionTableProps = {
  distribution: AnalyticsDistribution;
  labelColumn: string;
  className?: string;
};

function formatShare(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function AnalyticsDistributionTable({
  distribution,
  labelColumn,
  className,
}: AnalyticsDistributionTableProps) {
  const { tableItems, total } = distribution;

  if (tableItems.length === 0) {
    return null;
  }

  const insightsTitle = `${labelColumn} distribution & insights`;

  return (
    <div className={cn('min-w-0 space-y-3', className)}>
      <h3 className="font-heading text-foreground text-sm font-semibold">{insightsTitle}</h3>

      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-muted-foreground h-10 px-3 font-medium">
                {labelColumn}
              </TableHead>
              <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                Bags
              </TableHead>
              <TableHead className="bg-primary/5 text-muted-foreground h-10 px-3 text-right font-medium">
                Share
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableItems.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden
                    />
                    <span className="text-foreground truncate font-medium" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatQuantity(item.bags)}
                </TableCell>
                <TableCell className="bg-primary/5 text-primary px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatShare(item.share)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableCell className="px-3 py-2.5 font-semibold">Total</TableCell>
              <TableCell className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                {formatQuantity(total)}
              </TableCell>
              <TableCell className="bg-primary/10 text-primary px-3 py-2.5 text-right font-semibold tabular-nums">
                100.0%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
