import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { accountingApi } from "@/lib/api/accounting";
import { Card } from "@/components/ui/card";

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface BSRow {
  label: string;
  amount: number | null;
  isHeader?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
}

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

interface Voucher {
  _id: string;
  debitLedger: string | { _id: string };
  creditLedger: string | { _id: string };
  amount: number;
}

const BalanceSheet = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data, isLoading } = useQuery({
    queryKey: ["balanceSheet"],
    queryFn: () => accountingApi.getBalanceSheet(adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const { data: ledgersData } = useQuery({
    queryKey: ["ledgers"],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const { data: vouchersData } = useQuery({
    queryKey: ["vouchers"],
    queryFn: () => accountingApi.getVouchers({}, adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const isLoadingData = isLoading || !ledgersData || !vouchersData;

  if (isLoadingData) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">
          Loading balance sheet...
        </div>
      </Card>
    );
  }

  const balanceSheet = data?.data;
  if (!balanceSheet) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">No data available</div>
      </Card>
    );
  }

  const ledgers: Ledger[] = ledgersData?.data || [];
  const vouchers: Voucher[] = vouchersData?.data || [];

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

  /* ------------------ DATA PREP ------------------ */

  const liabilityRows: BSRow[] = [];
  const assetRows: BSRow[] = [];

  const equityLedgers = ledgers.filter((l) => l.type === "Equity");

  // Aggregate liabilities by sub-type and category
  const liabilityLedgers = ledgers.filter((l) => l.type === "Liability");
  const liabilitySubTypes: Record<string, number> = {};
  const liabilityCategories: Array<{ subType: string; category: string; total: number }> = [];

  liabilityLedgers.forEach((ledger) => {
    const balance = ledger.balance || ledger.closingBalance || 0;
    if (!liabilitySubTypes[ledger.subType]) {
      liabilitySubTypes[ledger.subType] = 0;
    }
    liabilitySubTypes[ledger.subType] += balance;

    const existingCategory = liabilityCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existingCategory) {
      existingCategory.total += balance;
    } else {
      liabilityCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  });

  // Aggregate assets by sub-type and category
  const assetLedgers = ledgers.filter((l) => l.type === "Asset");
  const assetSubTypes: Record<string, number> = {};
  const assetCategories: Array<{ subType: string; category: string; total: number }> = [];

  assetLedgers.forEach((ledger) => {
    // For "Stock in Hand", use closingBalance if available to match profit calculation
    const isStockInHand = ledger.category === "Stock in Hand";
    const balance = isStockInHand && ledger.closingBalance !== undefined
      ? ledger.closingBalance
      : (ledger.balance || ledger.closingBalance || 0);
    if (!assetSubTypes[ledger.subType]) {
      assetSubTypes[ledger.subType] = 0;
    }
    assetSubTypes[ledger.subType] += balance;

    const existingCategory = assetCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existingCategory) {
      existingCategory.total += balance;
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
    // Add CAPITAL header once
    liabilityRows.push({
      label: "CAPITAL",
      amount: null,
      isHeader: true,
    });

    // Process each capital account: opening balance and movements
    equityLedgers.forEach((ledger) => {
      // Calculate capital movements (additions and deletions) from vouchers
      const ledgerId = ledger._id;
      const capitalAdditions = vouchers
        .filter((v) => {
          const creditId = typeof v.creditLedger === "string" ? v.creditLedger : v.creditLedger._id;
          return creditId === ledgerId;
        })
        .reduce((sum, v) => sum + v.amount, 0);

      const capitalDeletions = vouchers
        .filter((v) => {
          const debitId = typeof v.debitLedger === "string" ? v.debitLedger : v.debitLedger._id;
          return debitId === ledgerId;
        })
        .reduce((sum, v) => sum + v.amount, 0);

      // Add opening balance
      liabilityRows.push({
        label: `${ledger.name} - Opening Balance`,
        amount: ledger.openingBalance || 0,
      });

      // Add capital movements row if there are additions or deletions
      if (capitalAdditions > 0 || capitalDeletions > 0) {
        const netMovement = capitalAdditions - capitalDeletions;
        if (netMovement !== 0) {
    liabilityRows.push({
            label: `${ledger.name} - ${netMovement > 0 ? "Add: Capital Introduced" : "Less: Capital Withdrawn"}`,
            amount: Math.abs(netMovement),
    });
        } else {
          // Show both if they exist and net to zero
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

    // Add profit/loss once at the end (after all capital accounts)
    if (netProfitLoss !== 0) {
      liabilityRows.push({
        label: netProfitLoss > 0 ? "Add: Profit" : "Less: Loss",
        amount: Math.abs(netProfitLoss),
        isProfit: netProfitLoss > 0, // true for profit (green), false for loss (red)
      });
    }

    // Calculate total capital: sum of all capital balances + profit/loss
    const totalCapital = equityLedgers.reduce((sum, ledger) => {
      const balance = ledger.balance || ledger.closingBalance || 0;
      return sum + balance;
    }, 0) + netProfitLoss;

    liabilityRows.push({
      label: "Total Capital",
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
      liabilityRows.push({
          label: c.category,
          amount: c.total,
      });
    });

    liabilityRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  });

  /* ------------------ ASSETS ------------------ */

  // Sort asset sub-types: Fixed Assets first, then Current Assets, then others
  const assetSubTypeOrder = ["Fixed Assets", "Current Assets"];
  const sortedAssetSubTypes = Object.entries(assetSubTypes).sort(([subTypeA], [subTypeB]) => {
    const indexA = assetSubTypeOrder.indexOf(subTypeA);
    const indexB = assetSubTypeOrder.indexOf(subTypeB);

    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only A is in the order array, it comes first
    if (indexA !== -1) return -1;
    // If only B is in the order array, it comes first
    if (indexB !== -1) return 1;
    // If neither is in the order array, maintain original order
    return 0;
    });

  sortedAssetSubTypes.forEach(([subType, total]) => {
    assetRows.push({
      label: subType.toUpperCase(),
      amount: null,
      isHeader: true,
    });

    assetCategories
      .filter((c) => c.subType === subType)
      .forEach((c) => {
      assetRows.push({
          label: c.category,
          amount: c.total,
      });
    });

    assetRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  });

  /* ------------------ ROW ALIGNMENT ------------------ */

  const maxRows = Math.max(liabilityRows.length, assetRows.length);

  // Calculate totals
  const totalEquity = equityLedgers.reduce((sum, ledger) => {
    const balance = ledger.balance || ledger.closingBalance || 0;
    return sum + balance;
  }, 0);

  const totalLiabilities = Object.values(liabilitySubTypes).reduce((sum, total) => sum + total, 0);
  const totalAssets = Object.values(assetSubTypes).reduce((sum, total) => sum + total, 0);

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfitLoss;
  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  /* ------------------ RENDER ------------------ */
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 border-b-2 border-gray-300 pb-3">
          Balance Sheet
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="px-3 py-2 text-left">Liabilities</th>
                <th className="px-3 py-2 text-right border-l border-dashed border-gray-400">
                  Amount
                </th>
                <th className="px-3 py-2 text-left">Assets</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: maxRows }).map((_, i) => {
                const L = liabilityRows[i];
                const A = assetRows[i];

                return (
                  <tr key={i} className="border-b border-gray-200">
                    {/* LIABILITY */}
                    <td
                      className={`px-3 py-1 ${
                        L?.isHeader ? "font-semibold" : ""
                      }`}
                    >
                      {L?.label || ""}
                    </td>

                    <td
                      className={`px-3 py-1 text-right border-l border-dashed border-gray-400 ${
                        L?.isTotal ? "font-semibold" : ""
                      } ${
                        L?.isProfit !== undefined && L.amount !== null
                          ? L.isProfit
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                          : ""
                      }`}
                    >
                      {L?.amount != null ? formatCurrency(L.amount) : ""}
                    </td>

                    {/* ASSET */}
                    <td
                      className={`px-3 py-1 ${
                        A?.isHeader ? "font-semibold" : ""
                      }`}
                    >
                      {A?.label || ""}
                    </td>

                    <td
                      className={`px-3 py-1 text-right ${
                        A?.isTotal ? "font-semibold" : ""
                      }`}
                    >
                      {A?.amount != null ? formatCurrency(A.amount) : ""}
                    </td>
                  </tr>
                );
              })}

              {/* TOTAL */}
              <tr className="border-t-2 border-gray-800 bg-gray-100 font-bold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right border-l border-dashed border-gray-400">
                  {formatCurrency(totalLiabilitiesAndEquity)}
                </td>
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(totalAssets)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Sheet Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Balance Sheet Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Assets</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(totalAssets)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              Total Liabilities & Equity
            </p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalLiabilitiesAndEquity)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Balance Sheet Status</p>
            <p
              className={`text-xl font-bold ${
                isBalanced ? "text-green-600" : "text-red-600"
              }`}
            >
              {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BalanceSheet;
