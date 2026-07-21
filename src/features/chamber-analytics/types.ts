import type { DaybookLocation } from '@/features/daybook/types';

export const NO_CHAMBER = '(No chamber)';
export const NO_FLOOR = '(No floor)';

export type LocationAnalyticsQuantityTab = 'current' | 'initial';

export type LocationAnalyticsView = 'location' | 'farmer';

export type LocationAnalyticsBagSize = {
  name: string;
  initialQuantity: number;
  currentQuantity: number;
  location: DaybookLocation;
  paltaiLocation?: DaybookLocation[];
};

export type LocationAnalyticsOrder = {
  _id: string;
  gatePassNo: number;
  date: string;
  variety: string;
  farmerId: string;
  farmerName: string;
  bagSizes: LocationAnalyticsBagSize[];
};

export type LocationAnalyticsFloor = {
  floor: string;
  initialTotal: number;
  currentTotal: number;
};

export type LocationAnalyticsChamber = {
  chamber: string;
  initialTotal: number;
  currentTotal: number;
  orderCount: number;
  floors: LocationAnalyticsFloor[];
  orders: LocationAnalyticsOrder[];
};

export type LocationAnalyticsFarmer = {
  farmerId: string;
  farmerName: string;
  accountNumber: number;
  orderCount: number;
  orders: LocationAnalyticsOrder[];
};

export type LocationAnalyticsData = {
  byLocation: {
    chambers: LocationAnalyticsChamber[];
  };
  byFarmer: LocationAnalyticsFarmer[];
};

export type LocationAnalyticsResponse = {
  success: boolean;
  data: LocationAnalyticsData | null;
  message?: string;
};
