import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { incomingGatePassesByFarmerLinkQueryKey } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import type { IncomingGatePassRecord } from '@/features/incoming/types/api';
import {
  createTransferStockFormSchema,
  type TransferStockFormSchemaConfig,
  type TransferStockFormValues,
} from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import { defaultSubmitMeta, type TransferStockSubmitMeta } from '@/features/transfer-stock/types';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { incomingGatePassesToStorageGatePasses } from '@/features/transfer-stock/utils/incoming-gate-pass-to-storage-gate-pass';

export type { TransferStockFormValues };

type UseCreateTransferStockFormOptions = {
  schemaConfig: TransferStockFormSchemaConfig;
  onOpenReview?: () => void;
  onSubmitConfirmed?: (
    values: TransferStockFormValues,
    items: TransferStockItem[],
  ) => Promise<void>;
};

export function useCreateTransferStockForm({
  schemaConfig,
  ...options
}: UseCreateTransferStockFormOptions) {
  const queryClient = useQueryClient();
  const todayIso = new Date().toISOString();

  const formSchema = useMemo(() => createTransferStockFormSchema(schemaConfig), [schemaConfig]);

  return useForm({
    defaultValues: {
      fromFarmerStorageLinkId: '',
      toFarmerStorageLinkId: '',
      date: todayIso,
      stockFilter: '',
      customMarka: '',
      remarks: '',
      allocations: {} as Record<string, number>,
    },
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = formSchema.parse(value);

      if ((meta as TransferStockSubmitMeta).submitAction === 'review') {
        options.onOpenReview?.();
        return;
      }

      const records =
        queryClient.getQueryData<IncomingGatePassRecord[]>(
          incomingGatePassesByFarmerLinkQueryKey(parsed.fromFarmerStorageLinkId),
        ) ?? [];
      const passes = incomingGatePassesToStorageGatePasses(records, parsed.fromFarmerStorageLinkId);
      const items = buildTransferItems(parsed.allocations, passes);

      if (!options.onSubmitConfirmed) {
        throw new Error('Submit handler is not configured.');
      }

      await options.onSubmitConfirmed(parsed, items);
    },
  });
}

export type CreateTransferStockFormApi = ReturnType<typeof useCreateTransferStockForm>;
