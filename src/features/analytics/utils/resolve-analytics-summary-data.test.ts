import { describe, expect, it } from 'vitest';

import type {
  AnalyticsStockFilterBucket,
  AnalyticsSummaryByFilterAndGenerationData,
  AnalyticsSummaryByFilterData,
  AnalyticsSummaryByGenerationData,
  AnalyticsSummaryData,
} from '@/features/analytics/types';
import { resolveAnalyticsSummaryData } from '@/features/analytics/utils/resolve-analytics-summary-data';

function makeBucket(current: number, variety = 'Atlantic'): AnalyticsStockFilterBucket {
  return {
    stockSummary: [
      {
        variety,
        sizes: [{ size: 'Ration', initialQuantity: current + 10, currentQuantity: current }],
      },
    ],
    chartData: {
      flatSeries: [
        {
          name: `${variety} Ration`,
          variety,
          size: 'Ration',
          initialQuantity: current + 10,
          currentQuantity: current,
        },
      ],
      varieties: [variety],
      sizes: ['Ration'],
    },
    totalInventory: { initial: current + 10, current },
    topVariety: { variety, currentQuantity: current },
    topSize: { size: 'Ration', currentQuantity: current },
  };
}

const flatSummary: AnalyticsSummaryData = {
  stockSummary: makeBucket(50).stockSummary,
  chartData: makeBucket(50).chartData,
  totalInventory: makeBucket(50).totalInventory,
  topVariety: makeBucket(50).topVariety,
  topSize: makeBucket(50).topSize,
};

describe('resolveAnalyticsSummaryData', () => {
  it('returns flat summary when neither preference tab is shown', () => {
    expect(resolveAnalyticsSummaryData(flatSummary, 'all', false, 'all', false)).toEqual(
      flatSummary,
    );
  });

  it('resolves a stock-filter bucket and merges the all tab', () => {
    const data: AnalyticsSummaryByFilterData = {
      stockSummaryByFilter: {
        Owned: makeBucket(80, 'Atlantic'),
        Farmer: makeBucket(20, 'Cardinal'),
      },
    };

    const owned = resolveAnalyticsSummaryData(data, 'Owned', true);
    expect(owned?.totalInventory.current).toBe(80);
    expect(owned?.stockSummary[0]?.variety).toBe('Atlantic');

    const merged = resolveAnalyticsSummaryData(data, 'all', true);
    expect(merged?.totalInventory.current).toBe(100);
  });

  it('resolves a generation bucket when only generation tabs are shown', () => {
    const data: AnalyticsSummaryByGenerationData = {
      stockSummaryByGeneration: {
        G1: makeBucket(40, 'Atlantic'),
        G2: makeBucket(15, 'Cardinal'),
      },
    };

    const g1 = resolveAnalyticsSummaryData(data, 'all', false, 'G1', true);
    expect(g1?.totalInventory.current).toBe(40);

    const merged = resolveAnalyticsSummaryData(data, 'all', false, 'all', true);
    expect(merged?.totalInventory.current).toBe(55);
  });

  it('resolves nested filter and generation tabs, merging when a tab is all', () => {
    const data: AnalyticsSummaryByFilterAndGenerationData = {
      stockSummaryByFilterAndGeneration: {
        Owned: {
          G1: makeBucket(80, 'Atlantic'),
          G2: makeBucket(20, 'Cardinal'),
        },
        Farmer: {
          G1: makeBucket(10, 'Chipsona'),
        },
      },
    };

    const exact = resolveAnalyticsSummaryData(data, 'Owned', true, 'G1', true);
    expect(exact?.totalInventory.current).toBe(80);
    expect(exact?.stockSummary[0]?.variety).toBe('Atlantic');

    const filterAllGeneration = resolveAnalyticsSummaryData(data, 'Owned', true, 'all', true);
    expect(filterAllGeneration?.totalInventory.current).toBe(100);

    const generationAllFilter = resolveAnalyticsSummaryData(data, 'all', true, 'G1', true);
    expect(generationAllFilter?.totalInventory.current).toBe(90);

    const bothAll = resolveAnalyticsSummaryData(data, 'all', true, 'all', true);
    expect(bothAll?.totalInventory.current).toBe(110);
  });
});
