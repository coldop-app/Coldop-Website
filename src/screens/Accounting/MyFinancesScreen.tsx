import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, FileText, Receipt, BarChart3, Calculator } from 'lucide-react';
import TopBar from '@/components/common/Topbar/Topbar';
import LedgerForm from './components/LedgerForm';
import LedgerList from './components/LedgerList';
import LedgerView from './components/LedgerView';
import VoucherForm from './components/VoucherForm';
import VoucherList from './components/VoucherList';
import BalanceSheet from './components/BalanceSheet';
import TradingAndPLAccount from './components/TradingAndPLAccount';
import ClosingBalances from './components/ClosingBalances';

const MyFinancesScreen = () => {
  const [activeTab, setActiveTab] = useState('ledgers');

  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent<string>) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('switchTab' as any, handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switchTab' as any, handleSwitchTab as EventListener);
    };
  }, []);

  return (
    <>
      <TopBar title="My Finances" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-50 rounded-lg p-1">
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
              value="vouchers"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Vouchers</span>
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

          <TabsContent value="ledgers" className="space-y-6">
            <LedgerForm />
            <LedgerList />
          </TabsContent>

          <TabsContent value="ledger-view">
            <LedgerView />
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6">
            <VoucherForm />
            <VoucherList />
          </TabsContent>

          <TabsContent value="financial-statements" className="space-y-6">
            <BalanceSheet />
            <TradingAndPLAccount />
          </TabsContent>

          <TabsContent value="closing-balances">
            <ClosingBalances />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MyFinancesScreen;
