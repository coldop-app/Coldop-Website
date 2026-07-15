import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  formatVarietyVisibilityLabel,
  useTransferGatePassMatrix,
} from '@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) =>
    selector({ preferences: { commodities: [] } }),
}));

function makePass(
  id: string,
  variety: string,
  gatePassNo: number,
  location: { chamber: string; floor: string; row: string } = {
    chamber: 'A',
    floor: '1',
    row: 'R1',
  },
): StorageGatePass {
  return {
    _id: id,
    farmerStorageLinkId: '674a1b2c3d4e5f6789012345',
    accountNumber: 101,
    gatePassNo,
    date: '2026-06-01T00:00:00.000Z',
    variety,
    storageCategory: 'RECEIPT',
    bagSizes: [
      {
        size: '50 kg',
        currentQuantity: 40,
        initialQuantity: 40,
        bagType: 'LENO',
        chamber: location.chamber,
        floor: location.floor,
        row: location.row,
      },
    ],
    remarks: '',
  };
}

describe('useTransferGatePassMatrix', () => {
  it('does not require variety selection in multi-optional mode', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10),
      makePass('pass-kufri', 'Kufri Jyoti', 11),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
      }),
    );

    expect(result.current.needsVarietySelection).toBe(false);
    expect(result.current.hasFilteredData).toBe(true);
    expect(result.current.displayGroups.flatMap((group) => group.passes)).toHaveLength(2);
  });

  it('starts with the supplied variety selected in multi-optional mode', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10),
      makePass('pass-kufri', 'Kufri Jyoti', 11),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
        initialVariety: 'Kufri Jyoti',
      }),
    );

    expect(result.current.varietyVisibilityLabel).toBe('Kufri Jyoti');
    expect(result.current.displayGroups.flatMap((group) => group.passes)).toEqual([
      expect.objectContaining({ variety: 'Kufri Jyoti' }),
    ]);
  });

  it('requires variety selection in single-required mode when multiple varieties exist', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10),
      makePass('pass-kufri', 'Kufri Jyoti', 11),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'single-required',
      }),
    );

    expect(result.current.needsVarietySelection).toBe(true);
    expect(result.current.hasFilteredData).toBe(false);
  });

  it('filters by selected varieties in multi-optional mode', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10),
      makePass('pass-kufri', 'Kufri Jyoti', 11),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
      }),
    );

    act(() => {
      result.current.setVarietyVisibility(new Set(['Chipsona']));
    });

    const visiblePasses = result.current.displayGroups.flatMap((group) => group.passes);
    expect(visiblePasses).toHaveLength(1);
    expect(visiblePasses[0]?.variety).toBe('Chipsona');
  });

  it('scopes location filter options to the selected variety in multi-optional mode', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10, {
        chamber: '4',
        floor: '2',
        row: 'B',
      }),
      makePass('pass-kufri', 'Kufri Jyoti', 11, {
        chamber: '1',
        floor: '1',
        row: 'A',
      }),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
      }),
    );

    expect(result.current.uniqueLocations.chambers).toEqual(['1', '4']);

    act(() => {
      result.current.setVarietyVisibility(new Set(['Chipsona']));
    });

    expect(result.current.uniqueLocations.chambers).toEqual(['4']);
    expect(result.current.uniqueLocations.floors).toEqual(['2']);
    expect(result.current.uniqueLocations.rows).toEqual(['B']);
  });

  it('scopes location filter options to the selected variety in single-required mode', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10, {
        chamber: '4',
        floor: '2',
        row: 'B',
      }),
      makePass('pass-kufri', 'Kufri Jyoti', 11, {
        chamber: '1',
        floor: '1',
        row: 'A',
      }),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'single-required',
      }),
    );

    expect(result.current.uniqueLocations.chambers).toEqual([]);

    act(() => {
      result.current.setVarietyFilter('Kufri Jyoti');
    });

    expect(result.current.uniqueLocations.chambers).toEqual(['1']);
    expect(result.current.uniqueLocations.rows).toEqual(['A']);
  });

  it('clears stale location filters when the variety selection changes', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10, {
        chamber: '4',
        floor: '2',
        row: 'B',
      }),
      makePass('pass-kufri', 'Kufri Jyoti', 11, {
        chamber: '1',
        floor: '1',
        row: 'A',
      }),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
      }),
    );

    act(() => {
      result.current.setLocationFilters({
        chamber: '1',
        floor: '',
        row: '',
      });
      result.current.setVarietyVisibility(new Set(['Chipsona']));
    });

    expect(result.current.locationFilters.chamber).toBe('');
  });

  it('exposes a readable label for the variety visibility trigger', () => {
    const passes = [
      makePass('pass-chipsona', 'Chipsona', 10),
      makePass('pass-kufri', 'Kufri Jyoti', 11),
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
      }),
    );

    expect(result.current.varietyVisibilityLabel).toBe('All');

    act(() => {
      result.current.setVarietyVisibility(new Set(['Chipsona']));
    });

    expect(result.current.varietyVisibilityLabel).toBe('Chipsona');

    act(() => {
      result.current.setVarietyVisibility(new Set(['Kufri Jyoti', 'Chipsona']));
    });

    expect(result.current.varietyVisibilityLabel).toBe('Chipsona, Kufri Jyoti');
  });
});

