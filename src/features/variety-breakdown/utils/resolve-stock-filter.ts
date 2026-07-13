import type { AnalyticsStockFilterBucketKey } from '@/features/analytics/utils/resolve-analytics-summary-data';
import { mapStockFilterOptionToBucketKey } from '@/features/analytics/utils/resolve-analytics-summary-data';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownStockFilter } from '../types';

export function resolveVarietyBreakdownStockFilter(
  stockFilterTab: StockFilterTab,
): VarietyBreakdownStockFilter | undefined {
  if (stockFilterTab === 'all') return undefined;

  const bucketKey = mapStockFilterOptionToBucketKey(stockFilterTab);

  return bucketKey ?? undefined;
}

export function isValidStockFilterBucket(value: string): value is AnalyticsStockFilterBucketKey {
  return value === 'FARMER' || value === 'OWNED';
}
