import { describe, expect, it } from 'vitest';

import { assignTransferStockReportSerialNumbers } from '@/features/transfer-stock-report/utils/assign-serial-numbers';

describe('assignTransferStockReportSerialNumbers', () => {
  it('numbers the oldest transfer as 1 and keeps that number on the row', () => {
    const rows = assignTransferStockReportSerialNumbers([
      { _id: 'latest', date: '2026-10-21T07:33:53.019Z', gatePassNo: 3 },
      { _id: 'oldest', date: '2026-10-01T00:00:00.000Z', gatePassNo: 9 },
      { _id: 'middle', date: '2026-10-10T00:00:00.000Z', gatePassNo: 1 },
    ]);

    expect(rows.map((row) => [row._id, row.serialNo])).toEqual([
      ['oldest', 1],
      ['middle', 2],
      ['latest', 3],
    ]);
  });

  it('breaks date ties by gate pass number, then original order', () => {
    const rows = assignTransferStockReportSerialNumbers([
      { _id: 'b', date: '2026-10-21T00:00:00.000Z', gatePassNo: 2 },
      { _id: 'a', date: '2026-10-21T00:00:00.000Z', gatePassNo: 2 },
      { _id: 'c', date: '2026-10-21T00:00:00.000Z', gatePassNo: 1 },
    ]);

    expect(rows.map((row) => row._id)).toEqual(['c', 'b', 'a']);
    expect(rows.map((row) => row.serialNo)).toEqual([1, 2, 3]);
  });

  it('places rows with an unparseable date after dated rows', () => {
    const rows = assignTransferStockReportSerialNumbers([
      { _id: 'bad', date: 'not-a-date', gatePassNo: 1 },
      { _id: 'good', date: '2026-10-21T00:00:00.000Z', gatePassNo: 8 },
    ]);

    expect(rows.map((row) => [row._id, row.serialNo])).toEqual([
      ['good', 1],
      ['bad', 2],
    ]);
  });
});
