import { useForm } from '@tanstack/react-form';

import { addLedgerFormSchema, formValuesToCreatePayload } from '../schemas/add-ledger-form-schema';

type UseAddLedgerFormOptions = {
  onSubmit: (payload: ReturnType<typeof formValuesToCreatePayload>) => Promise<void>;
};

export function useAddLedgerForm({ onSubmit }: UseAddLedgerFormOptions) {
  return useForm({
    defaultValues: {
      name: '',
      type: '',
      subType: '',
      category: '',
      openingBalance: '',
    },
    validators: {
      onChange: addLedgerFormSchema,
      onSubmit: addLedgerFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = addLedgerFormSchema.parse(value);
      await onSubmit(formValuesToCreatePayload(parsed));
    },
  });
}

export type AddLedgerFormApi = ReturnType<typeof useAddLedgerForm>;
