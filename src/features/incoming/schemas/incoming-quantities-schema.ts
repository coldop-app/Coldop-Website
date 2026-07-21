import * as z from 'zod';
import { BAG_SIZES, BAG_TYPES, DEFAULT_BAG_TYPE } from '@/lib/constants';

export const incomingPaltaiLocationRowSchema = z.object({
  id: z.string(),
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

export const incomingQuantityRowSchema = z.object({
  id: z.string(),
  size: z.string(),
  isExtra: z.boolean(),
  qty: z.number().nonnegative('Quantity cannot be negative.').optional(),
  bagType: z.enum(BAG_TYPES),
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
  paltaiLocations: z.array(incomingPaltaiLocationRowSchema),
});

export function hasAnyPaltaiLocationRow(
  row: Pick<z.infer<typeof incomingPaltaiLocationRowSchema>, 'chamber' | 'floor' | 'row'>,
): boolean {
  return row.chamber.trim() !== '' || row.floor.trim() !== '' || row.row.trim() !== '';
}

export function hasCompletePaltaiLocationRow(
  row: Pick<z.infer<typeof incomingPaltaiLocationRowSchema>, 'chamber' | 'floor' | 'row'>,
): boolean {
  return row.chamber.trim() !== '' && row.floor.trim() !== '' && row.row.trim() !== '';
}

export function paltaiLocationRowKey(
  row: Pick<z.infer<typeof incomingPaltaiLocationRowSchema>, 'chamber' | 'floor' | 'row'>,
): string {
  return `${row.chamber.trim()}\u001f${row.floor.trim()}\u001f${row.row.trim()}`;
}

export function createEmptyPaltaiLocationRow(): z.infer<typeof incomingPaltaiLocationRowSchema> {
  return {
    id: crypto.randomUUID(),
    chamber: '',
    floor: '',
    row: '',
  };
}

export function createIncomingQuantitiesSchema(allowedSizes: string[] = []) {
  return z.object({
    quantities: z.array(incomingQuantityRowSchema).superRefine((rows, ctx) => {
      let hasActiveRow = false;

      rows.forEach((row, index) => {
        if (row.isExtra && row.size === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Select a bag size.',
            path: [index, 'size'],
          });
          return;
        }

        if (row.size !== '' && allowedSizes.length > 0 && !allowedSizes.includes(row.size)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Select a valid bag size.',
            path: [index, 'size'],
          });
        }

        const qty = row.qty ?? 0;

        if (qty <= 0) {
          return;
        }

        if (!hasCompleteIncomingQuantityLocation(row)) {
          if (row.chamber.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Chamber is required when quantity is entered.',
              path: [index, 'chamber'],
            });
          }
          if (row.floor.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Floor is required when quantity is entered.',
              path: [index, 'floor'],
            });
          }
          if (row.row.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Row is required when quantity is entered.',
              path: [index, 'row'],
            });
          }
          return;
        }

        hasActiveRow = true;

        const seenPaltaiKeys = new Set<string>();

        row.paltaiLocations.forEach((paltaiRow, paltaiIndex) => {
          if (!hasAnyPaltaiLocationRow(paltaiRow)) {
            return;
          }

          if (!hasCompletePaltaiLocationRow(paltaiRow)) {
            if (paltaiRow.chamber.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Paltai chamber is required when paltai location is entered.',
                path: [index, 'paltaiLocations', paltaiIndex, 'chamber'],
              });
            }
            if (paltaiRow.floor.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Paltai floor is required when paltai location is entered.',
                path: [index, 'paltaiLocations', paltaiIndex, 'floor'],
              });
            }
            if (paltaiRow.row.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Paltai row is required when paltai location is entered.',
                path: [index, 'paltaiLocations', paltaiIndex, 'row'],
              });
            }
            return;
          }

          const key = paltaiLocationRowKey(paltaiRow);
          if (seenPaltaiKeys.has(key)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Duplicate paltai location.',
              path: [index, 'paltaiLocations', paltaiIndex, 'chamber'],
            });
            return;
          }
          seenPaltaiKeys.add(key);
        });
      });

      if (!hasActiveRow) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter at least one bag quantity with chamber, floor, and row.',
          path: [],
        });
      }
    }),
  });
}

export const incomingQuantitiesSchema = createIncomingQuantitiesSchema();

export type IncomingQuantitiesValues = z.infer<typeof incomingQuantitiesSchema>;

export type IncomingQuantityRow = IncomingQuantitiesValues['quantities'][number];

