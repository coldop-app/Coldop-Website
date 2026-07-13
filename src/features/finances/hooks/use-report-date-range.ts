import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from 'date-fns';

import type { PeriodFilter } from '@/features/finances/shared/constants';
import type { DateRange } from '@/features/finances/shared/report-types';
import { toEndOfDayIso, toStartOfDayIso } from '@/features/finances/utils/date-filters';
import type { LedgerFilters, VoucherFilters } from '@/features/finances/types';

function getPeriodBounds(period: PeriodFilter, referenceDate = new Date()) {
  switch (period) {
    case 'this_month':
      return {
        from: startOfMonth(referenceDate),
        to: endOfMonth(referenceDate),
      };
    case 'last_month': {
      const lastMonth = subMonths(referenceDate, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
    case 'this_quarter':
      return {
        from: startOfQuarter(referenceDate),
        to: endOfQuarter(referenceDate),
      };
    case 'this_year':
      return {
        from: startOfYear(referenceDate),
        to: endOfYear(referenceDate),
      };
  }
}

export function periodToDateRange(period: PeriodFilter, referenceDate = new Date()): DateRange {
  const { from, to } = getPeriodBounds(period, referenceDate);
  return {
    from: toStartOfDayIso(startOfDay(from)),
    to: toEndOfDayIso(endOfDay(to)),
  };
}

export function periodToApiFilters(
  period: PeriodFilter,
  referenceDate = new Date(),
): LedgerFilters & VoucherFilters {
  const dateRange = periodToDateRange(period, referenceDate);
  return {
    from: dateRange.from ?? undefined,
    to: dateRange.to ?? undefined,
  };
}

export function formatPeriodRangeLabel(period: PeriodFilter, referenceDate = new Date()): string {
  const { from, to } = getPeriodBounds(period, referenceDate);
  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(from)} – ${formatter.format(to)}`;
}
