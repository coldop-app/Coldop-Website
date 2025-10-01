export interface Admin {
  _id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  token: string;
  __v: number;
}

export interface ColdStorageDetails {
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity?: number;
}

export interface Preferences {
  bagSizes: string[];
}

export interface StoreAdmin {
  _id: string;
  name: string;
  personalAddress: string;
  mobileNumber: string;
  imageUrl: string;
  password: string;
  coldStorageDetails: ColdStorageDetails;
  coldStorageId: string;
  token: string;
  registeredFarmers: string[]; // Array of Farmer IDs
  role: string;
  isVerified: boolean;
  storeAdminId: number;
  isActive: boolean;
  isPaid: boolean;
  preferences: Preferences;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
}

export interface Voucher {
  type: "RECEIPT" | "DELIVERY";
  gatePassNumber: number;
}

export interface BagSizeQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

export interface BagSize {
  size: string;
  quantity?: BagSizeQuantity;
  quantityRemoved?: number;
  location?: string; // Location for each bag size
}

export interface IncomingBagSize {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  _id: string;
}

export interface IncomingOrder {
  _id: string;
  location: string;
  gatePass: Voucher;
  incomingBagSizes: IncomingBagSize[];
}

export interface OrderDetails {
  variety: string;
  bagSizes: BagSize[];
  location?: string;
  incomingOrder?: IncomingOrder;
}

export interface Order {
  _id: string;
  coldStorageId: string;
  farmerId: Farmer;
  gatePass: Voucher;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  dateOfSubmission?: string;
  dateOfExtraction?: string;
  fulfilled?: boolean;
  remarks: string;
  currentStockAtThatTime: number;
  orderDetails: OrderDetails[];
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface OutgoingBagSize {
  size: string;
  quantityRemoved: number;
}

export interface IncomingOrderReference {
  _id: string;
  location: string;
  gatePass: {
    type: string;
    gatePassNumber: number;
  };
  incomingBagSizes: IncomingBagSize[];
}

export interface OutgoingOrderDetails {
  variety: string;
  incomingOrder: IncomingOrderReference;
  bagSizes: OutgoingBagSize[];
}

export interface OutgoingOrder {
  _id: string;
  coldStorageId: string; // Reference to StoreAdmin
  farmerId: string; // Reference to Farmer
  gatePass: {
    type: string;
    gatePassNumber: number;
  };
  dateOfExtraction: string;
  remarks?: string;
  orderDetails: OutgoingOrderDetails[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// New types for Custom Analytics API response
export interface StockSummarySize {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
}

export interface StockSummaryVariety {
  variety: string;
  sizes: StockSummarySize[];
}

export interface OrderCounts {
  totalIncomingOrders: number;
  totalOutgoingOrders: number;
  totalOrders: number;
}

export interface Distributions {
  varietyDistribution: Record<string, number>;
  generationDistribution: Record<string, number>;
  rougingDistribution: Record<string, number>;
  graderDistribution: Record<string, number>;
  bagSizeDistribution: Record<string, number>;
  tuberTypeDistribution: Record<string, number>;
  bagTypeDistribution: Record<string, number>;
  varietyAnalysis: {
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  generationAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  rougingAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  graderAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
  };
  bagSizeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  tuberTypeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  bagTypeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  summary: {
    totalOrders: number;
    totalOutgoingOrders: number;
    uniqueVarieties: number;
    uniqueGenerations: number;
    uniqueRougings: number;
    uniqueGraders: number;
    uniqueBagSizes: number;
    uniqueTuberTypes: number;
    uniqueBagTypes: number;
  };
}

export interface CustomAnalyticsData {
  stockSummary: StockSummaryVariety[];
  totals: {
    totalBags: number;
    totalCurrentBags: number;
    totalRemovedBags: number;
  };
  orderCounts: OrderCounts;
  distributions: Distributions;
  filters: {
    variety?: string;
    generation?: string;
    rouging?: string;
    tuberType?: string;
    grader?: string;
    weighedStatus?: string;
    bagType?: string;
    bagSizeCategory?: string;
  };
}
