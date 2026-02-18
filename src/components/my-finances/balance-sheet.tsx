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
import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';
import { computeLedgerBalancesFromVouchers } from '@/services/accounting/computeLedgerBalances';
import type { Voucher } from '@/services/accounting/vouchers/useGetAllVouchers';
import { useGetAllVouchers } from '@/services/accounting/vouchers/useGetAllVouchers';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface BSRow {
  label: string;
  amount: number | null;
  isHeader?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
}

/**
 * Build balance sheet rows from ledgers and vouchers using the same logic as
 * the reference implementation: net profit/loss from P&L, capital with
 * movements, liabilities by subType/category, assets by subType/category
 * (Stock in Hand uses closingBalance when defined), asset order Fixed Assets
 * then Current Assets.
 */
function buildBalanceSheetRows(
  ledgers: Ledger[],
  vouchers: Voucher[]
): {
  liabilityRows: BSRow[];
  assetRows: BSRow[];
  totalLiabilitiesAndEquity: number;
  totalAssets: number;
  isBalanced: boolean;
} {
  const liabilityRows: BSRow[] = [];
  const assetRows: BSRow[] = [];

  const balanceMap = computeLedgerBalancesFromVouchers(ledgers, vouchers);
  const getBalance = (ledger: Ledger) => balanceMap.get(ledger._id) ?? 0;

  /* ------------------ CALCULATE NET PROFIT/LOSS ------------------ */

  const stockInHand = ledgers.find((l) => l.category === 'Stock in Hand');
  const openingStock = stockInHand?.openingBalance ?? 0;
  const closingStock =
    stockInHand != null ? getBalance(stockInHand) : 0;

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

  const salesTotal = sales.reduce((s, l) => s + getBalance(l), 0);
  const purchaseTotal = tradingExpenses.reduce(
    (s, l) => s + getBalance(l),
    0
  );

  const grossProfit = salesTotal + closingStock - purchaseTotal - openingStock;

  const indirectIncomesTotal = otherIncome.reduce(
    (s, l) => s + getBalance(l),
    0
  );
  const indirectExpensesTotal = nonTradingExpenses.reduce(
    (s, l) => s + getBalance(l),
    0
  );
  const netProfitLoss =
    grossProfit + indirectIncomesTotal - indirectExpensesTotal;

  /* ------------------ DATA PREP ------------------ */

  const equityLedgers = ledgers.filter((l) => l.type === 'Equity');

  const liabilityLedgers = ledgers.filter((l) => l.type === 'Liability');
  const liabilitySubTypes: Record<string, number> = {};
  const liabilityCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];

  liabilityLedgers.forEach((ledger) => {
    const balance = getBalance(ledger);
    liabilitySubTypes[ledger.subType] =
      (liabilitySubTypes[ledger.subType] ?? 0) + balance;
    const existing = liabilityCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existing) {
      existing.total += balance;
    } else {
      liabilityCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  });

  const assetLedgers = ledgers.filter((l) => l.type === 'Asset');
  const assetSubTypes: Record<string, number> = {};
  const assetCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];

  assetLedgers.forEach((ledger) => {
    const balance = getBalance(ledger);
    assetSubTypes[ledger.subType] =
      (assetSubTypes[ledger.subType] ?? 0) + balance;
    const existing = assetCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existing) {
      existing.total += balance;
    } else {
      assetCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  });

  /* ------------------ CAPITAL ------------------ */

  if (equityLedgers.length > 0) {
    liabilityRows.push({
      label: 'CAPITAL',
      amount: null,
      isHeader: true,
    });

    equityLedgers.forEach((ledger) => {
      const ledgerId = ledger._id;
      const capitalAdditions = vouchers
        .filter((v) => v.creditLedger._id === ledgerId)
        .reduce((sum, v) => sum + v.amount, 0);
      const capitalDeletions = vouchers
        .filter((v) => v.debitLedger._id === ledgerId)
        .reduce((sum, v) => sum + v.amount, 0);

      liabilityRows.push({
        label: `${ledger.name} - Opening Balance`,
        amount: ledger.openingBalance ?? 0,
      });

      if (capitalAdditions > 0 || capitalDeletions > 0) {
        const netMovement = capitalAdditions - capitalDeletions;
        if (netMovement !== 0) {
          liabilityRows.push({
            label: `${ledger.name} - ${netMovement > 0 ? 'Add: Capital Introduced' : 'Less: Capital Withdrawn'}`,
            amount: Math.abs(netMovement),
          });
        } else {
          if (capitalAdditions > 0) {
            liabilityRows.push({
              label: `${ledger.name} - Add: Capital Introduced`,
              amount: capitalAdditions,
            });
          }
          if (capitalDeletions > 0) {
            liabilityRows.push({
              label: `${ledger.name} - Less: Capital Withdrawn`,
              amount: capitalDeletions,
            });
          }
        }
      }
    });

    if (netProfitLoss !== 0) {
      liabilityRows.push({
        label: netProfitLoss > 0 ? 'Add: Profit' : 'Less: Loss',
        amount: Math.abs(netProfitLoss),
        isProfit: netProfitLoss > 0,
      });
    }

    const totalCapital =
      equityLedgers.reduce((sum, ledger) => sum + getBalance(ledger), 0) +
      netProfitLoss;

    liabilityRows.push({
      label: 'Total Capital',
      amount: totalCapital,
      isTotal: true,
    });
  }

  /* ------------------ LIABILITIES ------------------ */

  Object.entries(liabilitySubTypes).forEach(([subType, total]) => {
    liabilityRows.push({
      label: subType.toUpperCase(),
      amount: null,
      isHeader: true,
    });
    liabilityCategories
      .filter((c) => c.subType === subType)
      .forEach((c) => {
        liabilityRows.push({ label: c.category, amount: c.total });
      });
    liabilityRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  });

  /* ------------------ ASSETS ------------------ */

  const assetSubTypeOrder = ['Fixed Assets', 'Current Assets'];
  const sortedAssetSubTypes = Object.entries(assetSubTypes).sort(
    ([subTypeA], [subTypeB]) => {
      const indexA = assetSubTypeOrder.indexOf(subTypeA);
      const indexB = assetSubTypeOrder.indexOf(subTypeB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    }
  );

  sortedAssetSubTypes.forEach(([subType, total]) => {
    assetRows.push({
      label: subType.toUpperCase(),
      amount: null,
      isHeader: true,
    });
    assetCategories
      .filter((c) => c.subType === subType)
      .forEach((c) => {
        assetRows.push({ label: c.category, amount: c.total });
      });
    assetRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  });

  /* ------------------ TOTALS ------------------ */

  const totalEquity = equityLedgers.reduce(
    (sum, ledger) => sum + getBalance(ledger),
    0
  );
  const totalLiabilities = Object.values(liabilitySubTypes).reduce(
    (sum, t) => sum + t,
    0
  );
  const totalAssets = Object.values(assetSubTypes).reduce(
    (sum, t) => sum + t,
    0
  );
  const totalLiabilitiesAndEquity =
    totalLiabilities + totalEquity + netProfitLoss;
  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  return {
    liabilityRows,
    assetRows,
    totalLiabilitiesAndEquity,
    totalAssets,
    isBalanced,
  };
}

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface BalanceSheetProps {
  dateRange?: DateRange;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const BalanceSheet = memo(function BalanceSheet({
  dateRange,
}: BalanceSheetProps) {
  const params = useMemo(() => {
    const p: { from?: string; to?: string } = {};
    if (dateRange?.from) p.from = dateRange.from;
    if (dateRange?.to) p.to = dateRange.to;
    return p;
  }, [dateRange]);

  const ledgersQuery = useGetAllLedgers(params);
  const vouchersQuery = useGetAllVouchers(params);

  const isLoading = ledgersQuery.isLoading || vouchersQuery.isLoading;
  const isError = ledgersQuery.isError || vouchersQuery.isError;
  const error = ledgersQuery.error ?? vouchersQuery.error;

  const tableData = useMemo(() => {
    if (ledgersQuery.isLoading || vouchersQuery.isLoading) return null;
    const list = ledgersQuery.data ?? [];
    if (list.length === 0) return null;
    return buildBalanceSheetRows(list, vouchersQuery.data ?? []);
  }, [
    ledgersQuery.isLoading,
    vouchersQuery.isLoading,
    ledgersQuery.data,
    vouchersQuery.data,
  ]);

  if (isLoading) {
    return (
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-custom text-muted-foreground text-center">
            Loading balance sheet...
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
              : 'Failed to load balance sheet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!tableData) {
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
    liabilityRows,
    assetRows,
    totalLiabilitiesAndEquity,
    totalAssets,
    isBalanced,
  } = tableData;
  const maxRows = Math.max(liabilityRows.length, assetRows.length);

  return (
    <div className="space-y-6">
      <Card className="border-border/40 overflow-hidden shadow-sm">
        <CardHeader className="border-border/40 border-b pb-4">
          <h2 className="font-custom text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Balance Sheet
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border border-b-2 hover:bg-transparent">
                  <TableHead className="font-custom px-4 py-3 font-semibold">
                    Liabilities
                  </TableHead>
                  <TableHead className="font-custom border-border border-l border-dashed px-4 py-3 text-right font-semibold">
                    Amount
                  </TableHead>
                  <TableHead className="font-custom px-4 py-3 font-semibold">
                    Assets
                  </TableHead>
                  <TableHead className="font-custom px-4 py-3 text-right font-semibold">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: maxRows }).map((_, i) => {
                  const L = liabilityRows[i];
                  const A = assetRows[i];
                  return (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell
                        className={`font-custom px-4 py-2 ${L?.isHeader ? 'text-foreground font-semibold' : 'text-muted-foreground'} `}
                      >
                        {L?.label ?? '\u00A0'}
                      </TableCell>
                      <TableCell
                        className={`font-custom border-border border-l border-dashed px-4 py-2 text-right ${L?.isTotal ? 'text-foreground font-semibold' : ''} ${L?.isProfit !== undefined && L?.amount != null ? (L.isProfit ? 'font-semibold text-green-600 dark:text-green-400' : 'font-semibold text-red-600 dark:text-red-400') : ''} `}
                      >
                        {L?.amount != null
                          ? formatCurrency(L.amount)
                          : '\u00A0'}
                      </TableCell>
                      <TableCell
                        className={`font-custom px-4 py-2 ${A?.isHeader ? 'text-foreground font-semibold' : 'text-muted-foreground'} `}
                      >
                        {A?.label ?? '\u00A0'}
                      </TableCell>
                      <TableCell
                        className={`font-custom px-4 py-2 text-right ${A?.isTotal ? 'text-foreground font-semibold' : ''} `}
                      >
                        {A?.amount != null
                          ? formatCurrency(A.amount)
                          : '\u00A0'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-border bg-muted/50 hover:bg-muted/50 border-t-2 font-bold">
                  <TableCell className="font-custom px-4 py-3">Total</TableCell>
                  <TableCell className="font-custom border-border border-l border-dashed px-4 py-3 text-right">
                    {formatCurrency(totalLiabilitiesAndEquity)}
                  </TableCell>
                  <TableCell className="font-custom px-4 py-3">Total</TableCell>
                  <TableCell className="font-custom px-4 py-3 text-right">
                    {formatCurrency(totalAssets)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
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
                {formatCurrency(totalAssets)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-sm">
                Total Liabilities & Equity
              </p>
              <p className="font-custom text-primary text-xl font-bold">
                {formatCurrency(totalLiabilitiesAndEquity)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="font-custom text-muted-foreground text-sm">
                Balance Sheet Status
              </p>
              <p
                className={`font-custom text-xl font-bold ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
              >
                {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default BalanceSheet;
