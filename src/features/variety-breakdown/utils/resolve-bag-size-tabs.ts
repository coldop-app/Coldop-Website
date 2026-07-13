import type { CommodityPreference } from '@/features/auth/types';
import { getBagSizeOrderForVariety } from '@/features/incoming/utils/incoming-preferences';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import type { VarietyBreakdownSize } from '../types';
import { getSizeQuantityForMode } from './get-variety-breakdown-quantity';

export type BagSizeTabItem = {
  value: string;
  count: number;
};

export function resolveBagSizeTabs(
  commodities: CommodityPreference[],
  variety: string,
  apiSizes: VarietyBreakdownSize[],
  quantityMode: StockQuantityMode,
  urlBagSize: string,
): { tabs: BagSizeTabItem[]; activeBagSize: string } {
  const preferenceOrder = getBagSizeOrderForVariety(commodities, variety);
  const apiSizeMap = new Map(apiSizes.map((size) => [size.size, size]));

  const orderedSizes =
    preferenceOrder.length > 0
      ? preferenceOrder
      : [...apiSizeMap.keys()].sort((a, b) => a.localeCompare(b));

  const tabs: BagSizeTabItem[] = orderedSizes.map((sizeName) => {
    const apiSize = apiSizeMap.get(sizeName);

    return {
      value: sizeName,
      count: apiSize ? getSizeQuantityForMode(apiSize, quantityMode) : 0,
    };
  });

  const activeBagSize =
    tabs.find((tab) => tab.value === urlBagSize)?.value ?? tabs[0]?.value ?? urlBagSize;

  return { tabs, activeBagSize };
}
