import { useEffect, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import {
  QuantityModeTabLabel,
  StockSummaryTabBar,
} from '@/features/people/components/farmer-stock-summary-tabs';
import { getStockSummaryAccent } from '@/features/people/components/farmer-stock-summary-table-styles';
import type {
  StockFilterTab,
  StockQuantityMode,
} from '@/features/people/utils/build-farmer-stock-summary';
import { preserveScroll } from '@/lib/preserve-scroll';

import { useVarietyBreakdown } from '../api/use-variety-breakdown';
import { buildFarmerDistribution, buildFarmerTableRows } from '../utils/build-farmer-distribution';
import { buildSizeDistribution } from '../utils/build-size-distribution';
import { getSizeQuantityForMode } from '../utils/get-variety-breakdown-quantity';
import { resolveBagSizeTabs } from '../utils/resolve-bag-size-tabs';
import { resolveSelectedSize } from '../utils/resolve-selected-size';
import { resolveVarietyBreakdownData } from '../utils/resolve-variety-breakdown-data';
import { VarietyBreakdownFarmerShareChart } from './variety-breakdown-farmer-share-chart';
import { VarietyBreakdownFarmerTable } from './variety-breakdown-farmer-table';
import { VarietyBreakdownSizeChart } from './variety-breakdown-size-chart';
import {
  VarietyBreakdownSummaryCards,
  VarietyBreakdownSummaryCardsSkeleton,
} from './variety-breakdown-summary-cards';

const varietyBreakdownRouteApi = getRouteApi('/_authenticated/analytics/variety-breakdown');

type VarietyBreakdownTabContentProps = {
  quantityMode: StockQuantityMode;
  enabled: boolean;
  stockFilterTab: StockFilterTab;
};

export function VarietyBreakdownTabContent({
  quantityMode,
  enabled,
  stockFilterTab,
}: VarietyBreakdownTabContentProps) {
  const {
    variety,
    bagSize,
    tab,
    stockFilter: stockFilterParam,
    stockFilterTab: stockFilterTabParam,
  } = varietyBreakdownRouteApi.useSearch();
  const navigate = varietyBreakdownRouteApi.useNavigate();
  const preferences = usePreferencesStore((state) => state.preferences);
  const commodities = preferences?.commodities ?? [];
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);

  const breakdown = useVarietyBreakdown(
    { variety, stockFilter: showStockFilterTabs },
    { enabled },
  );

  const resolvedData = useMemo(
    () =>
      resolveVarietyBreakdownData(
        breakdown.response?.data,
        stockFilterTab,
        showStockFilterTabs,
      ),
    [breakdown.response?.data, showStockFilterTabs, stockFilterTab],
  );

  const apiSizes = resolvedData?.sizes ?? [];

  const { tabs, activeBagSize } = useMemo(
    () => resolveBagSizeTabs(commodities, variety, apiSizes, quantityMode, bagSize),
    [apiSizes, bagSize, commodities, quantityMode, variety],
  );

  const includeStockFilter = showStockFilterTabs || Boolean(stockFilterParam);

  const buildSearch = (nextBagSize: string) => ({
    variety,
    bagSize: nextBagSize,
    tab,
    ...(includeStockFilter
      ? {
          stockFilter: true as const,
          stockFilterTab: stockFilterTabParam ?? stockFilterTab,
        }
      : {}),
  });

  useEffect(() => {
    if (!enabled || breakdown.isLoading) return;
    if (activeBagSize && activeBagSize !== bagSize) {
      void navigate({
        search: buildSearch(activeBagSize),
        replace: true,
        ...preserveScroll,
      });
    }
  }, [
    activeBagSize,
    bagSize,
    breakdown.isLoading,
    enabled,
    includeStockFilter,
    navigate,
    stockFilterTab,
    stockFilterTabParam,
    tab,
    variety,
  ]);

  const selectedSize = useMemo(
    () => resolveSelectedSize(apiSizes, activeBagSize),
    [activeBagSize, apiSizes],
  );

  const orderedSizeNames = useMemo(() => tabs.map((item) => item.value), [tabs]);

  const totalQuantity = selectedSize ? getSizeQuantityForMode(selectedSize, quantityMode) : 0;

  const farmerRows = useMemo(
    () => buildFarmerTableRows(selectedSize?.farmerBreakdown ?? [], quantityMode),
    [quantityMode, selectedSize],
  );

  const farmerDistribution = useMemo(
    () => buildFarmerDistribution(selectedSize?.farmerBreakdown ?? [], quantityMode),
    [quantityMode, selectedSize],
  );

  const sizeDistribution = useMemo(
    () => buildSizeDistribution(orderedSizeNames, apiSizes, quantityMode, activeBagSize),
    [activeBagSize, apiSizes, orderedSizeNames, quantityMode],
  );

  const handleBagSizeChange = (value: string) => {
    void navigate({
      search: buildSearch(value),
      ...preserveScroll,
    });
  };

  if (breakdown.isLoading) {
    return <VarietyBreakdownTabContentSkeleton />;
  }

  if (breakdown.isError) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load variety breakdown</EmptyTitle>
          <EmptyDescription>
            {breakdown.error instanceof Error
              ? breakdown.error.message
              : 'Something went wrong while fetching variety breakdown data.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const accent = getStockSummaryAccent(quantityMode);

  return (
    <div className="flex flex-col gap-6">
      {tabs.length > 0 ? (
        <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
          <div className="bg-muted/20 space-y-0">
            <div className="px-3 pt-3 sm:px-4 sm:pt-4">
              <StockSummaryTabBar
                value={activeBagSize}
                onValueChange={handleBagSizeChange}
                items={tabs.map((item) => ({
                  value: item.value,
                  label: <QuantityModeTabLabel label={item.value} count={item.count} />,
                }))}
                ariaLabel="Bag size filter"
                accent={accent}
              />
            </div>
            <Separator />
          </div>
        </div>
      ) : null}

      <VarietyBreakdownSummaryCards
        variety={variety}
        totalQuantity={totalQuantity}
        quantityMode={quantityMode}
      />

      <VarietyBreakdownFarmerTable
        bagSize={activeBagSize}
        quantityMode={quantityMode}
        rows={farmerRows}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VarietyBreakdownSizeChart distribution={sizeDistribution} quantityMode={quantityMode} />
        <VarietyBreakdownFarmerShareChart
          distribution={farmerDistribution}
          quantityMode={quantityMode}
        />
      </div>
    </div>
  );
}

function VarietyBreakdownTabContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/20 space-y-0 p-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      </div>

      <VarietyBreakdownSummaryCardsSkeleton />

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="space-y-1.5 p-6 pb-0">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="p-6">
          <div className="border-border overflow-hidden rounded-lg border">
            <Skeleton className="h-10 w-full rounded-none" />
            <Skeleton className="h-11 w-full rounded-none" />
            <Skeleton className="h-11 w-full rounded-none" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-card overflow-hidden rounded-xl border shadow-sm"
          >
            <div className="space-y-1.5 p-6 pb-0">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6">
              <Skeleton className="mx-auto min-h-[220px] w-full max-w-md rounded-lg sm:min-h-[280px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
