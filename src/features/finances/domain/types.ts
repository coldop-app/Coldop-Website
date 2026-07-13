import type { LedgerType } from '@/features/finances/types';

import type { ReportRow } from '@/features/finances/shared/report-types';

export type ReportLedger = {
  id: string;
  name: string;
  type: LedgerType;
  subType: string;
  category: string;
  openingBalance: number;
  farmerStorageLinkId: string | null;
};

export type ReportVoucher = {
  id: string;
  date: string;
  amount: number;
  narration: string;
  debitLedgerId: string;
  creditLedgerId: string;
  debitLedgerName: string;
  creditLedgerName: string;
};

export type NetProfitLossResult = {
  openingStock: number;
  closingStock: number;
  salesTotal: number;
  purchaseTotal: number;
  grossProfit: number;
  indirectIncomesTotal: number;
  indirectExpensesTotal: number;
  netProfitLoss: number;
};

export type BalanceSheetReport = {
  liabilityRows: ReportRow[];
  assetRows: ReportRow[];
  totalLiabilitiesAndEquity: number;
  totalAssets: number;
  isBalanced: boolean;
  netProfitLoss: number;
};

export type TradingPlRow = {
  label: string;
  amount: number;
  highlight: boolean;
  isProfit?: boolean;
};

export type TradingPlReport = {
  openingStock: number;
  closingStock: number;
  purchaseTotal: number;
  salesTotal: number;
  grossProfit: number;
  netProfitLoss: number;
  pnlDebit: TradingPlRow[];
  pnlCredit: TradingPlRow[];
  tradingDebitTotal: number;
  tradingCreditTotal: number;
  debitTotal: number;
  creditTotal: number;
};

export type CategoryGroup = {
  type: LedgerType;
  category: string;
  subType: string;
  ledgers: Array<{ id: string; name: string; balance: number }>;
  total: number;
};

export type ClosingBalancesReport = {
  groupedByType: Partial<Record<LedgerType, CategoryGroup[]>>;
  netProfitLoss: number;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
};

export type LedgerStatementEntry = {
  id: string;
  date: string;
  amount: number;
  narration: string;
  counterpartyName: string;
  isDebit: boolean;
  entryType: 'D' | 'C';
  runningBalance: number;
};

export type LedgerStatementReport = {
  ledger: ReportLedger;
  openingBalance: number;
  hasOpeningBalance: boolean;
  entries: LedgerStatementEntry[];
  closingBalance: number;
  isDebitBalance: boolean;
  hasNoData: boolean;
};
