import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { Card } from "@/components/ui/card";

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface PnLRow {
  label: string;
  amount: number | null;
  highlight?: boolean;
  isProfit?: boolean;
}

const TradingAndPLAccount = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data, isLoading } = useQuery({
    queryKey: ["tradingAndPL"],
    queryFn: () => storeAdminApi.getTradingAndPL(adminInfo?.token || ""),
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

  const tradingPL = data?.data;
  if (!tradingPL) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">No data available</div>
      </Card>
    );
  }

  const { tradingAccount, profitAndLoss } = tradingPL;

  /* ------------------ P&L DATA PREP ------------------ */
  const pnlDebit: PnLRow[] = [];
  const pnlCredit: PnLRow[] = [];

  // Debit Side: Indirect Expenses + Net Profit (if any)
  if (profitAndLoss.indirectExpenses.breakdown) {
    profitAndLoss.indirectExpenses.breakdown.forEach((item: any) => {
      pnlDebit.push({
        label: item.name,
        amount: item.balance,
        highlight: false,
      });
    });
  }

  if (profitAndLoss.netProfit && profitAndLoss.netProfit > 0) {
    pnlDebit.push({
      label: "Net Profit Trfd. to Capital",
      amount: profitAndLoss.netProfit,
      highlight: true,
      isProfit: true,
    });
  }

  // Credit Side: Gross Profit + Indirect Income + Net Loss (if any)
  pnlCredit.push({
    label: "Gross Profit",
    amount: profitAndLoss.grossProfit,
    highlight: true,
    isProfit: profitAndLoss.grossProfit > 0,
  });

  if (profitAndLoss.indirectIncome.breakdown) {
    profitAndLoss.indirectIncome.breakdown.forEach((item: any) => {
      pnlCredit.push({
        label: item.name,
        amount: item.balance,
        highlight: false,
      });
    });
  }

  if (profitAndLoss.netProfit && profitAndLoss.netProfit < 0) {
    pnlCredit.push({
      label: "Net Loss Trfd. to Capital",
      amount: Math.abs(profitAndLoss.netProfit),
      highlight: true,
      isProfit: false,
    });
  }

  const maxRows = Math.max(pnlDebit.length, pnlCredit.length);

  // Calculate totals
  const tradingDebitTotal =
    tradingAccount.openingStock +
    tradingAccount.purchases +
    (tradingAccount.grossProfit > 0 ? tradingAccount.grossProfit : 0);

  const tradingCreditTotal =
    tradingAccount.sales +
    tradingAccount.closingStock +
    (tradingAccount.grossProfit < 0 ? Math.abs(tradingAccount.grossProfit) : 0);

  const pnlDebitTotal = pnlDebit.reduce(
    (sum, row) => sum + (row.amount || 0),
    0
  );
  const pnlCreditTotal = pnlCredit.reduce(
    (sum, row) => sum + (row.amount || 0),
    0
  );

  /* ------------------ RENDER ------------------ */
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Trading A/c and Profit & Loss A/c
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Particulars
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 border-l-2 border-dashed border-gray-400">
                Amount
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Particulars
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ================= TRADING ACCOUNT ================= */}
            <tr className="bg-white border-t-2 border-b-2 border-gray-900">
              <td
                colSpan={4}
                className="text-center font-bold py-3 text-gray-900"
              >
                Trading Account
              </td>
            </tr>

            {/* Opening Stock - Debit side */}
            {tradingAccount.openingStock > 0 && (
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2.5 text-gray-900">Opening Stock</td>
                <td className="px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400 text-gray-900">
                  {formatCurrency(tradingAccount.openingStock)}
                </td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right"></td>
              </tr>
            )}

            {/* Purchases - Debit side, Sales - Credit side */}
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2.5 text-gray-900">Purchases</td>
              <td className="px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400 text-gray-900">
                {formatCurrency(tradingAccount.purchases)}
              </td>
              <td className="px-4 py-2.5 text-gray-900">Sales</td>
              <td className="px-4 py-2.5 text-right text-gray-900">
                {formatCurrency(tradingAccount.sales)}
              </td>
            </tr>

            {/* Closing Stock - Credit side */}
            {tradingAccount.closingStock > 0 && (
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400"></td>
                <td className="px-4 py-2.5 text-gray-900">Closing Stock</td>
                <td className="px-4 py-2.5 text-right text-gray-900">
                  {formatCurrency(tradingAccount.closingStock)}
                </td>
              </tr>
            )}

            {/* Gross Profit/Loss */}
            {tradingAccount.grossProfit >= 0 ? (
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2.5 font-semibold text-gray-900">
                  Gross Profit
                </td>
                <td className="px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400 font-semibold text-green-600">
                  {formatCurrency(tradingAccount.grossProfit)}
                </td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right"></td>
              </tr>
            ) : (
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400"></td>
                <td className="px-4 py-2.5 font-semibold text-gray-900">
                  Gross Loss
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-red-600">
                  {formatCurrency(Math.abs(tradingAccount.grossProfit))}
                </td>
              </tr>
            )}

            {/* Trading Account Total */}
            <tr className="border-t-2 border-b-2 border-gray-900 bg-white">
              <td className="px-4 py-3 font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-right border-l-2 border-dashed border-gray-400 font-bold text-gray-900">
                {formatCurrency(tradingDebitTotal)}
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {formatCurrency(tradingCreditTotal)}
              </td>
            </tr>

            {/* ================= P & L ACCOUNT ================= */}
            <tr className="bg-white border-t-2 border-b-2 border-gray-900">
              <td
                colSpan={4}
                className="text-center font-bold py-3 text-gray-900"
              >
                Profit & Loss Account
              </td>
            </tr>

            {Array.from({ length: maxRows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-300">
                {/* Debit Side */}
                <td className="px-4 py-2.5 text-gray-900">
                  {pnlDebit[i]?.label || ""}
                </td>
                <td
                  className={`px-4 py-2.5 text-right border-l-2 border-dashed border-gray-400 ${
                    pnlDebit[i]?.highlight
                      ? pnlDebit[i]?.isProfit
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {pnlDebit[i]?.amount != null
                    ? formatCurrency(pnlDebit[i].amount)
                    : ""}
                </td>

                {/* Credit Side */}
                <td className="px-4 py-2.5 text-gray-900">
                  {pnlCredit[i]?.label || ""}
                </td>
                <td
                  className={`px-4 py-2.5 text-right ${
                    pnlCredit[i]?.highlight
                      ? pnlCredit[i]?.isProfit
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {pnlCredit[i]?.amount != null
                    ? formatCurrency(pnlCredit[i].amount)
                    : ""}
                </td>
              </tr>
            ))}

            {/* P&L Account Total */}
            <tr className="border-t-2 border-b-2 border-gray-900 bg-white">
              <td className="px-4 py-3 font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-right border-l-2 border-dashed border-gray-400 font-bold text-gray-900">
                {formatCurrency(pnlDebitTotal)}
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {formatCurrency(pnlCreditTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingAndPLAccount;
