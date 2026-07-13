import { describe, expect, it } from 'vitest';

import {
  buildFarmerReportDateRangeSummary,
  buildFarmerReportFilterSummaryLines,
  buildFarmerReportGroupingSummary,
} from './build-farmer-report-filter-summary';

describe('buildFarmerReportDateRangeSummary', () => {
  it('returns all dates when no range is applied', () => {
    expect(buildFarmerReportDateRangeSummary()).toBe('Date range: All dates');
    expect(buildFarmerReportDateRangeSummary(undefined, undefined)).toBe('Date range: All dates');
  });

  it('formats from-only and to-only ranges', () => {
    expect(buildFarmerReportDateRangeSummary('2024-06-01')).toMatch(/^Date range: from /);
    expect(buildFarmerReportDateRangeSummary(undefined, '2024-06-30')).toMatch(
      /^Date range: up to /,
    );
  });

  it('formats a full date range', () => {
    const summary = buildFarmerReportDateRangeSummary('2024-06-01', '2024-06-30');
    expect(summary).toMatch(/^Date range: .+ to .+$/);
  });
});

describe('buildFarmerReportGroupingSummary', () => {
  it('returns null when no grouping is active', () => {
    expect(buildFarmerReportGroupingSummary([])).toBeNull();
  });

  it('describes active grouping columns in order', () => {
    expect(buildFarmerReportGroupingSummary(['variety'])).toBe('Grouped by: Variety');
    expect(buildFarmerReportGroupingSummary(['variety', 'stockFilter'])).toBe(
      'Grouped by: Variety, Stock Filter',
    );
  });
});

describe('buildFarmerReportFilterSummaryLines', () => {
  it('includes date range and grouping lines', () => {
    expect(
      buildFarmerReportFilterSummaryLines({
        appliedFrom: '2024-01-01',
        appliedTo: '2024-12-31',
        grouping: ['variety'],
      }),
    ).toEqual([expect.stringMatching(/^Date range:/), 'Grouped by: Variety']);
  });

  it('omits grouping when not active', () => {
    expect(
      buildFarmerReportFilterSummaryLines({
        grouping: [],
      }),
    ).toEqual(['Date range: All dates']);
  });
});
