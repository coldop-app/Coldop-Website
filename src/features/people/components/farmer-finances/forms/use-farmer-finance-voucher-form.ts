import { useForm } from '@tanstack/react-form';

import type { CreateVoucherPayload } from '@/features/finances/types';
import {
  farmerFinanceVoucherFormSchema,
  formValuesToFarmerFinanceVoucherPayload,
} from '@/features/people/components/farmer-finances/schemas/farmer-finance-voucher-form-schema';

type UseFarmerFinanceVoucherFormOptions = {
  debitLedgerId: string;
  creditLedgerId: string;
  onSubmit: (payload: CreateVoucherPayload) => Promise<void>;
};

export function useFarmerFinanceVoucherForm({
  debitLedgerId,
  creditLedgerId,
  onSubmit,
}: UseFarmerFinanceVoucherFormOptions) {
  const todayIso = new Date().toISOString();

  return useForm({
    defaultValues: {
      date: todayIso,
      amount: '',
      narration: '',
    },
    validators: {
      onChange: farmerFinanceVoucherFormSchema,
      onSubmit: farmerFinanceVoucherFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = farmerFinanceVoucherFormSchema.parse(value);
      await onSubmit(
        formValuesToFarmerFinanceVoucherPayload(parsed, debitLedgerId, creditLedgerId),
      );
    },
  });
}

export type FarmerFinanceVoucherFormApi = ReturnType<typeof useFarmerFinanceVoucherForm>;
