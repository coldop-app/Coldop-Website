/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, FileText, Receipt, BarChart3, Calculator, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleDatePicker } from '@/components/ui/simple-date-picker';
import TopBar from '@/components/common/Topbar/Topbar';
import LedgerForm from './components/LedgerForm';
import LedgerList from './components/LedgerList';
import LedgerView from './components/LedgerView';
import VoucherForm from './components/VoucherForm';
import VoucherList from './components/VoucherList';
import BalanceSheet from './components/BalanceSheet';
import TradingAndPLAccount from './components/TradingAndPLAccount';
import ClosingBalances from './components/ClosingBalances';

interface DateRange {
  from: string | null;
  to: string | null;
}

const MyFinancesScreen = () => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({ from: null, to: null });

  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent<string>) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('switchTab' as any, handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switchTab' as any, handleSwitchTab as EventListener);
    };
  }, []);

  const formatDateForAPI = (date: Date | undefined): string | null => {
    if (!date) return null;
    // Format as ISO string with time set to start/end of day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleApplyFilters = () => {
    const from = formatDateForAPI(fromDate);
    const to = formatDateForAPI(toDate);

    // If to date is provided, set time to end of day (23:59:59)
    let toWithTime = null;
    if (to && toDate) {
      toWithTime = `${to}T23:59:59Z`;
    }

    // If from date is provided, set time to start of day (00:00:00)
    let fromWithTime = null;
    if (from && fromDate) {
      fromWithTime = `${from}T00:00:00Z`;
    }

    setAppliedDateRange({
      from: fromWithTime,
      to: toWithTime,
    });
  };

  const handleClearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedDateRange({ from: null, to: null });
  };

  return (
    <>
      <TopBar title="My Finances" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Date Range Filter */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Date Range Filter</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  From Date
                </label>
                <SimpleDatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder="DD.MM.YYYY"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  To Date
                </label>
                <SimpleDatePicker
                  value={toDate}
                  onChange={setToDate}
                  placeholder="DD.MM.YYYY"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto sm:flex-shrink-0"
                variant="default"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                className="w-full sm:w-auto sm:flex-shrink-0"
                variant="outline"
              >
                Clear
              </Button>
              {(appliedDateRange.from || appliedDateRange.to) && (
                <div className="text-xs sm:text-sm text-gray-600 flex-1 sm:flex-none sm:ml-auto pt-2 sm:pt-0">
                  <div className="font-medium mb-1">Active Filters:</div>
                  <div className="text-xs space-y-0.5">
                    {appliedDateRange.from && (
                      <div>From: {new Date(appliedDateRange.from).toLocaleDateString()}</div>
                    )}
                    {appliedDateRange.to && (
                      <div>To: {new Date(appliedDateRange.to).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 mb-4 sm:mb-6">
            <TabsList className="inline-flex w-full sm:grid sm:grid-cols-5 mb-0 bg-gray-50 rounded-lg p-1 min-w-max sm:min-w-0">
              <TabsTrigger
                value="vouchers"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Vouchers</span>
              </TabsTrigger>
              <TabsTrigger
                value="ledgers"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Ledgers</span>
              </TabsTrigger>
              <TabsTrigger
                value="ledger-view"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Ledger View</span>
              </TabsTrigger>
              <TabsTrigger
                value="financial-statements"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden md:inline">Financial Statements</span>
                <span className="hidden sm:inline md:hidden">Statements</span>
              </TabsTrigger>
              <TabsTrigger
                value="closing-balances"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden md:inline">Closing Balances</span>
                <span className="hidden sm:inline md:hidden">Balances</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="vouchers" className="space-y-6">
            <VoucherForm />
            <VoucherList dateRange={appliedDateRange} />
          </TabsContent>

          <TabsContent value="ledgers" className="space-y-6">
            <LedgerForm />
            <LedgerList dateRange={appliedDateRange} />
          </TabsContent>

          <TabsContent value="ledger-view">
            <LedgerView dateRange={appliedDateRange} />
          </TabsContent>

          <TabsContent value="financial-statements" className="space-y-6">
            <BalanceSheet dateRange={appliedDateRange} />
            <TradingAndPLAccount dateRange={appliedDateRange} />
          </TabsContent>

          <TabsContent value="closing-balances">
            <ClosingBalances dateRange={appliedDateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MyFinancesScreen;