export type IncomingPaltaiLocationRow = IncomingQuantityRow['paltaiLocations'][number];

export type IncomingQuantityLocation = Pick<IncomingQuantityRow, 'chamber' | 'floor' | 'row'>;

export function hasCompleteIncomingQuantityLocation(row: IncomingQuantityLocation): boolean {
  return row.chamber.trim() !== '' && row.floor.trim() !== '' && row.row.trim() !== '';
}

export function clearPaltaiLocations<T extends Pick<IncomingQuantityRow, 'paltaiLocations'>>(
  row: T,
): T {
  return { ...row, paltaiLocations: [] };
}

export function pruneEmptyPaltaiLocationRows(
  paltaiLocations: IncomingPaltaiLocationRow[],
): IncomingPaltaiLocationRow[] {
  return paltaiLocations.filter((entry) => hasAnyPaltaiLocationRow(entry));
}

export type PaltaiLocationFieldName = 'chamber' | 'floor' | 'row';

function isActiveQuantityRow(row: IncomingQuantityRow | undefined): boolean {
  if (!row) return false;
  return (row.qty ?? 0) > 0 && hasCompleteIncomingQuantityLocation(row);
}

export function validatePaltaiLocationField(
  quantityRow: IncomingQuantityRow | undefined,
  paltaiIndex: number,
  field: PaltaiLocationFieldName,
): string | undefined {
  if (!isActiveQuantityRow(quantityRow)) return undefined;

  const paltaiRow = quantityRow!.paltaiLocations[paltaiIndex];
  if (!paltaiRow || !hasAnyPaltaiLocationRow(paltaiRow)) return undefined;

  if (!hasCompletePaltaiLocationRow(paltaiRow)) {
    if (field === 'chamber' && paltaiRow.chamber.trim() === '') {
      return 'Paltai chamber is required when paltai location is entered.';
    }
    if (field === 'floor' && paltaiRow.floor.trim() === '') {
      return 'Paltai floor is required when paltai location is entered.';
    }
    if (field === 'row' && paltaiRow.row.trim() === '') {
      return 'Paltai row is required when paltai location is entered.';
    }
  }

  if (hasCompletePaltaiLocationRow(paltaiRow) && field === 'chamber') {
    const key = paltaiLocationRowKey(paltaiRow);
    const duplicateIndex = quantityRow!.paltaiLocations.findIndex(
      (entry, index) =>
        index !== paltaiIndex &&
        hasCompletePaltaiLocationRow(entry) &&
        paltaiLocationRowKey(entry) === key,
    );

    if (duplicateIndex !== -1) {
      return 'Duplicate paltai location.';
    }
  }

  return undefined;
}

export function validatePaltaiLocationRow(
  quantityRow: IncomingQuantityRow | undefined,
  paltaiIndex: number,
): Partial<Record<PaltaiLocationFieldName, string>> {
  const errors: Partial<Record<PaltaiLocationFieldName, string>> = {};

  for (const field of ['chamber', 'floor', 'row'] as const) {
    const message = validatePaltaiLocationField(quantityRow, paltaiIndex, field);
    if (message) errors[field] = message;
  }

  return errors;
}

export function quantityRowHasPaltaiValidationErrors(
  quantityRow: IncomingQuantityRow | undefined,
): boolean {
  if (!quantityRow) return false;

  return quantityRow.paltaiLocations.some((_, paltaiIndex) => {
    return Object.keys(validatePaltaiLocationRow(quantityRow, paltaiIndex)).length > 0;
  });
}

export function applyIncomingQuantityLocationToAll(
  rows: IncomingQuantityRow[],
  location: IncomingQuantityLocation,
): IncomingQuantityRow[] {
  return rows.map((row) => ({ ...row, ...location }));
}

export function resolveBagSizes(sizes: string[]): string[] {
  return sizes.length > 0 ? sizes : [...BAG_SIZES];
}

export function createDefaultIncomingQuantities(sizes: string[] = []): IncomingQuantityRow[] {
  return resolveBagSizes(sizes).map((size) => ({
    id: crypto.randomUUID(),
    size,
    isExtra: false,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: '',
    floor: '',
    row: '',
    paltaiLocations: [],
  }));
}

export function createEmptyIncomingQuantityRow(): IncomingQuantityRow {
  return {
    id: crypto.randomUUID(),
    size: '',
    isExtra: true,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: '',
    floor: '',
    row: '',
    paltaiLocations: [],
  };
}
