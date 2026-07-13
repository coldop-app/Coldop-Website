import { useForm } from '@tanstack/react-form';

import {
  addVoucherFormSchema,
  formValuesToCreatePayload,
} from '../schemas/add-voucher-form-schema';

type UseAddVoucherFormOptions = {
  onSubmit: (payload: ReturnType<typeof formValuesToCreatePayload>) => Promise<void>;
};

export function useAddVoucherForm({ onSubmit }: UseAddVoucherFormOptions) {
  const todayIso = new Date().toISOString();

  return useForm({
    defaultValues: {
      date: todayIso,
      debitLedger: '',
      creditLedger: '',
      amount: '',
      narration: '',
    },
    validators: {
      onChange: addVoucherFormSchema,
      onSubmit: addVoucherFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = addVoucherFormSchema.parse(value);
      await onSubmit(formValuesToCreatePayload(parsed));
    },
  });
}

export type AddVoucherFormApi = ReturnType<typeof useAddVoucherForm>;
