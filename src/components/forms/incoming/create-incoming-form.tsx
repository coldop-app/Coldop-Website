import { memo } from 'react';
import {
  IncomingFormBase,
  type IncomingFormSubmitPayload,
} from '@/components/forms/incoming/incoming-form-base';
import { useCreateIncomingGatePass } from '@/services/incoming-gate-pass/useCreateIncomingGatePass';
import { useGetReceiptVoucherNumber } from '@/services/store-admin/functions/useGetVoucherNumber';

export const CreateIncomingForm = memo(function CreateIncomingForm() {
  const createGatePass = useCreateIncomingGatePass();
  const { data: nextVoucherNumber, isLoading: isLoadingVoucher } =
    useGetReceiptVoucherNumber('incoming');

  const voucherNumberDisplay =
    isLoadingVoucher && nextVoucherNumber == null
      ? '...'
      : nextVoucherNumber != null
        ? `#${nextVoucherNumber}`
        : '—';

  const handleSubmit = async (payload: IncomingFormSubmitPayload) => {
    await createGatePass.mutateAsync({
      farmerStorageLinkId: payload.farmerStorageLinkId,
      date: payload.date,
      variety: payload.variety,
      truckNumber: payload.truckNumber,
      bagSizes: payload.bagSizes,
      remarks: payload.remarks,
      manualParchiNumber: payload.manualParchiNumber,
      amount: payload.amount,
    });
  };

  return (
    <IncomingFormBase
      mode="create"
      voucherNumberDisplay={voucherNumberDisplay}
      isSubmitting={createGatePass.isPending}
      gatePassNoForSummary={nextVoucherNumber ?? 0}
      isLoadingVoucher={isLoadingVoucher}
      onSubmit={handleSubmit}
    />
  );
});

export default CreateIncomingForm;
