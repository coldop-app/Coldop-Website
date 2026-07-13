import { describe, expect, it } from 'vitest';

import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  isFarmerReportGrouped,
  toggleFarmerReportGrouping,
} from './report-grouping';

describe('toggleFarmerReportGrouping', () => {
  it('appends a new grouping column in click order', () => {
    const first = toggleFarmerReportGrouping([], FARMER_REPORT_GROUP_COLUMN_IDS.variety);
    expect(first).toEqual(['variety']);

    const second = toggleFarmerReportGrouping(first, FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter);
    expect(second).toEqual(['variety', 'stockFilter']);
  });

  it('removes an active grouping column without changing the order of others', () => {
    const grouping = ['variety', 'stockFilter'];
    expect(toggleFarmerReportGrouping(grouping, FARMER_REPORT_GROUP_COLUMN_IDS.variety)).toEqual([
      'stockFilter',
    ]);
  });
});

describe('isFarmerReportGrouped', () => {
  it('returns whether a column is currently grouped', () => {
    expect(isFarmerReportGrouped(['variety'], FARMER_REPORT_GROUP_COLUMN_IDS.variety)).toBe(true);
    expect(isFarmerReportGrouped(['variety'], FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter)).toBe(
      false,
    );
  });
});
