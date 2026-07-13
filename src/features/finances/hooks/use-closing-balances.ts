import { useMemo } from 'react';

import { buildClosingBalancesReport } from '@/features/finances/domain/build-closing-balances';
import type { PeriodFilter } from '@/features/finances/shared/constants';

import { useFinancialSourceData } from './use-financial-source-data';

export function useClosingBalances(period: PeriodFilter) {
  const source = useFinancialSourceData(period);

  const report = useMemo(() => {
    if (source.ledgers.length === 0) {
      return null;
    }
    return buildClosingBalancesReport(source.ledgers, source.vouchers);
  }, [source.ledgers, source.vouchers]);

  return {
    report,
    ...source,
  };
}
