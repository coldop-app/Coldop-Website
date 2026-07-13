import { FarmerFinancePaymentVoucherDialog } from '@/features/people/components/farmer-finances/farmer-finance-payment-voucher-dialog';
import { useFarmerFinanceLedgers } from '@/features/people/components/farmer-finances/hooks/use-farmer-finance-ledgers';
import type { FarmerFinanceDialogProps } from '@/features/people/components/farmer-finances/types';
import { getMissingFarmerPaymentLedgers } from '@/features/people/components/farmer-finances/utils/get-missing-farmer-finance-ledgers';

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  linkId,
  farmerName,
}: FarmerFinanceDialogProps) {
  const { farmerLedger, paymentLedgers, isLoading } = useFarmerFinanceLedgers(linkId);

  const missingLedgers = getMissingFarmerPaymentLedgers({
    farmerLedger,
    hasPaymentLedgers: paymentLedgers.length > 0,
  });

  return (
    <FarmerFinancePaymentVoucherDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="receive"
      title="Receive Payment"
      description={
        farmerName
          ? `Record a payment received from ${farmerName}.`
          : 'Record a payment received from this farmer.'
      }
      farmerLedger={farmerLedger}
      paymentLedgers={paymentLedgers}
      isLoadingLedgers={isLoading}
      missingLedgers={missingLedgers}
      submitLabel="Receive Payment"
    />
  );
}
