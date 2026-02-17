export interface Farmer {
  _id: string;

  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;

  createdAt: string;
  updatedAt: string;
}

/** Farmer as returned inside a farmer-storage-link (may omit some fields) */
export interface FarmerStorageLinkFarmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
}

/** Single farmer–cold-storage link from GET /store-admin/farmer-storage-links */
export interface FarmerStorageLink {
  _id: string;
  farmerId: FarmerStorageLinkFarmer;
  coldStorageId: string;
  accountNumber: number;
  costPerBag: number;
  isActive: boolean;
  notes?: string;
}

/** Request body for POST /store-admin/quick-register-farmer */
export interface QuickRegisterFarmerInput {
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  coldStorageId: string;
  linkedById: string;
  accountNumber: number;
  costPerBag: number;
  openingBalance: number;
}

/** Farmer as returned in quick-register-farmer response */
export interface QuickRegisterFarmerResponseFarmer {
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Farmer-storage link as returned in quick-register-farmer response (IDs only) */
export interface QuickRegisterFarmerResponseLink {
  farmerId: string;
  coldStorageId: string;
  linkedById: string;
  accountNumber: number;
  isActive: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for POST /store-admin/quick-register-farmer */
export interface QuickRegisterFarmerApiResponse {
  success: boolean;
  data: {
    farmer: QuickRegisterFarmerResponseFarmer;
    farmerStorageLink: QuickRegisterFarmerResponseLink;
  };
  message: string;
}

/** Request body for PUT /store-admin/farmer-storage-link/:id (all fields optional) */
export interface UpdateFarmerStorageLinkInput {
  name?: string;
  address?: string;
  mobileNumber?: string;
  imageUrl?: string;
  accountNumber?: number;
  isActive?: boolean;
  notes?: string;
  linkedById?: string;
  openingBalance?: number;
  costPerBag?: number;
}

/** Farmer as returned in update farmer-storage-link response */
export interface UpdateFarmerStorageLinkResponseFarmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** Farmer-storage link as returned in update response (farmerId populated) */
export interface UpdateFarmerStorageLinkResponseLink {
  _id: string;
  farmerId: UpdateFarmerStorageLinkResponseFarmer;
  coldStorageId: string;
  linkedById: string;
  accountNumber: number;
  isActive: boolean;
  costPerBag?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for PUT /store-admin/farmer-storage-link/:id */
export interface UpdateFarmerStorageLinkApiResponse {
  success: boolean;
  data: {
    farmer: UpdateFarmerStorageLinkResponseFarmer;
    farmerStorageLink: UpdateFarmerStorageLinkResponseLink;
  };
  message: string;
}
