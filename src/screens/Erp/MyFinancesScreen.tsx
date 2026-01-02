/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import TopBar from "@/components/common/Topbar/Topbar";
import ColdStorageHeader from "@/components/common/ColdStorageHeader/ColdStorageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  ArrowDownCircle,
  Package,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import FinancesModal from "@/components/modals/FinancesModal";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import toast from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import ProfitLossReportPDF from "@/components/pdf/ProfitLossReportPDF";

type PaymentType = "CREDIT" | "DEBIT" | "SHED";

const MyFinancesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminInfo = useSelector(
    (state: RootState) => state.auth.adminInfo
  ) as StoreAdmin | null;
  const [isFinancesModalOpen, setIsFinancesModalOpen] = useState(false);
  const [initialPaymentType, setInitialPaymentType] =
    useState<PaymentType>("CREDIT");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch finances using React Query
  const {
    data: financesResponse,
    isLoading: isLoadingFinances,
    error: financesError,
    refetch: refetchFinances,
  } = useQuery({
    queryKey: ["myFinances", adminInfo?.token],
    queryFn: async () => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      const response = await storeAdminApi.getMyFinances(adminInfo.token);
      if (!response.data?.pnlSummary) {
        throw new Error("Invalid data format received");
      }
      return response.data;
    },
    enabled: !!adminInfo?.token,
  });

  const financesData = financesResponse || null;

  const handleAddPayment = () => {
    setInitialPaymentType("DEBIT");
    setIsFinancesModalOpen(true);
  };

  const handleReceivePayment = () => {
    setInitialPaymentType("CREDIT");
    setIsFinancesModalOpen(true);
  };

  const handleViewStock = () => {
    // Navigate to analytics page to view stock
    navigate("/erp/analytics");
  };

  const handleGeneratePDF = useCallback(async () => {
    if (!adminInfo || !financesData?.pnlSummary) {
      toast.error("No data available to generate report");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Give React time to render the loading state before starting heavy work
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100);
        });
      });

      // Map adminInfo to the format expected by ProfitLossReportPDF
      const pdfAdminInfo = {
        coldStorageName: adminInfo.coldStorageDetails?.coldStorageName,
        coldStorageAddress: adminInfo.coldStorageDetails?.coldStorageAddress,
        coldStorageContactNumber: adminInfo.coldStorageDetails?.coldStorageContactNumber,
      };

      const pdfDoc = (
        <ProfitLossReportPDF
          adminInfo={pdfAdminInfo}
          pnlSummary={financesData.pnlSummary}
        />
      );

      // Generate PDF with timeout for safety
      const pdfBlob = await Promise.race([
        pdf(pdfDoc).toBlob(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
        ),
      ]);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const fileName = `Finances_Report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Try to open in new window, fallback to download
      const newWindow = window.open(pdfUrl, "_blank");

      if (newWindow) {
        toast.success("Report opened in new tab");
        // Revoke URL after reasonable delay
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 10000);
      } else {
        // Fallback: download the file
        const downloadLink = document.createElement("a");
        downloadLink.href = pdfUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast.success("PDF downloaded successfully");
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 2000);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMsg =
        error instanceof Error && error.message.includes("timeout")
          ? "PDF generation took too long. Please try again."
          : "Failed to generate PDF. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [adminInfo, financesData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      LABOUR: "Labour",
      ELECTRICITY: "Electricity",
      TRANSPORT: "Transport",
      SALARY: "Salary",
      FESTIVAL: "Festival",
      OTHER: "Other",
    };
    return labels[category] || category;
  };

  const actionButtons = (
    <>
      <Button
        onClick={handleAddPayment}
        className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">{t("myFinances.addExpense")}</span>
        <span className="sm:hidden">{t("myFinances.addExpense")}</span>
      </Button>
      <Button
        onClick={handleReceivePayment}
        variant="outline"
        className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <ArrowDownCircle className="mr-2 h-4 w-4 text-primary" />
        <span className="hidden sm:inline">
          {t("myFinances.receivePayment")}
        </span>
        <span className="sm:hidden">{t("myFinances.receivePayment")}</span>
      </Button>
      <Button
        onClick={handleViewStock}
        variant="outline"
        className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <Package className="mr-2 h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{t("myFinances.viewStock")}</span>
        <span className="sm:hidden">{t("myFinances.viewStock")}</span>
      </Button>
      {!isLoadingFinances && financesData?.pnlSummary && (
        <Button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          variant="outline"
          className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </>
          )}
        </Button>
      )}
    </>
  );

  // Create payment history mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: {
      farmerId?: string;
      farmerName?: string;
      amount: number;
      remarks: string;
      date: string;
      paymentType: PaymentType;
      coldStorageId?: string;
      category?:
        | "LABOUR"
        | "ELECTRICITY"
        | "TRANSPORT"
        | "SALARY"
        | "FESTIVAL"
        | "OTHER";
    }) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      const payload = {
        amount: data.amount,
        date: data.date,
        farmerId: data.farmerId,
        farmerName: data.farmerName,
        remarks: data.remarks || "",
        paymentType: data.paymentType,
        coldStorageId: data.coldStorageId || adminInfo?._id || "",
        category: data.category,
      };
      return storeAdminApi.createPaymentHistory(payload, adminInfo.token);
    },
    onSuccess: () => {
      toast.success("Payment history entry created successfully");
      setIsFinancesModalOpen(false);
      // Invalidate and refetch finances data
      queryClient.invalidateQueries({ queryKey: ["myFinances"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to create payment history entry"
      );
    },
  });

  const handleFinancesSubmit = async (data: {
    farmerId?: string;
    farmerName?: string;
    amount: number;
    remarks: string;
    date: string;
    paymentType: PaymentType;
    coldStorageId?: string;
    category?:
      | "LABOUR"
      | "ELECTRICITY"
      | "TRANSPORT"
      | "SALARY"
      | "FESTIVAL"
      | "OTHER";
  }) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <>
      <TopBar
        title={t("myFinances.title")}
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
      />

      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Cold Storage Header with Action Buttons */}
        <ColdStorageHeader
          adminInfo={adminInfo}
          actionButtons={actionButtons}
        />

        {/* Summary Cards */}
        {!isLoadingFinances && financesData?.pnlSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Net Income Card */}
            <Card className="shadow-sm border border-gray-200/50">
              <CardHeader className="pb-2 px-3 sm:px-4 py-2.5 sm:py-3">
                <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-green-600/80" />
                  <span>Net Income</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-base sm:text-lg font-semibold text-green-600">
                  {formatCurrency(financesData.pnlSummary.income.total)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {financesData.pnlSummary.income.farmers.length}{" "}
                  {financesData.pnlSummary.income.farmers.length === 1
                    ? "farmer"
                    : "farmers"}
                </div>
              </CardContent>
            </Card>

            {/* Net Expenses Card */}
            <Card className="shadow-sm border border-gray-200/50">
              <CardHeader className="pb-2 px-3 sm:px-4 py-2.5 sm:py-3">
                <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <ArrowDownRight className="h-3 w-3 text-red-600/80" />
                  <span>Net Expenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="text-base sm:text-lg font-semibold text-red-600">
                  {formatCurrency(financesData.pnlSummary.expenses.total)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {financesData.pnlSummary.expenses.byCategory.length}{" "}
                  {financesData.pnlSummary.expenses.byCategory.length === 1
                    ? "category"
                    : "categories"}
                </div>
              </CardContent>
            </Card>

            {/* Net Profit/Loss Card */}
            <Card className="shadow-sm border border-gray-200/50">
              <CardHeader className="pb-2 px-3 sm:px-4 py-2.5 sm:py-3">
                <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  {financesData.pnlSummary.netProfitOrLoss >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600/80" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600/80" />
                  )}
                  <span>
                    Net{" "}
                    {financesData.pnlSummary.netProfitOrLoss >= 0
                      ? "Profit"
                      : "Loss"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div
                  className={`text-base sm:text-lg font-semibold ${
                    financesData.pnlSummary.netProfitOrLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(financesData.pnlSummary.netProfitOrLoss)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Income - Expenses
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoadingFinances && (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {financesError && !isLoadingFinances && (
          <Card>
            <CardContent className="py-6 sm:py-8 px-4 sm:px-6 text-center">
              <p className="text-sm sm:text-base text-red-600 mb-4">
                {financesError instanceof Error
                  ? financesError.message
                  : "Failed to load finances data"}
              </p>
              <Button
                onClick={() => refetchFinances()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profit & Loss Statement */}
        {!isLoadingFinances && financesData?.pnlSummary && (
          <div className="space-y-3 sm:space-y-4">
            {/* P&L Summary Card */}
            <Card className="shadow-sm border border-gray-200/50 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
                    <div className="p-1.5 bg-primary/5 rounded-md">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <span>Profit & Loss Statement</span>
                  </CardTitle>
                  <Button
                    onClick={() => refetchFinances()}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <div className="divide-y divide-gray-100">
                  {/* Income Section */}
                  <div className="p-4 sm:p-5 bg-green-50/30">
                    <div className="flex items-center gap-2 mb-4 sm:mb-5">
                      <div className="p-1.5 bg-green-100/70 rounded-md">
                        <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600/80" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                        Income
                      </h3>
                    </div>

                    {/* Farmers Income List */}
                    <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
                      {financesData.pnlSummary.income.farmers.map((farmer) => {
                        // Calculate: Total Income = Rent + Shed
                        const totalIncome =
                          farmer.rentIncome + farmer.shed.total;
                        // Calculate: Standing Amount = Rent + Shed - Credit
                        const standingAmount =
                          farmer.rentIncome +
                          farmer.shed.total -
                          farmer.credit.total;

                        return (
                          <div
                            key={farmer.farmerId}
                            className="bg-white rounded-lg p-3 sm:p-4 border border-green-100/60 shadow-sm hover:shadow hover:border-green-200/60 transition-all duration-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                    {farmer.name}
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-2.5 flex flex-wrap items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-gray-50 rounded text-gray-600 text-xs">
                                    ID: {farmer.farmerId}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate max-w-[200px] sm:max-w-none">
                                    {farmer.address}
                                  </span>
                                </p>
                                <div className="space-y-1.5 mt-2">
                                  <div className="flex items-center justify-between py-1 px-2 bg-green-50/50 rounded text-xs">
                                    <span className="text-gray-600 pr-2">
                                      Rent ({farmer.stock.totalBags} ×{" "}
                                      {formatCurrency(farmer.stock.costPerBag)})
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-green-700 whitespace-nowrap">
                                      {formatCurrency(farmer.rentIncome)}
                                    </span>
                                  </div>
                                  {farmer.shed.total > 0 && (
                                    <div className="flex items-center justify-between py-1 px-2 bg-green-50/30 rounded text-xs">
                                      <span className="text-gray-600">
                                        Shed
                                      </span>
                                      <span className="text-xs font-medium text-green-600 whitespace-nowrap">
                                        +{formatCurrency(farmer.shed.total)}
                                      </span>
                                    </div>
                                  )}
                                  {farmer.credit.total > 0 && (
                                    <div className="flex items-center justify-between py-1 px-2 bg-red-50/30 rounded text-xs">
                                      <span className="text-gray-600">
                                        Payments Made
                                      </span>
                                      <span className="text-xs font-medium text-red-600 whitespace-nowrap">
                                        -{formatCurrency(farmer.credit.total)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between py-1.5 px-2 bg-blue-50/50 rounded text-xs border-t border-gray-100 mt-1.5 pt-1.5">
                                    <span className="text-gray-700 font-medium">
                                      Standing Amount
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-blue-700 whitespace-nowrap">
                                      {formatCurrency(standingAmount)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="sm:ml-3 text-left sm:text-right flex-shrink-0">
                                <div className="inline-flex flex-col items-start sm:items-end p-2 sm:p-2.5 bg-green-500/90 rounded-md">
                                  <div className="text-sm sm:text-base font-semibold text-white">
                                    {formatCurrency(totalIncome)}
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-green-50 mt-0.5">
                                    Total
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Income */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-green-200/50 bg-green-50/20 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500/70 rounded-full"></div>
                        Total Income
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-green-600">
                        {formatCurrency(financesData.pnlSummary.income.total)}
                      </span>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div className="p-4 sm:p-5 bg-red-50/30">
                    <div className="flex items-center gap-2 mb-4 sm:mb-5">
                      <div className="p-1.5 bg-red-100/70 rounded-md">
                        <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600/80" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                        Expenses
                      </h3>
                    </div>

                    {financesData.pnlSummary.expenses.byCategory.length ===
                    0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gray-100/50 rounded-full flex items-center justify-center mb-3">
                          <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium">
                          No expenses recorded
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
                        {financesData.pnlSummary.expenses.byCategory.map(
                          (category) => (
                            <div
                              key={category.category}
                              className="bg-white rounded-lg p-3 sm:p-4 border border-red-100/60 shadow-sm hover:shadow hover:border-red-200/60 transition-all duration-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <h4 className="text-sm sm:text-base font-medium text-gray-900">
                                      {getCategoryLabel(category.category)}
                                    </h4>
                                    <span className="px-1.5 py-0.5 bg-red-100/70 text-red-700 text-[10px] sm:text-xs font-medium rounded">
                                      {category.list.length}{" "}
                                      {category.list.length === 1
                                        ? "entry"
                                        : "entries"}
                                    </span>
                                  </div>
                                </div>
                                <div className="inline-flex items-center px-2 sm:px-2.5 py-1.5 bg-red-500/90 rounded-md">
                                  <span className="text-sm sm:text-base font-semibold text-white">
                                    {formatCurrency(category.total)}
                                  </span>
                                </div>
                              </div>
                              {/* Expense Items List */}
                              {category.list.length > 0 && (
                                <div className="space-y-1.5 mt-3 pt-3 border-t border-red-100/50">
                                  {category.list.map((expense) => (
                                    <div
                                      key={expense._id}
                                      className="flex items-start justify-between py-1.5 px-2 bg-red-50/30 rounded hover:bg-red-50/50 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <div className="font-medium text-xs sm:text-sm text-gray-900">
                                            {formatCurrency(expense.amount)}
                                          </div>
                                        </div>
                                        {expense.remarks && (
                                          <div className="text-xs text-gray-600 mt-0.5 truncate">
                                            {expense.remarks}
                                          </div>
                                        )}
                                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                          {new Date(
                                            expense.date
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Total Expenses */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-red-200/50 bg-red-50/20 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500/70 rounded-full"></div>
                        Total Expenses
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-red-600">
                        {formatCurrency(financesData.pnlSummary.expenses.total)}
                      </span>
                    </div>
                  </div>

                  {/* Net Profit/Loss */}
                  <div
                    className={`p-4 sm:p-5 ${
                      financesData.pnlSummary.netProfitOrLoss >= 0
                        ? "bg-green-50/40"
                        : "bg-red-50/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            financesData.pnlSummary.netProfitOrLoss >= 0
                              ? "bg-green-100/70"
                              : "bg-red-100/70"
                          }`}
                        >
                          {financesData.pnlSummary.netProfitOrLoss >= 0 ? (
                            <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-green-600/80" />
                          ) : (
                            <TrendingDown className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-red-600/80" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide mb-0.5">
                            Net{" "}
                            {financesData.pnlSummary.netProfitOrLoss >= 0
                              ? "Profit"
                              : "Loss"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Income - Expenses
                          </div>
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg ${
                          financesData.pnlSummary.netProfitOrLoss >= 0
                            ? "bg-green-500/90"
                            : "bg-red-500/90"
                        }`}
                      >
                        <span className="text-base sm:text-lg font-semibold text-white">
                          {formatCurrency(
                            financesData.pnlSummary.netProfitOrLoss
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Finances Modal */}
      <FinancesModal
        isOpen={isFinancesModalOpen}
        onClose={() => setIsFinancesModalOpen(false)}
        onSubmit={handleFinancesSubmit}
        isLoading={createPaymentMutation.isPending}
        token={adminInfo?.token || ""}
        coldStorageId={adminInfo?._id || ""}
        initialPaymentType={initialPaymentType}
        currentUserId={adminInfo?._id}
      />
    </>
  );
};

export default MyFinancesScreen;
