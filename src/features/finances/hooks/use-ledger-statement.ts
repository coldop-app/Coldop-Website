import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchLedgersApi } from '@/features/finances/api/use-ledgers';
import { fetchVouchersApi } from '@/features/finances/api/use-vouchers';
import { buildLedgerStatement } from '@/features/finances/domain/build-ledger-statement';
import type { PeriodFilter } from '@/features/finances/shared/constants';
import { periodToApiFilters } from '@/features/finances/hooks/use-report-date-range';
import { toReportLedgers, toReportVouchers } from '@/features/finances/utils/to-report-models';

function ledgerStatementQueryKey(ledgerId: string, period: PeriodFilter) {
  return ['finances', 'ledger-statement', ledgerId, period] as const;
}

export function useLedgerStatement(ledgerId: string, period: PeriodFilter) {
  const filters = useMemo(() => periodToApiFilters(period), [period]);

  const query = useQuery({
    queryKey: ledgerStatementQueryKey(ledgerId, period),
    queryFn: async () => {
      const [ledgers, vouchers] = await Promise.all([
        fetchLedgersApi(filters),
        fetchVouchersApi(filters),
      ]);
      return {
        ledgers: toReportLedgers(ledgers),
        vouchers: toReportVouchers(vouchers),
      };
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(ledgerId),
  });

  const report = useMemo(() => {
    if (!query.data) {
      return null;
    }
    return buildLedgerStatement(ledgerId, query.data.ledgers, query.data.vouchers);
  }, [ledgerId, query.data]);

  return {
    report,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
