import { getAnalyticsQuantityForMode } from '@/features/analytics/utils/get-analytics-quantity-for-mode';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownFarmer, VarietyBreakdownSize } from '../types';

type QuantityFields = {
  initialQuantity: number;
  currentQuantity: number;
};

export function getSizeQuantityForMode(
  size: VarietyBreakdownSize,
  mode: StockQuantityMode,
): number {
  return getAnalyticsQuantityForMode(size.initialQuantity, size.currentQuantity, mode);
}

export function getFarmerQuantityForMode(
  farmer: VarietyBreakdownFarmer,
  mode: StockQuantityMode,
): number {
  return getAnalyticsQuantityForMode(farmer.initialQuantity, farmer.currentQuantity, mode);
}

export function getQuantityForMode(row: QuantityFields, mode: StockQuantityMode): number {
  return getAnalyticsQuantityForMode(row.initialQuantity, row.currentQuantity, mode);
}
