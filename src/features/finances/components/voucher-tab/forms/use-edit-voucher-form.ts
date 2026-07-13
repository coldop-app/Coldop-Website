import { useForm } from '@tanstack/react-form';

import type { ComboboxOption } from '@/components/searchable-option-combobox';

import {
  addVoucherFormSchema,
  formValuesToUpdatePayload,
  voucherToFormValues,
} from '../schemas/add-voucher-form-schema';
import type { Voucher } from '../types';

type UseEditVoucherFormOptions = {
  voucher: Voucher;
  ledgerOptions: ComboboxOption[];
  onSubmit: (payload: ReturnType<typeof formValuesToUpdatePayload>) => Promise<void>;
};

export function useEditVoucherForm({
  voucher,
  ledgerOptions,
  onSubmit,
}: UseEditVoucherFormOptions) {
  return useForm({
    defaultValues: voucherToFormValues(voucher, ledgerOptions),
    validators: {
      onChange: addVoucherFormSchema,
      onSubmit: addVoucherFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = addVoucherFormSchema.parse(value);
      await onSubmit(formValuesToUpdatePayload(parsed));
    },
  });
}

export type EditVoucherFormApi = ReturnType<typeof useEditVoucherForm>;
