export type AnalyticsStockSize = {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
};

export type AnalyticsStockVariety = {
  variety: string;
  sizes: AnalyticsStockSize[];
};

export type AnalyticsFlatSeriesPoint = {
  name: string;
  variety: string;
  size: string;
  initialQuantity: number;
  currentQuantity: number;
};

export type AnalyticsChartData = {
  flatSeries: AnalyticsFlatSeriesPoint[];
  varieties: string[];
  sizes: string[];
};

export type AnalyticsInventoryTotals = {
  initial: number;
  current: number;
};

export type AnalyticsTopVariety = {
  variety: string;
  currentQuantity: number;
};

export type AnalyticsTopSize = {
  size: string;
  currentQuantity: number;
};

export type AnalyticsSummaryData = {
  stockSummary: AnalyticsStockVariety[];
  chartData: AnalyticsChartData;
  totalInventory: AnalyticsInventoryTotals;
  topVariety: AnalyticsTopVariety | null;
  topSize: AnalyticsTopSize | null;
};

export type AnalyticsStockFilterBucket = {
  stockSummary: AnalyticsStockVariety[];
  chartData: AnalyticsChartData;
  totalInventory: AnalyticsInventoryTotals;
  topVariety: AnalyticsTopVariety | null;
  topSize: AnalyticsTopSize | null;
};

export type AnalyticsSummaryByFilterData = {
  stockSummaryByFilter: Record<string, AnalyticsStockFilterBucket>;
};

export type AnalyticsSummaryByGenerationData = {
  stockSummaryByGeneration: Record<string, AnalyticsStockFilterBucket>;
};

export type AnalyticsSummaryByFilterAndGenerationData = {
  stockSummaryByFilterAndGeneration: Record<
    string,
    Record<string, AnalyticsStockFilterBucket>
  >;
};

export type AnalyticsGroupedSummaryData =
  | AnalyticsSummaryByFilterData
  | AnalyticsSummaryByGenerationData
  | AnalyticsSummaryByFilterAndGenerationData;

export type AnalyticsSummaryResponse = {
  success: boolean;
  data: AnalyticsSummaryData | AnalyticsGroupedSummaryData | null;
  message?: string;
};

export type AnalyticsTopFarmerPoint = {
  name: string;
  value: number;
};

export type AnalyticsTopFarmersChartData = {
  byCurrentQuantity: AnalyticsTopFarmerPoint[];
  byInitialQuantity: AnalyticsTopFarmerPoint[];
  byQuantityRemoved: AnalyticsTopFarmerPoint[];
};

export type AnalyticsTopFarmersData = {
  chartData: AnalyticsTopFarmersChartData;
};

export type AnalyticsTopFarmersResponse = {
  success: boolean;
  data: AnalyticsTopFarmersData | null;
  message?: string;
};
