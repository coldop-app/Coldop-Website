import { useMemo, useState } from 'react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { useAnalyticsSummary } from '@/features/analytics/api/use-analytics-summary';
import { useAnalyticsTopFarmers } from '@/features/analytics/api/use-analytics-top-farmers';
import { AnalyticsCapacityUtilization } from '@/features/analytics/components/analytics-capacity-utilization';
import {
  AnalyticsSummaryCards,
  AnalyticsSummaryCardsSkeleton,
} from '@/features/analytics/components/analytics-summary-cards';
import { AnalyticsSizeDistribution } from '@/features/analytics/components/analytics-size-distribution';
import { AnalyticsStockSummarySection } from '@/features/analytics/components/analytics-stock-summary-section';
import { AnalyticsTopFarmersChart } from '@/features/analytics/components/analytics-top-farmers-chart';
import { AnalyticsVarietyDistribution } from '@/features/analytics/components/analytics-variety-distribution';
import {
  buildSizeDistribution,
  buildVarietyDistribution,
} from '@/features/analytics/utils/build-analytics-distribution';
import { buildAnalyticsStockSummary } from '@/features/analytics/utils/build-analytics-stock-summary';
import { buildAnalyticsSummaryCards } from '@/features/analytics/utils/build-analytics-summary-cards';
import { resolveAnalyticsSummaryData } from '@/features/analytics/utils/resolve-analytics-summary-data';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';
import { RefreshCw } from 'lucide-react';

type AnalyticsTabContentProps = {
  quantityMode: StockQuantityMode;
  enabled: boolean;
};

export function AnalyticsTabContent({ quantityMode, enabled }: AnalyticsTabContentProps) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);
  const [stockFilterTab, setStockFilterTab] = useState<StockFilterTab>('all');

  const coldStorageCapacity = useColdStorageStore((state) => state.coldStorage?.capacity);

  const useGroupedApi = showStockFilterTabs && stockFilterTab !== 'all';
  const needsStoreWideSummary = showStockFilterTabs && stockFilterTab !== 'all';

  const summary = useAnalyticsSummary({ stockFilter: useGroupedApi }, { enabled });
  const storeSummary = useAnalyticsSummary(
    {},
    {
      enabled: enabled && needsStoreWideSummary,
    },
  );
  const topFarmers = useAnalyticsTopFarmers({ enabled });

  const isLoading =
    summary.isLoading || topFarmers.isLoading || (needsStoreWideSummary && storeSummary.isLoading);

  const isError =
    summary.isError || topFarmers.isError || (needsStoreWideSummary && storeSummary.isError);

  const error = summary.error ?? topFarmers.error ?? storeSummary.error;

  const summaryData = useMemo(
    () => resolveAnalyticsSummaryData(summary.response?.data, stockFilterTab, showStockFilterTabs),
    [summary.response, stockFilterTab, showStockFilterTabs],
  );

  const storeWideSummaryData = useMemo(() => {
    if (!needsStoreWideSummary) {
      return summaryData;
    }

    return resolveAnalyticsSummaryData(storeSummary.response?.data, 'all', false);
  }, [needsStoreWideSummary, storeSummary.response, summaryData]);

  const cards = useMemo(() => {
    if (!summaryData) return null;
    return buildAnalyticsSummaryCards(summaryData, topFarmers.response, quantityMode);
  }, [summaryData, topFarmers.response, quantityMode]);

  const matrix = useMemo(() => {
    if (!summaryData) return null;
    return buildAnalyticsStockSummary({
      stockSummary: summaryData.stockSummary,
      sizeOrder: summaryData.chartData.sizes,
      quantityMode,
    });
  }, [summaryData, quantityMode]);

  const varietyDistribution = useMemo(() => {
    if (!summaryData) return null;
    return buildVarietyDistribution(summaryData.stockSummary, quantityMode);
  }, [summaryData, quantityMode]);

  const sizeDistribution = useMemo(() => {
    if (!summaryData) return null;
    return buildSizeDistribution(
      summaryData.stockSummary,
      quantityMode,
      summaryData.chartData.sizes,
    );
  }, [summaryData, quantityMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <AnalyticsSummaryCardsSkeleton />

        <section className="flex flex-col gap-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="p-4">
              <div className="border-border overflow-hidden rounded-lg border">
                <Skeleton className="h-11 w-full rounded-none" />
                <Skeleton className="h-12 w-full rounded-none" />
                <Skeleton className="h-12 w-full rounded-none" />
                <Skeleton className="h-12 w-full rounded-none" />
              </div>
            </div>
          </div>
        </section>

        <CardSkeleton />
        <DistributionChartsSkeleton />
        <TopFarmersChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load analytics</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error
              ? error.message
              : 'Something went wrong while fetching analytics data.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!summaryData || !cards || !matrix || !varietyDistribution || !sizeDistribution) {
    return (
      <Empty className="border-border bg-card rounded-xl border">
        <EmptyHeader>
          <EmptyTitle>Stock summary unavailable</EmptyTitle>
          <EmptyDescription>
            Could not resolve analytics data for the selected stock filter.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsSummaryCards cards={cards} />

      <AnalyticsStockSummarySection
        matrix={matrix}
        quantityMode={quantityMode}
        stockFilterTab={stockFilterTab}
        onStockFilterTabChange={setStockFilterTab}
      />

      <AnalyticsCapacityUtilization
        currentQuantity={
          storeWideSummaryData?.totalInventory.current ?? summaryData.totalInventory.current
        }
        totalCapacity={coldStorageCapacity}
      />

      <div className="flex w-full flex-col gap-6">
        <AnalyticsVarietyDistribution
          distribution={varietyDistribution}
          quantityMode={quantityMode}
        />
        <AnalyticsSizeDistribution distribution={sizeDistribution} quantityMode={quantityMode} />
        <AnalyticsTopFarmersChart topFarmers={topFarmers.response} quantityMode={quantityMode} />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border p-6 shadow-sm">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-48" />
      <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}

function DistributionChartsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="border-border bg-card overflow-hidden rounded-xl border shadow-sm"
        >
          <div className="space-y-1.5 p-6 pb-0">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4 p-6 sm:space-y-6">
            <Skeleton className="mx-auto min-h-[220px] w-full max-w-md rounded-lg sm:min-h-[280px]" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-52" />
              <div className="border-border overflow-hidden rounded-lg border">
                <Skeleton className="h-10 w-full rounded-none" />
                <Skeleton className="h-11 w-full rounded-none" />
                <Skeleton className="h-11 w-full rounded-none" />
                <Skeleton className="h-11 w-full rounded-none" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopFarmersChartSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="space-y-1.5 p-6 pb-0">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="p-6">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
