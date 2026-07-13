import { describe, expect, it } from 'vitest';

import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';

import { getIncomingReportTotalBags } from './columns';

function createRow(
  overrides: Partial<IncomingGatePassReportRecord> = {},
): IncomingGatePassReportRecord {
  return {
    _id: 'row-1',
    gatePassNo: 55,
    date: '2026-06-29T02:44:10.373Z',
    type: 'RECEIPT',
    variety: 'Atlantic',
    status: 'OPEN',
    bagSizes: [],
    initialTotal: 700,
    currentTotal: 699,
    farmerStorageLinkId: {
      _id: 'farmer-1',
      name: 'lokesh',
      accountNumber: 8,
      address: 'mandi road',
      mobileNumber: '7757041279',
    },
    ...overrides,
  };
}

describe('getIncomingReportTotalBags', () => {
  it('returns currentTotal in current quantity mode', () => {
    const row = createRow();

    expect(getIncomingReportTotalBags(row, 'current')).toBe(699);
  });

  it('returns initialTotal in initial quantity mode', () => {
    const row = createRow();

    expect(getIncomingReportTotalBags(row, 'initial')).toBe(700);
  });
});
