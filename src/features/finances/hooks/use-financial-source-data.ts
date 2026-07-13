import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchLedgersApi } from '@/features/finances/api/use-ledgers';
import { fetchVouchersApi } from '@/features/finances/api/use-vouchers';
import type { PeriodFilter } from '@/features/finances/shared/constants';
import { periodToApiFilters } from '@/features/finances/hooks/use-report-date-range';
import { toReportLedgers, toReportVouchers } from '@/features/finances/utils/to-report-models';

const FINANCIAL_SOURCE_QUERY_KEY = ['finances', 'source-data'] as const;

function financialSourceQueryKey(period: PeriodFilter) {
  return [...FINANCIAL_SOURCE_QUERY_KEY, period] as const;
}

export function useFinancialSourceData(period: PeriodFilter) {
  const filters = useMemo(() => periodToApiFilters(period), [period]);

  const ledgersQuery = useQuery({
    queryKey: financialSourceQueryKey(period),
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
  });

  return {
    ledgers: ledgersQuery.data?.ledgers ?? [],
    vouchers: ledgersQuery.data?.vouchers ?? [],
    isLoading: ledgersQuery.isLoading,
    isFetching: ledgersQuery.isFetching,
    isError: ledgersQuery.isError,
    error: ledgersQuery.error,
    refetch: ledgersQuery.refetch,
  };
}
