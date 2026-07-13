import { z } from 'zod';

import {
  DEFAULT_FINANCES_PERIOD,
  PERIOD_FILTER_VALUES,
  type PeriodFilter,
} from '@/features/finances/shared/constants';

export const FINANCES_TAB_VALUES = [
  'vouchers',
  'ledgers',
  'financial-statements',
  'closing-balances',
] as const;

export const financesTabSchema = z.enum(FINANCES_TAB_VALUES);

export const financesPeriodSchema = z.enum(PERIOD_FILTER_VALUES);

export const financesSearchSchema = z.object({
  tab: financesTabSchema.catch('vouchers'),
  period: financesPeriodSchema.catch(DEFAULT_FINANCES_PERIOD),
});

export type FinancesTab = z.infer<typeof financesTabSchema>;
export type FinancesPeriod = PeriodFilter;

export const ledgerStatementSearchSchema = z.object({
  period: financesPeriodSchema.catch(DEFAULT_FINANCES_PERIOD),
  from: z.literal('people').optional().catch(undefined),
  farmerId: z.string().optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  mobileNumber: z.string().optional().catch(undefined),
  accountNumber: z.coerce.number().optional().catch(undefined),
  address: z.string().optional().catch(undefined),
  costPerBag: z.coerce.number().optional().catch(undefined),
});

export type LedgerStatementSearch = z.infer<typeof ledgerStatementSearchSchema>;

type LedgerStatementPeopleBackTarget = {
  kind: 'people';
  to: '/people/$id';
  params: { id: string };
  search: {
    name?: string;
    mobileNumber?: string;
    accountNumber?: number;
    address?: string;
    costPerBag?: number;
    tab: 'incoming';
  };
  label: 'Back to Farmer';
};

type LedgerStatementFinancesBackTarget = {
  kind: 'finances';
  to: '/finances';
  search: { tab: 'ledgers'; period: PeriodFilter };
  label: 'Back to Ledgers';
};

export type LedgerStatementBackTarget =
  LedgerStatementPeopleBackTarget | LedgerStatementFinancesBackTarget;

export function buildLedgerStatementBackTarget(
  search: LedgerStatementSearch,
  farmerStorageLinkId: string | null | undefined,
  period: PeriodFilter,
): LedgerStatementBackTarget {
  const farmerId = search.farmerId ?? farmerStorageLinkId;

  if (search.from === 'people' && farmerId) {
    return {
      kind: 'people',
      to: '/people/$id',
      params: { id: farmerId },
      search: {
        name: search.name,
        mobileNumber: search.mobileNumber,
        accountNumber: search.accountNumber,
        address: search.address,
        costPerBag: search.costPerBag,
        tab: 'incoming',
      },
      label: 'Back to Farmer',
    };
  }

  return {
    kind: 'finances',
    to: '/finances',
    search: { tab: 'ledgers', period },
    label: 'Back to Ledgers',
  };
}
