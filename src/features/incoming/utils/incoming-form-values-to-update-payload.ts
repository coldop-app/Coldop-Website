import type { IncomingBagSize } from '@/features/daybook/types';
import type { UpdateIncomingGatePassPayload } from '@/features/incoming/types/api';
import type { IncomingFormValues } from '@/features/incoming/types';
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
    ...(bag.paltaiLocation
      ? {
          paltaiLocation: {
            chamber: bag.paltaiLocation.chamber.trim(),
            floor: bag.paltaiLocation.floor.trim(),
            row: bag.paltaiLocation.row.trim(),
          },
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

type BuildUpdateIncomingGatePassPayloadOptions = {
  showFinances: boolean;
  costPerBag?: number;
  rentEntryVoucherId?: string;
  originalBagSizes: IncomingBagSize[];
};

export function buildUpdateIncomingGatePassPayload(
  current: IncomingFormValues,
  baseline: IncomingFormValues,
  {
    showFinances,
    costPerBag,
    rentEntryVoucherId,
    originalBagSizes,
  }: BuildUpdateIncomingGatePassPayloadOptions,
): UpdateIncomingGatePassPayload | null {
  const payload: UpdateIncomingGatePassPayload = {};

  if (current.farmerIncomingLinkId !== baseline.farmerIncomingLinkId) {
    payload.farmerStorageLinkId = current.farmerIncomingLinkId;
  }

  if (normalizeIsoDateTime(current.date) !== normalizeIsoDateTime(baseline.date)) {
    payload.date = current.date;
  }

  if (current.variety !== baseline.variety) {
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

  if (current.stockFilter.trim() !== baseline.stockFilter.trim()) {
    payload.stockFilter = current.stockFilter.trim();
  }

  if (current.customMarka.trim() !== baseline.customMarka.trim()) {
    payload.customMarka = current.customMarka.trim();
  }

  const activeRows = getActiveIncomingQuantityRows(current.quantities);
  const nextBagSizes = mapQuantityRowsToBagSizes(activeRows, originalBagSizes);

  if (!bagSizesEqual(nextBagSizes, originalBagSizes)) {
    payload.bagSizes = nextBagSizes;
  }

  const affectsAmount = payload.bagSizes !== undefined || payload.farmerStorageLinkId !== undefined;

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
