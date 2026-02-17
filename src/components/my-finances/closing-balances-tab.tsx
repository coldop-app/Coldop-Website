import { Fragment, memo, useMemo } from 'react';

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
import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface DateRange {
  from: string | null;
  to: string | null;
}

interface ClosingBalancesTabProps {
  dateRange?: DateRange;
}

interface CategoryGroup {
  type: string;
  category: string;
  subType: string;
  ledgers: Ledger[];
  total: number;
}

interface TypeColors {
  bg: string;
  header: string;
  total: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** For Stock in Hand use closingBalance when defined (even if 0); else balance || closingBalance || 0 */
function getDisplayBalance(ledger: Ledger): number {
  const isStockInHand = ledger.category === 'Stock in Hand';
  if (isStockInHand && ledger.closingBalance !== undefined) {
    return ledger.closingBalance ?? 0;
  }
  return ledger.balance || ledger.closingBalance || 0;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const TYPE_COLORS: Record<string, TypeColors> = {
  Asset: {
    bg: 'bg-blue-600',
    header: 'bg-blue-50 dark:bg-blue-950/40',
    total: 'bg-blue-100 dark:bg-blue-900/30',
  },
  Liability: {
    bg: 'bg-red-600',
    header: 'bg-red-50 dark:bg-red-950/40',
    total: 'bg-red-100 dark:bg-red-900/30',
  },
  Equity: {
    bg: 'bg-green-600',
    header: 'bg-green-50 dark:bg-green-950/40',
    total: 'bg-green-100 dark:bg-green-900/30',
  },
  Income: {
    bg: 'bg-purple-600',
    header: 'bg-purple-50 dark:bg-purple-950/40',
    total: 'bg-purple-100 dark:bg-purple-900/30',
  },
  Expense: {
    bg: 'bg-orange-600',
    header: 'bg-orange-50 dark:bg-orange-950/40',
    total: 'bg-orange-100 dark:bg-orange-900/30',
  },
};

const ClosingBalancesTab = memo(function ClosingBalancesTab({
  dateRange,
}: ClosingBalancesTabProps) {
  const params = useMemo(
    () => ({
      from: dateRange?.from ?? undefined,
      to: dateRange?.to ?? undefined,
    }),
    [dateRange?.from, dateRange?.to]
  );

  const {
    data: ledgers = [],
    isLoading,
    isError,
    error,
  } = useGetAllLedgers(params);

  const computed = useMemo(() => {
    if (ledgers.length === 0) return null;

    // Stock in Hand: use closingBalance when defined (even if 0), otherwise use balance
    const stockInHand = ledgers.find((l) => l.category === 'Stock in Hand');
    const openingStock = stockInHand?.openingBalance ?? 0;
    const closingStock =
      stockInHand != null && stockInHand.closingBalance !== undefined
        ? (stockInHand.closingBalance ?? 0)
        : (stockInHand?.balance ?? 0);

    const incomeLedgers = ledgers.filter((l) => l.type === 'Income');
    const expenseLedgers = ledgers.filter((l) => l.type === 'Expense');

    const sales = incomeLedgers.filter((l) =>
      l.category.toLowerCase().includes('sale')
    );
    const otherIncome = incomeLedgers.filter(
      (l) => !l.category.toLowerCase().includes('sale')
    );

    const tradingExpenses = expenseLedgers.filter(
      (e) => e.subType === 'Direct Expenses' && e.category === 'Purchases'
    );
    const nonTradingExpenses = expenseLedgers.filter(
      (e) => !(e.subType === 'Direct Expenses' && e.category === 'Purchases')
    );

    const salesTotal = sales.reduce(
      (s, l) => s + (l.balance || l.closingBalance || 0),
      0
    );
    const purchaseTotal = tradingExpenses.reduce(
      (s, l) => s + (l.balance || l.closingBalance || 0),
      0
    );

    const grossProfit =
      salesTotal + closingStock - purchaseTotal - openingStock;

    const indirectIncomesTotal = otherIncome.reduce(
      (s, l) => s + (l.balance || l.closingBalance || 0),
      0
    );
    const indirectExpensesTotal = nonTradingExpenses.reduce(
      (s, l) => s + (l.balance || l.closingBalance || 0),
      0
    );
    const netProfitLoss =
      grossProfit + indirectIncomesTotal - indirectExpensesTotal;

    const categoryGroups: Record<string, CategoryGroup> = {};
    ledgers.forEach((ledger) => {
      const key = `${ledger.type}::${ledger.category}`;
      if (!categoryGroups[key]) {
        categoryGroups[key] = {
          type: ledger.type,
          category: ledger.category,
          subType: ledger.subType,
          ledgers: [],
          total: 0,
        };
      }
      categoryGroups[key].ledgers.push(ledger);
      // For Stock in Hand, use closing balance if available; else balance || closingBalance || 0
      const isStockInHand = ledger.category === 'Stock in Hand';
      if (isStockInHand && ledger.closingBalance !== undefined) {
        categoryGroups[key].total += ledger.closingBalance ?? 0;
      } else {
        categoryGroups[key].total +=
          ledger.balance || ledger.closingBalance || 0;
      }
    });

    const groupedByType: Record<string, CategoryGroup[]> = {};
    Object.values(categoryGroups).forEach((group) => {
      if (!groupedByType[group.type]) {
        groupedByType[group.type] = [];
      }
      groupedByType[group.type].push(group);
    });

    // Total assets: for Stock in Hand use closing balance if available; else balance || closingBalance || 0
    const totalAssets = ledgers
      .filter((l) => l.type === 'Asset')
      .reduce((sum, l) => {
        const isStockInHand = l.category === 'Stock in Hand';
        if (isStockInHand && l.closingBalance !== undefined) {
          return sum + (l.closingBalance ?? 0);
        }
        return sum + (l.balance || l.closingBalance || 0);
      }, 0);

    const totalLiabilitiesAndEquity =
      ledgers
        .filter((l) => l.type === 'Liability')
        .reduce((sum, l) => sum + (l.balance || l.closingBalance || 0), 0) +
      ledgers
        .filter((l) => l.type === 'Equity')
        .reduce((sum, l) => sum + (l.balance || l.closingBalance || 0), 0) +
      netProfitLoss;

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

    return {
      groupedByType,
      netProfitLoss,
      totalAssets,
      totalLiabilitiesAndEquity,
      isBalanced,
    };
  }, [ledgers]);

  if (isLoading) {
    return (
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-muted-foreground text-center">
            Loading closing balances…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-destructive text-center">
            {error instanceof Error
              ? error.message
              : 'Failed to load closing balances'}
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
    return null;
  }

  const {
    groupedByType,
    netProfitLoss,
    totalAssets,
    totalLiabilitiesAndEquity,
    isBalanced,
  } = computed;

  return (
    <div className="space-y-6">
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardHeader className="border-border/40 border-b pb-4">
          <h2 className="font-custom text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Closing Balances Report
          </h2>
          <p className="font-custom text-muted-foreground text-sm">
            This report shows the closing balances of all ledgers which form the
            basis of the financial statements.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          {Object.entries(groupedByType).map(([type, groups]) => {
            const colors = TYPE_COLORS[type] ?? TYPE_COLORS.Asset;
            const typeTotal = groups.reduce((sum, g) => sum + g.total, 0);
            const displayTotal =
              type === 'Equity' ? typeTotal + netProfitLoss : typeTotal;

            return (
              <div
                key={type}
                className="border-border/60 overflow-hidden rounded-xl border"
              >
                <div
                  className={`${colors.bg} font-custom flex justify-between px-4 py-3 font-bold text-white`}
                >
                  <span>{type}</span>
                  <span>Total: ₹ {formatCurrency(displayTotal)}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow
                      className={`${colors.header} border-border/40 hover:bg-transparent`}
                    >
                      <TableHead className="font-custom px-4 py-3 font-semibold">
                        Category
                      </TableHead>
                      <TableHead className="font-custom px-4 py-3 font-semibold">
                        Sub-Type
                      </TableHead>
                      <TableHead className="font-custom px-4 py-3 text-right font-semibold">
                        Balance (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group, idx) => (
                      <Fragment key={`${group.type}-${group.category}-${idx}`}>
                        <TableRow className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-custom px-4 py-2 font-semibold">
                            {group.category}
                          </TableCell>
                          <TableCell className="font-custom text-muted-foreground px-4 py-2">
                            {group.subType}
                          </TableCell>
                          <TableCell className="font-custom px-4 py-2 text-right font-medium">
                            {formatCurrency(group.total)}
                          </TableCell>
                        </TableRow>
                        {group.ledgers.map((ledger) => {
                          const displayBalance = getDisplayBalance(ledger);
                          return (
                            <TableRow
                              key={ledger._id}
                              className="border-border/40 bg-muted/20 hover:bg-muted/30"
                            >
                              <TableCell className="font-custom text-muted-foreground pl-8 text-sm">
                                {ledger.name}
                              </TableCell>
                              <TableCell className="px-4 py-2" />
                              <TableCell className="font-custom px-4 py-2 text-right text-sm">
                                {formatCurrency(displayBalance)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </Fragment>
                    ))}
                    {type === 'Equity' && netProfitLoss !== 0 && (
                      <TableRow
                        className={`${colors.total} border-border border-t-2 font-bold`}
                      >
                        <TableCell
                          className="font-custom px-4 py-2"
                          colSpan={2}
                        >
                          {netProfitLoss > 0
                            ? 'Add: Net Profit'
                            : 'Less: Net Loss'}
                        </TableCell>
                        <TableCell
                          className={`font-custom px-4 py-2 text-right ${netProfitLoss < 0 ? 'text-red-600 dark:text-red-400' : ''}`}
                        >
                          {formatCurrency(Math.abs(netProfitLoss))}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      className={`${colors.total} border-border/40 font-bold`}
                    >
                      <TableCell className="font-custom px-4 py-2" colSpan={2}>
                        Total {type}
                      </TableCell>
                      <TableCell className="font-custom px-4 py-2 text-right">
                        {formatCurrency(displayTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/40 from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 overflow-hidden bg-linear-to-br shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-lg font-semibold">
            Balance Sheet Summary
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-sm">
                Total Assets
              </p>
              <p className="font-custom text-primary text-xl font-bold">
                ₹ {formatCurrency(totalAssets)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-sm">
                Total Liabilities & Equity
              </p>
              <p className="font-custom text-primary text-xl font-bold">
                ₹ {formatCurrency(totalLiabilitiesAndEquity)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-sm">
                Balance Sheet Status
              </p>
              <p
                className={`font-custom text-xl font-bold ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
              >
                {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ClosingBalancesTab;
