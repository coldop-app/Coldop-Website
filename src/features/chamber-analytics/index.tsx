import { useEffect } from 'react';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LineChart, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { preserveScroll } from '@/lib/preserve-scroll';

import { LOCATION_ANALYTICS_QUERY_KEY, useLocationAnalytics } from './api/use-location-analytics';
import { ChamberAnalyticsFarmerTab } from './components/chamber-analytics-farmer-tab';
import { ChamberAnalyticsLocationTab } from './components/chamber-analytics-location-tab';
import type { LocationAnalyticsTab, LocationAnalyticsView } from './search';
import { resolveChamberTabs } from './utils/resolve-chamber-tabs';

const chamberAnalyticsRouteApi = getRouteApi('/_authenticated/analytics/advanced');

const ChamberAnalyticsPage = () => {
  const { tab, view, chamber, floor } = chamberAnalyticsRouteApi.useSearch();
  const navigate = chamberAnalyticsRouteApi.useNavigate();
  const queryClient = useQueryClient();

  const isRefreshing = useIsFetching({ queryKey: LOCATION_ANALYTICS_QUERY_KEY }) > 0;

  const analytics = useLocationAnalytics();
  const chambers = analytics.response?.data?.byLocation.chambers ?? [];
  const { activeChamber } = resolveChamberTabs(chambers, chamber);

  useEffect(() => {
    if (!analytics.response || chambers.length === 0) return;
    if (chamber && chambers.some((item) => item.chamber === chamber)) return;

    if (activeChamber && activeChamber !== chamber) {
      void navigate({
        search: (prev) => ({
          ...prev,
          chamber: activeChamber,
          floor: '',
        }),
        replace: true,
        ...preserveScroll,
      });
    }
  }, [activeChamber, analytics.response, chamber, chambers, navigate]);

  const handleQuantityTabChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: value as LocationAnalyticsTab,
      }),
      ...preserveScroll,
    });
  };

  const handleViewTabChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        view: value as LocationAnalyticsView,
      }),
      ...preserveScroll,
    });
  };

  const handleChamberChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        chamber: value,
        floor: '',
      }),
      ...preserveScroll,
    });
  };

  const handleFloorChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        floor: value,
      }),
      ...preserveScroll,
    });
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: LOCATION_ANALYTICS_QUERY_KEY });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link to="/analytics" search={{ tab: 'current' }}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Analytics
          </Link>
        </Button>
      </div>

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <LineChart className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Location Wise Analytics</ItemTitle>
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

      <Tabs value={tab} onValueChange={handleQuantityTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="min-w-0">
          <ViewTabs
            activeQuantityTab={tab}
            quantityTab="current"
            view={view}
            chamber={chamber}
            floor={floor}
            onViewChange={handleViewTabChange}
            onChamberChange={handleChamberChange}
            onFloorChange={handleFloorChange}
          />
        </TabsContent>

        <TabsContent value="initial" className="min-w-0">
          <ViewTabs
            activeQuantityTab={tab}
            quantityTab="initial"
            view={view}
            chamber={chamber}
            floor={floor}
            onViewChange={handleViewTabChange}
            onChamberChange={handleChamberChange}
            onFloorChange={handleFloorChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

type ViewTabsProps = {
  activeQuantityTab: LocationAnalyticsTab;
  quantityTab: LocationAnalyticsTab;
  view: LocationAnalyticsView;
  chamber: string | undefined;
  floor: string;
  onViewChange: (value: string) => void;
  onChamberChange: (chamber: string) => void;
  onFloorChange: (floor: string) => void;
};

function ViewTabs({
  activeQuantityTab,
  quantityTab,
  view,
  chamber,
  floor,
  onViewChange,
  onChamberChange,
  onFloorChange,
}: ViewTabsProps) {
  const isActiveQuantityTab = activeQuantityTab === quantityTab;

  return (
    <Tabs value={view} onValueChange={onViewChange} className="w-full gap-4">
      <TabsList className="h-11 w-full">
        <TabsTrigger value="location">By Location</TabsTrigger>
        <TabsTrigger value="farmer">By Farmer</TabsTrigger>
      </TabsList>

      <TabsContent value="location" className="min-w-0">
        <ChamberAnalyticsLocationTab
          tab={quantityTab}
          chamber={chamber}
          floor={floor}
          enabled={isActiveQuantityTab && view === 'location'}
          onChamberChange={onChamberChange}
          onFloorChange={onFloorChange}
        />
      </TabsContent>

      <TabsContent value="farmer" className="min-w-0">
        <ChamberAnalyticsFarmerTab
          tab={quantityTab}
          enabled={isActiveQuantityTab && view === 'farmer'}
        />
      </TabsContent>
    </Tabs>
  );
}

export default ChamberAnalyticsPage;
