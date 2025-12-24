import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { StoreAdmin } from '@/utils/types';
import TopBar from '@/components/common/Topbar/Topbar';
import ColdStorageHeader from '@/components/common/ColdStorageHeader/ColdStorageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowDownCircle, Package, TrendingUp, TrendingDown, Loader2, RefreshCw, Receipt, Users } from 'lucide-react';
import FinancesModal from '@/components/modals/FinancesModal';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import toast from 'react-hot-toast';

type PaymentType = "CREDIT" | "DEBIT";

interface MyFinancesData {
  storeExpenses: Array<{
    _id: string;
    coldStorageId: string;
    farmer: string | null;
    amount: number;
    remarks: string;
    date: string;
    paymentType: PaymentType;
    category: "LABOUR" | "ELECTRICITY" | "TRANSPORT" | "SALARY" | "FESTIVAL" | "OTHER";
    createdAt: string;
    updatedAt: string;
  }>;
  farmerTransactions: Array<{
    _id: string;
    farmer: {
      _id: string;
      farmerId: string;
      name: string;
      address: string;
      mobileNumber: string;
    };
    amount: number;
    amount_left: number;
    remarks: string;
    date: string;
    paymentType: PaymentType;
    category: "LABOUR" | "ELECTRICITY" | "TRANSPORT" | "SALARY" | "FESTIVAL" | "OTHER";
    createdAt: string;
    updatedAt: string;
  }>;
}

const MyFinancesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [isFinancesModalOpen, setIsFinancesModalOpen] = useState(false);
  const [isFinancesLoading, setIsFinancesLoading] = useState(false);
  const [initialPaymentType, setInitialPaymentType] = useState<PaymentType>("CREDIT");
  const [financesData, setFinancesData] = useState<MyFinancesData | null>(null);
  const [isLoadingFinances, setIsLoadingFinances] = useState(true);
  const [financesError, setFinancesError] = useState<string | null>(null);

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
    navigate('/erp/analytics');
  };

  const fetchFinances = async () => {
    if (!adminInfo?.token) return;

    try {
      setIsLoadingFinances(true);
      setFinancesError(null);
      const response = await storeAdminApi.getMyFinances(adminInfo.token);
      setFinancesData(response.data);
    } catch (error: any) {
      setFinancesError(
        error.response?.data?.message || "Failed to load finances data"
      );
      toast.error("Failed to load finances data");
    } finally {
      setIsLoadingFinances(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, [adminInfo?.token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      LABOUR: 'Labour',
      ELECTRICITY: 'Electricity',
      TRANSPORT: 'Transport',
      SALARY: 'Salary',
      FESTIVAL: 'Festival',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  // Calculate totals
  const storeExpensesTotal = financesData?.storeExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  ) || 0;

  const farmerTransactionsTotal = financesData?.farmerTransactions.reduce(
    (sum, transaction) => {
      if (transaction.paymentType === 'CREDIT') {
        return sum + transaction.amount;
      }
      return sum - transaction.amount;
    },
    0
  ) || 0;

  const actionButtons = (
    <>
      <Button
        onClick={handleAddPayment}
        className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">
          {t('myFinances.addPayment')}
        </span>
        <span className="sm:hidden">
          {t('myFinances.addPayment')}
        </span>
      </Button>
      <Button
        onClick={handleReceivePayment}
        variant="outline"
        className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <ArrowDownCircle className="mr-2 h-4 w-4 text-primary" />
        <span className="hidden sm:inline">
          {t('myFinances.receivePayment')}
        </span>
        <span className="sm:hidden">
          {t('myFinances.receivePayment')}
        </span>
      </Button>
      <Button
        onClick={handleViewStock}
        variant="outline"
        className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
      >
        <Package className="mr-2 h-4 w-4 text-primary" />
        <span className="hidden sm:inline">
          {t('myFinances.viewStock')}
        </span>
        <span className="sm:hidden">
          {t('myFinances.viewStock')}
        </span>
      </Button>
    </>
  );

  const handleFinancesSubmit = async (data: {
    farmerId?: string;
    farmerName?: string;
    amount: number;
    remarks: string;
    date: string;
    paymentType: PaymentType;
    coldStorageId?: string;
    category?: "LABOUR" | "ELECTRICITY" | "TRANSPORT" | "SALARY" | "FESTIVAL" | "OTHER";
  }) => {
    try {
      setIsFinancesLoading(true);
      const payload = {
        amount: data.amount,
        date: data.date,
        farmerId: data.farmerId,
        farmerName: data.farmerName,
        remarks: data.remarks || "",
        paymentType: data.paymentType,
      };
      await storeAdminApi.createPaymentHistory(
        payload,
        adminInfo?.token || ""
      );
      toast.success("Payment history entry created successfully");
      setIsFinancesModalOpen(false);
      // Refresh finances data
      await fetchFinances();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create payment history entry"
      );
    } finally {
      setIsFinancesLoading(false);
    }
  };

  return (
    <>
      <TopBar
        title={t('myFinances.title')}
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
      />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Cold Storage Header with Action Buttons */}
        <ColdStorageHeader adminInfo={adminInfo} actionButtons={actionButtons} />

        {/* Summary Cards */}
        {!isLoadingFinances && financesData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Store Expenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(storeExpensesTotal)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {financesData.storeExpenses.length} {financesData.storeExpenses.length === 1 ? 'entry' : 'entries'}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Farmer Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {formatCurrency(Math.abs(farmerTransactionsTotal))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {financesData.farmerTransactions.length} {financesData.farmerTransactions.length === 1 ? 'entry' : 'entries'}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                  {farmerTransactionsTotal >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  )}
                  <span>Net Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div
                  className={`text-xl sm:text-2xl font-bold ${
                    farmerTransactionsTotal - storeExpensesTotal >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(farmerTransactionsTotal - storeExpensesTotal)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Total transactions
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
              <p className="text-sm sm:text-base text-red-600 mb-4">{financesError}</p>
              <Button
                onClick={fetchFinances}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mx-auto touch-manipulation"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Store Expenses Section */}
        {!isLoadingFinances && financesData && (
          <Card>
            <CardHeader className="border-b px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  <span>Store Expenses</span>
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
                    ({financesData.storeExpenses.length})
                  </span>
                </CardTitle>
                <Button
                  onClick={fetchFinances}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {financesData.storeExpenses.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Receipt className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium">No store expenses found</p>
                  <p className="text-xs sm:text-sm mt-1">Add your first expense to get started</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Remarks
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financesData.storeExpenses.map((expense, index) => (
                          <tr
                            key={expense._id}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(expense.date)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {getCategoryLabel(expense.category)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {expense.remarks || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">
                              {formatCurrency(expense.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 border-t">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                            {formatCurrency(storeExpensesTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {financesData.storeExpenses.map((expense) => (
                      <div key={expense._id} className="p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {formatDate(expense.date)}
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {getCategoryLabel(expense.category)}
                            </span>
                          </div>
                          <div className="text-base font-bold text-red-600 ml-2">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                        {expense.remarks && (
                          <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                            {expense.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="p-4 bg-gray-100 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Total:</span>
                        <span className="text-base font-bold text-red-600">
                          {formatCurrency(storeExpensesTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Farmer Transactions Section */}
        {!isLoadingFinances && financesData && (
          <Card>
            <CardHeader className="border-b px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span>Farmer Transactions</span>
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
                    ({financesData.farmerTransactions.length})
                  </span>
                </CardTitle>
                <Button
                  onClick={fetchFinances}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {financesData.farmerTransactions.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium">No farmer transactions found</p>
                  <p className="text-xs sm:text-sm mt-1">Record your first transaction to get started</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Farmer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Remarks
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financesData.farmerTransactions.map((transaction, index) => (
                          <tr
                            key={transaction._id}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {transaction.farmer.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {transaction.farmer.farmerId}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  transaction.paymentType === 'CREDIT'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {transaction.paymentType === 'CREDIT' ? 'Credit' : 'Debit'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {transaction.remarks || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm font-semibold text-right ${
                                transaction.paymentType === 'CREDIT'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.paymentType === 'CREDIT' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                              {formatCurrency(transaction.amount_left)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {financesData.farmerTransactions.map((transaction) => (
                      <div key={transaction._id} className="p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                              {transaction.farmer.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              ID: {transaction.farmer.farmerId} • {formatDate(transaction.date)}
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                transaction.paymentType === 'CREDIT'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.paymentType === 'CREDIT' ? 'Credit' : 'Debit'}
                            </span>
                          </div>
                          <div className="ml-3 text-right flex-shrink-0">
                            <div
                              className={`text-base font-bold ${
                                transaction.paymentType === 'CREDIT'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.paymentType === 'CREDIT' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Bal: {formatCurrency(transaction.amount_left)}
                            </div>
                          </div>
                        </div>
                        {transaction.remarks && (
                          <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                            {transaction.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Finances Modal */}
      <FinancesModal
        isOpen={isFinancesModalOpen}
        onClose={() => setIsFinancesModalOpen(false)}
        onSubmit={handleFinancesSubmit}
        isLoading={isFinancesLoading}
        token={adminInfo?.token || ""}
        coldStorageId={adminInfo?._id || ""}
        initialPaymentType={initialPaymentType}
        currentUserId={adminInfo?._id}
      />
    </>
  );
};

export default MyFinancesScreen;
