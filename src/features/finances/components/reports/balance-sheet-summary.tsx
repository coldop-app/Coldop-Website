import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInr } from '@/features/finances/shared/format-currency';
import { cn } from '@/lib/utils';

type BalanceSheetSummaryProps = {
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  className?: string;
};

export function BalanceSheetSummary({
  totalAssets,
  totalLiabilitiesAndEquity,
  isBalanced,
  className,
}: BalanceSheetSummaryProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Balance Sheet Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border-border bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Total Assets</p>
            <p className="font-heading text-foreground text-xl font-semibold tabular-nums">
              {formatInr(totalAssets)}
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Total Liabilities & Equity</p>
            <p className="font-heading text-foreground text-xl font-semibold tabular-nums">
              {formatInr(totalLiabilitiesAndEquity)}
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Balance Sheet Status</p>
            <p
              className={cn(
                'font-heading text-xl font-semibold',
                isBalanced ? 'text-primary' : 'text-destructive',
              )}
            >
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
