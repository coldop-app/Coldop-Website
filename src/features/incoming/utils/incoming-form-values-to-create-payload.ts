import type { IncomingBagSize } from '@/features/daybook/types';
import type { IncomingQuantityRow } from '@/features/incoming/schemas/incoming-quantities-schema';
import { hasCompleteIncomingQuantityLocation } from '@/features/incoming/schemas/incoming-quantities-schema';
import type {
  CreateIncomingGatePassBagSize,
  CreateIncomingGatePassPayload,
} from '@/features/incoming/types/api';
import type { IncomingFormValues } from '@/features/incoming/types';
import { normalizeUppercase } from '@/lib/form-utils';

export function getActiveIncomingQuantityRows(
  quantities: IncomingQuantityRow[],
): IncomingQuantityRow[] {
  return quantities.filter((row) => (row.qty ?? 0) > 0 && hasCompleteIncomingQuantityLocation(row));
}

function bagLocationKey(name: string, chamber: string, floor: string, row: string) {
  return `${name}|${chamber.trim()}|${floor.trim()}|${row.trim()}`;
}

export function mapQuantityRowsToBagSizes(
  rows: IncomingQuantityRow[],
  originalBags: IncomingBagSize[] = [],
): CreateIncomingGatePassBagSize[] {
  const paltaiByLocation = new Map<string, IncomingBagSize['paltaiLocation']>();

  for (const bag of originalBags) {
    if (!bag.paltaiLocation) continue;
    const key = bagLocationKey(
      bag.name,
      bag.location.chamber,
      bag.location.floor,
      bag.location.row,
    );
    paltaiByLocation.set(key, bag.paltaiLocation);
  }

  return rows.map((row) => {
    const chamber = row.chamber.trim();
    const floor = row.floor.trim();
    const rowValue = row.row.trim();
    const key = bagLocationKey(row.size, chamber, floor, rowValue);
    const paltaiLocation = paltaiByLocation.get(key);

    const bagSize: CreateIncomingGatePassBagSize = {
      name: row.size,
      initialQuantity: row.qty ?? 0,
      currentQuantity: row.qty ?? 0,
      location: {
        chamber,
        floor,
        row: rowValue,
      },
    };

    if (paltaiLocation) {
      bagSize.paltaiLocation = paltaiLocation;
    }

    return bagSize;
  });
}

type BuildCreateIncomingGatePassPayloadOptions = {
  showFinances: boolean;
  costPerBag?: number;
  coldStorageId?: string;
  createdById?: string;
};

export function buildCreateIncomingGatePassPayload(
  values: IncomingFormValues,
  {
    showFinances,
    costPerBag,
    coldStorageId,
    createdById,
  }: BuildCreateIncomingGatePassPayloadOptions,
): CreateIncomingGatePassPayload {
  const activeRows = getActiveIncomingQuantityRows(values.quantities);

  if (activeRows.length === 0) {
    throw new Error('Enter at least one bag quantity with chamber, floor, and row.');
  }

  const totalBags = activeRows.reduce((sum, row) => sum + (row.qty ?? 0), 0);

  const payload: CreateIncomingGatePassPayload = {
    farmerStorageLinkId: values.farmerIncomingLinkId,
    date: values.date,
    variety: values.variety,
    bagSizes: mapQuantityRowsToBagSizes(activeRows),
  };

  if (values.manualGatePassNumber != null) {
    payload.manualParchiNumber = String(values.manualGatePassNumber);
  }

  if (values.stockFilter.trim()) {
    payload.stockFilter = values.stockFilter.trim();
  }

  if (values.customMarka.trim()) {
    payload.customMarka = values.customMarka.trim();
  }

  if (values.truckNumber.trim()) {
    payload.truckNumber = normalizeUppercase(values.truckNumber.trim());
  }

  if (values.remarks.trim()) {
    payload.remarks = values.remarks.trim();
  }

  if (createdById) {
    payload.createdById = createdById;
  }

  if (coldStorageId) {
    payload.coldStorageId = coldStorageId;
  }

  if (showFinances) {
    if (typeof costPerBag !== 'number' || costPerBag <= 0) {
      throw new Error(
        'Selected farmer has no valid cost per bag. Update the farmer account or disable finances.',
      );
    }

    const amount = totalBags * costPerBag;

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0 when finances are enabled.');
    }

    payload.amount = amount;
  }

  return payload;
}
