import { describe, expect, it } from 'vitest';

import {
  createIncomingQuantitiesSchema,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import {
  quantityRowHasPaltaiValidationErrors,
  validatePaltaiLocationField,
} from '@/features/incoming/schemas/incoming-quantities-schema';

function activeRow(overrides: Partial<IncomingQuantityRow> = {}): IncomingQuantityRow {
  return {
    id: 'row-1',
    size: '50kg',
    isExtra: false,
    qty: 10,
    bagType: 'JUTE',
    chamber: 'A',
    floor: '1',
    row: '1',
    paltaiLocations: [],
    ...overrides,
  };
}

describe('validatePaltaiLocationField', () => {
  it('allows fully empty paltai rows on active quantity lines', () => {
    const row = activeRow({
      paltaiLocations: [{ id: 'p1', chamber: '', floor: '', row: '' }],
    });

    expect(validatePaltaiLocationField(row, 0, 'chamber')).toBeUndefined();
    expect(validatePaltaiLocationField(row, 0, 'floor')).toBeUndefined();
    expect(validatePaltaiLocationField(row, 0, 'row')).toBeUndefined();
    expect(quantityRowHasPaltaiValidationErrors(row)).toBe(false);
  });

  it('requires all fields when any paltai field is entered', () => {
    const row = activeRow({
      paltaiLocations: [{ id: 'p1', chamber: 'B', floor: '', row: '' }],
    });

    expect(validatePaltaiLocationField(row, 0, 'chamber')).toBeUndefined();
    expect(validatePaltaiLocationField(row, 0, 'floor')).toBe(
      'Paltai floor is required when paltai location is entered.',
    );
    expect(validatePaltaiLocationField(row, 0, 'row')).toBe(
      'Paltai row is required when paltai location is entered.',
    );
    expect(quantityRowHasPaltaiValidationErrors(row)).toBe(true);
  });

  it('skips paltai validation when the quantity row is inactive', () => {
    const row = activeRow({
      qty: 0,
      paltaiLocations: [{ id: 'p1', chamber: 'B', floor: '', row: '' }],
    });

    expect(validatePaltaiLocationField(row, 0, 'floor')).toBeUndefined();
    expect(quantityRowHasPaltaiValidationErrors(row)).toBe(false);
  });

  it('rejects duplicate complete paltai entries', () => {
    const row = activeRow({
      paltaiLocations: [
        { id: 'p1', chamber: 'B', floor: '2', row: '4' },
        { id: 'p2', chamber: 'B', floor: '2', row: '4' },
      ],
    });

    expect(validatePaltaiLocationField(row, 1, 'chamber')).toBe('Duplicate paltai location.');
    expect(quantityRowHasPaltaiValidationErrors(row)).toBe(true);
  });
});

describe('createIncomingQuantitiesSchema paltai validation', () => {
  const schema = createIncomingQuantitiesSchema(['50kg']);

  it('accepts active rows without paltai locations', () => {
    const result = schema.safeParse({ quantities: [activeRow()] });
    expect(result.success).toBe(true);
  });

  it('rejects partially filled paltai rows', () => {
    const result = schema.safeParse({
      quantities: [
        activeRow({
          paltaiLocations: [{ id: 'p1', chamber: 'B', floor: '', row: '' }],
        }),
      ],
    });

    expect(result.success).toBe(false);
  });
});
