import { useMemo } from 'react';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, RefreshCw, Wheat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import type { AnalyticsTab } from '@/features/analytics/search';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import { StockSummaryTabBar } from '@/features/people/components/farmer-stock-summary-tabs';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';
import { preserveScroll } from '@/lib/preserve-scroll';

import { VARIETY_BREAKDOWN_QUERY_KEY } from './api/use-variety-breakdown';
import { VarietyBreakdownTabContent } from './components/variety-breakdown-tab-content';

const varietyBreakdownRouteApi = getRouteApi('/_authenticated/analytics/variety-breakdown');

function resolveStockFilterTabFromSearch(
  stockFilterTabParam: string | undefined,
  stockFilterTabs: StockFilterTab[],
): StockFilterTab {
  if (!stockFilterTabParam) return 'all';

  const exact = stockFilterTabs.find((tab) => tab === stockFilterTabParam);
  if (exact) return exact;

  const normalized = stockFilterTabParam.trim().toUpperCase();
  const caseInsensitive = stockFilterTabs.find(
    (tab) => tab !== 'all' && tab.trim().toUpperCase() === normalized,
  );
  return caseInsensitive ?? 'all';
}

const VarietyBreakdownPage = () => {
  const {
    variety,
    bagSize,
    tab,
    stockFilter: stockFilterParam,
    stockFilterTab: stockFilterTabParam,
  } = varietyBreakdownRouteApi.useSearch();
  const navigate = varietyBreakdownRouteApi.useNavigate();
  const queryClient = useQueryClient();
  const preferences = usePreferencesStore((state) => state.preferences);
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);
  const stockFilterOptions = preferences?.stockFilter?.options ?? [];

  const isRefreshing = useIsFetching({ queryKey: VARIETY_BREAKDOWN_QUERY_KEY }) > 0;

  const stockFilterTabs: StockFilterTab[] = useMemo(
    () => (showStockFilterTabs ? ['all', ...stockFilterOptions] : []),
    [showStockFilterTabs, stockFilterOptions],
  );

  const stockFilterTab = useMemo(
    () => resolveStockFilterTabFromSearch(stockFilterTabParam, stockFilterTabs),
    [stockFilterTabParam, stockFilterTabs],
  );

  const includeStockFilter = showStockFilterTabs || Boolean(stockFilterParam);

  const stockFilterTabItems = stockFilterTabs.map((filterTab) => ({
    value: filterTab,
    label: filterTab === 'all' ? 'All' : filterTab,
  }));

  const buildSearch = (overrides: {
    bagSize?: string;
    tab?: AnalyticsTab;
    stockFilterTab?: StockFilterTab;
  } = {}) => ({
    variety,
    bagSize: overrides.bagSize ?? bagSize,
    tab: overrides.tab ?? tab,
    ...(includeStockFilter
      ? {
          stockFilter: true as const,
          stockFilterTab: overrides.stockFilterTab ?? stockFilterTab,
        }
      : {}),
  });

  const handleTabChange = (value: string) => {
    void navigate({
      search: buildSearch({ tab: value as AnalyticsTab }),
      ...preserveScroll,
    });
  };

  const handleStockFilterTabChange = (value: string) => {
    void navigate({
      search: buildSearch({ stockFilterTab: value as StockFilterTab }),
      ...preserveScroll,
    });
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: VARIETY_BREAKDOWN_QUERY_KEY });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link to="/analytics" search={{ tab }}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Analytics
          </Link>
        </Button>
      </div>

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Wheat className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle className="truncate">{variety}</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {showStockFilterTabs ? (
        <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
          <div className="bg-muted/20 space-y-0">
            <div className="px-3 pt-3 sm:px-4 sm:pt-4">
              <StockSummaryTabBar
                value={stockFilterTab}
                onValueChange={handleStockFilterTabChange}
                items={stockFilterTabItems}
                ariaLabel="Stock ownership filter"
              />
            </div>
            <Separator />
          </div>
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="min-w-0">
          <VarietyBreakdownTabContent
            quantityMode="current"
            enabled={tab === 'current'}
            stockFilterTab={stockFilterTab}
          />
        </TabsContent>

        <TabsContent value="initial" className="min-w-0">
          <VarietyBreakdownTabContent
            quantityMode="initial"
            enabled={tab === 'initial'}
            stockFilterTab={stockFilterTab}
          />
        </TabsContent>

        <TabsContent value="outgoing" className="min-w-0">
          <VarietyBreakdownTabContent
            quantityMode="outgoing"
            enabled={tab === 'outgoing'}
            stockFilterTab={stockFilterTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VarietyBreakdownPage;
