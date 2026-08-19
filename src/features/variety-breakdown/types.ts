export type VarietyBreakdownFarmer = {
  farmerName: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
};

export type VarietyBreakdownSize = {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  farmerBreakdown: VarietyBreakdownFarmer[];
};

export type VarietyBreakdownData = {
  variety: string;
  sizes: VarietyBreakdownSize[];
};

export type VarietyBreakdownByFilterData = {
  varietyBreakdownByFilter: Record<string, VarietyBreakdownData>;
};

export type VarietyBreakdownByGenerationData = {
  varietyBreakdownByGeneration: Record<string, VarietyBreakdownData>;
};

export type VarietyBreakdownByFilterAndGenerationData = {
  varietyBreakdownByFilterAndGeneration: Record<string, Record<string, VarietyBreakdownData>>;
};

export type VarietyBreakdownGroupedData =
  | VarietyBreakdownByFilterData
  | VarietyBreakdownByGenerationData
  | VarietyBreakdownByFilterAndGenerationData;

export type VarietyBreakdownResponse = {
  success: boolean;
  data: VarietyBreakdownData | VarietyBreakdownGroupedData | null;
  message?: string;
};
