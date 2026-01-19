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
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Date Range Filter</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <SimpleDatePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder="DD.MM.YYYY"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <SimpleDatePicker
                value={toDate}
                onChange={setToDate}
                placeholder="DD.MM.YYYY"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto"
                variant="default"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
                variant="outline"
              >
                Clear
              </Button>
            </div>
            {(appliedDateRange.from || appliedDateRange.to) && (
              <div className="text-sm text-gray-600">
                <div className="font-medium">Active Filters:</div>
                <div className="text-xs mt-1">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-50 rounded-lg p-1">
            <TabsTrigger
              value="vouchers"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Vouchers</span>
            </TabsTrigger>
            <TabsTrigger
              value="ledgers"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Ledgers</span>
            </TabsTrigger>
            <TabsTrigger
              value="ledger-view"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Ledger View</span>
            </TabsTrigger>
            <TabsTrigger
              value="financial-statements"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Financial Statements</span>
            </TabsTrigger>
            <TabsTrigger
              value="closing-balances"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Closing Balances</span>
            </TabsTrigger>
          </TabsList>

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
