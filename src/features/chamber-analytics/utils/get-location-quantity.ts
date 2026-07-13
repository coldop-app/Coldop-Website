import type { LocationAnalyticsQuantityTab } from '../types';

type QuantityFields = {
  initialTotal: number;
  currentTotal: number;
};

type BagQuantityFields = {
  initialQuantity: number;
  currentQuantity: number;
};

export function getChamberQuantity(
  chamber: QuantityFields,
  tab: LocationAnalyticsQuantityTab,
): number {
  return tab === 'current' ? chamber.currentTotal : chamber.initialTotal;
}

export function getFloorQuantity(floor: QuantityFields, tab: LocationAnalyticsQuantityTab): number {
  return tab === 'current' ? floor.currentTotal : floor.initialTotal;
}

export function getBagQuantity(bag: BagQuantityFields, tab: LocationAnalyticsQuantityTab): number {
  return tab === 'current' ? bag.currentQuantity : bag.initialQuantity;
}

export function sumBagQuantitiesForTab(
  bags: BagQuantityFields[],
  tab: LocationAnalyticsQuantityTab,
): number {
  return bags.reduce((sum, bag) => sum + getBagQuantity(bag, tab), 0);
}
