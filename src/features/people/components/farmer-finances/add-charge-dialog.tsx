import { FarmerFinanceVoucherDialog } from '@/features/people/components/farmer-finances/farmer-finance-voucher-dialog';
import { useFarmerFinanceLedgers } from '@/features/people/components/farmer-finances/hooks/use-farmer-finance-ledgers';
import type { FarmerFinanceDialogProps } from '@/features/people/components/farmer-finances/types';
import { getMissingAddChargeLedgers } from '@/features/people/components/farmer-finances/utils/get-missing-farmer-finance-ledgers';

export function AddChargeDialog({
  open,
  onOpenChange,
  linkId,
  farmerName,
}: FarmerFinanceDialogProps) {
  const { farmerLedger, otherIncomeLedger, isLoading } = useFarmerFinanceLedgers(linkId);

  const missingLedgers = getMissingAddChargeLedgers({
    debitLedger: farmerLedger,
    creditLedger: otherIncomeLedger,
  });

  return (
    <FarmerFinanceVoucherDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Charge"
      description={
        farmerName ? `Record a charge for ${farmerName}.` : 'Record a charge for this farmer.'
      }
      debitLedger={farmerLedger}
      creditLedger={otherIncomeLedger}
      isLoadingLedgers={isLoading}
      missingLedgers={missingLedgers}
      submitLabel="Add Charge"
    />
  );
}
