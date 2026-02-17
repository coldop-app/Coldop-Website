import type { Preferences } from './preferences';

export type Role = 'Admin' | 'Manager' | 'Staff';

export interface StoreAdmin {
  _id: string;

  coldStorageId: string;

  name: string;
  mobileNumber: string;
  role: Role;
  isVerified: boolean;

  // Security metadata (usually read-only on client)
  failedLoginAttempts: number;
  lockedUntil?: string; // ISO date

  createdAt: string;
  updatedAt: string;
}

// Login input type
export interface StoreAdminLoginInput {
  mobileNumber: string;
  password: string;
}

// API response types for login
export interface StoreAdminLoginData {
  storeAdmin: StoreAdmin & {
    coldStorageId: {
      _id: string;
      name: string;
      address: string;
      mobileNumber: string;
      capacity: number;
      imageUrl: string;
      isPaid: boolean;
      isActive: boolean;
      plan: string;
      createdAt: string;
      updatedAt: string;
      __v?: number;
      /** Populated by API; when present, preferences are nested here */
      preferencesId?: string | Preferences;
    };
  };
  token: string;
}

export interface StoreAdminLoginApiResponse {
  success: boolean;
  data: StoreAdminLoginData | null;
  message: string;
}
