import { describe, expect, it } from 'vitest';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import {
  allocationKey,
  buildTransferItems,
  filterStorageGatePasses,
  getSlotStockLevel,
  getUniqueSizes,
  getUniqueVarietiesForStockFilter,
  groupPassesByDate,
  isSlotUnavailable,
  parseAllocationKey,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

const samplePass: StorageGatePass = {
  _id: 'pass-1',
  farmerStorageLinkId: 'link-1',
  accountNumber: 101,
  gatePassNo: 100,
  manualGatePassNumber: 50,
  date: '2026-03-04T00:00:00.000Z',
  variety: 'K. Jyoti',
  storageCategory: 'RENTAL',
  bagSizes: [
    {
      size: 'Ration',
      currentQuantity: 40,
      initialQuantity: 40,
      bagType: 'LENO',
      chamber: '4',
      floor: '1',
      row: 'D',
    },
    {
      size: 'Large|Special',
      currentQuantity: 10,
      initialQuantity: 10,
      bagType: 'LENO',
      chamber: '1',
      floor: '2',
      row: 'A',
    },
  ],
  remarks: '',
};

describe('getSlotStockLevel', () => {
  it('returns full when current matches initial', () => {
    expect(getSlotStockLevel(100, 100)).toBe('full');
  });

  it('returns full when current exceeds initial', () => {
    expect(getSlotStockLevel(120, 100)).toBe('full');
  });

  it('returns full when initial is zero', () => {
    expect(getSlotStockLevel(0, 0)).toBe('full');
  });

  it('returns depleted between 10% and 99.99% remaining', () => {
    expect(getSlotStockLevel(50, 100)).toBe('depleted');
    expect(getSlotStockLevel(10, 100)).toBe('depleted');
    expect(getSlotStockLevel(99, 100)).toBe('depleted');
  });

  it('returns critical below 10% remaining', () => {
    expect(getSlotStockLevel(9, 100)).toBe('critical');
    expect(getSlotStockLevel(1, 100)).toBe('critical');
    expect(getSlotStockLevel(0, 100)).toBe('critical');
  });
});

describe('isSlotUnavailable', () => {
  it('returns true when current quantity is zero or negative', () => {
    expect(isSlotUnavailable(0)).toBe(true);
    expect(isSlotUnavailable(-1)).toBe(true);
  });

  it('returns false when current quantity is positive', () => {
    expect(isSlotUnavailable(1)).toBe(false);
  });
});

describe('allocationKey / parseAllocationKey', () => {
  it('round-trips pass id, size, and bag index', () => {
    const key = allocationKey('pass-1', 'Ration', 0);
    const parsed = parseAllocationKey(key);
    expect(parsed).toEqual({
      passId: 'pass-1',
      sizeName: 'Ration',
      bagIndex: 0,
    });
  });

  it('supports size names containing pipe characters', () => {
    const key = allocationKey('pass-1', 'Large|Special', 1);
    const parsed = parseAllocationKey(key);
    expect(parsed).toEqual({
      passId: 'pass-1',
      sizeName: 'Large|Special',
      bagIndex: 1,
    });
  });
});

describe('filterStorageGatePasses', () => {
  it('filters by variety, search, and location together', () => {
    const result = filterStorageGatePasses([samplePass], {
      variety: 'K. Jyoti',
      search: '100',
      location: { chamber: '4', floor: '', row: '' },
      preferences: { customMarka: false, markaType: 'GatePass' },
    });
    expect(result).toHaveLength(1);

    const noMatch = filterStorageGatePasses([samplePass], {
      variety: 'Other',
    });
    expect(noMatch).toHaveLength(0);
  });

  it('filters by multiple varieties when varieties array is provided', () => {
    const otherPass: StorageGatePass = {
      ...samplePass,
      _id: 'pass-2',
      variety: 'K. Pukhraj',
    };

    const result = filterStorageGatePasses([samplePass, otherPass], {
      varieties: ['K. Jyoti', 'K. Pukhraj'],
    });
    expect(result).toHaveLength(2);

    const singleResult = filterStorageGatePasses([samplePass, otherPass], {
      varieties: ['K. Jyoti'],
    });
    expect(singleResult).toHaveLength(1);
    expect(singleResult[0]?.variety).toBe('K. Jyoti');

    const noMatch = filterStorageGatePasses([samplePass, otherPass], {
      varieties: ['Other'],
    });
    expect(noMatch).toHaveLength(0);
  });

  it('prefers varieties array over single variety when both are set', () => {
    const otherPass: StorageGatePass = {
      ...samplePass,
      _id: 'pass-2',
      variety: 'K. Pukhraj',
    };

    const result = filterStorageGatePasses([samplePass, otherPass], {
      variety: 'K. Jyoti',
      varieties: ['K. Pukhraj'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.variety).toBe('K. Pukhraj');
  });

  it('filters by marka using manual parchi or gate pass fallback', () => {
    const result = filterStorageGatePasses([samplePass], {
      search: '100/50',
      preferences: { customMarka: false, markaType: 'GatePass' },
    });
    expect(result).toHaveLength(1);

    const withManualParchi = filterStorageGatePasses(
      [{ ...samplePass, manualParchiNumber: 'P-99' }],
      {
        search: 'p-99/50',
        preferences: { customMarka: false, markaType: 'GatePass' },
      },
    );
    expect(withManualParchi).toHaveLength(1);
  });

  it('filters by stock filter when set', () => {
    const ownedPass: StorageGatePass = {
      ...samplePass,
      _id: 'pass-owned',
      stockFilter: 'Owned',
    };
    const farmerPass: StorageGatePass = {
      ...samplePass,
      _id: 'pass-farmer',
      stockFilter: 'Farmer',
    };
    const noFilterPass: StorageGatePass = {
      ...samplePass,
      _id: 'pass-none',
    };

    const passes = [ownedPass, farmerPass, noFilterPass];

    expect(filterStorageGatePasses(passes, { stockFilter: 'Owned' })).toHaveLength(1);
    expect(filterStorageGatePasses(passes, { stockFilter: 'Owned' })[0]?._id).toBe('pass-owned');

    expect(filterStorageGatePasses(passes, { stockFilter: 'Farmer' })).toHaveLength(1);

    expect(filterStorageGatePasses(passes, { stockFilter: '' })).toHaveLength(3);
    expect(filterStorageGatePasses(passes, {})).toHaveLength(3);
  });
});

describe('getUniqueVarietiesForStockFilter', () => {
  it('returns all varieties when stock filter is unset', () => {
    const passes: StorageGatePass[] = [
      { ...samplePass, _id: 'a', variety: 'Chipsona', stockFilter: 'Owned' },
      { ...samplePass, _id: 'b', variety: 'Kufri Jyoti', stockFilter: 'Farmer' },
    ];

    expect(getUniqueVarietiesForStockFilter(passes)).toEqual(['Chipsona', 'Kufri Jyoti']);
    expect(getUniqueVarietiesForStockFilter(passes, '')).toEqual(['Chipsona', 'Kufri Jyoti']);
  });

  it('scopes varieties to matching stock filter with current quantity', () => {
    const ownedWithStock: StorageGatePass = {
      ...samplePass,
      _id: 'owned-stock',
      variety: 'Chipsona',
      stockFilter: 'Owned',
    };
    const ownedEmpty: StorageGatePass = {
      ...samplePass,
      _id: 'owned-empty',
      variety: 'Kufri Jyoti',
      stockFilter: 'Owned',
      bagSizes: samplePass.bagSizes.map((bag) => ({ ...bag, currentQuantity: 0 })),
    };
    const farmerWithStock: StorageGatePass = {
      ...samplePass,
      _id: 'farmer-stock',
      variety: 'Lady Rosetta',
      stockFilter: 'Farmer',
    };

    expect(
      getUniqueVarietiesForStockFilter(
        [ownedWithStock, ownedEmpty, farmerWithStock],
        'Owned',
      ),
    ).toEqual(['Chipsona']);
  });
});

describe('groupPassesByDate', () => {
  it('groups passes under formatted date labels', () => {
    const groups = groupPassesByDate([samplePass], 'asc');
    expect(groups).toHaveLength(1);
    expect(groups[0]?.dateKey).toBe('2026-03-04');
    expect(groups[0]?.passes).toHaveLength(1);
    expect(groups[0]?.dateLabel).toMatch(/2026/);
  });
});

describe('getUniqueSizes', () => {
  it('orders sizes by preference instead of alphabetically', () => {
    const sizes = getUniqueSizes([samplePass], ['Large|Special', 'Ration']);
    expect(sizes).toEqual(['Large|Special', 'Ration']);
  });

  it('sorts unknown sizes after configured preference order', () => {
    const sizes = getUniqueSizes([samplePass], ['Large|Special', 'Ration']);
    expect(sizes).toEqual(['Large|Special', 'Ration']);
  });
});

describe('buildTransferItems', () => {
  it('builds line items from allocation keys', () => {
    const key = allocationKey('pass-1', 'Ration', 0);
    const items = buildTransferItems({ [key]: 25 }, [samplePass]);
    expect(items).toEqual([
      {
        storageGatePassId: 'pass-1',
        gatePassNo: 100,
        bagSize: 'Ration',
        bagIndex: 0,
        quantity: 25,
        location: { chamber: '4', floor: '1', row: 'D' },
      },
    ]);
  });
});
