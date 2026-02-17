import { memo, useState, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';

import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
  ItemFooter,
} from '@/components/ui/item';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import {
  Wallet,
  RefreshCw,
  ChevronDown,
  FileText,
  Receipt,
  BookOpen,
  List,
  BarChart3,
  Calculator,
} from 'lucide-react';

import VoucherTab from './vouchers-tab';
import LedgerTab from './ledgers-tab';
import LedgerViewTab from './ledger-view-tab';
import FinancialStatementsTab from './financial-statements-tab';
import ClosingBalancesTab from './closing-balances-tab';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type PeriodFilter = 'this_month' | 'last_month' | 'this_quarter' | 'this_year';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  this_quarter: 'This quarter',
  this_year: 'This year',
};

const TAB_TRIGGER_CLASS =
  'font-custom relative shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ' +
  'text-muted-foreground hover:text-foreground ' +
  'data-[state=active]:bg-background data-[state=active]:text-foreground ' +
  'data-[state=active]:shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'min-w-0 sm:flex-1 sm:px-4';

/* ------------------------------------------------------------------ */
/* Skeleton loader */
/* ------------------------------------------------------------------ */

function MyFinancesSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/40 overflow-hidden shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/40 overflow-hidden">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component */
/* ------------------------------------------------------------------ */

const TAB_VALUE_LEDGER_VIEW = 'ledger-view';

const MyFinancesPage = memo(function MyFinancesPage() {
  const search = useSearch({ from: '/store-admin/_authenticated/my-finances/' });
  const tabFromUrl = search.tab;
  const farmerStorageLinkIdFromUrl = search.farmerStorageLinkId;
  const farmerNameFromUrl = search.farmerName;

  const activeTab = useMemo(() => {
    if (
      tabFromUrl === 'Ledger View' ||
      tabFromUrl === TAB_VALUE_LEDGER_VIEW
    ) {
      return TAB_VALUE_LEDGER_VIEW;
    }
    return 'vouchers';
  }, [tabFromUrl]);

  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Placeholder: no API yet – use false to show content, true for loading
  const isLoading = false;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-6 sm:pb-6 lg:p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <MyFinancesSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-6 sm:pb-6 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header: title + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <ItemMedia variant="icon" className="shrink-0 rounded-lg">
                <Wallet className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom truncate text-sm font-semibold sm:text-base">
                My Finances
              </ItemTitle>
            </div>
            <ItemActions className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                onClick={handleRefresh}
                className="font-custom focus-visible:ring-primary h-9 min-h-9 gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-8"
                aria-busy={isRefreshing}
                aria-label={isRefreshing ? 'Refreshing' : 'Refresh'}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {/* Period filter + actions */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <ItemFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-custom focus-visible:ring-primary h-9 min-h-9 w-full gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-8 sm:w-auto"
                >
                  Period: {PERIOD_LABELS[period]}
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="font-custom">
                {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={period === key}
                    onCheckedChange={() => setPeriod(key)}
                  >
                    {PERIOD_LABELS[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <Button
                variant="secondary"
                size="sm"
                className="font-custom focus-visible:ring-primary h-9 min-h-9 w-full gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-8 sm:w-auto"
                asChild
              >
                <a href="#">
                  <FileText className="h-4 w-4 shrink-0" />
                  Get reports
                </a>
              </Button>
            </div>
          </ItemFooter>
        </Item>

        {/* Tabs: scrollable on mobile; initial tab from URL when present */}
        <Tabs
          key={`${activeTab}-${farmerStorageLinkIdFromUrl ?? ''}`}
          defaultValue={activeTab}
          className="w-full space-y-4"
        >
          <div className="-mx-1 overflow-x-auto overflow-y-hidden px-1">
            <TabsList className="font-custom bg-muted inline-flex h-auto w-full flex-nowrap items-center justify-start gap-1 rounded-2xl p-1 sm:w-max sm:min-w-full">
              <TabsTrigger
                value="vouchers"
                className={TAB_TRIGGER_CLASS}
                aria-label="Vouchers"
              >
                <Receipt className="mr-0 h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline">Vouchers</span>
              </TabsTrigger>
              <TabsTrigger
                value="ledgers"
                className={TAB_TRIGGER_CLASS}
                aria-label="Ledgers"
              >
                <BookOpen className="mr-0 h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline">Ledgers</span>
              </TabsTrigger>
              <TabsTrigger
                value="ledger-view"
                className={TAB_TRIGGER_CLASS}
                aria-label="Ledger View"
              >
                <List className="mr-0 h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline">Ledger View</span>
              </TabsTrigger>
              <TabsTrigger
                value="financial-statements"
                className={TAB_TRIGGER_CLASS}
                aria-label="Financial Statements"
              >
                <BarChart3 className="mr-0 h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline">Financial Statements</span>
              </TabsTrigger>
              <TabsTrigger
                value="closing-balances"
                className={TAB_TRIGGER_CLASS}
                aria-label="Closing Balances"
              >
                <Calculator className="mr-0 h-4 w-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline">Closing Balances</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="vouchers" className="outline-none">
            <VoucherTab />
          </TabsContent>
          <TabsContent value="ledgers" className="outline-none">
            <LedgerTab />
          </TabsContent>
          <TabsContent value="ledger-view" className="outline-none">
            <LedgerViewTab
              initialFarmerStorageLinkId={farmerStorageLinkIdFromUrl}
              initialFarmerName={farmerNameFromUrl}
            />
          </TabsContent>
          <TabsContent value="financial-statements" className="outline-none">
            <FinancialStatementsTab />
          </TabsContent>
          <TabsContent value="closing-balances" className="outline-none">
            <ClosingBalancesTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
});

export default MyFinancesPage;
