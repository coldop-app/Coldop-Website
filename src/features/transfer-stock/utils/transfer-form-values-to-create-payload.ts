import { parseVoucherAmount } from '@/features/finances/components/voucher-tab/schemas/add-voucher-form-schema';
import type { TransferStockFormValues } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import type { PotatoAction } from '@/features/transfer-stock/search';
import type { CreateTransferStockPayload } from '@/features/transfer-stock/types/api';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';

export type BuildTransferStockPayloadOptions = {
  potatoAction?: PotatoAction;
  includeStockFilter?: boolean;
  includeCustomMarka?: boolean;
};

export function buildCreateTransferStockPayload(
  values: TransferStockFormValues,
  items: TransferStockItem[],
  options?: BuildTransferStockPayloadOptions,
): CreateTransferStockPayload {
  const remarks = values.remarks.trim();
  const stockFilter = values.stockFilter.trim();
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
    ...(options?.includeStockFilter && stockFilter ? { stockFilter } : {}),
    ...(options?.includeCustomMarka && customMarka ? { customMarka } : {}),
    ...(remarks ? { remarks } : {}),
  };

  if (!options?.potatoAction) {
    return payload;
  }

  return {
    ...payload,
    amount: parseVoucherAmount(values.amount),
    ...(remarks ? { narration: remarks } : {}),
    ...(options.potatoAction === 'buy' ? { isBuyPotato: true } : { isSellPotato: true }),
  };
}
