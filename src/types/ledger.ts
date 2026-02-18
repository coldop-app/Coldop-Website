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
   TYPES
======================= */

export type AccountCategoryMap = {
  readonly [subType: string]: readonly string[];
};

export type ChartOfAccounts = {
  readonly [key in LedgerType]: AccountCategoryMap;
};

/* =======================
   DATA
======================= */

export const chartOfAccounts: ChartOfAccounts = {
  Asset: {
    'Fixed Assets': [
      'Property',
      'Plant',
      'Equipment',
      'Furniture',
      'Vehicles',
    ],
    'Current Assets': [
      'Cash',
      'Bank Accounts',
      'Cash Equivalents',
      'Stock in Hand',
      'Debtors',
      'Prepaid Expenses',
      'Other Current Assets',
    ],
  },

  Liability: {
    'Current Liabilities': [
      'Creditors',
      'Short-term Loans',
      'Outstanding Expenses',
    ],
    'Long-term Liabilities': ['Long-term Loans', 'Deferred Revenue'],
  },

  Income: {
    'Operating Income': ['Sales', 'Service Revenue', 'Rental Income'],
    'Non-Operating Income': [
      'Interest Received',
      'Dividends',
      'Other Income',
    ],
  },

  Expense: {
    'Direct Expenses': ['Purchases'],
    'Operating Expenses': [
      'Rent',
      'Salaries',
      'Utilities',
      'Supplies',
      'Depreciation',
    ],
    'Non-Operating Expenses': [
      'Interest Expense',
      'Loss on Sale',
      'Miscellaneous',
    ],
    'Other Expense': ['Discount'],
  },

  Equity: {
    'Capital & Reserves': [
      'Capital',
      'Reserves & Surplus',
      'Retained Earnings',
    ],
  },
} as const;

/**
 * Ledger options aligned with balance-sheet and trading/P&L calculations:
 * - Assets: subTypes "Fixed Assets" and "Current Assets" (balance-sheet order).
 *   "Stock in Hand" under Current Assets uses closingBalance when defined.
 * - Expenses: subType "Direct Expenses" and category "Purchases" are used for
 *   trading (Opening Stock + Purchases vs Sales + Closing Stock); all other
 *   expenses are indirect for P&L.
 * - Income: categories whose name includes "sale" are treated as sales for
 *   gross profit; others are other income for P&L.
 */
export const LEDGER_OPTIONS = {
  Asset: {
    'Fixed Assets': [
      'Land',
      'Building',
      'Machinery',
      'Vehicle',
      'Furniture',
      'Computer',
    ],
    'Current Assets': [
      'Cash',
      'Bank Accounts',
      'Debtors',
      'Stock in Hand',
      'Prepaid Expenses',
      'Other Current Assets',
    ],
  },
  Liability: {
    'Current Liabilities': [
      'Creditors',
      'Short-term Loan',
      'Outstanding Expenses',
      'Other Current Liabilities'
    ],
    'Non Current Liabilities': ['Bank Loan', 'Other Non Current Liabilities'],
  },
  Income: {
    'Operating Income': [
      'Sales',
    ],
    'Non-Operating Income': [
      'Interest Income',
      'Rental Income',
      'Other Income',
    ],
  },
  Expense: {
    'Direct Expenses': ['Purchases', 'Freight', 'Packaging'],
    'Indirect Expenses': [
      'Utilities',
      'Salary',
      'Supplies',
      'Other Indirect',
    ],
    'Financial Expenses': ['Bank Charges', 'Loan Interest'],
  },
  Equity: {
    Capital: ['Owner Capital', 'Partner Capital'],
    Reserves: ['Retained Earnings'],
    Drawings: ['Owner Drawings'],
  },
} as const;

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
