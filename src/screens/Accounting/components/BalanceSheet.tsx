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

interface BSRow {
  label: string;
  amount: number | null;
  isHeader?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
}

const BalanceSheet = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data, isLoading } = useQuery({
    queryKey: ["balanceSheet"],
    queryFn: () => storeAdminApi.getBalanceSheet(adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  if (isLoading) {
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

  const { assets, liabilitiesAndEquity } = balanceSheet;

  /* ------------------ DATA PREP ------------------ */
  const liabilityRows: BSRow[] = [];
  const assetRows: BSRow[] = [];

  /* ------------------ CAPITAL ------------------ */
  liabilityRows.push({
    label: "CAPITAL",
    amount: null,
    isHeader: true,
  });

  const openingCapital =
    liabilitiesAndEquity.equity.total - (liabilitiesAndEquity.netProfit || 0);

  liabilityRows.push({
    label: "Capital - Opening Balance",
    amount: openingCapital,
  });

  if (liabilitiesAndEquity.netProfit && liabilitiesAndEquity.netProfit !== 0) {
    liabilityRows.push({
      label: liabilitiesAndEquity.netProfit > 0 ? "Add: Profit" : "Less: Loss",
      amount: Math.abs(liabilitiesAndEquity.netProfit),
      isProfit: liabilitiesAndEquity.netProfit > 0,
    });
  }

  liabilityRows.push({
    label: "Capital",
    amount: liabilitiesAndEquity.equity.total,
    isTotal: true,
  });

  /* ------------------ CURRENT LIABILITIES ------------------ */
  if (liabilitiesAndEquity.currentLiabilities.breakdown.length > 0) {
    liabilityRows.push({
      label: "CURRENT LIABILITIES",
      amount: null,
      isHeader: true,
    });

    liabilitiesAndEquity.currentLiabilities.breakdown.forEach((item: any) => {
      liabilityRows.push({
        label: item.name,
        amount: item.balance,
      });
    });

    liabilityRows.push({
      label: "Total Current Liabilities",
      amount: liabilitiesAndEquity.currentLiabilities.total,
      isTotal: true,
    });
  }

  /* ------------------ FIXED ASSETS ------------------ */
  if (assets.fixedAssets.breakdown.length > 0) {
    assetRows.push({
      label: "FIXED ASSETS",
      amount: null,
      isHeader: true,
    });

    assets.fixedAssets.breakdown.forEach((item: any) => {
      assetRows.push({
        label: item.name,
        amount: item.balance,
      });
    });

    assetRows.push({
      label: "Total Fixed Assets",
      amount: assets.fixedAssets.total,
      isTotal: true,
    });
  }

  /* ------------------ CURRENT ASSETS ------------------ */
  if (assets.currentAssets.breakdown.length > 0) {
    assetRows.push({
      label: "CURRENT ASSETS",
      amount: null,
      isHeader: true,
    });

    assets.currentAssets.breakdown.forEach((item: any) => {
      assetRows.push({
        label: item.name,
        amount: item.balance,
      });
    });

    assetRows.push({
      label: "Total Current Assets",
      amount: assets.currentAssets.total,
      isTotal: true,
    });
  }

  /* ------------------ ROW ALIGNMENT ------------------ */
  const maxRows = Math.max(liabilityRows.length, assetRows.length);
  const totalLiabilities = liabilitiesAndEquity.total;
  const totalAssets = assets.total;
  const isBalanced = totalAssets === totalLiabilities;

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
                  {formatCurrency(totalLiabilities)}
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
              {formatCurrency(totalLiabilities)}
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
