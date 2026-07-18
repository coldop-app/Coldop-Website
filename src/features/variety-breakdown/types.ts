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

export type VarietyBreakdownResponse = {
  success: boolean;
  data: VarietyBreakdownData | VarietyBreakdownByFilterData | null;
  message?: string;
};
