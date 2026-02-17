export type Plan = 'Premium' | 'Enterprise';

export interface ColdStorage {
  _id: string;

  name: string;
  address: string;
  mobileNumber: string;
  capacity: number;
  imageUrl?: string;

  isPaid: boolean;
  isActive: boolean;
  plan: Plan;

  createdAt: string; // ISO date from API
  updatedAt: string;

  preferencesId?: string;
}
