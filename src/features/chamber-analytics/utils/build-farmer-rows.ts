import type { LocationAnalyticsFarmer, LocationAnalyticsQuantityTab } from '../types';
import { sumBagQuantitiesForTab } from './get-location-quantity';

export type FarmerTableRow = {
  farmerId: string;
  farmerName: string;
  accountNumber: number;
  orderCount: number;
  totalBags: number;
  share: number;
};

export function buildFarmerRows(
  farmers: LocationAnalyticsFarmer[],
  tab: LocationAnalyticsQuantityTab,
): FarmerTableRow[] {
  const grandTotal = farmers.reduce((sum, farmer) => {
    const farmerTotal = farmer.orders.reduce(
      (orderSum, order) => orderSum + sumBagQuantitiesForTab(order.bagSizes, tab),
      0,
    );
    return sum + farmerTotal;
  }, 0);

  return farmers
    .map((farmer) => {
      const totalBags = farmer.orders.reduce(
        (sum, order) => sum + sumBagQuantitiesForTab(order.bagSizes, tab),
        0,
      );

      return {
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        accountNumber: farmer.accountNumber,
        orderCount: farmer.orderCount,
        totalBags,
        share: grandTotal > 0 ? (totalBags / grandTotal) * 100 : 0,
      };
    })
    .filter((row) => row.totalBags > 0)
    .sort((a, b) => {
      const diff = b.totalBags - a.totalBags;
      if (diff !== 0) return diff;
      return a.farmerName.localeCompare(b.farmerName);
    });
}

export function findFarmerById(
  farmers: LocationAnalyticsFarmer[],
  farmerId: string | null,
): LocationAnalyticsFarmer | null {
  if (!farmerId) return null;
  return farmers.find((farmer) => farmer.farmerId === farmerId) ?? null;
}
