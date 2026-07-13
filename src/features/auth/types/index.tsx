export interface LoginCredentials {
  mobileNumber: string;
  password: string;
}

export type Role = 'Admin' | 'Manager' | 'Staff';

export interface CommodityPreference {
  name: string;
  varieties: string[];
  sizes: string[];
}

export interface StockFilterPreference {
  enabled: boolean;
  options: string[];
}

export interface Preferences {
  _id: string;
  commodities: CommodityPreference[];
  reportFormat: string;
  showFinances: boolean;
  showViewFilters?: boolean;
  labourCost: number;
  stockFilter?: StockFilterPreference;
  customMarka?: boolean;
  markaType?: string;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Chamber {
  name: string;
  capacity: number;
}

export interface StorageLayoutFloor {
  _id?: string;
  name: string;
  capacity: number;
}

export interface StorageLayoutChamber {
  _id?: string;
  name: string;
  floors: StorageLayoutFloor[];
}

export interface ColdStorage {
  _id: string;
  preferencesId: string;
  name: string;
  address: string;
  mobileNumber: string;
  capacity: number;
  chambers?: Chamber[];
  storageLayout?: StorageLayoutChamber[];
  imageUrl: string;
  isPaid: boolean;
  isActive: boolean;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColdStoragePopulated extends Omit<ColdStorage, 'preferencesId'> {
  preferencesId: Preferences;
}

export interface StoreAdmin {
  _id: string;
  coldStorageId: string;
  name: string;
  mobileNumber: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreAdminPopulated extends Omit<StoreAdmin, 'coldStorageId'> {
  coldStorageId: ColdStoragePopulated;
}

/** @deprecated Use StoreAdmin */
export type AuthUser = StoreAdmin;

export interface LoginResponseData {
  storeAdmin: StoreAdminPopulated;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: LoginResponseData | null;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  data: null;
  message: string;
}
