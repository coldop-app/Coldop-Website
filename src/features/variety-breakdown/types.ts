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

export type VarietyBreakdownResponse = {
  success: boolean;
  data: VarietyBreakdownData | null;
  message?: string;
};

export type VarietyBreakdownStockFilter = string;
