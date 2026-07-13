import { useMemo, useState } from 'react';
import {
  createDefaultIncomingQuantities,
  type IncomingFormSchemaConfig,
} from '@/features/incoming/schemas/incoming-form-schema';
import { useIncomingForm } from '@/features/incoming/forms/use-incoming-form';

type UseCreateIncomingFormOptions = {
  schemaConfig: IncomingFormSchemaConfig;
  initialCommodity?: string;
  initialBagSizes?: string[];
  gatePassNo?: number;
  userId?: string;
  onOpenReview?: () => void;
  onCloseReview?: () => void;
};

export function useCreateIncomingForm({
  schemaConfig,
  initialCommodity = '',
  initialBagSizes = [],
  gatePassNo,
  userId,
  onOpenReview,
  onCloseReview,
}: UseCreateIncomingFormOptions) {
  const [todayIso] = useState(() => new Date().toISOString());

  const defaultValues = useMemo(
    () => ({
      gatePassNo: gatePassNo ?? 0,
      manualGatePassNumber: undefined as number | undefined,
      farmerIncomingLinkId: '',
      createdBy: userId ?? '',
      commodity: initialCommodity,
      variety: '',
      stockFilter: '',
      customMarka: '',
      date: todayIso,
      truckNumber: '',
      quantities: createDefaultIncomingQuantities(initialBagSizes),
      remarks: '',
    }),
    [gatePassNo, userId, initialCommodity, initialBagSizes, todayIso],
  );

  return useIncomingForm({
    schemaConfig,
    defaultValues,
    onOpenReview,
    onCloseReview,
  });
}

export type CreateIncomingFormApi = ReturnType<typeof useCreateIncomingForm>;