describe('formatVarietyVisibilityLabel', () => {
  it('formats all, none, and selected variety labels', () => {
    expect(formatVarietyVisibilityLabel('all')).toBe('All');
    expect(formatVarietyVisibilityLabel(new Set())).toBe('None');
    expect(formatVarietyVisibilityLabel(new Set(['Kufri Jyoti']))).toBe('Kufri Jyoti');
    expect(formatVarietyVisibilityLabel(new Set(['Kufri Jyoti', 'Chipsona']))).toBe(
      'Chipsona, Kufri Jyoti',
    );
  });
});

describe('useTransferGatePassMatrix controlled stockFilter', () => {
  it('applies a fixed stock filter and hides the stock filter control', () => {
    const passes = [
      {
        ...makePass('pass-owned', 'Kufri Jyoti', 10),
        stockFilter: 'Owned',
      },
      {
        ...makePass('pass-farmer', 'Kufri Jyoti', 11),
        stockFilter: 'Farmer',
      },
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
        stockFilter: 'Owned',
      }),
    );

    expect(result.current.showStockFilter).toBe(false);
    expect(result.current.isStockFilterControlled).toBe(true);
    expect(result.current.displayGroups).toHaveLength(1);
    expect(result.current.displayGroups[0]?.passes[0]?._id).toBe('pass-owned');
  });

  it('scopes location filter options to the controlled stock filter', () => {
    const passes = [
      {
        ...makePass('pass-owned', 'Chipsona', 10, {
          chamber: '4',
          floor: '2',
          row: 'B',
        }),
        stockFilter: 'Owned',
      },
      {
        ...makePass('pass-farmer', 'Chipsona', 11, {
          chamber: '1',
          floor: '1',
          row: 'A',
        }),
        stockFilter: 'Farmer',
      },
    ];

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'multi-optional',
        stockFilter: 'Owned',
      }),
    );

    expect(result.current.uniqueLocations.chambers).toEqual(['4']);
    expect(result.current.uniqueLocations.floors).toEqual(['2']);
    expect(result.current.uniqueLocations.rows).toEqual(['B']);
  });

  it('scopes variety options to stock filter with current quantity', () => {
    const ownedWithStock = {
      ...makePass('pass-owned-chipsona', 'Chipsona', 10),
      stockFilter: 'Owned',
    };
    const ownedEmpty = {
      ...makePass('pass-owned-empty', 'Kufri Jyoti', 11),
      stockFilter: 'Owned',
      bagSizes: [
        {
          size: '50 kg',
          currentQuantity: 0,
          initialQuantity: 40,
          bagType: 'LENO',
          chamber: 'A',
          floor: '1',
          row: 'R1',
        },
      ],
    };
    const farmerWithStock = {
      ...makePass('pass-farmer-lady', 'Lady Rosetta', 12),
      stockFilter: 'Farmer',
    };

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: [ownedWithStock, ownedEmpty, farmerWithStock],
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: 'single-required',
        stockFilter: 'Owned',
      }),
    );

    expect(result.current.uniqueVarieties).toEqual(['Chipsona']);
  });
});
