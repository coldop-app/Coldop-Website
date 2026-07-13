import { getRouteApi, Link } from '@tanstack/react-router';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ChevronRight, LineChart, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { preserveScroll } from '@/lib/preserve-scroll';

import { ANALYTICS_SUMMARY_QUERY_KEY } from './api/use-analytics-summary';
import { ANALYTICS_TOP_FARMERS_QUERY_KEY } from './api/use-analytics-top-farmers';
import { AnalyticsTabContent } from './components/analytics-tab-content';
import type { AnalyticsTab } from './search';

const analyticsRouteApi = getRouteApi('/_authenticated/analytics/');

const ANALYTICS_QUERY_KEYS = [
  ANALYTICS_SUMMARY_QUERY_KEY,
  ANALYTICS_TOP_FARMERS_QUERY_KEY,
] as const;

const AnalyticsPage = () => {
  const { tab } = analyticsRouteApi.useSearch();
  const navigate = analyticsRouteApi.useNavigate();
  const queryClient = useQueryClient();
  const summaryFetching = useIsFetching({ queryKey: ANALYTICS_SUMMARY_QUERY_KEY });
  const topFarmersFetching = useIsFetching({
    queryKey: ANALYTICS_TOP_FARMERS_QUERY_KEY,
  });
  const isRefreshing = summaryFetching > 0 || topFarmersFetching > 0;

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as AnalyticsTab },
      ...preserveScroll,
    });
  };

  const handleRefresh = () => {
    for (const queryKey of ANALYTICS_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Analytics</ItemTitle>
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

      <Item
        variant="outline"
        size="sm"
        asChild
        className="group hover:bg-muted/40 cursor-pointer transition-colors"
      >
        <Link
          to="/analytics/advanced"
          search={{ tab: 'current', view: 'location', floor: '' }}
          preload="intent"
          aria-label="Location Wise Analytics — stock breakdown by storage location"
        >
          <ItemMedia variant="icon">
            <div className="bg-primary/10 group-hover:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
              <LineChart className="text-primary h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </div>
          </ItemMedia>

          <ItemContent>
            <ItemTitle>Location Wise Analytics</ItemTitle>
            <ItemDescription>
              Stock breakdown and occupancy across storage locations.
            </ItemDescription>
          </ItemContent>

          <ItemActions>
            <ChevronRight
              className="text-muted-foreground group-hover:text-foreground size-4 transition-all duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </ItemActions>
        </Link>
      </Item>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="min-w-0">
          <AnalyticsTabContent quantityMode="current" enabled={tab === 'current'} />
        </TabsContent>

        <TabsContent value="initial" className="min-w-0">
          <AnalyticsTabContent quantityMode="initial" enabled={tab === 'initial'} />
        </TabsContent>

        <TabsContent value="outgoing" className="min-w-0">
          <AnalyticsTabContent quantityMode="outgoing" enabled={tab === 'outgoing'} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
