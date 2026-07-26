import { describe, expect, it } from 'vitest';

import {
  applyIncomingPaltaiLocation,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import { incomingDaybookEntryToFormValues } from '@/features/incoming/utils/incoming-daybook-entry-to-form-values';
import { mapQuantityRowsToBagSizes } from '@/features/incoming/utils/incoming-form-values-to-create-payload';
import { buildUpdateIncomingGatePassPayload } from '@/features/incoming/utils/incoming-form-values-to-update-payload';
import {
  FARMER_LINK_ID,
  makeFarmerStorageLink,
  makeIncomingDaybookEntry,
  makePreferences,
  USER_ID,
} from '@/test/fixtures';

function makeQuantityRow(overrides: Partial<IncomingQuantityRow> = {}): IncomingQuantityRow {
  return {
    id: 'qty-1',
    size: '50kg',
    isExtra: false,
    qty: 80,
    bagType: 'JUTE',
    chamber: 'A',
    floor: '1',
    row: 'R1',
    previousLocation: [],
    ...overrides,
  };
}

describe('applyIncomingPaltaiLocation', () => {
  it('appends the current location and replaces chamber/floor/row', () => {
    const row = makeQuantityRow({
      previousLocation: [{ chamber: 'X', floor: '9', row: 'Z' }],
    });

    expect(
      applyIncomingPaltaiLocation(row, { chamber: 'B', floor: '2', row: 'R4' }),
    ).toEqual({
      ...row,
      chamber: 'B',
      floor: '2',
      row: 'R4',
      previousLocation: [
        { chamber: 'X', floor: '9', row: 'Z' },
        { chamber: 'A', floor: '1', row: 'R1' },
      ],
    });
  });
});

describe('mapQuantityRowsToBagSizes previousLocation', () => {
  it('serializes previousLocation from form rows', () => {
    const bags = mapQuantityRowsToBagSizes([
      makeQuantityRow({
        previousLocation: [
          { chamber: 'A', floor: '1', row: 'R1' },
          { chamber: 'B', floor: '2', row: 'R4' },
        ],
        chamber: 'C',
        floor: '3',
        row: 'R7',
      }),
    ]);

    expect(bags).toEqual([
      {
        name: '50kg',
        initialQuantity: 80,
        currentQuantity: 80,
        location: { chamber: 'C', floor: '3', row: 'R7' },
        previousLocation: [
          { chamber: 'A', floor: '1', row: 'R1' },
          { chamber: 'B', floor: '2', row: 'R4' },
        ],
      },
    ]);
  });

  it('omits previousLocation when the history is empty', () => {
    const bags = mapQuantityRowsToBagSizes([makeQuantityRow()]);

    expect(bags[0]).toEqual({
      name: '50kg',
      initialQuantity: 80,
      currentQuantity: 80,
      location: { chamber: 'A', floor: '1', row: 'R1' },
    });
    expect(bags[0]).not.toHaveProperty('previousLocation');
  });
});

describe('incomingDaybookEntryToFormValues previousLocation', () => {
  it('hydrates previousLocation onto quantity rows', () => {
    const entry = makeIncomingDaybookEntry({
      bagSizes: [
        {
          name: '50kg',
          initialQuantity: 120,
          currentQuantity: 120,
          location: { chamber: 'C', floor: '3', row: 'R7' },
          previousLocation: [
            { chamber: 'A', floor: '1', row: 'R1' },
            { chamber: 'B', floor: '2', row: 'R4' },
          ],
        },
      ],
    });

    const values = incomingDaybookEntryToFormValues({
      entry,
      commodities: makePreferences().commodities,
      farmerStorageLinks: [makeFarmerStorageLink()],
      userId: USER_ID,
    });

    const row = values.quantities.find((quantity) => quantity.size === '50kg' && quantity.qty === 120);

    expect(row).toMatchObject({
      chamber: 'C',
      floor: '3',
      row: 'R7',
      previousLocation: [
        { chamber: 'A', floor: '1', row: 'R1' },
        { chamber: 'B', floor: '2', row: 'R4' },
      ],
    });
  });
});

describe('buildUpdateIncomingGatePassPayload previousLocation', () => {
  it('includes bagSizes when previousLocation changes via paltai', () => {
    const entry = makeIncomingDaybookEntry();
    const preferences = makePreferences();
    const farmerLinks = [makeFarmerStorageLink()];
    const baseline = incomingDaybookEntryToFormValues({
      entry,
      commodities: preferences.commodities,
      farmerStorageLinks: farmerLinks,
      userId: USER_ID,
    });

    const current = {
      ...baseline,
      quantities: baseline.quantities.map((row) =>
        row.size === '50kg' && row.qty === 120
          ? applyIncomingPaltaiLocation(row, { chamber: 'B', floor: '2', row: 'R4' })
          : row,
      ),
    };

    const payload = buildUpdateIncomingGatePassPayload(current, baseline, {
      showFinances: false,
      originalBagSizes: entry.bagSizes ?? [],
      rentEntryVoucherId: entry.rentEntryVoucherId,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        bagSizes: [
          expect.objectContaining({
            name: '50kg',
            location: { chamber: 'B', floor: '2', row: 'R4' },
            previousLocation: [{ chamber: 'A', floor: '1', row: '3' }],
          }),
        ],
      }),
    );
    expect(payload?.farmerStorageLinkId).toBeUndefined();
    expect(FARMER_LINK_ID).toBeTruthy();
  });

  it('preserves currentQuantity and omits farmer when lockFarmerAndQuantity is set', () => {
    const entry = makeIncomingDaybookEntry({
      bagSizes: [
        {
          name: '50kg',
          initialQuantity: 120,
          currentQuantity: 80,
          location: { chamber: 'A', floor: '1', row: '3' },
        },
      ],
    });
    const preferences = makePreferences();
    const farmerLinks = [makeFarmerStorageLink()];
    const baseline = incomingDaybookEntryToFormValues({
      entry,
      commodities: preferences.commodities,
      farmerStorageLinks: farmerLinks,
      userId: USER_ID,
    });

    const current = {
      ...baseline,
      farmerIncomingLinkId: 'other-farmer-link',
      quantities: baseline.quantities.map((row) =>
        row.size === '50kg' && row.qty === 120
          ? applyIncomingPaltaiLocation(row, { chamber: 'B', floor: '2', row: 'R4' })
          : row,
      ),
    };

    const payload = buildUpdateIncomingGatePassPayload(current, baseline, {
      showFinances: true,
      costPerBag: 10,
      originalBagSizes: entry.bagSizes ?? [],
      rentEntryVoucherId: entry.rentEntryVoucherId,
      lockFarmerAndQuantity: true,
    });

    expect(payload?.farmerStorageLinkId).toBeUndefined();
    expect(payload?.amount).toBeUndefined();
    expect(payload?.bagSizes).toEqual([
      {
        name: '50kg',
        initialQuantity: 120,
        currentQuantity: 80,
        location: { chamber: 'B', floor: '2', row: 'R4' },
        previousLocation: [{ chamber: 'A', floor: '1', row: '3' }],
      },
    ]);
  });
});
