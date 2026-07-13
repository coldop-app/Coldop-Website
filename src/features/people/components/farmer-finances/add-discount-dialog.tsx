import { FarmerFinanceVoucherDialog } from '@/features/people/components/farmer-finances/farmer-finance-voucher-dialog';
import { useFarmerFinanceLedgers } from '@/features/people/components/farmer-finances/hooks/use-farmer-finance-ledgers';
import type { FarmerFinanceDialogProps } from '@/features/people/components/farmer-finances/types';
import { getMissingAddDiscountLedgers } from '@/features/people/components/farmer-finances/utils/get-missing-farmer-finance-ledgers';

export function AddDiscountDialog({
  open,
  onOpenChange,
  linkId,
  farmerName,
}: FarmerFinanceDialogProps) {
  const { farmerLedger, discountLedger, isLoading } = useFarmerFinanceLedgers(linkId);

  const missingLedgers = getMissingAddDiscountLedgers({
    debitLedger: discountLedger,
    creditLedger: farmerLedger,
  });

  return (
    <FarmerFinanceVoucherDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Discount"
      description={
        farmerName ? `Record a discount for ${farmerName}.` : 'Record a discount for this farmer.'
      }
      debitLedger={discountLedger}
      creditLedger={farmerLedger}
      isLoadingLedgers={isLoading}
      missingLedgers={missingLedgers}
      submitLabel="Add Discount"
    />
  );
}
