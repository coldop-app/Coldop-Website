import { useMemo } from 'react';

import { buildBalanceSheetReport } from '@/features/finances/domain/build-balance-sheet';
import type { PeriodFilter } from '@/features/finances/shared/constants';

import { useFinancialSourceData } from './use-financial-source-data';

export function useBalanceSheet(period: PeriodFilter) {
  const source = useFinancialSourceData(period);

  const report = useMemo(() => {
    if (source.ledgers.length === 0) {
      return null;
    }
    return buildBalanceSheetReport(source.ledgers, source.vouchers);
  }, [source.ledgers, source.vouchers]);

  return {
    report,
    ...source,
  };
}
