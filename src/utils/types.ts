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
  defaults?: {
    generation?: string;
    rouging?: string;
    tuberType?: string;
    grader?: string;
  };
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
  type: "RECEIPT" | "DELIVERY" | "SHED";
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
  quantityTakenOut?: number; // For shed vouchers
  quantityRejected?: number; // For shed vouchers
  quantityRestored?: number; // For shed vouchers
  currentQuantity?: number; // For shed vouchers
  location?: string; // Location for each bag size
  approxWeight?: number; // Approximate weight for each bag size
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
  farmerId: Farmer | null;
  gatePass: Voucher;
  generation?: string | null;
  rouging?: string | null;
  tuberType?: string | null;
  grader?: string | null;
  weighedStatus?: boolean | null;
  approxWeight?: string | null;
  bagType?: string | null;
  dateOfSubmission?: string | null;
  dateOfExtraction?: string;
  fulfilled?: boolean;
  remarks?: string | null;
  currentStockAtThatTime: number;
  orderDetails: OrderDetails[] | null;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  isNullVoucher?: boolean;
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

// Shed Voucher Types
export interface ShedVoucherIncomingBagSize {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  location: string;
  approxWeight: number;
  _id: string;
}

export interface ShedVoucherIncomingOrder {
  _id: string;
  gatePass: {
    type: "RECEIPT";
    gatePassNumber: number;
  };
  incomingBagSizes: ShedVoucherIncomingBagSize[];
}

export interface ShedVoucherBagSize {
  size: string;
  quantityTakenOut: number;
  quantityRejected: number;
  quantityRestored: number;
  currentQuantity: number;
  location: string;
  approxWeight: number;
}

export interface ShedOrderDetail {
  variety: string;
  incomingOrder: ShedVoucherIncomingOrder;
  bagSizes: ShedVoucherBagSize[];
}

export interface ShedVoucher {
  _id: string;
  gatePass: {
    type: "SHED";
    gatePassNumber: number;
  };
  coldStorageId: string;
  farmerId: string;
  dateOfExtraction: string;
  remarks: string;
  currentStockAtThatTime: number;
  orderDetails: ShedOrderDetail[];
  status: string;
  isNullVoucher: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ShedVoucherListResponse {
  status: string;
  data: ShedVoucher[];
}

// Bag Size Selection for forms
export interface BagSizeSelection {
  receiptNumber: number;
  bagSize: string;
  selectedQuantity: number;
  maxQuantity: number;
}

// Form Data Types
export interface FormData {
  farmerName: string;
  farmerId: string;
  variety: string[];
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  approxWeight: string;
  bagType: string;
  remarks: string;
}

// API Error Type
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
