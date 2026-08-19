import type { IncomingBagSize } from '@/features/daybook/types';
import type { UpdateIncomingGatePassPayload } from '@/features/incoming/types/api';
import type { IncomingFormValues } from '@/features/incoming/types';
import type { IncomingQuantityRow } from '@/features/incoming/schemas/incoming-quantities-schema';
import { normalizeUppercase } from '@/lib/form-utils';
import {
  getActiveIncomingQuantityRows,
  mapQuantityRowsToBagSizes,
} from '@/features/incoming/utils/incoming-form-values-to-create-payload';

function normalizeIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function formatManualParchiNumber(value: number | undefined): string {
  return value != null ? String(value) : '';
}

function normalizePreviousLocation(locations: IncomingQuantityRow['previousLocation']) {
  return (locations ?? []).map((location) => ({
    chamber: location.chamber.trim(),
    floor: location.floor.trim(),
    row: location.row.trim(),
  }));
}

function normalizeBagSizesForCompare(bags: IncomingBagSize[]) {
  return bags.map((bag) => ({
    name: bag.name,
    initialQuantity: bag.initialQuantity,
    currentQuantity: bag.currentQuantity,
    location: {
      chamber: bag.location.chamber.trim(),
      floor: bag.location.floor.trim(),
      row: bag.location.row.trim(),
    },
    ...(bag.previousLocation && bag.previousLocation.length > 0
      ? {
          previousLocation: bag.previousLocation.map((location) => ({
            chamber: location.chamber.trim(),
            floor: location.floor.trim(),
            row: location.row.trim(),
          })),
        }
      : {}),
  }));
}

function bagSizesEqual(current: IncomingBagSize[], baseline: IncomingBagSize[]): boolean {
  return (
    JSON.stringify(normalizeBagSizesForCompare(current)) ===
    JSON.stringify(normalizeBagSizesForCompare(baseline))
  );
}

/**
 * When quantities are locked (current ≠ initial), preserve original bag counts
 * and only apply location / previousLocation updates from the form rows.
 */
function mergeLocationOntoOriginalBagSizes(
  rows: IncomingQuantityRow[],
  originalBags: IncomingBagSize[],
): IncomingBagSize[] {
  const usedRowIndexes = new Set<number>();

  return originalBags.map((bag) => {
    const rowIndex = rows.findIndex(
      (row, index) =>
        !usedRowIndexes.has(index) &&
        row.size === bag.name &&
        (row.qty ?? 0) === bag.initialQuantity,
    );

    if (rowIndex === -1) {
      return bag;
    }

    usedRowIndexes.add(rowIndex);
    const row = rows[rowIndex];
    const previousLocation = normalizePreviousLocation(row.previousLocation);

    const next: IncomingBagSize = {
      name: bag.name,
      initialQuantity: bag.initialQuantity,
      currentQuantity: bag.currentQuantity,
      location: {
        chamber: row.chamber.trim(),
        floor: row.floor.trim(),
        row: row.row.trim(),
      },
    };

    if (previousLocation.length > 0) {
      next.previousLocation = previousLocation;
    }

    return next;
  });
}

type BuildUpdateIncomingGatePassPayloadOptions = {
  showFinances: boolean;
  costPerBag?: number;
  rentEntryVoucherId?: string;
  originalBagSizes: IncomingBagSize[];
  /**
   * When stock has moved (current ≠ initial), omit farmer / date / variety /
   * stock filter / custom marka / quantity changes from the payload.
   */
  lockFarmerAndQuantity?: boolean;
};

export function buildUpdateIncomingGatePassPayload(
  current: IncomingFormValues,
  baseline: IncomingFormValues,
  {
    showFinances,
    costPerBag,
    rentEntryVoucherId,
    originalBagSizes,
    lockFarmerAndQuantity = false,
  }: BuildUpdateIncomingGatePassPayloadOptions,
): UpdateIncomingGatePassPayload | null {
  const payload: UpdateIncomingGatePassPayload = {};

  if (
    !lockFarmerAndQuantity &&
    current.farmerIncomingLinkId !== baseline.farmerIncomingLinkId
  ) {
    payload.farmerStorageLinkId = current.farmerIncomingLinkId;
  }

  if (
    !lockFarmerAndQuantity &&
    normalizeIsoDateTime(current.date) !== normalizeIsoDateTime(baseline.date)
  ) {
    payload.date = current.date;
  }

  if (!lockFarmerAndQuantity && current.variety !== baseline.variety) {
    payload.variety = current.variety;
  }

  if (current.truckNumber.trim() !== baseline.truckNumber.trim()) {
    payload.truckNumber = normalizeUppercase(current.truckNumber.trim());
  }

  if (current.remarks.trim() !== baseline.remarks.trim()) {
    payload.remarks = current.remarks.trim();
  }

  const currentManual = formatManualParchiNumber(current.manualGatePassNumber);
  const baselineManual = formatManualParchiNumber(baseline.manualGatePassNumber);
  if (currentManual !== baselineManual) {
    payload.manualParchiNumber = currentManual;
  }

  if (!lockFarmerAndQuantity && current.stockFilter.trim() !== baseline.stockFilter.trim()) {
    payload.stockFilter = current.stockFilter.trim();
  }

  if (!lockFarmerAndQuantity && current.generation.trim() !== baseline.generation.trim()) {
    payload.generation = current.generation.trim();
  }

  if (!lockFarmerAndQuantity && current.customMarka.trim() !== baseline.customMarka.trim()) {
    payload.customMarka = current.customMarka.trim();
  }

  const activeRows = getActiveIncomingQuantityRows(current.quantities);
  const nextBagSizes = lockFarmerAndQuantity
    ? mergeLocationOntoOriginalBagSizes(activeRows, originalBagSizes)
    : mapQuantityRowsToBagSizes(activeRows, originalBagSizes);

  if (!bagSizesEqual(nextBagSizes, originalBagSizes)) {
    payload.bagSizes = nextBagSizes;
  }

  const affectsAmount =
    !lockFarmerAndQuantity &&
    (payload.bagSizes !== undefined || payload.farmerStorageLinkId !== undefined);

  if (showFinances && rentEntryVoucherId && affectsAmount) {
    if (typeof costPerBag !== 'number' || costPerBag <= 0) {
      throw new Error(
        'Selected farmer has no valid cost per bag. Update the farmer account or disable finances.',
      );
    }

    const totalBags = activeRows.reduce((sum, row) => sum + (row.qty ?? 0), 0);
    const amount = totalBags * costPerBag;

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0 when finances are enabled.');
    }

    payload.amount = amount;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}
