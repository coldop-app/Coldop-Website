import { getRouteApi } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileSpreadsheet, Landmark, Receipt } from 'lucide-react';

import { preserveScroll } from '@/lib/preserve-scroll';

import VoucherTab from './components/voucher-tab/index';
import LedgerTab from './components/ledger-tab/index';
import FinancialStatementTab from './components/financial-statements-tab';
import ClosingBalanceTab from './components/closing-balances-tab';
import { FinancesReportContext } from './hooks/finances-report-context';
import type { FinancesPeriod, FinancesTab } from './search';
import { PERIOD_FILTER_VALUES, PERIOD_LABELS } from './shared/constants';

const financesRouteApi = getRouteApi('/_authenticated/finances/');

const REPORT_TABS: FinancesTab[] = ['financial-statements', 'closing-balances'];

const FinancesPage = () => {
  const { tab, period } = financesRouteApi.useSearch();
  const navigate = financesRouteApi.useNavigate();

  const handleTabChange = (value: string) => {
    navigate({
      search: (current) => ({
        ...current,
        tab: value as FinancesTab,
      }),
      ...preserveScroll,
    });
  };

  const handlePeriodChange = (nextPeriod: FinancesPeriod) => {
    navigate({
      search: (current) => ({
        ...current,
        period: nextPeriod,
      }),
      ...preserveScroll,
    });
  };

  const showPeriodFilter = REPORT_TABS.includes(tab);

  return (
    <FinancesReportContext.Provider value={{ period }}>
      <div className="flex w-full flex-col gap-4">
        {showPeriodFilter ? (
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-11 gap-2 sm:h-9">
                  Period: {PERIOD_LABELS[period]}
                  <ChevronDown className="size-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PERIOD_FILTER_VALUES.map((value) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={period === value}
                    onCheckedChange={() => handlePeriodChange(value)}
                  >
                    {PERIOD_LABELS[value]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
          <TabsList className="h-11 w-full">
            <TabsTrigger value="vouchers">
              <Receipt className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">Vouchers</span>
            </TabsTrigger>

            <TabsTrigger value="ledgers">
              <BookOpen className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">Ledgers</span>
            </TabsTrigger>

            <TabsTrigger value="financial-statements">
              <FileSpreadsheet className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">Financial Statements</span>
            </TabsTrigger>

            <TabsTrigger value="closing-balances">
              <Landmark className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">Closing Balances</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vouchers" className="min-w-0">
            <VoucherTab />
          </TabsContent>

          <TabsContent value="ledgers" className="min-w-0">
            <LedgerTab />
          </TabsContent>

          <TabsContent value="financial-statements" className="min-w-0">
            <FinancialStatementTab />
          </TabsContent>

          <TabsContent value="closing-balances" className="min-w-0">
            <ClosingBalanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </FinancesReportContext.Provider>
  );
};

export default FinancesPage;
