import type { TransferStockFormValues } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import type { PotatoAction } from '@/features/transfer-stock/search';
import type { CreateTransferStockPayload } from '@/features/transfer-stock/types/api';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';

export type BuildTransferStockPayloadOptions = {
  potatoAction?: PotatoAction;
  costPerBag?: number;
};

export function buildCreateTransferStockPayload(
  values: TransferStockFormValues,
  items: TransferStockItem[],
  options?: BuildTransferStockPayloadOptions,
): CreateTransferStockPayload {
  const remarks = values.remarks.trim();
  const customMarka = values.customMarka.trim();

  const payload: CreateTransferStockPayload = {
    fromFarmerStorageLinkId: values.fromFarmerStorageLinkId,
    toFarmerStorageLinkId: values.toFarmerStorageLinkId,
    date: values.date,
    items: items.map((item) => ({
      incomingGatePassId: item.storageGatePassId,
      bagSize: item.bagSize,
      quantity: item.quantity,
      location: item.location,
    })),
    ...(customMarka ? { customMarka } : {}),
    ...(remarks ? { remarks } : {}),
  };

  if (!options?.potatoAction || options.costPerBag === undefined) {
    return payload;
  }

  const totalBags = items.reduce((sum, item) => sum + item.quantity, 0);
  const amount = totalBags * options.costPerBag;

  return {
    ...payload,
    amount,
    ...(options.potatoAction === 'buy' ? { isBuyPotato: true } : { isSellPotato: true }),
  };
}
