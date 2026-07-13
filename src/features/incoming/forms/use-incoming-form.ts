import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import {
  createIncomingFormSchema,
  type IncomingFormSchemaConfig,
} from '@/features/incoming/schemas/incoming-form-schema';
import type { IncomingFormValues } from '@/features/incoming/types';
import { defaultSubmitMeta, type IncomingSubmitMeta } from '@/features/incoming/types';

export type { IncomingFormValues };

function isIncomingSubmitMeta(meta: unknown): meta is IncomingSubmitMeta {
  if (!meta || typeof meta !== 'object') return false;
  const candidate = meta as { submitAction?: unknown };
  return candidate.submitAction === 'review' || candidate.submitAction === 'submit';
}

type UseIncomingFormOptions = {
  schemaConfig: IncomingFormSchemaConfig;
  defaultValues: IncomingFormValues;
  onOpenReview?: () => void;
  onCloseReview?: () => void;
  onSubmitConfirmed?: (values: IncomingFormValues) => Promise<void>;
};

export function useIncomingForm({
  schemaConfig,
  defaultValues,
  onOpenReview,
  onCloseReview,
  onSubmitConfirmed,
}: UseIncomingFormOptions) {
  const formSchema = useMemo(() => createIncomingFormSchema(schemaConfig), [schemaConfig]);

  return useForm({
    defaultValues,
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = formSchema.parse(value);

      if (isIncomingSubmitMeta(meta) && meta.submitAction === 'review') {
        onOpenReview?.();
        return;
      }

      if (onSubmitConfirmed) {
        await onSubmitConfirmed(parsed);
      }

      onCloseReview?.();
    },
  });
}

export type IncomingFormApi = ReturnType<typeof useIncomingForm>;
