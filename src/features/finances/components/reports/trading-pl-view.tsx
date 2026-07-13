import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TradingPlReport } from '@/features/finances/domain/types';
import { formatCurrency } from '@/features/finances/shared/format-currency';
import { cn } from '@/lib/utils';

type TradingPlViewProps = {
  report: TradingPlReport;
};

export function TradingPlView({ report }: TradingPlViewProps) {
  const {
    openingStock,
    closingStock,
    purchaseTotal,
    salesTotal,
    grossProfit,
    pnlDebit,
    pnlCredit,
    tradingDebitTotal,
    tradingCreditTotal,
    debitTotal,
    creditTotal,
  } = report;

  const maxRows = Math.max(pnlDebit.length, pnlCredit.length);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-border border-b pb-4">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          Trading A/c and Profit & Loss A/c
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table className="w-full text-sm">
            <TableHeader className="border-border bg-muted/50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground h-10 px-3 font-medium">
                  Particulars
                </TableHead>
                <TableHead className="border-border text-muted-foreground h-10 border-l border-dashed px-3 text-right font-medium">
                  Amount
                </TableHead>
                <TableHead className="text-muted-foreground h-10 px-3 font-medium">
                  Particulars
                </TableHead>
                <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-y-2">
                <TableCell colSpan={4} className="py-2 text-center font-medium">
                  Trading Account
                </TableCell>
              </TableRow>

              {openingStock > 0 ? (
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5">Opening Stock</TableCell>
                  <TableCell className="border-border border-l border-dashed px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(openingStock)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5" />
                </TableRow>
              ) : null}

              <TableRow className="hover:bg-muted/50">
                <TableCell className="px-3 py-2.5">Purchases</TableCell>
                <TableCell className="border-border border-l border-dashed px-3 py-2.5 text-right tabular-nums">
                  {formatCurrency(purchaseTotal)}
                </TableCell>
                <TableCell className="px-3 py-2.5">Sales</TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {formatCurrency(salesTotal)}
                </TableCell>
              </TableRow>

              {closingStock > 0 ? (
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="border-border border-l border-dashed px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5">Closing Stock</TableCell>
                  <TableCell className="px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(closingStock)}
                  </TableCell>
                </TableRow>
              ) : null}

              {grossProfit >= 0 ? (
                <TableRow className="border-border hover:bg-muted/50 border-b">
                  <TableCell className="px-3 py-2.5 font-medium">Gross Profit</TableCell>
                  <TableCell className="border-border text-primary border-l border-dashed px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(grossProfit)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5" />
                </TableRow>
              ) : (
                <TableRow className="border-border hover:bg-muted/50 border-b">
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="border-border border-l border-dashed px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5 font-medium">Gross Loss</TableCell>
                  <TableCell className="text-destructive px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(Math.abs(grossProfit))}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-t-2 font-medium">
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="border-border border-l border-dashed px-3 py-3 text-right tabular-nums">
                  {formatCurrency(tradingDebitTotal)}
                </TableCell>
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(tradingCreditTotal)}
                </TableCell>
              </TableRow>

              <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-y-2">
                <TableCell colSpan={4} className="py-2 text-center font-medium">
                  Profit & Loss Account
                </TableCell>
              </TableRow>

              {Array.from({ length: maxRows }).map((_, index) => {
                const debit = pnlDebit[index];
                const credit = pnlCredit[index];
                return (
                  <TableRow
                    key={`pnl-${index}`}
                    className="border-border hover:bg-muted/50 border-b"
                  >
                    <TableCell className="text-muted-foreground px-3 py-2.5">
                      {debit?.label ?? '\u00A0'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'border-border border-l border-dashed px-3 py-2.5 text-right tabular-nums',
                        debit?.highlight &&
                          (debit.isProfit
                            ? 'text-primary font-medium'
                            : 'text-destructive font-medium'),
                      )}
                    >
                      {debit ? formatCurrency(debit.amount) : '\u00A0'}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-3 py-2.5">
                      {credit?.label ?? '\u00A0'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'px-3 py-2.5 text-right tabular-nums',
                        credit?.highlight &&
                          (credit.isProfit
                            ? 'text-primary font-medium'
                            : 'text-destructive font-medium'),
                      )}
                    >
                      {credit ? formatCurrency(credit.amount) : '\u00A0'}
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-t-2 font-medium">
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="border-border border-l border-dashed px-3 py-3 text-right tabular-nums">
                  {formatCurrency(debitTotal)}
                </TableCell>
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(creditTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
