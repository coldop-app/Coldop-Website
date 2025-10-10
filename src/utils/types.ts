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
