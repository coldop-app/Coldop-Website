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

export interface BagSizeQuantity {
  size: string;
  quantity: {
    initialQuantity: number;
    currentQuantity: number;
  };
}

export interface OrderDetails {
  variety: string;
  bagSizes: BagSizeQuantity[];
  location: string;
}

export type VoucherType = 'RECEIPT' | 'DELIVERY' | 'RESTORE';

export interface Voucher {
  type: VoucherType;
  voucherNumber: number;
}

export interface Order {
  _id: string;
  coldStorageId: string; // Reference to StoreAdmin
  farmerId: string; // Reference to Farmer
  voucher: Voucher;
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks?: string;
  currentStockAtThatTime: number;
  orderDetails: OrderDetails[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OutgoingBagSize {
  size: string;
  quantityRemoved: number;
}

export interface IncomingBagSize {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
}

export interface IncomingOrderReference {
  _id: string;
  location: string;
  voucher: {
    type: string;
    voucherNumber: number;
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
  voucher: {
    type: string;
    voucherNumber: number;
  };
  dateOfExtraction: string;
  remarks?: string;
  orderDetails: OutgoingOrderDetails[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}