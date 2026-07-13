import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { incomingGatePassesByFarmerLinkQueryKey } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import type { IncomingGatePassRecord } from '@/features/incoming/types/api';
import {
  createOutgoingEditFormSchema,
  type OutgoingEditFormSchemaConfig,
  type OutgoingEditFormValues,
} from '@/features/outgoing/schemas/outgoing-edit-form-schema';
import { defaultSubmitMeta, type OutgoingSubmitMeta } from '@/features/outgoing/types';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { incomingGatePassesToStorageGatePasses } from '@/features/transfer-stock/utils/incoming-gate-pass-to-storage-gate-pass';

type UseEditOutgoingGatePassFormOptions = {
  schemaConfig: OutgoingEditFormSchemaConfig;
  defaultValues: OutgoingEditFormValues;
  resolveStoragePasses?: (farmerStorageLinkId: string) => StorageGatePass[];
  onOpenReview?: () => void;
  onCloseReview?: () => void;
  onSubmitConfirmed?: (
    values: OutgoingEditFormValues,
    items: TransferStockItem[],
    passes: StorageGatePass[],
  ) => Promise<void>;
};

export function useEditOutgoingGatePassForm({
  schemaConfig,
  defaultValues,
  resolveStoragePasses,
  onOpenReview,
  onCloseReview,
  onSubmitConfirmed,
}: UseEditOutgoingGatePassFormOptions) {
  const queryClient = useQueryClient();

  const formSchema = useMemo(() => createOutgoingEditFormSchema(schemaConfig), [schemaConfig]);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = formSchema.parse(value);

      if ((meta as OutgoingSubmitMeta).submitAction === 'review') {
        onOpenReview?.();
        return;
      }

      const records =
        queryClient.getQueryData<IncomingGatePassRecord[]>(
          incomingGatePassesByFarmerLinkQueryKey(parsed.farmerStorageLinkId),
        ) ?? [];
      const passes =
        resolveStoragePasses?.(parsed.farmerStorageLinkId) ??
        incomingGatePassesToStorageGatePasses(records, parsed.farmerStorageLinkId);
      const items = buildTransferItems(parsed.allocations, passes);

      if (!onSubmitConfirmed) {
        throw new Error('Submit handler is not configured.');
      }

      await onSubmitConfirmed(parsed, items, passes);
      onCloseReview?.();
    },
  });

  return { form, formSchema };
}

export type EditOutgoingGatePassFormApi = ReturnType<typeof useEditOutgoingGatePassForm>;
