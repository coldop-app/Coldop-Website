import type { LocationAnalyticsOrder } from '../types';
import type { LocationAnalyticsQuantityTab } from '../types';
import { getEffectiveAnalyticsBagLocation } from './get-effective-analytics-location';
import { getBagQuantity } from './get-location-quantity';

export type FilteredChamberOrder = {
  order: LocationAnalyticsOrder;
  bagSizes: LocationAnalyticsOrder['bagSizes'];
  totalBags: number;
};

export function filterChamberOrders(
  orders: LocationAnalyticsOrder[],
  floor: string,
  tab: LocationAnalyticsQuantityTab,
): FilteredChamberOrder[] {
  const result: FilteredChamberOrder[] = [];

  for (const order of orders) {
    const matchingBags =
      floor === 'all'
        ? order.bagSizes
        : order.bagSizes.filter(
            (bag) => getEffectiveAnalyticsBagLocation(bag).floor === floor,
          );

    if (matchingBags.length === 0) continue;

    const totalBags = matchingBags.reduce((sum, bag) => sum + getBagQuantity(bag, tab), 0);

    if (totalBags <= 0) continue;

    result.push({
      order,
      bagSizes: matchingBags,
      totalBags,
    });
  }

  return result.sort((a, b) => {
    const dateDiff = new Date(b.order.date).getTime() - new Date(a.order.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.order.gatePassNo - a.order.gatePassNo;
  });
}
