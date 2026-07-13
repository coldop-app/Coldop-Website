import type {
  AnalyticsSummaryByFilterData,
  AnalyticsSummaryData,
} from '@/features/analytics/types';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';

export type AnalyticsStockFilterBucketKey = 'FARMER' | 'OWNED';

export function isAnalyticsSummaryByFilterData(
  data: AnalyticsSummaryData | AnalyticsSummaryByFilterData,
): data is AnalyticsSummaryByFilterData {
  return 'stockSummaryByFilter' in data;
}

export function mapStockFilterOptionToBucketKey(
  option: string,
): AnalyticsStockFilterBucketKey | null {
  const normalized = option.trim().toUpperCase();

  if (normalized === 'FARMER' || normalized.includes('FARMER')) {
    return 'FARMER';
  }

  if (
    normalized === 'OWNED' ||
    normalized === 'OWN' ||
    normalized.includes('OWNED') ||
    normalized.includes('OWN')
  ) {
    return 'OWNED';
  }

  return null;
}

export function bucketToAnalyticsSummaryData(
  bucket: AnalyticsSummaryByFilterData['stockSummaryByFilter'][AnalyticsStockFilterBucketKey],
): AnalyticsSummaryData {
  return {
    stockSummary: bucket.stockSummary,
    chartData: bucket.chartData,
    totalInventory: bucket.totalInventory,
    topVariety: bucket.topVariety,
    topSize: bucket.topSize,
  };
}

export function resolveAnalyticsSummaryData(
  data: AnalyticsSummaryData | AnalyticsSummaryByFilterData | null | undefined,
  stockFilterTab: StockFilterTab,
  showStockFilterTabs: boolean,
): AnalyticsSummaryData | null {
  if (!data) return null;

  if (!showStockFilterTabs || stockFilterTab === 'all') {
    return isAnalyticsSummaryByFilterData(data) ? null : data;
  }

  if (!isAnalyticsSummaryByFilterData(data)) return null;

  const bucketKey = mapStockFilterOptionToBucketKey(stockFilterTab);
  if (!bucketKey) return null;

  const bucket = data.stockSummaryByFilter[bucketKey];
  if (!bucket) return null;

  return bucketToAnalyticsSummaryData(bucket);
}
