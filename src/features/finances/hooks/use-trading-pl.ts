import { useMemo } from 'react';

import { buildTradingPlReport } from '@/features/finances/domain/build-trading-pl';
import type { ReportLedger, ReportVoucher } from '@/features/finances/domain/types';

export function useTradingPl(ledgers: ReportLedger[], vouchers: ReportVoucher[]) {
  const report = useMemo(() => {
    return buildTradingPlReport(ledgers, vouchers);
  }, [ledgers, vouchers]);

  return { report };
}
