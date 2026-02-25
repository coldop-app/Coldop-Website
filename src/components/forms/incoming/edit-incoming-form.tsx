import { memo } from 'react';
import {
  IncomingFormBase,
  type IncomingFormSubmitPayload,
} from '@/components/forms/incoming/incoming-form-base';
import { useUpdateIncomingGatePass } from '@/services/incoming-gate-pass/useUpdateIncomingGatePass';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

export interface EditIncomingFormProps {
  editEntry: DaybookEntry;
  editId: string;
}

export const EditIncomingForm = memo(function EditIncomingForm({
  editEntry,
  editId,
}: EditIncomingFormProps) {
  const updateGatePass = useUpdateIncomingGatePass();

  const voucherNumberDisplay =
    editEntry.gatePassNo != null ? `#${editEntry.gatePassNo}` : '—';

  const handleSubmit = async (payload: IncomingFormSubmitPayload) => {
    await updateGatePass.mutateAsync({
      id: editId,
      payload: {
        date: payload.date,
        variety: payload.variety,
        remarks: payload.remarks,
        bagSizes: payload.bagSizes,
        amount: payload.amount,
        stockFilter: payload.stockFilter,
        customMarka: payload.customMarka,
        manualParchiNumber: payload.manualParchiNumber,
      },
    });
  };

  return (
    <IncomingFormBase
      mode="edit"
      editEntry={editEntry}
      voucherNumberDisplay={voucherNumberDisplay}
      isSubmitting={updateGatePass.isPending}
      onSubmit={handleSubmit}
    />
  );
});

export default EditIncomingForm;
