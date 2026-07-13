import type {
  CommodityPreference,
  Preferences,
  StockFilterPreference,
} from '@/features/auth/types';

export type UpdatePreferencesPayload = {
  commodities?: CommodityPreference[];
  reportFormat?: string;
  showFinances?: boolean;
  labourCost?: number;
  stockFilter?: StockFilterPreference;
  customMarka?: boolean;
  markaType?: string;
  customFields?: Record<string, unknown>;
};

export interface UpdatePreferencesResponse {
  success: boolean;
  message: string;
  data: Preferences | null;
}
