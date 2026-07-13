import { useForm } from '@tanstack/react-form';

import type { Ledger } from '../types';
import {
  editLedgerFormSchema,
  formValuesToUpdatePayload,
  ledgerToFormValues,
} from '../schemas/add-ledger-form-schema';

type UseEditLedgerFormOptions = {
  ledger: Ledger;
  onSubmit: (payload: ReturnType<typeof formValuesToUpdatePayload>) => Promise<void>;
};

export function useEditLedgerForm({ ledger, onSubmit }: UseEditLedgerFormOptions) {
  return useForm({
    defaultValues: ledgerToFormValues(ledger),
    validators: {
      onChange: editLedgerFormSchema,
      onSubmit: editLedgerFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = editLedgerFormSchema.parse(value);
      await onSubmit(formValuesToUpdatePayload(parsed));
    },
  });
}

export type EditLedgerFormApi = ReturnType<typeof useEditLedgerForm>;
