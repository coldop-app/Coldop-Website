import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Card } from '@/components/ui/card';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  openingBalance?: number;
  closingBalance?: number;
  balance?: number;
}

interface DateRange {
  from: string | null;
  to: string | null;
}

interface ClosingBalancesProps {
  dateRange?: DateRange;
}

const ClosingBalances = ({ dateRange }: ClosingBalancesProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data: ledgersData, isLoading } = useQuery({
    queryKey: ['ledgers', dateRange?.from, dateRange?.to],
    queryFn: () => {
      const params: { from?: string; to?: string } = {};
      if (dateRange?.from) {
        params.from = dateRange.from;
      }
      if (dateRange?.to) {
        params.to = dateRange.to;
      }
      return accountingApi.getLedgers(params, adminInfo?.token || '');
    },
    enabled: !!adminInfo?.token
  });

  if (isLoading) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">Loading closing balances...</div>
      </Card>
    );
  }

  const ledgers: Ledger[] = ledgersData?.data || [];

  if (ledgers.length === 0) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">No data available</div>
      </Card>
    );
  }

  /* ------------------ CALCULATE NET PROFIT/LOSS ------------------ */

  // Get Stock in Hand ledger (by category only)
  const stockInHand = ledgers.find(
    (l) => l.category === "Stock in Hand"
  );
  const openingStock = stockInHand?.openingBalance || 0;
  // For Stock in Hand, always use closingBalance if defined (even if 0), otherwise use balance
  const closingStock = stockInHand && stockInHand.closingBalance !== undefined
    ? stockInHand.closingBalance
    : (stockInHand?.balance || 0);

  // Get income and expense ledgers
  const incomeLedgers = ledgers.filter((l) => l.type === "Income");
  const expenseLedgers = ledgers.filter((l) => l.type === "Expense");

  // Calculate sales and purchases
  const sales = incomeLedgers.filter((l) =>
    l.category.toLowerCase().includes("sale")
  );
  const otherIncome = incomeLedgers.filter(
    (l) => !l.category.toLowerCase().includes("sale")
  );

  const tradingExpenses = expenseLedgers.filter(
    (e) => e.subType === "Direct Expenses" && e.category === "Purchases"
  );
  const nonTradingExpenses = expenseLedgers.filter(
    (e) => !(e.subType === "Direct Expenses" && e.category === "Purchases")
  );

  const salesTotal = sales.reduce((s, l) => s + (l.balance || l.closingBalance || 0), 0);
  const purchaseTotal = tradingExpenses.reduce((s, l) => s + (l.balance || l.closingBalance || 0), 0);

  // Gross Profit/Loss = Sales + Closing Stock - Purchases - Opening Stock
  const grossProfit = salesTotal + closingStock - purchaseTotal - openingStock;

  // Net Profit/Loss = Gross Profit/Gross Loss + Indirect Incomes - Indirect Expenses
  const indirectIncomesTotal = otherIncome.reduce((s, l) => s + (l.balance || l.closingBalance || 0), 0);
  const indirectExpensesTotal = nonTradingExpenses.reduce((s, l) => s + (l.balance || l.closingBalance || 0), 0);
  const netProfitLoss = grossProfit + indirectIncomesTotal - indirectExpensesTotal;

  /* ------------------ GROUP LEDGERS BY TYPE AND CATEGORY ------------------ */

  const categoryGroups: Record<
    string,
    {
      type: string;
      category: string;
      subType: string;
      ledgers: Ledger[];
      total: number;
    }
  > = {};

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
    // For Stock in Hand, use closing balance if available
    const isStockInHand = ledger.category === "Stock in Hand";
    if (isStockInHand && ledger.closingBalance !== undefined) {
      categoryGroups[key].total += ledger.closingBalance;
    } else {
      categoryGroups[key].total += ledger.balance || ledger.closingBalance || 0;
    }
  });

  const groupedByType: Record<string, typeof categoryGroups[string][]> = {};
  Object.values(categoryGroups).forEach((group) => {
    if (!groupedByType[group.type]) {
      groupedByType[group.type] = [];
    }
    groupedByType[group.type].push(group);
  });

  const typeColors: Record<
    string,
    { bg: string; header: string; total: string }
  > = {
    Asset: { bg: "bg-blue-600", header: "bg-blue-50", total: "bg-blue-100" },
    Liability: { bg: "bg-red-600", header: "bg-red-50", total: "bg-red-100" },
    Equity: { bg: "bg-green-600", header: "bg-green-50", total: "bg-green-100" },
    Income: { bg: "bg-purple-600", header: "bg-purple-50", total: "bg-purple-100" },
    Expense: { bg: "bg-orange-600", header: "bg-orange-50", total: "bg-orange-100" },
  };

  /* ------------------ CALCULATE TOTALS ------------------ */

  const totalAssets = ledgers
    .filter((l) => l.type === "Asset")
    .reduce((sum, l) => {
      // For Stock in Hand, use closing balance if available
      const isStockInHand = l.category === "Stock in Hand";
      if (isStockInHand && l.closingBalance !== undefined) {
        return sum + l.closingBalance;
      }
      return sum + (l.balance || l.closingBalance || 0);
    }, 0);

  const totalLiabilitiesAndEquity =
    ledgers
      .filter((l) => l.type === "Liability")
      .reduce((sum, l) => sum + (l.balance || l.closingBalance || 0), 0) +
    ledgers
      .filter((l) => l.type === "Equity")
      .reduce((sum, l) => sum + (l.balance || l.closingBalance || 0), 0) +
    netProfitLoss;

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Closing Balances Report</h2>
        <p className="text-gray-600 mb-4">
          This report shows the closing balances of all ledgers which form the
          basis of the financial statements.
        </p>

        <div className="space-y-6">
          {Object.entries(groupedByType).map(([type, groups]) => {
            const colors = typeColors[type] || typeColors.Asset;
            const typeTotal = groups.reduce((sum, g) => sum + g.total, 0);
            const displayTotal =
              type === "Equity" ? typeTotal + netProfitLoss : typeTotal;

            return (
              <div key={type} className="border rounded-lg overflow-hidden">
                <div
                  className={`${colors.bg} text-white p-4 font-bold flex justify-between`}
                >
                  <span>{type}</span>
                  <span>
                    Total: ₹{" "}
                    {displayTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={colors.header}>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Sub-Type</th>
                        <th className="px-4 py-2 text-right">Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-semibold">
                              {group.category}
                            </td>
                            <td className="px-4 py-2">{group.subType}</td>
                            <td className="px-4 py-2 text-right font-medium">
                              {group.total.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                          {group.ledgers.map((ledger) => {
                            // For Stock in Hand, use closing balance if available
                            const isStockInHand = ledger.category === "Stock in Hand";
                            const displayBalance = isStockInHand && ledger.closingBalance !== undefined
                              ? ledger.closingBalance
                              : (ledger.balance || ledger.closingBalance || 0);

                            return (
                              <tr
                                key={ledger._id}
                                className="border-b hover:bg-gray-50 bg-gray-50"
                              >
                                <td className="px-4 py-2 pl-8 text-sm text-gray-600">
                                  {ledger.name}
                                </td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2 text-right text-sm">
                                  {displayBalance.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                      {type === "Equity" && netProfitLoss !== 0 && (
                        <tr
                          className={`${colors.total} font-bold border-t-2`}
                        >
                          <td className="px-4 py-2" colSpan={2}>
                            {netProfitLoss > 0 ? "Add: Net Profit" : "Less: Net Loss"}
                          </td>
                          <td className={`px-4 py-2 text-right ${netProfitLoss < 0 ? "text-red-600" : ""}`}>
                            {Math.abs(netProfitLoss).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      <tr className={`${colors.total} font-bold`}>
                        <td className="px-4 py-2" colSpan={2}>
                          Total {type}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {displayTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-blue-300">
          <h3 className="text-xl font-bold mb-4">Balance Sheet Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded">
              <p className="text-gray-600 text-sm">Total Assets</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹ {totalAssets.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-gray-600 text-sm">
                Total Liabilities & Equity
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹ {totalLiabilitiesAndEquity.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-4 rounded border-2 border-green-400">
              <p className="text-gray-600 text-sm">Balance Sheet Status</p>
              <p
                className={`text-2xl font-bold ${
                  isBalanced ? "text-green-600" : "text-red-600"
                }`}
              >
                {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingBalances;
