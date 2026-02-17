import { memo, useMemo } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Ledger } from '@/services/accounting/ledgers/useGetAllLedgers';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (n: number) =>
  n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface PnLRow {
  label: string;
  amount: number;
  highlight: boolean;
  isProfit?: boolean;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface TradingAndPLAccountProps {
  dateRange?: DateRange;
  ledgers: Ledger[];
  isLoading?: boolean;
  error?: Error | null;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const TradingAndPLAccount = memo(function TradingAndPLAccount({
  ledgers,
  isLoading,
  error,
}: TradingAndPLAccountProps) {
  const computed = useMemo(() => {
    if (ledgers.length === 0) {
      return null;
    }

    // Stock in Hand: use closingBalance when defined (even if 0), otherwise use balance
    const stockInHand = ledgers.find((l) => l.category === 'Stock in Hand');
    const openingStock = stockInHand?.openingBalance ?? 0;
    const closingStock =
      stockInHand != null && stockInHand.closingBalance !== undefined
        ? (stockInHand.closingBalance ?? 0)
        : (stockInHand?.balance ?? 0);

    const incomeLedgers = ledgers.filter((l) => l.type === 'Income');
    const expenseLedgers = ledgers.filter((l) => l.type === 'Expense');

    const incomeCategories: Array<{
      subType: string;
      category: string;
      total: number;
    }> = [];
    const expenseCategories: Array<{
      subType: string;
      category: string;
      total: number;
    }> = [];

    incomeLedgers.forEach((ledger) => {
      const balance = ledger.balance || ledger.closingBalance || 0;
      const existing = incomeCategories.find(
        (c) => c.subType === ledger.subType && c.category === ledger.category
      );
      if (existing) {
        existing.total += balance;
      } else {
        incomeCategories.push({
          subType: ledger.subType,
          category: ledger.category,
          total: balance,
        });
      }
    });

    expenseLedgers.forEach((ledger) => {
      const balance = ledger.balance || ledger.closingBalance || 0;
      const existing = expenseCategories.find(
        (c) => c.subType === ledger.subType && c.category === ledger.category
      );
      if (existing) {
        existing.total += balance;
      } else {
        expenseCategories.push({
          subType: ledger.subType,
          category: ledger.category,
          total: balance,
        });
      }
    });

    const sales = incomeCategories.filter((i) =>
      i.category.toLowerCase().includes('sale')
    );
    const otherIncome = incomeCategories.filter(
      (i) => !i.category.toLowerCase().includes('sale')
    );

    const tradingExpenses = expenseCategories.filter(
      (e) => e.subType === 'Direct Expenses' && e.category === 'Purchases'
    );
    const nonTradingExpenses = expenseCategories.filter(
      (e) => !(e.subType === 'Direct Expenses' && e.category === 'Purchases')
    );

    const salesTotal = sales.reduce((s, i) => s + i.total, 0);
    const purchaseTotal = tradingExpenses.reduce((s, e) => s + e.total, 0);

    const grossProfit =
      salesTotal + closingStock - purchaseTotal - openingStock;

    const indirectIncomesTotal = otherIncome.reduce((s, i) => s + i.total, 0);
    const indirectExpensesTotal = nonTradingExpenses.reduce(
      (s, e) => s + e.total,
      0
    );
    const netProfitLoss =
      grossProfit + indirectIncomesTotal - indirectExpensesTotal;

    const pnlDebit: PnLRow[] = [
      ...(grossProfit < 0
        ? [
            {
              label: 'Gross Loss',
              amount: Math.abs(grossProfit),
              highlight: true,
              isProfit: false,
            },
          ]
        : []),
      ...nonTradingExpenses.map((e) => ({
        label: e.category,
        amount: e.total,
        highlight: false,
      })),
      ...(netProfitLoss > 0
        ? [
            {
              label: 'Net Profit Trfd. to Capital',
              amount: netProfitLoss,
              highlight: true,
              isProfit: true,
            },
          ]
        : []),
    ];

    const pnlCredit: PnLRow[] = [
      ...(grossProfit > 0
        ? [
            {
              label: 'Gross Profit',
              amount: grossProfit,
              highlight: true,
              isProfit: true,
            },
          ]
        : []),
      ...otherIncome.map((i) => ({
        label: i.category,
        amount: i.total,
        highlight: false,
      })),
      ...(netProfitLoss < 0
        ? [
            {
              label: 'Net Loss Trfd. to Capital',
              amount: Math.abs(netProfitLoss),
              highlight: true,
              isProfit: false,
            },
          ]
        : []),
    ];

    const maxRows = Math.max(pnlDebit.length, pnlCredit.length);
    const tradingDebitTotal =
      openingStock + purchaseTotal + (grossProfit > 0 ? grossProfit : 0);
    const tradingCreditTotal =
      salesTotal + closingStock + (grossProfit < 0 ? Math.abs(grossProfit) : 0);
    const debitTotal = pnlDebit.reduce((s, r) => s + r.amount, 0);
    const creditTotal = pnlCredit.reduce((s, r) => s + r.amount, 0);

    return {
      openingStock,
      closingStock,
      purchaseTotal,
      salesTotal,
      grossProfit,
      pnlDebit,
      pnlCredit,
      maxRows,
      tradingDebitTotal,
      tradingCreditTotal,
      debitTotal,
      creditTotal,
    };
  }, [ledgers]);

  if (isLoading) {
    return (
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-muted-foreground text-center">
            Loading Trading & P&L Account...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-destructive text-center">
            {error instanceof Error
              ? error.message
              : 'Failed to load Trading & P&L Account'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (ledgers.length === 0) {
    return (
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-muted-foreground text-center">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!computed) {
    return (
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-muted-foreground text-center">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    openingStock,
    closingStock,
    purchaseTotal,
    salesTotal,
    grossProfit,
    pnlDebit,
    pnlCredit,
    maxRows,
    tradingDebitTotal,
    tradingCreditTotal,
    debitTotal,
    creditTotal,
  } = computed;

  return (
    <Card className="border-border/40 overflow-hidden shadow-sm">
      <CardHeader className="border-border/40 border-b pb-4">
        <h2 className="font-custom text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Trading A/c and Profit & Loss A/c
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border border-b-2 hover:bg-transparent">
                <TableHead className="font-custom px-4 py-3 font-semibold">
                  Particulars
                </TableHead>
                <TableHead className="font-custom border-border border-l border-dashed px-4 py-3 text-right font-semibold">
                  Amount
                </TableHead>
                <TableHead className="font-custom px-4 py-3 font-semibold">
                  Particulars
                </TableHead>
                <TableHead className="font-custom px-4 py-3 text-right font-semibold">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Trading Account */}
              <TableRow className="border-border hover:bg-muted/50 bg-muted/50 border-y-2">
                <TableCell
                  colSpan={4}
                  className="font-custom py-2 text-center font-bold"
                >
                  Trading Account
                </TableCell>
              </TableRow>

              {openingStock > 0 && (
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="font-custom px-4 py-2">
                    Opening Stock
                  </TableCell>
                  <TableCell className="font-custom border-border border-l border-dashed px-4 py-2 text-right">
                    {formatCurrency(openingStock)}
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2"> </TableCell>
                  <TableCell className="font-custom px-4 py-2 text-right">
                    {' '}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-custom px-4 py-2">
                  Purchases
                </TableCell>
                <TableCell className="font-custom border-border border-l border-dashed px-4 py-2 text-right">
                  {formatCurrency(purchaseTotal)}
                </TableCell>
                <TableCell className="font-custom px-4 py-2">Sales</TableCell>
                <TableCell className="font-custom px-4 py-2 text-right">
                  {formatCurrency(salesTotal)}
                </TableCell>
              </TableRow>

              {closingStock > 0 && (
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="font-custom px-4 py-2"> </TableCell>
                  <TableCell className="font-custom border-border border-l border-dashed px-4 py-2 text-right">
                    {' '}
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2">
                    Closing Stock
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2 text-right">
                    {formatCurrency(closingStock)}
                  </TableCell>
                </TableRow>
              )}

              {grossProfit >= 0 ? (
                <TableRow className="border-border hover:bg-muted/30 border-b">
                  <TableCell className="font-custom px-4 py-2 font-semibold">
                    Gross Profit
                  </TableCell>
                  <TableCell className="font-custom border-border border-l border-dashed px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(grossProfit)}
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2"> </TableCell>
                  <TableCell className="font-custom px-4 py-2 text-right">
                    {' '}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="border-border hover:bg-muted/30 border-b">
                  <TableCell className="font-custom px-4 py-2"> </TableCell>
                  <TableCell className="font-custom border-border border-l border-dashed px-4 py-2 text-right">
                    {' '}
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2 font-semibold">
                    Gross Loss
                  </TableCell>
                  <TableCell className="font-custom px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(Math.abs(grossProfit))}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="border-border hover:bg-muted/50 bg-muted/50 border-t-2 font-bold">
                <TableCell className="font-custom px-4 py-3">Total</TableCell>
                <TableCell className="font-custom border-border border-l border-dashed px-4 py-3 text-right">
                  {formatCurrency(tradingDebitTotal)}
                </TableCell>
                <TableCell className="font-custom px-4 py-3">Total</TableCell>
                <TableCell className="font-custom px-4 py-3 text-right">
                  {formatCurrency(tradingCreditTotal)}
                </TableCell>
              </TableRow>

              {/* P&L Account */}
              <TableRow className="border-border hover:bg-muted/50 bg-muted/50 border-y-2">
                <TableCell
                  colSpan={4}
                  className="font-custom py-2 text-center font-bold"
                >
                  Profit & Loss Account
                </TableCell>
              </TableRow>

              {Array.from({ length: maxRows }).map((_, i) => (
                <TableRow
                  key={i}
                  className="border-border hover:bg-muted/30 border-b"
                >
                  <TableCell className="font-custom text-muted-foreground px-4 py-2">
                    {pnlDebit[i]?.label ?? '\u00A0'}
                  </TableCell>
                  <TableCell
                    className={`font-custom border-border border-l border-dashed px-4 py-2 text-right ${
                      pnlDebit[i]?.highlight
                        ? pnlDebit[i]?.isProfit
                          ? 'font-semibold text-green-600 dark:text-green-400'
                          : 'font-semibold text-red-600 dark:text-red-400'
                        : ''
                    }`}
                  >
                    {pnlDebit[i]
                      ? formatCurrency(pnlDebit[i].amount)
                      : '\u00A0'}
                  </TableCell>
                  <TableCell className="font-custom text-muted-foreground px-4 py-2">
                    {pnlCredit[i]?.label ?? '\u00A0'}
                  </TableCell>
                  <TableCell
                    className={`font-custom px-4 py-2 text-right ${
                      pnlCredit[i]?.highlight
                        ? pnlCredit[i]?.isProfit
                          ? 'font-semibold text-green-600 dark:text-green-400'
                          : 'font-semibold text-red-600 dark:text-red-400'
                        : ''
                    }`}
                  >
                    {pnlCredit[i]
                      ? formatCurrency(pnlCredit[i].amount)
                      : '\u00A0'}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="border-border hover:bg-muted/50 bg-muted/50 border-t-2 font-bold">
                <TableCell className="font-custom px-4 py-3">Total</TableCell>
                <TableCell className="font-custom border-border border-l border-dashed px-4 py-3 text-right">
                  {formatCurrency(debitTotal)}
                </TableCell>
                <TableCell className="font-custom px-4 py-3">Total</TableCell>
                <TableCell className="font-custom px-4 py-3 text-right">
                  {formatCurrency(creditTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

export default TradingAndPLAccount;
