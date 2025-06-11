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
}

export interface Voucher {
  type: 'RECEIPT' | 'DELIVERY';
  voucherNumber: number;
}

export interface BagSizeQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

export interface BagSize {
  size: string;
  quantity?: BagSizeQuantity;
  quantityRemoved?: number;
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
  voucher: Voucher;
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
  voucher: Voucher;
  dateOfSubmission?: string;
  dateOfExtraction?: string;
  fulfilled?: boolean;
  remarks: string;
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