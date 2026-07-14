import { mapStockFilterOptionToBucketKey } from '@/features/analytics/utils/resolve-analytics-summary-data';
import type { StockFilterTab } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownStockFilter } from '../types';

export function resolveVarietyBreakdownStockFilter(
  stockFilterTab: StockFilterTab,
): VarietyBreakdownStockFilter | undefined {
  if (stockFilterTab === 'all') return undefined;

  return mapStockFilterOptionToBucketKey(stockFilterTab) ?? undefined;
}
