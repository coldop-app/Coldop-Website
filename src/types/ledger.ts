/* =======================
   ENUM
======================= */

export type LedgerType =
  | 'Asset'
  | 'Liability'
  | 'Income'
  | 'Expense'
  | 'Equity';

/* =======================
   API / FRONTEND TYPE
======================= */
export interface Ledger {
  _id: string;
  name: string;
  type: LedgerType;
  subType: string;
  category: string;
  openingBalance: number;
  balance: number;
  closingBalance: number | null;
  coldStorageId: string;
  farmerStorageLinkId?: string | null;
  createdBy: string;
  isSystemLedger: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
}
