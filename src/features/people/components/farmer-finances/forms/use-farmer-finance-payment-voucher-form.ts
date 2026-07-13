import { useForm } from '@tanstack/react-form';

import type { CreateVoucherPayload } from '@/features/finances/types';
import {
  farmerFinancePaymentVoucherFormSchema,
  formValuesToFarmerFinancePaymentVoucherPayload,
  type FarmerFinancePaymentVoucherMode,
} from '@/features/people/components/farmer-finances/schemas/farmer-finance-payment-voucher-form-schema';

type UseFarmerFinancePaymentVoucherFormOptions = {
  mode: FarmerFinancePaymentVoucherMode;
  farmerLedgerId: string;
  onSubmit: (payload: CreateVoucherPayload) => Promise<void>;
};

export function useFarmerFinancePaymentVoucherForm({
  mode,
  farmerLedgerId,
  onSubmit,
}: UseFarmerFinancePaymentVoucherFormOptions) {
  const todayIso = new Date().toISOString();

  return useForm({
    defaultValues: {
      date: todayIso,
      paymentLedger: '',
      amount: '',
      narration: '',
    },
    validators: {
      onChange: farmerFinancePaymentVoucherFormSchema,
      onSubmit: farmerFinancePaymentVoucherFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = farmerFinancePaymentVoucherFormSchema.parse(value);
      await onSubmit(formValuesToFarmerFinancePaymentVoucherPayload(parsed, mode, farmerLedgerId));
    },
  });
}
