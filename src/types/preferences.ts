/**
 * Preferences types matching the backend Mongoose model.
 * Contains commodity configuration, report format,
 * finance visibility flag, and extensible custom fields.
 */

export interface CommodityObj {
  name: string;
  varieties: string[];
  sizes: string[];
}

export interface Preferences {
  _id?: string;

  commodities: CommodityObj[];

  /** Report format identifier (e.g. "pdf", "excel", "default") */
  reportFormat: string;

  /** Whether financial data should be visible */
  showFinances: boolean;

  /** Labour cost (number) */
  labourCost: number;

  /** Custom, user-defined fields for future customisations */
  customFields?: Record<string, unknown>;

  createdAt: string; // ISO date from API
  updatedAt: string;
}
