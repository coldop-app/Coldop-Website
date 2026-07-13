export type Farmer = {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type FarmerStorageLink = {
  _id: string;
  farmerId?: string;
  coldStorageId?: string;
  linkedById?: string;
  accountNumber: number;
  name: string;
  address: string;
  mobileNumber: string;
  isActive: boolean;
  costPerBag: number;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerStorageLinksResponse = {
  success: boolean;
  data: FarmerStorageLink[] | null;
};

export type QuickRegisterFarmerPayload = {
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  accountNumber?: number;
  openingBalance?: number;
  costPerBag?: number;
};

export type QuickRegisterFarmerData = {
  farmer: Farmer;
  farmerStorageLink: FarmerStorageLink;
};

export type QuickRegisterFarmerResponse = {
  success: boolean;
  message?: string;
  data: QuickRegisterFarmerData | null;
};

export type UpdateFarmerStorageLinkPayload = {
  name?: string;
  address?: string;
  mobileNumber?: string;
  accountNumber?: number;
  costPerBag?: number;
  openingBalance?: number;
};

export type UpdateFarmerStorageLinkResponse = {
  success: boolean;
  message?: string;
  data: QuickRegisterFarmerData | null;
};
