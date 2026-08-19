import { describe, expect, it } from 'vitest';

import type {
  VarietyBreakdownByFilterAndGenerationData,
  VarietyBreakdownByGenerationData,
  VarietyBreakdownData,
} from '@/features/variety-breakdown/types';
import { resolveVarietyBreakdownData } from '@/features/variety-breakdown/utils/resolve-variety-breakdown-data';

function makeBreakdown(
  current: number,
  farmerName = 'Farmer A',
): VarietyBreakdownData {
  return {
    variety: 'Atlantic',
    sizes: [
      {
        size: 'Ration',
        initialQuantity: current + 5,
        currentQuantity: current,
        quantityRemoved: 5,
        farmerBreakdown: [
          {
            farmerName,
            initialQuantity: current + 5,
            currentQuantity: current,
            quantityRemoved: 5,
          },
        ],
      },
    ],
  };
}

describe('resolveVarietyBreakdownData', () => {
  it('returns flat data when neither preference is shown', () => {
    const data = makeBreakdown(40);
    expect(resolveVarietyBreakdownData(data, 'all', false, 'all', false)).toEqual(data);
  });

  it('resolves generation buckets when only generation tabs are shown', () => {
    const data: VarietyBreakdownByGenerationData = {
      varietyBreakdownByGeneration: {
        G1: makeBreakdown(30, 'A'),
        G2: makeBreakdown(10, 'B'),
      },
    };

    expect(resolveVarietyBreakdownData(data, 'all', false, 'G1', true)?.sizes[0]?.currentQuantity).toBe(
      30,
    );
    expect(
      resolveVarietyBreakdownData(data, 'all', false, 'all', true)?.sizes[0]?.currentQuantity,
    ).toBe(40);
  });

  it('resolves nested filter and generation, merging when a tab is all', () => {
    const data: VarietyBreakdownByFilterAndGenerationData = {
      varietyBreakdownByFilterAndGeneration: {
        Owned: {
          G1: makeBreakdown(80, 'A'),
          G2: makeBreakdown(20, 'B'),
        },
        Farmer: {
          G1: makeBreakdown(10, 'C'),
        },
      },
    };

    expect(resolveVarietyBreakdownData(data, 'Owned', true, 'G1', true)?.sizes[0]?.currentQuantity).toBe(
      80,
    );
    expect(
      resolveVarietyBreakdownData(data, 'Owned', true, 'all', true)?.sizes[0]?.currentQuantity,
    ).toBe(100);
    expect(resolveVarietyBreakdownData(data, 'all', true, 'G1', true)?.sizes[0]?.currentQuantity).toBe(
      90,
    );
  });
});
