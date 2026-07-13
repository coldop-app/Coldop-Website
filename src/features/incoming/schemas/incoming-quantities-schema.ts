import * as z from 'zod';
import { BAG_SIZES, BAG_TYPES, DEFAULT_BAG_TYPE } from '@/lib/constants';

export const incomingQuantityRowSchema = z.object({
  id: z.string(),
  size: z.string(),
  isExtra: z.boolean(),
  qty: z.number().nonnegative('Quantity cannot be negative.').optional(),
  bagType: z.enum(BAG_TYPES),
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

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

export type IncomingQuantityLocation = Pick<IncomingQuantityRow, 'chamber' | 'floor' | 'row'>;

export function hasCompleteIncomingQuantityLocation(row: IncomingQuantityLocation): boolean {
  return row.chamber.trim() !== '' && row.floor.trim() !== '' && row.row.trim() !== '';
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
  };
}
