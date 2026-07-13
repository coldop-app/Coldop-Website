import type { OutgoingFormValues } from '@/features/outgoing/schemas/outgoing-form-schema';
import type { CreateOutgoingGatePassPayload } from '@/features/outgoing/types/api';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { normalizeUppercase } from '@/lib/form-utils';

export function groupItemsIntoIncomingGatePasses(
  items: TransferStockItem[],
  passes: StorageGatePass[],
): CreateOutgoingGatePassPayload['incomingGatePasses'] {
  const byPassId = new Map<string, TransferStockItem[]>();

  for (const item of items) {
    const list = byPassId.get(item.storageGatePassId) ?? [];
    list.push(item);
    byPassId.set(item.storageGatePassId, list);
  }

  return [...byPassId.entries()].map(([passId, passItems]) => {
    const pass = passes.find((candidate) => candidate._id === passId);
    if (!pass) {
      throw new Error(`Incoming gate pass ${passId} was not found for the selected allocations.`);
    }

    return {
      incomingGatePassId: passId,
      variety: pass.variety,
      allocations: passItems.map((item) => ({
        size: item.bagSize,
        quantityToAllocate: item.quantity,
        location: item.location,
      })),
    };
  });
}

export function buildCreateOutgoingGatePassPayload(
  values: OutgoingFormValues,
  items: TransferStockItem[],
  passes: StorageGatePass[],
  gatePassNo: number,
  idempotencyKey?: string,
): CreateOutgoingGatePassPayload {
  const remarks = values.remarks.trim();
  const from = values.from.trim();
  const to = values.to.trim();
  const truckNumber = values.truckNumber.trim();

  const payload: CreateOutgoingGatePassPayload = {
    farmerStorageLinkId: values.farmerStorageLinkId,
    gatePassNo,
    date: values.date,
    incomingGatePasses: groupItemsIntoIncomingGatePasses(items, passes),
  };

  if (values.manualGatePassNumber != null) {
    payload.manualParchiNumber = values.manualGatePassNumber;
  }

  if (values.stockFilter.trim()) {
    payload.stockFilter = values.stockFilter.trim();
  }

  if (from) {
    payload.from = from;
  }

  if (to) {
    payload.to = to;
  }

  if (truckNumber) {
    payload.truckNumber = normalizeUppercase(truckNumber);
  }

  if (remarks) {
    payload.remarks = remarks;
  }

  if (idempotencyKey) {
    payload.idempotencyKey = idempotencyKey;
  }

  return payload;
}
