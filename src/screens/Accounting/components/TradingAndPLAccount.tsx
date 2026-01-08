import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { accountingApi } from "@/lib/api/accounting";
import { Card } from "@/components/ui/card";

const format = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

interface PnLRow {
  label: string;
  amount: number;
  highlight: boolean;
  isProfit?: boolean;
}

const TradingAndPLAccount = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data: ledgersData, isLoading } = useQuery({
    queryKey: ["ledgers"],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  if (isLoading) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">
          Loading Trading & P&L Account...
        </div>
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

  /* ================= TRADING ================= */

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

  // Aggregate by category
  const incomeCategories: Array<{ subType: string; category: string; total: number }> = [];
  const expenseCategories: Array<{ subType: string; category: string; total: number }> = [];

  incomeLedgers.forEach((ledger) => {
    const balance = ledger.balance || ledger.closingBalance || 0;
    const existingCategory = incomeCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existingCategory) {
      existingCategory.total += balance;
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
    const existingCategory = expenseCategories.find(
      (c) => c.subType === ledger.subType && c.category === ledger.category
    );
    if (existingCategory) {
      existingCategory.total += balance;
    } else {
      expenseCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  });

  // Calculate sales and purchases
  const sales = incomeCategories.filter((i) =>
    i.category.toLowerCase().includes("sale")
  );
  const otherIncome = incomeCategories.filter(
    (i) => !i.category.toLowerCase().includes("sale")
  );

  // Get purchases from Direct Expenses sub-type
  const tradingExpenses = expenseCategories.filter(
    (e) => e.subType === "Direct Expenses" && e.category === "Purchases"
  );

  const nonTradingExpenses = expenseCategories.filter(
    (e) => !(e.subType === "Direct Expenses" && e.category === "Purchases")
  );

  const salesTotal = sales.reduce((s, i) => s + i.total, 0);
  const purchaseTotal = tradingExpenses.reduce((s, e) => s + e.total, 0);

  // Gross Profit/Loss = Sales + Closing Stock - Purchases - Opening Stock
  const grossProfit = salesTotal + closingStock - purchaseTotal - openingStock;

  /* ================= P & L ================= */

  // Calculate Net Profit/Loss = Gross Profit/Gross Loss + Indirect Incomes - Indirect Expenses
  const indirectIncomesTotal = otherIncome.reduce((s, i) => s + i.total, 0);
  const indirectExpensesTotal = nonTradingExpenses.reduce((s, e) => s + e.total, 0);

  // Net Profit/Loss = Gross Profit (or -Gross Loss) + Indirect Incomes - Indirect Expenses
  const netProfitLoss = grossProfit + indirectIncomesTotal - indirectExpensesTotal;

  // Debit Side = Gross Loss (if any) + Indirect Expenses + Net Profit (if any)
  const pnlDebit: PnLRow[] = [
    ...(grossProfit < 0 ? [{
      label: "Gross Loss",
      amount: Math.abs(grossProfit),
      highlight: true,
      isProfit: false,
    }] : []),
    ...nonTradingExpenses.map((e) => ({
      label: e.category,
      amount: e.total,
      highlight: false,
    })),
    ...(netProfitLoss > 0 ? [{
      label: `Net Profit Trfd. to Capital`,
      amount: netProfitLoss,
      highlight: true,
      isProfit: true,
    }] : []),
  ];

  // Credit Side = Gross Profit (if any) + Indirect Incomes + Net Loss (if any)
  const pnlCredit: PnLRow[] = [
    ...(grossProfit > 0 ? [{
      label: "Gross Profit",
      amount: grossProfit,
      highlight: true,
      isProfit: true,
    }] : []),
    ...otherIncome.map((i) => ({
      label: i.category,
      amount: i.total,
      highlight: false,
    })),
    ...(netProfitLoss < 0 ? [{
      label: `Net Loss Trfd. to Capital`,
      amount: Math.abs(netProfitLoss),
      highlight: true,
      isProfit: false,
    }] : []),
  ];

  const maxRows = Math.max(pnlDebit.length, pnlCredit.length);

  // Calculate totals
  const tradingDebitTotal = openingStock + purchaseTotal + (grossProfit > 0 ? grossProfit : 0);
  const tradingCreditTotal = salesTotal + closingStock + (grossProfit < 0 ? Math.abs(grossProfit) : 0);

  const debitTotal = pnlDebit.reduce((s, r) => s + r.amount, 0);
  const creditTotal = pnlCredit.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 border-b-2 border-gray-300 pb-3">
        Trading A/c and Profit & Loss A/c
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left px-3 py-2 w-1/2">Particulars</th>
            <th className="text-right px-3 py-2 w-24 border-l border-dashed">
              Amount
            </th>
            <th className="text-left px-3 py-2 w-1/2">Particulars</th>
            <th className="text-right px-3 py-2 w-24">Amount</th>
          </tr>
        </thead>

        <tbody>
          {/* ================= TRADING ACCOUNT ================= */}
          <tr className="bg-gray-100 border-y-2 border-gray-600">
            <td colSpan={4} className="text-center font-bold py-2">
              Trading Account
            </td>
          </tr>

          {/* Opening Stock - Debit side */}
          {openingStock > 0 && (
            <tr>
              <td className="px-3 py-1">Opening Stock</td>
              <td className="px-3 py-1 text-right border-l border-dashed">
                {format(openingStock)}
              </td>
              <td className="px-3 py-1"></td>
              <td className="px-3 py-1 text-right"></td>
            </tr>
          )}

          {/* Purchases - Debit side */}
          <tr>
            <td className="px-3 py-1">Purchases</td>
            <td className="px-3 py-1 text-right border-l border-dashed">
              {format(purchaseTotal)}
            </td>
            <td className="px-3 py-1">Sales</td>
            <td className="px-3 py-1 text-right">{format(salesTotal)}</td>
          </tr>

          {/* Closing Stock - Credit side */}
          {closingStock > 0 && (
            <tr>
              <td className="px-3 py-1"></td>
              <td className="px-3 py-1 text-right border-l border-dashed"></td>
              <td className="px-3 py-1">Closing Stock</td>
              <td className="px-3 py-1 text-right">{format(closingStock)}</td>
            </tr>
          )}

          {grossProfit >= 0 ? (
            <tr className="border-b">
              <td className="px-3 py-1 font-semibold">Gross Profit</td>
              <td className={`px-3 py-1 text-right border-l border-dashed font-semibold text-green-600`}>
                {format(grossProfit)}
              </td>
              <td className="px-3 py-1"></td>
              <td className="px-3 py-1 text-right"></td>
            </tr>
          ) : (
            <tr className="border-b">
              <td className="px-3 py-1"></td>
              <td className="px-3 py-1 text-right border-l border-dashed"></td>
              <td className="px-3 py-1 font-semibold">Gross Loss</td>
              <td className={`px-3 py-1 text-right font-semibold text-red-600`}>
                {format(Math.abs(grossProfit))}
              </td>
            </tr>
          )}

          <tr className="bg-gray-100 border-t-2 border-gray-600 font-bold">
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right border-l border-dashed">
              {format(tradingDebitTotal)}
            </td>
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right">{format(tradingCreditTotal)}</td>
          </tr>

          {/* ================= P & L ACCOUNT ================= */}
          <tr className="bg-gray-100 border-y-2 border-gray-600">
            <td colSpan={4} className="text-center font-bold py-2">
              Profit & Loss Account
            </td>
          </tr>

          {Array.from({ length: maxRows }).map((_, i) => (
            <tr key={i} className="border-b">
              {/* Debit */}
              <td className="px-3 py-1">{pnlDebit[i]?.label || ""}</td>
              <td
                className={`px-3 py-1 text-right border-l border-dashed ${
                  pnlDebit[i]?.highlight
                    ? pnlDebit[i]?.isProfit
                      ? "font-semibold text-green-600"
                      : "font-semibold text-red-600"
                    : ""
                }`}
              >
                {pnlDebit[i] ? format(pnlDebit[i].amount) : ""}
              </td>

              {/* Credit */}
              <td className="px-3 py-1">{pnlCredit[i]?.label || ""}</td>
              <td
                className={`px-3 py-1 text-right ${
                  pnlCredit[i]?.highlight
                    ? pnlCredit[i]?.isProfit
                      ? "font-semibold text-green-600"
                      : "font-semibold text-red-600"
                    : ""
                }`}
              >
                {pnlCredit[i] ? format(pnlCredit[i].amount) : ""}
              </td>
            </tr>
          ))}

          <tr className="bg-gray-100 border-t-2 border-gray-600 font-bold">
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right border-l border-dashed">
              {format(debitTotal)}
            </td>
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right">{format(creditTotal)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default TradingAndPLAccount;
