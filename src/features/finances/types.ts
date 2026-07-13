export type VoucherLedgerRef = {
  _id: string;
  name: string;
};

export type VoucherLedgerField = VoucherLedgerRef | string;

export type VoucherApiRecord = {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: VoucherLedgerField;
  creditLedger: VoucherLedgerField;
  amount: number;
  narration: string;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type VouchersResponse = {
  success: boolean;
  data: VoucherApiRecord[] | null;
};

export type CreateVoucherPayload = {
  date: string;
  debitLedger: string;
  creditLedger: string;
  amount: number;
  narration?: string;
};

export type CreateVoucherResponse = {
  success: boolean;
  message?: string;
  data: VoucherApiRecord | null;
};

export type UpdateVoucherPayload = {
  date?: string;
  debitLedger?: string;
  creditLedger?: string;
  amount?: number;
  narration?: string;
};

export type UpdateVoucherResponse = {
  success: boolean;
  message?: string;
  data: VoucherApiRecord | null;
};

export type DeleteVoucherResponse = {
  success: boolean;
  message?: string;
};

export type VoucherFilters = {
  from?: string;
  to?: string;
  ledgerId?: string;
};

export type LedgerType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

export type LedgerApiRecord = {
  _id: string;
  name: string;
  type: LedgerType;
  subType: string;
  category: string;
  openingBalance: number;
  balance: number;
  closingBalance: number | null;
  coldStorageId: string;
  farmerStorageLinkId: string | null;
  createdBy: string;
  isSystemLedger: boolean;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
};

export type LedgersResponse = {
  success: boolean;
  data: LedgerApiRecord[] | null;
};

export type CreateLedgerPayload = {
  name: string;
  type: LedgerType;
  subType: string;
  category: string;
  openingBalance?: number;
  farmerStorageLinkId?: string | null;
};

export type CreateLedgerResponse = {
  success: boolean;
  message?: string;
  data: LedgerApiRecord | null;
};

export type UpdateLedgerPayload = {
  name?: string;
  type?: LedgerType;
  subType?: string;
  category?: string;
  openingBalance?: number;
  closingBalance?: number | null;
};

export type UpdateLedgerResponse = {
  success: boolean;
  message?: string;
  data: LedgerApiRecord | null;
};

export type DeleteLedgerResponse = {
  success: boolean;
  message?: string;
};

export type LedgerFilters = {
  type?: LedgerType;
  search?: string;
  farmerStorageLinkId?: string;
  from?: string;
  to?: string;
};
