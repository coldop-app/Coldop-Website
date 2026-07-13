import { BALANCE_EPSILON } from '@/features/finances/shared/constants';
import type { LedgerType } from '@/features/finances/types';

import { computeLedgerBalances } from './compute-ledger-balances';
import { computeNetProfitLoss } from './compute-net-profit-loss';
import type { CategoryGroup, ClosingBalancesReport, ReportLedger, ReportVoucher } from './types';

export function buildClosingBalancesReport(
  ledgers: ReportLedger[],
  vouchers: ReportVoucher[],
  options?: { epsilon?: number },
): ClosingBalancesReport | null {
  if (ledgers.length === 0) {
    return null;
  }

  const epsilon = options?.epsilon ?? BALANCE_EPSILON;
  const balanceMap = computeLedgerBalances(ledgers, vouchers);
  const getBalance = (ledger: ReportLedger) => balanceMap.get(ledger.id) ?? 0;
  const { netProfitLoss } = computeNetProfitLoss(ledgers, balanceMap);

  const categoryGroups: Record<string, CategoryGroup> = {};

  for (const ledger of ledgers) {
    const key = `${ledger.type}::${ledger.category}`;
    if (!categoryGroups[key]) {
      categoryGroups[key] = {
        type: ledger.type,
        category: ledger.category,
        subType: ledger.subType,
        ledgers: [],
        total: 0,
      };
    }
    const balance = getBalance(ledger);
    categoryGroups[key].ledgers.push({
      id: ledger.id,
      name: ledger.name,
      balance,
    });
    categoryGroups[key].total += balance;
  }

  const groupedByType: Partial<Record<LedgerType, CategoryGroup[]>> = {};
  for (const group of Object.values(categoryGroups)) {
    if (!groupedByType[group.type]) {
      groupedByType[group.type] = [];
    }
    groupedByType[group.type]!.push(group);
  }

  const totalAssets = ledgers
    .filter((ledger) => ledger.type === 'Asset')
    .reduce((sum, ledger) => sum + getBalance(ledger), 0);

  const totalLiabilitiesAndEquity =
    ledgers
      .filter((ledger) => ledger.type === 'Liability')
      .reduce((sum, ledger) => sum + getBalance(ledger), 0) +
    ledgers
      .filter((ledger) => ledger.type === 'Equity')
      .reduce((sum, ledger) => sum + getBalance(ledger), 0) +
    netProfitLoss;

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < epsilon;

  return {
    groupedByType,
    netProfitLoss,
    totalAssets,
    totalLiabilitiesAndEquity,
    isBalanced,
  };
}
