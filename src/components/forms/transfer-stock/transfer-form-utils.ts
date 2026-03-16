import { payloadDateSchema } from '@/lib/helpers';
import {
  getBagDetailsForSize,
  parseAllocationKey,
} from '@/components/forms/outgoing/outgoing-form-utils';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import type { CreateTransferStockBody } from '@/services/transfer-stock/useCreateTransferStock';

/* -------------------------------------------------
   Helpers for transfer stock form
-------------------------------------------------- */

export function buildTransferPayload(
  formValues: {
    fromFarmerStorageLinkId: string;
    toFarmerStorageLinkId: string;
    date: string;
    truckNumber?: string;
    remarks?: string;
  },
  cellQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): CreateTransferStockBody | null {
  const entries = Object.entries(cellQuantities).filter(
    ([, qty]) => qty != null && qty > 0
  );
  if (entries.length === 0) return null;

  const passById = new Map(incomingPasses.map((p) => [p._id, p]));

  const items: CreateTransferStockBody['items'] = [];

  for (const [key, qty] of entries) {
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const { passId, sizeName, bagIndex } = parsed;
    const pass = passById.get(passId);
    if (!pass) continue;
    const details = getBagDetailsForSize(pass, sizeName);
    const detail = details[bagIndex];
    const loc = detail?.location;
    items.push({
      incomingGatePassId: passId,
      bagSize: sizeName,
      quantity: qty,
      location: {
        chamber: loc?.chamber ?? '',
        floor: loc?.floor ?? '',
        row: loc?.row ?? '',
      },
    });
  }

  if (!items.length) return null;

  const date = payloadDateSchema.parse(formValues.date);

  return {
    fromFarmerStorageLinkId: formValues.fromFarmerStorageLinkId,
    toFarmerStorageLinkId: formValues.toFarmerStorageLinkId,
    date,
    ...(formValues.truckNumber?.trim() && {
      truckNumber: formValues.truckNumber.trim(),
    }),
    items,
    remarks: formValues.remarks?.trim() || undefined,
  };
}
