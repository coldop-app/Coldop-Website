import type { LedgerType } from '@/features/finances/types';

export type AccountCategoryMap = {
  readonly [subType: string]: readonly string[];
};

export type ChartOfAccounts = {
  readonly [key in LedgerType]: AccountCategoryMap;
};

/**
 * Ledger options aligned with balance-sheet and trading/P&L calculations.
 */
export const LEDGER_OPTIONS = {
  Asset: {
    'Fixed Assets': ['Land', 'Building', 'Machinery', 'Vehicle', 'Furniture', 'Computer'],
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
      'Other Current Liabilities',
    ],
    'Non Current Liabilities': ['Bank Loan', 'Other Non Current Liabilities'],
  },
  Income: {
    'Operating Income': ['Sales'],
    'Non-Operating Income': ['Interest Income', 'Rental Income', 'Other Income'],
  },
  Expense: {
    'Direct Expenses': ['Purchases', 'Freight', 'Packaging'],
    'Indirect Expenses': ['Utilities', 'Salary', 'Supplies', 'Other Indirect'],
    'Financial Expenses': ['Bank Charges', 'Loan Interest'],
  },
  Equity: {
    Capital: ['Owner Capital', 'Partner Capital'],
    Reserves: ['Retained Earnings'],
    Drawings: ['Owner Drawings'],
  },
} as const satisfies ChartOfAccounts;

export const LEDGER_TYPES = Object.keys(LEDGER_OPTIONS) as LedgerType[];

export function getSubTypesForType(type: LedgerType | string): string[] {
  if (!type || !(type in LEDGER_OPTIONS)) {
    return [];
  }

  return Object.keys(LEDGER_OPTIONS[type as LedgerType]);
}

export function getCategoriesForTypeSubType(type: LedgerType | string, subType: string): string[] {
  if (!type || !subType || !(type in LEDGER_OPTIONS)) {
    return [];
  }

  const typeOptions = LEDGER_OPTIONS[type as LedgerType] as AccountCategoryMap;

  return subType in typeOptions ? [...typeOptions[subType]] : [];
}
