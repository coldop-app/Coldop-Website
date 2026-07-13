import { describe, expect, it } from 'vitest';

import { chunkGatePassReportRows } from './chunk-report-rows';

describe('chunkGatePassReportRows', () => {
  it('returns a single empty page when there are no rows', () => {
    expect(chunkGatePassReportRows([], 2)).toEqual([[]]);
  });

  it('splits rows into fixed-size pages', () => {
    const rows = Array.from({ length: 5 }, (_, index) => ({
      cells: [],
      isGroupRow: index % 2 === 0,
    }));

    expect(chunkGatePassReportRows(rows, 2)).toEqual([
      rows.slice(0, 2),
      rows.slice(2, 4),
      rows.slice(4, 5),
    ]);
  });
});
