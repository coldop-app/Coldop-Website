import { BALANCE_EPSILON, ASSET_SUBTYPE_ORDER } from '@/features/finances/shared/constants';
import type { ReportRow } from '@/features/finances/shared/report-types';

import { computeLedgerBalances } from './compute-ledger-balances';
import { computeNetProfitLoss } from './compute-net-profit-loss';
import type { BalanceSheetReport, ReportLedger, ReportVoucher } from './types';

function addCategoryTotal(
  categories: Array<{ subType: string; category: string; total: number }>,
  ledger: ReportLedger,
  balance: number,
) {
  const existing = categories.find(
    (item) => item.subType === ledger.subType && item.category === ledger.category,
  );
  if (existing) {
    existing.total += balance;
    return;
  }
  categories.push({
    subType: ledger.subType,
    category: ledger.category,
    total: balance,
  });
}

export function buildBalanceSheetReport(
  ledgers: ReportLedger[],
  vouchers: ReportVoucher[],
  options?: { epsilon?: number },
): BalanceSheetReport {
  const epsilon = options?.epsilon ?? BALANCE_EPSILON;
  const liabilityRows: ReportRow[] = [];
  const assetRows: ReportRow[] = [];

  const balanceMap = computeLedgerBalances(ledgers, vouchers);
  const getBalance = (ledger: ReportLedger) => balanceMap.get(ledger.id) ?? 0;
  const { netProfitLoss } = computeNetProfitLoss(ledgers, balanceMap);

  const equityLedgers = ledgers.filter((ledger) => ledger.type === 'Equity');
  const liabilityLedgers = ledgers.filter((ledger) => ledger.type === 'Liability');
  const assetLedgers = ledgers.filter((ledger) => ledger.type === 'Asset');

  const liabilitySubTypes: Record<string, number> = {};
  const liabilityCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];

  for (const ledger of liabilityLedgers) {
    const balance = getBalance(ledger);
    liabilitySubTypes[ledger.subType] = (liabilitySubTypes[ledger.subType] ?? 0) + balance;
    addCategoryTotal(liabilityCategories, ledger, balance);
  }

  const assetSubTypes: Record<string, number> = {};
  const assetCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];

  for (const ledger of assetLedgers) {
    const balance = getBalance(ledger);
    assetSubTypes[ledger.subType] = (assetSubTypes[ledger.subType] ?? 0) + balance;
    addCategoryTotal(assetCategories, ledger, balance);
  }

  if (equityLedgers.length > 0) {
    liabilityRows.push({
      label: 'CAPITAL',
      amount: null,
      isHeader: true,
    });

    for (const ledger of equityLedgers) {
      const capitalAdditions = vouchers
        .filter((voucher) => voucher.creditLedgerId === ledger.id)
        .reduce((sum, voucher) => sum + voucher.amount, 0);
      const capitalDeletions = vouchers
        .filter((voucher) => voucher.debitLedgerId === ledger.id)
        .reduce((sum, voucher) => sum + voucher.amount, 0);

      liabilityRows.push({
        label: `${ledger.name} - Opening Balance`,
        amount: ledger.openingBalance ?? 0,
      });

      if (capitalAdditions > 0 || capitalDeletions > 0) {
        const netMovement = capitalAdditions - capitalDeletions;
        if (netMovement !== 0) {
          liabilityRows.push({
            label: `${ledger.name} - ${netMovement > 0 ? 'Add: Capital Introduced' : 'Less: Capital Withdrawn'}`,
            amount: Math.abs(netMovement),
          });
        } else {
          if (capitalAdditions > 0) {
            liabilityRows.push({
              label: `${ledger.name} - Add: Capital Introduced`,
              amount: capitalAdditions,
            });
          }
          if (capitalDeletions > 0) {
            liabilityRows.push({
              label: `${ledger.name} - Less: Capital Withdrawn`,
              amount: capitalDeletions,
            });
          }
        }
      }
    }

    if (netProfitLoss !== 0) {
      liabilityRows.push({
        label: netProfitLoss > 0 ? 'Add: Profit' : 'Less: Loss',
        amount: Math.abs(netProfitLoss),
        isProfit: netProfitLoss > 0,
      });
    }

    const totalCapital =
      equityLedgers.reduce((sum, ledger) => sum + getBalance(ledger), 0) + netProfitLoss;

    liabilityRows.push({
      label: 'Total Capital',
      amount: totalCapital,
      isTotal: true,
    });
  }

  for (const [subType, total] of Object.entries(liabilitySubTypes)) {
    liabilityRows.push({
      label: subType.toUpperCase(),
      amount: null,
      isHeader: true,
    });
    for (const category of liabilityCategories.filter((item) => item.subType === subType)) {
      liabilityRows.push({ label: category.category, amount: category.total });
    }
    liabilityRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  }

  const sortedAssetSubTypes = Object.entries(assetSubTypes).sort(([subTypeA], [subTypeB]) => {
    const indexA = ASSET_SUBTYPE_ORDER.indexOf(subTypeA as (typeof ASSET_SUBTYPE_ORDER)[number]);
    const indexB = ASSET_SUBTYPE_ORDER.indexOf(subTypeB as (typeof ASSET_SUBTYPE_ORDER)[number]);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  for (const [subType, total] of sortedAssetSubTypes) {
    assetRows.push({
      label: subType.toUpperCase(),
      amount: null,
      isHeader: true,
    });
    for (const category of assetCategories.filter((item) => item.subType === subType)) {
      assetRows.push({ label: category.category, amount: category.total });
    }
    assetRows.push({
      label: `Total ${subType}`,
      amount: total,
      isTotal: true,
    });
  }

  const totalEquity = equityLedgers.reduce((sum, ledger) => sum + getBalance(ledger), 0);
  const totalLiabilities = Object.values(liabilitySubTypes).reduce((sum, total) => sum + total, 0);
  const totalAssets = Object.values(assetSubTypes).reduce((sum, total) => sum + total, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfitLoss;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < epsilon;

  return {
    liabilityRows,
    assetRows,
    totalLiabilitiesAndEquity,
    totalAssets,
    isBalanced,
    netProfitLoss,
  };
}
