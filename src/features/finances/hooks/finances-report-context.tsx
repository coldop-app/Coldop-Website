import { createContext, useContext } from 'react';

import { DEFAULT_FINANCES_PERIOD, type PeriodFilter } from '@/features/finances/shared/constants';

type FinancesReportContextValue = {
  period: PeriodFilter;
};

export const FinancesReportContext = createContext<FinancesReportContextValue | null>(null);

export function useFinancesReportPeriod(): PeriodFilter {
  const context = useContext(FinancesReportContext);
  return context?.period ?? DEFAULT_FINANCES_PERIOD;
}
